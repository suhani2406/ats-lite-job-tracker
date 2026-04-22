import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, STATUS_STYLES } from "@/lib/statuses";

const initialForm = {
  title: "",
  company: "",
  location: "",
  link: "",
  status: "Applied",
};

export default function AddJobDialog({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) setForm(initialForm);
  }, [open]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) return;
    setSubmitting(true);
    await onSubmit({
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      link: form.link.trim(),
      status: form.status,
    });
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] bg-card border-border"
        data-testid="add-job-dialog"
      >
        <DialogHeader>
          <p className="uppercase text-[10px] tracking-[0.22em] text-muted-foreground font-medium">
            New application
          </p>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight">
            Add a job
          </DialogTitle>
          <DialogDescription>
            Track it from Applied all the way to Offer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="add-job-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Job title *
              </Label>
              <Input
                value={form.title}
                onChange={update("title")}
                placeholder="Senior Software Engineer"
                required
                className="h-10 bg-background"
                data-testid="add-job-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Company *
              </Label>
              <Input
                value={form.company}
                onChange={update("company")}
                placeholder="Acme Corp"
                required
                className="h-10 bg-background"
                data-testid="add-job-company-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Location
              </Label>
              <Input
                value={form.location}
                onChange={update("location")}
                placeholder="Remote / New York"
                className="h-10 bg-background"
                data-testid="add-job-location-input"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Job link
              </Label>
              <Input
                value={form.link}
                onChange={update("link")}
                placeholder="https://…"
                className="h-10 bg-background"
                data-testid="add-job-link-input"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger
                  className="h-10 bg-background border-border"
                  data-testid="add-job-status-trigger"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {STATUSES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      data-testid={`add-job-status-option-${s.toLowerCase()}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[s].dot}`} />
                        {s}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 border-border bg-background hover:bg-secondary"
              data-testid="add-job-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !form.title.trim() || !form.company.trim()}
              className="h-10 bg-primary hover:bg-primary/90 font-medium"
              data-testid="add-job-submit-button"
            >
              {submitting ? "Adding…" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
