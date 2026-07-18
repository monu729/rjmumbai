import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/components/config/fire-config";

// Firestore is queried here, server-side, and the JSON response is cached on
// Vercel's CDN via Cache-Control. Every visitor shares the cached copy, so
// Firestore reads no longer scale with traffic.
export const dynamic = "force-dynamic";

// "Today" is anchored to India Standard Time - the site's audience and the
// games' schedule. Cache tiers by how settled the requested range is:
//   ends before the current month  -> 90 days (completed months are frozen)
//   ends before today's IST midnight -> 24 hours (recent days, may be corrected)
//   touches today                   -> 60 seconds (live)
// Boundaries roll forward automatically as IST midnight / month-start pass.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
function startOfTodayIstMs() {
  const nowIst = Date.now() + IST_OFFSET_MS;
  return Math.floor(nowIst / DAY_MS) * DAY_MS - IST_OFFSET_MS;
}
// function startOfCurrentMonthIstMs() {
//   const nowIst = new Date(Date.now() + IST_OFFSET_MS);
//   return Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), 1) - IST_OFFSET_MS;
// }

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const startMs = searchParams.has("startMs")
    ? Number(searchParams.get("startMs"))
    : null;
  const endMs = searchParams.has("endMs")
    ? Number(searchParams.get("endMs"))
    : null;
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const max = searchParams.has("max") ? Number(searchParams.get("max")) : null;

  if (
    (startMs != null && !Number.isFinite(startMs)) ||
    (endMs != null && !Number.isFinite(endMs)) ||
    (max != null && (!Number.isInteger(max) || max < 1 || max > 500))
  ) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const constraints = [];
  if (gameId) constraints.push(where("game_id", "==", gameId));
  if (startMs != null)
    constraints.push(where("selected_time", ">=", Timestamp.fromMillis(startMs)));
  if (endMs != null)
    constraints.push(where("selected_time", "<=", Timestamp.fromMillis(endMs)));
  constraints.push(orderBy("selected_time", order));
  if (max != null) constraints.push(limit(max));

  try {
    const snapshot = await getDocs(
      query(collection(db, "results"), ...constraints)
    );
    // Only the fields the UI uses - trims payload and keeps the client shape
    // ({ selected_time: { seconds } }) identical to the old SDK objects.
    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        game_id: data.game_id,
        value: data.value,
        selected_time: { seconds: data.selected_time?.seconds ?? null },
      };
    });

    // let cacheControl;
    // if (endMs != null && endMs < startOfCurrentMonthIstMs()) {
    //   // Completed past months: frozen data -> 90 days.
    //   cacheControl = "public, s-maxage=7776000, stale-while-revalidate=7776000";
    // } else if (endMs != null && endMs < startOfTodayIstMs()) {
    //   // Past days within the current month (e.g. yesterday) -> 24 hours.
    //   cacheControl = "public, s-maxage=86400, stale-while-revalidate=604800";
    // } else {
    //   // Touches today (today's chart, "latest result") -> 60 seconds.
    //   cacheControl = "public, s-maxage=60, stale-while-revalidate=300";
    // }


    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    const todayStart = startOfTodayIstMs();
    const now = Date.now();

    let cacheControl;

    if (endMs != null) {
      if (endMs < todayStart) {
        // Any previous date (yesterday or older)
        cacheControl =
          "public, s-maxage=7776000, stale-while-revalidate=7776000";
      } else if (endMs < now - THREE_HOURS_MS) {
        // Today's data, but at least 3 hours old
        cacheControl =
          "public, s-maxage=86400, stale-while-revalidate=604800";
      } else {
        // Live data (last 3 hours)
        cacheControl =
          "public, s-maxage=10, stale-while-revalidate=300";
      }
    } else {
      // No endMs means likely latest/live data
      cacheControl =
        "public, s-maxage=10, stale-while-revalidate=300";
    }

// Explanation
// 9:00 AM ----- 12:00 PM ----- 3:00 PM ----- 4:00 PM ----- 6:00 PM
//    │               │             │             │            │
//    │               │             │             │            Current time
//    │               │             │             │
// 24-hour cache 24-hour cache   Boundary     10-second cache

    return NextResponse.json(results, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("results API query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
