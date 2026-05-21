import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { GenreCount, SpotifyArtist, SpotifyProfile, SpotifyTopResponse } from "@/types/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [profileResponse, topArtistsResponse] = await Promise.all([
    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }),
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }),
  ]);

  if (!profileResponse.ok) {
    const errorBody = await profileResponse.json().catch(() => null);
    return NextResponse.json(
      { message: errorBody?.error?.message ?? "Spotify profile request failed" },
      { status: 500 },
    );
  }

  if (!topArtistsResponse.ok) {
    const errorBody = await topArtistsResponse.json().catch(() => null);
    return NextResponse.json(
      { message: errorBody?.error?.message ?? "Spotify artists request failed" },
      { status: 500 },
    );
  }

  const profile = (await profileResponse.json()) as SpotifyProfile;
  const topArtists = (await topArtistsResponse.json()) as SpotifyTopResponse<SpotifyArtist>;

  const genreFrequency = new Map<string, number>();

  for (const artist of topArtists.items) {
    for (const genre of artist.genres) {
      genreFrequency.set(genre, (genreFrequency.get(genre) ?? 0) + 1);
    }
  }

  const topGenres: GenreCount[] = Array.from(genreFrequency.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  return NextResponse.json({ profile, topGenres });
}