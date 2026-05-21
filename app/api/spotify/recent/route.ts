import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createHeatmapGrid } from "@/lib/spotify";
import type { SpotifyRecentlyPlayed } from "@/types/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    return NextResponse.json(
      { message: errorBody?.error?.message ?? "Spotify request failed" },
      { status: 500 },
    );
  }

  const data = (await response.json()) as SpotifyRecentlyPlayed;
  const heatmap = createHeatmapGrid(data.items);

  return NextResponse.json({ heatmap, items: data.items });
}