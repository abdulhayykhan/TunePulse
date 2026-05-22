import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createHeatmapGrid } from "@/lib/spotify";
import type { SpotifyRecentlyPlayed } from "@/types/spotify";

export const dynamic = "force-dynamic";

function buildRecentlyPlayedUrl(before?: number) {
  const url = new URL("https://api.spotify.com/v1/me/player/recently-played");
  url.searchParams.set("limit", "50");

  if (before) {
    url.searchParams.set("before", before.toString());
  }

  return url.toString();
}

function mergeRecentlyPlayedPages(...pages: SpotifyRecentlyPlayed["items"][]) {
  const merged = new Map<string, SpotifyRecentlyPlayed["items"][number]>();

  for (const page of pages) {
    for (const item of page) {
      merged.set(`${item.played_at}:${item.track.id}`, item);
    }
  }

  return Array.from(merged.values()).slice(0, 150);
}

async function fetchRecentlyPlayedPage(sessionToken: string, before?: number) {
  const response = await fetch(buildRecentlyPlayedUrl(before), {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? "Spotify request failed");
  }

  return (await response.json()) as SpotifyRecentlyPlayed;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = Date.now();
    const page1Before = undefined;
    const page2Before = now - 24 * 60 * 60 * 1000;
    const page3Before = now - 48 * 60 * 60 * 1000;

    const [page1, page2, page3] = await Promise.all([
      fetchRecentlyPlayedPage(session.accessToken, page1Before),
      fetchRecentlyPlayedPage(session.accessToken, page2Before),
      fetchRecentlyPlayedPage(session.accessToken, page3Before),
    ]);

    const mergedItems = mergeRecentlyPlayedPages(page1.items, page2.items, page3.items);
    const heatmap = createHeatmapGrid(mergedItems);

    return NextResponse.json({ heatmap, items: mergedItems });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spotify request failed";
    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}