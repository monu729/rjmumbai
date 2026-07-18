'use client'
import {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

import { db } from "../config/fire-config";

// ---------------------------------------------------------------------------
// Scoped result queries.
//
// Firestore bills per document read, so instead of downloading the whole
// "results" collection (thousands of docs, growing daily) each view asks the
// server for exactly the slice it displays: one day, one month, or the single
// latest result. Identical queries within a session are answered from an
// in-memory cache, so navigating back and forth costs no extra reads.
//
// NOTE: queries that combine game_id with selected_time need a one-time
// composite index (game_id ASC + selected_time ASC, and game_id ASC +
// selected_time DESC). If an index is missing, Firestore rejects the query
// with an error containing a one-click "create index" link for the console.
// ---------------------------------------------------------------------------

const queryCache = new Map();

// Dev-only read counter. Every Firestore call in the app funnels through
// runResultsQuery/fetchGames, so this is the exact number of billed document
// reads this session (Firestore bills min. 1 read even for an empty query).
// Stripped from production builds via the NODE_ENV check.
let sessionReads = 0;
function trackReads(label, count) {
  if (process.env.NODE_ENV === "production") return;
  sessionReads += count;
  console.log(
    `[Firestore] ${label} -> ${count} doc read${count === 1 ? "" : "s"} (session total: ${sessionReads})`
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
  const constraints = [];
  if (gameId) constraints.push(where("game_id", "==", gameId));
  if (startMs != null)
    constraints.push(where("selected_time", ">=", Timestamp.fromMillis(startMs)));
  if (endMs != null)
    constraints.push(where("selected_time", "<=", Timestamp.fromMillis(endMs)));
  constraints.push(orderBy("selected_time", order));
  if (max != null) constraints.push(limit(max));

  const snapshot = await getDocs(query(collection(db, "results"), ...constraints));
  if (process.env.NODE_ENV !== "production") {
    trackReads(
      describeQuery({ gameId, startMs, endMs, order, max }),
      Math.max(snapshot.size, 1)
    );
  }
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
        `[Firestore] cache hit -> 0 doc reads (${describeQuery({ gameId, startMs, endMs, order, max })})`
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
  const past = await fetchResults({
    gameId,
    endMs: Date.now(),
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
// Games are a handful of documents, fetched once and shared via context.
// ---------------------------------------------------------------------------

function useGamesSource() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchGames() {
      try {
        const snapshot = await getDocs(collection(db, "games"));
        trackReads("games (all)", Math.max(snapshot.size, 1));
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (!cancelled) setGames(fetched);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      }
    }
    fetchGames();
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
