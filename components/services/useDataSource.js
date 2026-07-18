'use client'
import {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";

// ---------------------------------------------------------------------------
// All Firestore access happens server-side in /api/results and /api/games.
// Their responses carry Cache-Control headers that Vercel's CDN honors:
// immutable past data caches for 24h, live data for ~60s. Every visitor
// shares those cached copies, so Firestore reads no longer scale with
// traffic. This module is a thin fetch layer with an in-session dedupe
// cache on top (repeat queries within a tab cost nothing at all).
// ---------------------------------------------------------------------------

const queryCache = new Map();

// Dev-only fetch ledger. Logs documents returned per API call and a running
// session total. (Billed Firestore reads happen at the origin only on CDN
// cache misses - see the Firebase console Usage tab for the global number.)
// Stripped from production builds via the NODE_ENV checks.
let sessionDocs = 0;
function trackFetch(label, count) {
  if (process.env.NODE_ENV === "production") return;
  sessionDocs += count;
  console.log(
    `[API] ${label} -> ${count} doc${count === 1 ? "" : "s"} (session total: ${sessionDocs})`
  );
}

function describeQuery({ gameId, startMs, endMs, order, max }) {
  const fmt = (ms) =>
    ms == null ? "…" : new Date(ms).toLocaleString("en-IN", { hour12: true });
  const parts = ["results"];
  if (gameId) parts.push(`game=${gameId.slice(0, 6)}…`);
  if (startMs != null || endMs != null) parts.push(`${fmt(startMs)} → ${fmt(endMs)}`);
  parts.push(order);
  if (max != null) parts.push(`limit ${max}`);
  return parts.join(" | ");
}

async function runResultsQuery({ gameId, startMs, endMs, order, max }) {
  const searchParams = new URLSearchParams();
  if (gameId) searchParams.set("gameId", gameId);
  if (startMs != null) searchParams.set("startMs", String(startMs));
  if (endMs != null) searchParams.set("endMs", String(endMs));
  searchParams.set("order", order);
  if (max != null) searchParams.set("max", String(max));

  const response = await fetch(`/api/results?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Results API failed with status ${response.status}`);
  }
  const results = await response.json();
  if (process.env.NODE_ENV !== "production") {
    trackFetch(
      describeQuery({ gameId, startMs, endMs, order, max }),
      results.length
    );
  }
  return results;
}

export function fetchResults({
  gameId = null,
  startMs = null,
  endMs = null,
  order = "asc",
  max = null,
} = {}) {
  const key = JSON.stringify({ gameId, startMs, endMs, order, max });
  if (queryCache.has(key)) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[API] cache hit -> 0 docs (${describeQuery({ gameId, startMs, endMs, order, max })})`
      );
    }
    return queryCache.get(key);
  }
  const promise = runResultsQuery({ gameId, startMs, endMs, order, max }).catch(
    (error) => {
      queryCache.delete(key); // don't cache failures
      throw error;
    }
  );
  queryCache.set(key, promise);
  return promise;
}

// Latest published result for a game (selected_time <= now). When the game
// has no past results yet, optionally falls back to its earliest upcoming one.
export async function fetchLatestResultForGame(gameId, { pastOnly = false } = {}) {
  // Quantized to the minute so every visitor in the same minute requests the
  // same URL and shares one CDN cache entry, instead of each Date.now()
  // minting a unique, uncacheable key.
  const nowMinuteMs = Math.floor(Date.now() / 60000) * 60000;
  const past = await fetchResults({
    gameId,
    endMs: nowMinuteMs,
    order: "desc",
    max: 1,
  });
  if (past.length > 0) return past[0];
  if (pastOnly) return null;
  const upcoming = await fetchResults({ gameId, order: "asc", max: 1 });
  return upcoming[0] ?? null;
}

export function useResults({
  gameId = null,
  startMs = null,
  endMs = null,
  order = "asc",
  max = null,
  enabled = true,
} = {}) {
  const [state, setState] = useState({ results: [], loading: enabled });

  useEffect(() => {
    if (!enabled) {
      setState({ results: [], loading: false });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    fetchResults({ gameId, startMs, endMs, order, max })
      .then((results) => {
        if (!cancelled) setState({ results, loading: false });
      })
      .catch((error) => {
        console.error("Failed to fetch results:", error);
        if (!cancelled) setState({ results: [], loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, startMs, endMs, order, max, enabled]);

  return state;
}

// ---------------------------------------------------------------------------
// Games are a handful of documents, fetched once per session and shared via
// context (and CDN-cached for 5 minutes across visitors).
// ---------------------------------------------------------------------------

function useGamesSource() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/games")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Games API failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((fetched) => {
        if (process.env.NODE_ENV !== "production") {
          trackFetch("games (all)", fetched.length);
        }
        if (!cancelled) setGames(fetched);
      })
      .catch((error) => console.error("Failed to fetch games:", error));
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ games }), [games]);
}

const DataContext = createContext({ games: [] });

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  return (
    <DataContext.Provider value={useGamesSource()}>
      {children}
    </DataContext.Provider>
  );
}
