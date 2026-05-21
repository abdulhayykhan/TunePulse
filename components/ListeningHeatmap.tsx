import type { HeatmapCell } from "@/types/spotify";

interface ListeningHeatmapProps {
  readonly heatmap: HeatmapCell[];
  readonly isLoading: boolean;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const emphasizedHours = new Set([0, 6, 12, 18, 23]);

function interpolateColor(value: number) {
  const base = { r: 26, g: 26, b: 26 };
  const accent = { r: 29, g: 185, b: 84 };
  const mix = {
    r: Math.round(base.r + (accent.r - base.r) * value),
    g: Math.round(base.g + (accent.g - base.g) * value),
    b: Math.round(base.b + (accent.b - base.b) * value),
  };

  return `rgb(${mix.r} ${mix.g} ${mix.b})`;
}

function formatTooltip(day: number, hour: number, count: number) {
  const weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][day];
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "am" : "pm";
  return `${weekday} ${displayHour}${suffix} — ${count} plays`;
}

export default function ListeningHeatmap(props: ListeningHeatmapProps) {
  const { heatmap, isLoading } = props;
  const maxCount = Math.max(1, ...heatmap.map((cell) => cell.count));

  return (
    <section className="animate-fade-up rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(29,185,84,0.12)]" style={{ animationDelay: "400ms" }}>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.28em] text-accent">Listening heatmap</p>
        <h2 className="mt-1 text-2xl font-bold text-white">When you keep the music on</h2>
      </div>

      {isLoading ? (
        <div className="h-[520px] animate-pulse rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-2 pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <div />
              {dayLabels.map((label) => (
                <div key={label} className="text-center">
                  {label}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-2">
                  <div className="pr-2 text-right text-[11px] leading-6 text-zinc-500">
                    {emphasizedHours.has(hour) ? `${hour}` : ""}
                  </div>

                  {Array.from({ length: 7 }, (_, day) => {
                    const cell = heatmap.find((entry) => entry.day === day && entry.hour === hour) ?? { day, hour, count: 0 };
                    const opacity = cell.count === 0 ? 0 : cell.count / maxCount;
                    const background = cell.count === 0 ? "#1a1a1a" : interpolateColor(opacity);
                    const cellIndex = hour * 7 + day;

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="group relative h-6 rounded-md border border-white/5 animate-fade-up transition hover:scale-[1.02]"
                        style={{
                          background,
                          animationDelay: `${cellIndex * 2}ms`,
                        }}
                        title={formatTooltip(day, hour, cell.count)}
                      >
                        <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-2 py-1 text-[11px] text-white shadow-2xl group-hover:block">
                          {formatTooltip(day, hour, cell.count)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}