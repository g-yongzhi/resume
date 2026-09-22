import type { ReactNode } from "react";
import { CalendarDays, Sparkles, Star, TrendingUp } from "lucide-react";
import type { ExtendedStats } from "../../lib/adminApi";
import { GOLD } from "../../lib/adminUtils";

type Props = {
  stats: ExtendedStats;
  activePeriod: "" | "today" | "week";
  starredOnly: boolean;
  onPeriod: (p: "" | "today" | "week") => void;
  onStarred: (v: boolean) => void;
};

export function InsightsPanel({ stats, activePeriod, starredOnly, onPeriod, onStarred }: Props) {
  const max = Math.max(1, ...stats.trend.map((t) => t.count));

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1fr_minmax(0,280px)]">
        <div className="border-b border-zinc-100 p-5 lg:border-b-0 lg:border-r">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            <TrendingUp size={14} />
            近 7 日咨询趋势
          </p>
          <div className="mt-5 flex h-28 items-end justify-between gap-1.5 sm:gap-2">
            {stats.trend.map((bar) => {
              const barH = Math.round((bar.count / max) * 72);
              const isToday = bar.date === stats.trend[stats.trend.length - 1]?.date;
              return (
                <div key={bar.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium tabular-nums text-zinc-500">{bar.count || "·"}</span>
                  <div
                    className="w-full max-w-9 rounded-t-md"
                    style={{
                      height: Math.max(4, barH),
                      background: isToday
                        ? `linear-gradient(180deg, ${GOLD}, #8a6d2b)`
                        : "color-mix(in srgb, #141414 14%, transparent)",
                    }}
                    title={`${bar.date}: ${bar.count} 条`}
                  />
                  <span className="text-[9px] tabular-nums text-zinc-400">{bar.date.slice(5).replace("-", "/")}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-zinc-100 sm:grid-cols-4 lg:grid-cols-2">
          <InsightPill
            icon={<Sparkles size={16} />}
            label="今日新增"
            value={stats.today}
            active={activePeriod === "today"}
            onClick={() => onPeriod(activePeriod === "today" ? "" : "today")}
          />
          <InsightPill
            icon={<CalendarDays size={16} />}
            label="本周"
            value={stats.week}
            active={activePeriod === "week"}
            onClick={() => onPeriod(activePeriod === "week" ? "" : "week")}
          />
          <InsightPill
            icon={<Star size={16} />}
            label="星标"
            value={stats.starred}
            active={starredOnly}
            onClick={() => onStarred(!starredOnly)}
          />
          <div className="flex flex-col items-start gap-2 bg-[#C5A059]/[0.06] p-4">
            <span className="text-[#C5A059]">
              <TrendingUp size={16} />
            </span>
            <span className="text-2xl font-bold tabular-nums text-zinc-900">{stats.pending}</span>
            <span className="text-[11px] font-medium text-zinc-500">待处理</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightPill({
  icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 bg-white p-4 text-left transition hover:bg-zinc-50 ${
        active ? "ring-2 ring-inset ring-[#C5A059]/45" : ""
      }`}
    >
      <span className="text-zinc-400">{icon}</span>
      <span className="text-2xl font-bold tabular-nums text-zinc-900">{value}</span>
      <span className="text-[11px] font-medium text-zinc-500">{label}</span>
    </button>
  );
}
