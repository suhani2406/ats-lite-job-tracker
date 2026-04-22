import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { STATUSES } from "@/lib/statuses";
import Topbar from "@/components/dashboard/Topbar";
import StatsStrip from "@/components/dashboard/StatsStrip";
import FilterBar from "@/components/dashboard/FilterBar";
import JobCard from "@/components/dashboard/JobCard";
import EmptyState from "@/components/dashboard/EmptyState";
import AddJobDialog from "@/components/dashboard/AddJobDialog";
import Pagination from "@/components/dashboard/Pagination";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PAGE_SIZE = 9;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ All: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [addOpen, setAddOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (filter !== "All") params.status = filter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get("/jobs", { params });
      setJobs(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
      setCounts(data.counts_by_status);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [filter, page, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreate = async (payload) => {
    try {
      await api.post("/jobs", payload);
      toast.success("Application added");
      setAddOpen(false);
      setPage(1);
      setFilter("All");
      fetchJobs();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const handleStatusChange = async (job, status) => {
    try {
      await api.patch(`/jobs/${job.id}`, { status });
      toast.success(`Moved to ${status}`);
      fetchJobs();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}" at ${job.company}?`)) return;
    try {
      await api.delete(`/jobs/${job.id}`);
      toast.success("Application deleted");
      // If last item on page was deleted, step back a page
      if (jobs.length === 1 && page > 1) setPage(page - 1);
      else fetchJobs();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="dashboard-page">
      <Topbar user={user} onLogout={logout} onAdd={() => setAddOpen(true)} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="uppercase text-xs tracking-[0.2em] text-muted-foreground font-medium mb-2">
              Your Pipeline
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Hi, {user?.name?.split(" ")[0] || "there"}.
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {counts.All} total application{counts.All === 1 ? "" : "s"} tracked.
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="h-11 bg-primary hover:bg-primary/90 font-medium group self-start sm:self-auto"
            data-testid="header-add-job-button"
          >
            <Plus size={16} weight="bold" className="mr-2 group-hover:rotate-90 transition-transform" />
            New Application
          </Button>
        </div>

        {/* Stats */}
        <StatsStrip counts={counts} />

        {/* Filter + Search */}
        <div className="mt-10 mb-6">
          <FilterBar
            active={filter}
            onChange={(f) => {
              setFilter(f);
              setPage(1);
            }}
            counts={counts}
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 border border-border rounded-lg bg-card/50 animate-pulse"
                data-testid={`job-skeleton-${i}`}
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            filter={filter}
            onAdd={() => setAddOpen(true)}
            hasAny={counts.All > 0}
          />
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
            >
              <AnimatePresence>
                {jobs.map((j) => (
                  <motion.div
                    key={j.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                    }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <JobCard
                      job={j}
                      statuses={STATUSES}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
          </>
        )}
      </main>

      <AddJobDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={handleCreate} />
    </div>
  );
}
