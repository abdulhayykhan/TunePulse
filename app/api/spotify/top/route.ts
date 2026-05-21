import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { SpotifyArtist, SpotifyTopResponse, SpotifyTrack, TimeRange } from "@/types/spotify";

export const dynamic = "force-dynamic";

const validTypes = new Set(["tracks", "artists"] as const);
const validRanges = new Set<TimeRange>(["short_term", "medium_term", "long_term"]);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as "tracks" | "artists" | null;
  const timeRange = searchParams.get("time_range") as TimeRange | null;

  if (!type || !validTypes.has(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }

  if (!timeRange || !validRanges.has(timeRange)) {
    return NextResponse.json({ message: "Invalid time range" }, { status: 400 });
  }

  const response = await fetch(`https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=20`, {
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

  const data = (await response.json()) as SpotifyTopResponse<SpotifyTrack> | SpotifyTopResponse<SpotifyArtist>;
  return NextResponse.json(data);
}