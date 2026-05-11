import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/cn";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("font-mono text-[10px] uppercase tracking-kissaten text-ink-3 block mb-2", className)}
    {...props}
  />
));
Label.displayName = "Label";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full min-h-[44px] bg-transparent border-0 border-b border-rule-strong",
        "font-sans text-base text-ink py-2 px-0",
        "focus:outline-none focus:border-persimmon placeholder:text-ink-3",
        "transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

// Big monospace numeric input — for dose, water, temp etc.
export const NumInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      inputMode="decimal"
      className={cn(
        "font-mono tabular-nums text-center text-3xl tracking-tight",
        className,
      )}
      {...props}
    />
  ),
);
NumInput.displayName = "NumInput";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full bg-transparent border-hairline border-rule-strong",
      "font-sans text-base text-ink px-3 py-2 min-h-[72px]",
      "focus:outline-none focus:border-persimmon placeholder:text-ink-3",
      "transition-colors resize-none",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
