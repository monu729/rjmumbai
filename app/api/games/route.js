import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/components/config/fire-config";

// force-dynamic so Next never freezes this at build time; freshness is
// governed by the CDN Cache-Control below instead (new games show up
// within 5 minutes).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "games"));
    const games = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        status: data.status,
      };
    });
    return NextResponse.json(games, {
      headers: {
        "Cache-Control": "public, s-maxage=7776000, stale-while-revalidate=7776000",
      },
    });
  } catch (error) {
    console.error("games API query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
