import { STATUSES } from "@/lib/statuses";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function FilterBar({ active, onChange, counts, search, onSearch }) {
  const tabs = ["All", ...STATUSES];
  return (
    <div
      className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between"
      data-testid="filter-bar"
    >
      <div className="flex flex-wrap gap-2" data-testid="filter-tabs">
        {tabs.map((t) => {
          const isActive = active === t;
          const count = counts[t] ?? 0;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              data-testid={`filter-tab-${t.toLowerCase()}`}
              className={[
                "h-9 px-4 rounded-md border text-sm font-medium inline-flex items-center gap-2 transition-all",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_0_3px_hsl(221_83%_53%/0.15)]"
                  : "bg-card border-border text-foreground hover:border-muted-foreground/40 hover:-translate-y-[1px]",
              ].join(" ")}
            >
              <span>{t}</span>
              <span
                className={[
                  "text-[10px] tracking-wider px-1.5 py-0.5 rounded-sm",
                  isActive ? "bg-white/15" : "bg-secondary text-muted-foreground",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative lg:w-72">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search title, company, location"
          className="h-10 pl-9 bg-card border-border focus-visible:ring-primary"
          data-testid="search-input"
        />
      </div>
    </div>
  );
}
