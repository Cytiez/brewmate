import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Bean } from "@/lib/db-types";

export default function BeanCard({ bean }: { bean: Bean }) {
  const days = bean.roast_date ? Math.floor((Date.now() - new Date(bean.roast_date).getTime()) / 86400000) : null;
  const meta = [bean.roaster, bean.origin_country].filter(Boolean).join(" · ");
  const stats = [
    bean.process ? cap(bean.process) : null,
    bean.roast_level ? cap(bean.roast_level) : null,
    days != null ? `${days}d off roast` : null,
  ].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/beans/${bean.id}`}
      className="group block py-4 md:py-5 border-b border-rule hover:bg-elevated transition-colors -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="display text-xl md:text-2xl leading-tight truncate">{bean.name}</h3>
            {bean.is_active ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-persimmon flex-none">
                <span className="h-1.5 w-1.5 rounded-full bg-persimmon" />
                Active
              </span>
            ) : null}
          </div>
          {meta && <p className="text-[14px] md:text-[15px] text-ink-2 truncate">{meta}</p>}
          {stats && (
            <p className="text-[13px] text-ink-3 mt-1">{stats}</p>
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

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
