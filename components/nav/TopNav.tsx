"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Coffee, History, SlidersHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/ui/ThemeToggle";

const items = [
  { href: "/home",      label: "Home",    icon: House },
  { href: "/beans",     label: "Beans",   icon: Coffee },
  { href: "/equipment", label: "Gear",    icon: SlidersHorizontal },
  { href: "/history",   label: "Journal", icon: History },
];

export default function TopNav({ signOut }: { signOut?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <header className="hidden md:block sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-rule">
      <div className="spine-wide flex items-center h-16 gap-8">
        {/* Masthead */}
        <Link href="/home" className="flex items-baseline gap-2 group">
          <span className="display text-lg leading-none group-hover:text-persimmon transition-colors">
            Brewmate
          </span>
          <span className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3">
            日録
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 px-3 h-9 font-mono text-[11px] uppercase tracking-widest",
                  "transition-colors",
                  active
                    ? "text-ink border-b-2 border-ink"
                    : "text-ink-3 hover:text-ink",
                )}
              >
                <it.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: log CTA + theme + signout */}
        <div className="flex items-center gap-3">
          <Link
            href="/log"
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-4 font-mono text-[11px] uppercase tracking-widest",
              "transition-colors",
              pathname.startsWith("/log")
                ? "bg-persimmon text-paper"
                : "bg-ink text-paper hover:bg-persimmon",
            )}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Log
          </Link>
          <ThemeToggle />
          {signOut}
        </div>
      </div>
    </header>
  );
}
