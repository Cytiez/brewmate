import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Minimal page header. Default: title + optional back arrow + optional right
// action. No eyebrow above the title — pages that want secondary info should
// render a .sublabel underneath instead.
export default function PageHeader({
  title,
  back,
  sublabel,
  action,
  size = "md",
}: {
  title: string;
  back?: string;
  sublabel?: React.ReactNode;
  action?: React.ReactNode;
  size?: "md" | "lg";
}) {
  const titleCls =
    size === "lg"
      ? "text-[40px] sm:text-[48px] md:text-[60px] lg:text-[72px]"
      : "text-[30px] sm:text-[34px] md:text-[40px] lg:text-[48px]";

  return (
    <header className="pt-2 pb-4 md:pb-5 mb-5 md:mb-7 border-b border-rule">
      {(back || action) && (
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center text-ink-2">
            {back ? (
              <Link
                href={back}
                className="-ml-2 inline-flex items-center justify-center h-9 w-9 hover:text-ink transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="h-[18px] w-[18px]" />
              </Link>
            ) : null}
          </div>
          {action ? <div className="text-ink-2">{action}</div> : null}
        </div>
      )}
      <h1 className={`display leading-[1.02] ${titleCls}`}>{title}</h1>
      {sublabel ? <p className="sublabel mt-2">{sublabel}</p> : null}
    </header>
  );
}
