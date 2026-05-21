import { Target, SignOut, User as UserIcon, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar({ user, onLogout, onAdd }) {
  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md"
      data-testid="dashboard-topbar"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md border border-border bg-card flex items-center justify-center">
            <Target size={20} weight="duotone" className="text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-black text-sm tracking-tight">ATS-Lite</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Job Tracker
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onAdd}
            variant="outline"
            className="hidden sm:inline-flex h-9 border-border bg-card hover:bg-secondary"
            data-testid="topbar-add-job-button"
          >
            <Plus size={14} weight="bold" className="mr-1.5" />
            Add Job
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-9 w-9 rounded-full border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center text-xs font-semibold"
                data-testid="user-menu-trigger"
                aria-label="User menu"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border bg-popover">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" data-testid="user-menu-name">
                    {user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" disabled>
                <UserIcon size={14} />
                <span className="text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10"
                onClick={onLogout}
                data-testid="logout-button"
              >
                <SignOut size={14} />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
