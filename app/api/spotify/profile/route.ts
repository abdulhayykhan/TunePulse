import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { GenreCount, SpotifyArtist, SpotifyProfile, SpotifyTopResponse } from "@/types/spotify";

export const dynamic = "force-dynamic";

function collectArtistGenres(artists: SpotifyArtist[]): string[] {
  return artists.flatMap((artist) => artist?.genres ?? []);
}

function countGenres(genres: string[]): GenreCount[] {
  const genreFrequency = new Map<string, number>();

  genres.forEach((genre) => {
    genreFrequency.set(genre, (genreFrequency.get(genre) ?? 0) + 1);
  });

  return Array.from(genreFrequency.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
}

function buildTopGenres(artists: SpotifyArtist[]): GenreCount[] {
  return countGenres(collectArtistGenres(artists));
}

async function fetchGenresFromTopArtists(sessionToken: string, timeRange: "short_term" | "medium_term" | "long_term"): Promise<GenreCount[]> {
  const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=50`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const topArtists = (await response.json()) as SpotifyTopResponse<SpotifyArtist>;
  return buildTopGenres(topArtists.items);
}

async function fetchGenresFromAllTopArtists(sessionToken: string): Promise<GenreCount[]> {
  const [shortTermResponse, mediumTermResponse, longTermResponse] = await Promise.all([
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }),
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }),
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }),
  ]);

  const responses = [shortTermResponse, mediumTermResponse, longTermResponse];
  const allArtists: SpotifyArtist[] = [];

  for (const response of responses) {
    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as SpotifyTopResponse<SpotifyArtist>;
    allArtists.push(...(data.items ?? []));
  }

  return buildTopGenres(allArtists);
}

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

  let topGenres = buildTopGenres(topArtists.items);

  if (topGenres.length === 0) {
    topGenres = await fetchGenresFromAllTopArtists(session.accessToken);
  }

  return NextResponse.json({ profile, topGenres });
}