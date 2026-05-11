"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = (theme === "system" ? resolvedTheme : theme) ?? "light";

  function toggle() {
    setTheme(current === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center h-9 w-9 text-ink-2 hover:text-ink transition-colors"
      suppressHydrationWarning
    >
      {/* render placeholder dimensions until mounted to avoid flash */}
      {mounted ? (
        current === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />
      ) : (
        <span className="block h-[18px] w-[18px]" />
      )}
    </button>
  );
}
