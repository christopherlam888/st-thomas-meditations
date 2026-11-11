"use client";

import { useTheme } from "next-themes";
import { Github, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle light or dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
    >
      {/* icon choice handled purely by CSS to avoid hydration flash */}
      <Sun className="h-[18px] w-[18px] dark:hidden" aria-hidden />
      <Moon className="h-[18px] w-[18px] hidden dark:block" aria-hidden />
    </Button>
  );
}

export function GithubLink() {
  return (
    <a
      href="https://github.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <Github className="h-[18px] w-[18px]" aria-hidden />
      <span className="hidden sm:inline">GitHub</span>
    </a>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Open navigation"
      onClick={onClick}
      className="lg:hidden text-muted-foreground hover:text-foreground"
    >
      <Menu className="h-5 w-5" aria-hidden />
    </Button>
  );
}

export function SiteTitle() {
  return (
    <div className="min-w-0">
      <a href="/" className="group inline-flex items-baseline gap-2 min-w-0">
        <span aria-hidden className="fleuron text-base leading-none hidden sm:inline">❧</span>
        <span className="truncate font-semibold text-[17px] sm:text-[19px] tracking-tight group-hover:text-primary transition-colors">
          Meditations of St. Thomas Aquinas, O.P.
        </span>
      </a>
      <p className="truncate text-[12.5px] text-muted-foreground mt-0.5">
        For Every Day · Fr. E. C. McEniry, O.P. · 1941
      </p>
    </div>
  );
}
