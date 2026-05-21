"use client";

import type { RefObject } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import type { GenreCount, SpotifyProfile, SpotifyTrack } from "@/types/spotify";

interface PersonalityCardProps {
  readonly profile: SpotifyProfile | null;
  readonly topTracks: SpotifyTrack[];
  readonly topGenres: GenreCount[];
  readonly cardRef: RefObject<HTMLDivElement | null>;
}

function getPersonalityLabel(genre?: string) {
  const value = genre?.toLowerCase() ?? "";

  if (value.includes("hip hop") || value.includes("hip-hop")) {
    return "Rhythm Architect";
  }

  if (value.includes("pop")) {
    return "Mainstream Maven";
  }

  if (value.includes("rock")) {
    return "Guitar Loyalist";
  }

  if (value.includes("electronic") || value.includes("dance")) {
    return "Digital Nomad";
  }

  if (value.includes("classical")) {
    return "Timeless Curator";
  }

  return "Eclectic Explorer";
}

async function exportCard(cardElement: HTMLDivElement | null) {
  if (!cardElement) {
    return;
  }

  const canvas = await html2canvas(cardElement, {
    backgroundColor: null,
    scale: 2,
  });

  const link = document.createElement("a");
  link.download = "tunepulse-personality-card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function PersonalityCard({ profile, topTracks, topGenres, cardRef }: Readonly<PersonalityCardProps>) {
  const displayName = profile?.display_name ?? "TunePulse fan";
  const spotifyId = profile?.display_name
    ? `@${profile.display_name.toLowerCase().replace(/\s+/g, "")}`
    : "@spotify";
  const avatar = profile?.images[0]?.url;
  const label = getPersonalityLabel(topGenres[0]?.genre);
  const trackNames = topTracks.slice(0, 3).map((track) => track.name);

  return (
    <section className="animate-fade-up space-y-4" style={{ animationDelay: "500ms" }}>
      <div
        ref={cardRef}
        className="relative flex h-[340px] w-full max-w-[600px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(29,185,84,0.08),transparent_30%)]" />
        <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(120deg,rgba(29,185,84,0)_0%,rgba(29,185,84,0.08)_18%,rgba(255,255,255,0.04)_32%,rgba(29,185,84,0.12)_50%,rgba(255,255,255,0.04)_68%,rgba(29,185,84,0.08)_82%,rgba(29,185,84,0)_100%)] bg-[length:200%_200%] opacity-70 mix-blend-screen" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image src={avatar} alt={displayName} width={60} height={60} className="h-15 w-15 rounded-full object-cover" />
              ) : (
                <div className="flex h-15 w-15 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-lg font-semibold text-white">{displayName}</p>
                <p className="text-sm text-zinc-400">{spotifyId}</p>
              </div>
            </div>

            <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Listener DNA
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Your profile reads as</p>
              <h3 className="mt-2 text-3xl font-black tracking-tight text-white">{label}</h3>
            </div>

            <div className="space-y-2 text-sm text-zinc-300">
              {trackNames.length ? (
                trackNames.map((trackName, index) => (
                  <p key={trackName}>
                    <span className="text-accent">{index + 1}.</span> {trackName}
                  </p>
                ))
              ) : (
                <p className="text-zinc-500">Your top tracks will appear here once we have enough data.</p>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {topGenres.slice(0, 3).map((genre) => (
                <span key={genre.genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                  {genre.genre}
                </span>
              ))}
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent">TunePulse</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void exportCard(cardRef.current)}
          className="rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#22c55e]"
        >
          Export PNG
        </button>
      </div>
    </section>
  );
}