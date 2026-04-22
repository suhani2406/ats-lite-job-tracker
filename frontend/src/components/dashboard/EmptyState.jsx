import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react";

const EMPTY_IMAGE =
  "https://static.prod-images.emergentagent.com/jobs/9b52b448-064b-4433-9575-b8ab07ff69a1/images/27ea2d661576c9e731d38af98455a8bed3f46193392fc980fe2b963ccf2675f7.png";

export default function EmptyState({ filter, onAdd, hasAny }) {
  const isFiltered = filter && filter !== "All" && hasAny;
  return (
    <div
      className="border border-border rounded-lg bg-card/50 py-16 px-6 flex flex-col items-center text-center"
      data-testid="empty-state"
    >
      <img
        src={EMPTY_IMAGE}
        alt="No applications"
        className="h-44 w-44 object-contain opacity-80 mb-6"
      />
      <p className="uppercase text-[10px] tracking-[0.22em] text-muted-foreground font-medium mb-3">
        {isFiltered ? `No ${filter} applications` : "No applications yet"}
      </p>
      <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight max-w-md text-balance">
        {isFiltered
          ? `Nothing in ${filter} — try another stage or add a new application.`
          : "Start building your pipeline. Add your first application."}
      </h3>
      <p className="text-sm text-muted-foreground mt-3 max-w-md">
        Keep title, company, link, and status in one place. Move through stages with a click.
      </p>
      <Button
        onClick={onAdd}
        className="mt-8 h-11 bg-primary hover:bg-primary/90 font-medium"
        data-testid="empty-add-button"
      >
        <Plus size={16} weight="bold" className="mr-2" />
        Add Application
      </Button>
    </div>
  );
}
