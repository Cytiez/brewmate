import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Bean } from "@/lib/db-types";

export default function BeanCard({ bean, index }: { bean: Bean; index: number }) {
  const days = bean.roast_date ? Math.floor((Date.now() - new Date(bean.roast_date).getTime()) / 86400000) : null;
  const meta = [bean.roaster, bean.origin_country].filter(Boolean).join(" · ");
  const stats = [bean.process, bean.roast_level, days != null ? `${days}d` : null].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/beans/${bean.id}`}
      className="group block py-4 md:py-5 border-b border-rule hover:bg-elevated transition-colors -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8"
    >
      <div className="flex items-start gap-4">
        <div className="font-mono text-[11px] tabular-nums text-ink-3 pt-1 w-8 flex-none">
          {(index + 1).toString().padStart(2, "0")}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="display text-xl md:text-2xl leading-tight truncate">{bean.name}</h3>
            {bean.is_active ? (
              <span className="font-mono text-[10px] uppercase tracking-kissaten text-persimmon flex-none">
                ● active
              </span>
            ) : null}
          </div>
          {meta && <p className="text-[14px] md:text-[15px] text-ink-2 truncate">{meta}</p>}
          {stats && (
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 mt-1">{stats}</p>
          )}

          {bean.flavor_notes?.length ? (
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
              {bean.flavor_notes.slice(0, 5).map((n, i) => (
                <span key={n} className="font-serif text-[14px] italic text-ink-2">
                  {n}{i < Math.min(4, bean.flavor_notes.length - 1) ? "," : ""}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <ChevronRight className="h-4 w-4 text-ink-3 group-hover:text-ink translate-y-1 flex-none transition-colors" strokeWidth={1.5} />
      </div>
    </Link>
  );
}
