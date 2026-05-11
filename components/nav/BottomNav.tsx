"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Coffee,
  History,
  SlidersHorizontal,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
};

const items: Item[] = [
  { href: "/home", label: "Home", icon: House },
  { href: "/beans", label: "Beans", icon: Coffee },
  { href: "/log", label: "Log", icon: Plus, primary: true },
  { href: "/equipment", label: "Gear", icon: SlidersHorizontal },
  { href: "/history", label: "Journal", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-30 mx-auto max-w-mobile bg-paper/90 backdrop-blur-md border-t border-rule pb-safe-bottom"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 h-16 relative">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href} className="flex">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1",
                  "font-mono text-[9px] uppercase tracking-widest transition-colors",
                  active ? "text-ink" : "text-ink-3 hover:text-ink-2",
                )}
              >
                {it.primary ? (
                  <span
                    className={cn(
                      "flex items-center justify-center h-11 w-11 rounded-full -translate-y-3 transition-all",
                      "bg-ink text-paper",
                      "ring-[6px] ring-paper",
                      active && "bg-persimmon",
                    )}
                  >
                    <it.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                ) : (
                  <it.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.5} />
                )}
                <span className={cn(it.primary && "-translate-y-2 text-[8px]")}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
