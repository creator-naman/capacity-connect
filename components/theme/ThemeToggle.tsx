"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

/** Restrained two-state toggle; initial value follows the system preference. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Switch to ${next} theme`}
      aria-label={`Switch to ${next} theme`}
      className={
        "flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-secondary transition-colors duration-150 hover:bg-surface-sunken hover:text-ink " +
        className
      }
    >
      {theme === "dark" ? (
        <Sun size={18} strokeWidth={1.75} />
      ) : (
        <Moon size={18} strokeWidth={1.75} />
      )}
    </button>
  );
}
