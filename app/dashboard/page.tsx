"use client";

import { useEffect, useRef, useState } from "react";
import type { HeatmapCell, GenreCount, SpotifyArtist, SpotifyProfile, SpotifyRecentlyPlayedItem, SpotifyTrack, TimeRange } from "@/types/spotify";
import TopTracks from "@/components/TopTracks";
import TopArtists from "@/components/TopArtists";
import GenreBreakdown from "@/components/GenreBreakdown";
import ListeningHeatmap from "@/components/ListeningHeatmap";
import PersonalityCard from "@/components/PersonalityCard";

const rangeTabs: Array<{ label: string; value: TimeRange }> = [
  { label: "4 Weeks", value: "short_term" },
  { label: "6 Months", value: "medium_term" },
  { label: "All Time", value: "long_term" },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("short_term");
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [recentItems, setRecentItems] = useState<SpotifyRecentlyPlayedItem[]>([]);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [topGenres, setTopGenres] = useState<GenreCount[]>([]);
  const [isTracksLoading, setIsTracksLoading] = useState(true);
  const [isArtistsLoading, setIsArtistsLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadRankings() {
      setIsTracksLoading(true);
      setIsArtistsLoading(true);

      try {
        const [tracksResponse, artistsResponse] = await Promise.all([
          fetch(`/api/spotify/top?type=tracks&time_range=${timeRange}`, { signal: controller.signal }),
          fetch(`/api/spotify/top?type=artists&time_range=${timeRange}`, { signal: controller.signal }),
        ]);

        if (tracksResponse.ok) {
          const tracksData = (await tracksResponse.json()) as { items: SpotifyTrack[] };
          if (active) {
            setTopTracks(tracksData.items ?? []);
          }
        }

        if (artistsResponse.ok) {
          const artistsData = (await artistsResponse.json()) as { items: SpotifyArtist[] };
          if (active) {
            setTopArtists(artistsData.items ?? []);
          }
        }
      } finally {
        if (active) {
          setIsTracksLoading(false);
          setIsArtistsLoading(false);
        }
      }
    }

    void loadRankings();

    return () => {
      active = false;
      controller.abort();
    };
  }, [timeRange]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadRecentAndProfile() {
      setIsRecentLoading(true);
      setIsProfileLoading(true);

      try {
        const [recentResponse, profileResponse] = await Promise.all([
          fetch("/api/spotify/recent", { signal: controller.signal }),
          fetch("/api/spotify/profile", { signal: controller.signal }),
        ]);

        if (recentResponse.ok) {
          const recentData = (await recentResponse.json()) as { heatmap: HeatmapCell[]; items: SpotifyRecentlyPlayedItem[] };
          if (active) {
            setHeatmap(recentData.heatmap ?? []);
            setRecentItems(recentData.items ?? []);
          }
        }

        if (profileResponse.ok) {
          const profileData = (await profileResponse.json()) as { profile: SpotifyProfile; topGenres: GenreCount[] };
          if (active) {
            setProfile(profileData.profile ?? null);
            setTopGenres(profileData.topGenres ?? []);
          }
        }
      } finally {
        if (active) {
          setIsRecentLoading(false);
          setIsProfileLoading(false);
        }
      }
    }

    void loadRecentAndProfile();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const personalitySource = topTracks.slice(0, 3);
  const genreSource = topGenres.slice(0, 3);

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 shadow-glow">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-accent">Listener dashboard</p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">How your Spotify habits actually look</h1>
            <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
              A compact snapshot of your top tracks, repeat artists, genre shape, and the hours you keep returning to music.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-black/30 p-1">
            {rangeTabs.map((tab) => {
              const active = tab.value === timeRange;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setTimeRange(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-accent text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <TopTracks tracks={topTracks} isLoading={isTracksLoading} />
        <TopArtists artists={topArtists} isLoading={isArtistsLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GenreBreakdown genres={topGenres} isLoading={isProfileLoading} />
        <ListeningHeatmap heatmap={heatmap} isLoading={isRecentLoading} />
      </div>

      <PersonalityCard
        profile={profile}
        topTracks={personalitySource}
        topGenres={genreSource}
        cardRef={cardRef}
      />

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-sm text-zinc-400">
        <p>Recent plays loaded: {recentItems.length}</p>
      </div>
    </div>
  );
}