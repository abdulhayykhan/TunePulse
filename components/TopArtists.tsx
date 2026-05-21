import Image from "next/image";
import type { SpotifyArtist } from "@/types/spotify";

interface TopArtistsProps {
  artists: SpotifyArtist[];
  isLoading: boolean;
}

export default function TopArtists({ artists, isLoading }: TopArtistsProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-6 shadow-glow">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.28em] text-accent">Top artists</p>
        <h2 className="mt-1 text-2xl font-bold text-white">Artists shaping the signal</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="animate-pulse rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-white/10" />
              <div className="mt-4 h-4 rounded bg-white/10" />
              <div className="mt-2 h-3 w-3/5 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {artists.map((artist) => {
            const image = artist.images[0]?.url;
            const genre = artist.genres[0] ?? "genreless";

            return (
              <a
                key={artist.id}
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-4 text-center transition duration-200 hover:scale-[1.03] hover:border-accent/50 hover:shadow-[0_0_0_1px_rgba(29,185,84,0.24)]"
              >
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/5 bg-white/10">
                  {image ? (
                    <Image src={image} alt={artist.name} fill className="object-cover" sizes="80px" />
                  ) : null}
                </div>
                <h3 className="mt-4 truncate font-semibold text-white">{artist.name}</h3>
                <p className="mt-2 line-clamp-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {genre}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}