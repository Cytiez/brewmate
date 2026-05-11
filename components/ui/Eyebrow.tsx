import { cn } from "@/lib/cn";

// Numbered editorial section label — "01 ／ BEANS"
export default function Eyebrow({
  index,
  children,
  align = "left",
  className,
}: {
  index?: string;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "eyebrow flex items-center gap-2",
        align === "right" && "justify-end",
        className,
      )}
    >
      {index ? (
        <>
          <span className="text-ink-2">{index}</span>
          <span className="text-ink-3">／</span>
        </>
      ) : null}
      <span>{children}</span>
    </div>
  );
}
