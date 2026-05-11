"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center border-hairline border-rule-strong",
      "transition-colors focus-visible:outline-none disabled:opacity-50",
      "data-[state=checked]:bg-ink data-[state=unchecked]:bg-transparent",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 bg-ink transition-transform",
        "data-[state=checked]:bg-paper",
        "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-px",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
