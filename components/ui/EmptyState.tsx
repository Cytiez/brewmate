import Link from "next/link";
import { Button } from "./Button";

export default function EmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="text-center py-12 md:py-20">
      <div className="mx-auto mb-5 h-px w-12 bg-rule-strong" />
      <h2 className="display text-2xl md:text-3xl mb-2">{title}</h2>
      <p className="text-ink-2 text-[15px] md:text-base max-w-[360px] mx-auto leading-relaxed">{body}</p>
      {ctaLabel && ctaHref ? (
        <Button asChild variant="outline" size="lg" className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
      <div className="mx-auto mt-6 h-px w-12 bg-rule-strong" />
    </div>
  );
}
