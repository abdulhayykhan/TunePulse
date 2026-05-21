import Image from "next/image";
import type { SpotifyTrack } from "@/types/spotify";
import { getTrackArtists, getTrackImage } from "@/lib/spotify";

interface TopTracksProps {
  tracks: SpotifyTrack[];
  isLoading: boolean;
}

export default function TopTracks({ tracks, isLoading }: TopTracksProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-6 shadow-glow">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-accent">Top tracks</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Your current repeat queue</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">1-20</span>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                <div className="h-8 w-6 rounded bg-white/10" />
                <div className="h-12 w-12 rounded-lg bg-white/10" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/5 rounded bg-white/10" />
                  <div className="h-3 w-2/5 rounded bg-white/5" />
                </div>
              </div>
            ))
          : tracks.map((track, index) => {
              const image = getTrackImage(track);

              return (
                <a
                  key={track.id}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-transparent border-l-accent/0 bg-white/[0.03] p-3 transition hover:border-l-accent hover:bg-white/[0.05]"
                >
                  <div className="w-6 text-right text-sm font-semibold text-zinc-500 group-hover:text-zinc-300">
                    {index + 1}
                  </div>

                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/10">
                    {image ? (
                      <Image src={image} alt={track.name} fill className="object-cover" sizes="48px" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{track.name}</h3>
                    <p className="truncate text-sm text-zinc-400">{getTrackArtists(track)}</p>
                  </div>
                </a>
              );
            })}
      </div>
    </section>
  );
}