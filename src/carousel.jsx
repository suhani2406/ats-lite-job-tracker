import { STATUSES, STATUS_STYLES } from "@/lib/statuses";
import { TrendUp } from "@phosphor-icons/react";

export default function StatsStrip({ counts }) {
  const total = counts.All || 0;

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-5 gap-4 border border-border rounded-lg bg-card/50 overflow-hidden"
      data-testid="stats-strip"
    >
      <StatCell
        label="Total"
        value={total}
        accent="hsl(221 83% 53%)"
        icon={<TrendUp size={18} weight="duotone" className="text-primary" />}
      />
      {STATUSES.map((s) => {
        const pct = total > 0 ? Math.round(((counts[s] || 0) / total) * 100) : 0;
        const style = STATUS_STYLES[s];
        return (
          <StatCell
            key={s}
            label={s}
            value={counts[s] || 0}
            sub={`${pct}%`}
            accent={style.accent}
          />
        );
      })}
    </div>
  );
}

function StatCell({ label, value, sub, accent, icon }) {
  return (
    <div
      className="relative p-5 sm:p-6 border-r last:border-r-0 border-border"
      data-testid={`stat-cell-${label.toLowerCase()}`}
    >
      <div
        className="absolute top-0 left-0 h-px w-10"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between">
        <span className="uppercase text-[10px] tracking-[0.2em] text-muted-foreground font-medium">
          {label}
        </span>
        {icon}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-3xl sm:text-4xl font-black tracking-tight">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
