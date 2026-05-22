import type { GenreCount } from "@/types/spotify";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

interface GenreBreakdownProps {
  readonly genres: GenreCount[];
  readonly isLoading: boolean;
  readonly topArtistNames: string[];
}

interface GenreTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ readonly payload?: GenreCount }>;
}

function GenreTooltip({ active, payload }: GenreTooltipProps) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const current = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/90 px-4 py-3 text-sm text-white shadow-2xl">
      <p className="font-semibold capitalize">{current.genre}</p>
      <p className="mt-1 text-zinc-400">{current.count} listens</p>
    </div>
  );
}

export default function GenreBreakdown(props: GenreBreakdownProps) {
  const { genres, isLoading, topArtistNames } = props;
  const chartData = genres.slice(0, 6);
  const chart = (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={chartData} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis dataKey="genre" tick={{ fill: "#d4d4d8", fontSize: 12 }} />
        <PolarRadiusAxis tick={false} axisLine={false} stroke="rgba(255,255,255,0.12)" />
        <Radar dataKey="count" stroke="#1DB954" fill="#1DB954" fillOpacity={0.3} />
        <Tooltip content={<GenreTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex min-h-[320px] animate-pulse items-center justify-center rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
        <div className="h-72 w-72 rounded-full bg-white/5" />
      </div>
    );
  } else if (chartData.length) {
    content = chart;
  } else {
    content = (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 text-center text-sm text-zinc-500 backdrop-blur-sm">
        <p className="max-w-md text-zinc-300">Your artists are genre-less rebels - Spotify hasn't tagged them yet.</p>

        {topArtistNames.length ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {topArtistNames.slice(0, 3).map((artistName) => (
              <span key={artistName} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                {artistName}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="animate-fade-up rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(29,185,84,0.12)]" style={{ animationDelay: "300ms" }}>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.28em] text-accent">Genre breakdown</p>
        <h2 className="mt-1 text-2xl font-bold text-white">What your library leans toward</h2>
      </div>

      <div className="min-h-[320px]">{content}</div>

      <div className="mt-5 flex flex-wrap gap-2">
        {genres
          .slice()
          .sort((left, right) => right.count - left.count)
          .map((genre) => (
            <span
              key={genre.genre}
              className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              {genre.genre} · {genre.count}
            </span>
          ))}
      </div>
    </section>
  );
}