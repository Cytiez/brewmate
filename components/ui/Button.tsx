import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-mono uppercase tracking-widest transition-all select-none whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none active:scale-[0.985]",
  {
    variants: {
      variant: {
        ink: "bg-ink text-paper hover:bg-ink/90",
        outline: "bg-transparent border-hairline border-ink text-ink hover:bg-ink hover:text-paper",
        persimmon: "bg-persimmon text-paper hover:bg-persimmon/90",
        ghost: "bg-transparent text-ink hover:bg-rule/40",
        link: "bg-transparent text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink p-0 min-h-0",
      },
      size: {
        sm: "h-9 px-3 text-[10px]",
        md: "h-11 px-5 text-[11px]",
        lg: "h-12 px-6 text-xs",
        xl: "h-14 px-6 text-xs",
        icon: "h-10 w-10 p-0 text-xs",
      },
    },
    defaultVariants: { variant: "ink", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
