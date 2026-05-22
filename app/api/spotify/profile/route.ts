import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { GenreCount, SpotifyArtist, SpotifyProfile, SpotifyTopResponse, SpotifyTrack } from "@/types/spotify";

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

async function fetchGenresFromTopTracks(sessionToken: string): Promise<GenreCount[]> {
  const topTracksResponse = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term", {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!topTracksResponse.ok) {
    return [];
  }

  const topTracks = (await topTracksResponse.json()) as SpotifyTopResponse<SpotifyTrack>;
  const artistIds = Array.from(
    new Set(
      topTracks.items
        .flatMap((track) => track.artists ?? [])
        .map((artist) => artist.id)
        .filter(Boolean),
    ),
  ).slice(0, 50);

  const genreFrequency = new Map<string, number>();

  for (let index = 0; index < artistIds.length; index += 50) {
    const batchIds = artistIds.slice(index, index + 50);
    const artistsResponse = await fetch(`https://api.spotify.com/v1/artists?ids=${batchIds.join(",")}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!artistsResponse.ok) {
      continue;
    }

    const artistsData = (await artistsResponse.json()) as { artists: SpotifyArtist[] };

    for (const artist of artistsData.artists ?? []) {
      for (const genre of artist?.genres ?? []) {
        genreFrequency.set(genre, (genreFrequency.get(genre) ?? 0) + 1);
      }
    }
  }

  return Array.from(genreFrequency.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
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
    topGenres = await fetchGenresFromTopTracks(session.accessToken);
  }

  return NextResponse.json({ profile, topGenres });
}