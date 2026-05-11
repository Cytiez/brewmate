import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Asymmetric page head — hairline underline, optional left back arrow.
// Title scales up generously on larger screens for editorial weight.
export default function PageHeader({
  title,
  back,
  eyebrow,
  action,
}: {
  title: string;
  back?: string;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="pt-2 pb-4 md:pb-6 mb-5 md:mb-8 border-b border-rule">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 text-ink-2">
          {back ? (
            <Link
              href={back}
              className="-ml-2 inline-flex items-center justify-center h-9 w-9 hover:text-ink transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </Link>
          ) : null}
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        </div>
        {action ? <div className="text-ink-2">{action}</div> : null}
      </div>
      <h1 className="display text-[34px] sm:text-[40px] md:text-[52px] lg:text-[60px] leading-[1.02]">
        {title}
      </h1>
    </header>
  );
}
