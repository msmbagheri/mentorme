"use client";

import { signOut } from "next-auth/react";
import { LogOut, ExternalLink } from "lucide-react";
import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ROLE_VARIANT: Record<Role, "brand" | "info" | "neutral"> = {
  ADMIN: "brand",
  EDITOR: "info",
  VIEWER: "neutral",
};

export function AdminHeader({
  name,
  email,
  role,
}: {
  name: string | null;
  email: string | null;
  role: Role;
}) {
  const initials = (name ?? email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
      <div className="lg:hidden">
        <span className="text-h4 font-bold text-gradient-logo">MentorMe</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <Button asChild variant="ghost" size="sm">
          <a href="/en" target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            <span className="hidden sm:inline">View site</span>
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[var(--radius-pill)] p-1 ps-2 transition-colors hover:bg-[var(--color-surface-alt)]"
              aria-label="Account menu"
            >
              <div className="hidden text-end sm:block">
                <div className="text-small font-semibold text-[var(--color-text-primary)]">
                  {name ?? email}
                </div>
              </div>
              <span
                className="flex size-9 items-center justify-center rounded-full bg-gradient-cta text-small font-bold text-white"
                aria-hidden
              >
                {initials}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-small font-semibold text-[var(--color-text-primary)]">
                {name ?? "Account"}
              </span>
              <span className="font-normal lowercase text-[var(--color-text-muted)]">
                {email}
              </span>
              <Badge variant={ROLE_VARIANT[role]} className="mt-1 w-fit">
                {role}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => void signOut({ callbackUrl: "/admin/login" })}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
