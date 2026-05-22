import Image from "next/image";
import type { SpotifyArtist } from "@/types/spotify";

interface TopArtistsProps {
  readonly artists: SpotifyArtist[];
  readonly isLoading: boolean;
}

export default function TopArtists({ artists, isLoading }: Readonly<TopArtistsProps>) {
  return (
    <section className="animate-fade-up rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(29,185,84,0.12)]" style={{ animationDelay: "200ms" }}>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.28em] text-accent">Top artists</p>
        <h2 className="mt-1 text-2xl font-bold text-white">Artists shaping the signal</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="min-h-[13rem] animate-pulse rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
              <div className="mx-auto h-20 w-20 rounded-full bg-white/10" />
              <div className="mt-4 h-4 rounded bg-white/10" />
              <div className="mt-2 h-3 w-3/5 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {artists.map((artist) => {
            const image = artist.images[0]?.url;
            const genre = artist?.genres?.[0] ?? null;

            return (
              <a
                key={artist.id}
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className="group min-h-[13rem] rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 text-center transition duration-200 backdrop-blur-sm hover:scale-[1.03] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(29,185,84,0.14)]"
              >
                <div className="relative mx-auto h-20 w-20">
                  <div className="absolute inset-0 rounded-full border border-accent/25 transition duration-300 group-hover:animate-pulse group-hover:border-accent/70 group-hover:shadow-[0_0_0_1px_rgba(29,185,84,0.3)]" />
                  <div className="absolute inset-[2px] overflow-hidden rounded-full bg-white/10">
                    {image ? (
                      <Image src={image} alt={artist.name} fill className="object-cover transition duration-300 group-hover:scale-[1.08]" sizes="80px" />
                    ) : null}
                  </div>
                </div>
                <h3 className="mt-4 line-clamp-2 text-center text-sm leading-tight text-wrap font-semibold text-white">{artist.name}</h3>
                {genre ? (
                  <p className="mt-2 line-clamp-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {genre}
                  </p>
                ) : null}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}