import { STATUS_STYLES } from "@/lib/statuses";
import {
  Buildings,
  MapPin,
  ArrowUpRight,
  Trash,
  CaretDown,
  Clock,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default function JobCard({ job, statuses, onStatusChange, onDelete }) {
  const style = STATUS_STYLES[job.status] || STATUS_STYLES.Applied;

  return (
    <div
      className="group relative border border-border bg-card rounded-lg p-6 transition-all duration-200 hover:border-muted-foreground/30 hover:-translate-y-0.5 flex flex-col"
      data-testid={`job-card-${job.id}`}
    >
      {}
      <div
        className="absolute top-0 left-0 h-px w-16 transition-all group-hover:w-24"
        style={{ background: style.accent }}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3
            className="font-display font-bold text-lg tracking-tight truncate"
            title={job.title}
            data-testid={`job-title-${job.id}`}
          >
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground truncate">
            <Buildings size={14} weight="duotone" className="shrink-0" />
            <span className="truncate" data-testid={`job-company-${job.id}`}>
              {job.company}
            </span>
          </div>
        </div>

        <span
          className={[
            "text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-sm border inline-flex items-center gap-1.5 shrink-0",
            style.badge,
          ].join(" ")}
          data-testid={`job-badge-${job.id}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground mb-5">
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>Applied {formatDate(job.created_at)}</span>
        </div>
        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline truncate"
            data-testid={`job-link-${job.id}`}
          >
            <ArrowUpRight size={13} weight="bold" />
            Job posting
          </a>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border bg-background hover:border-muted-foreground/40 transition-colors"
              data-testid={`status-dropdown-trigger-${job.id}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              <span>Change status</span>
              <CaretDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-border bg-popover">
            {statuses.map((s) => {
              const st = STATUS_STYLES[s];
              return (
                <DropdownMenuItem
                  key={s}
                  onClick={() => job.status !== s && onStatusChange(job, s)}
                  className="gap-2 text-sm"
                  data-testid={`status-option-${job.id}-${s.toLowerCase()}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {s}
                  {job.status === s && (
                    <span className="ml-auto text-[10px] text-muted-foreground">current</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => onDelete(job)}
          className="h-8 w-8 rounded-md border border-border bg-background hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 text-muted-foreground transition-colors inline-flex items-center justify-center"
          aria-label="Delete job"
          data-testid={`delete-button-${job.id}`}
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  );
}
