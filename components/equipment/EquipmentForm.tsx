"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import Eyebrow from "@/components/ui/Eyebrow";
import type { Equipment, EquipmentKind } from "@/lib/db-types";

const PLACEHOLDER: Record<EquipmentKind, string> = {
  grinder: "Comandante C40",
  dripper: "Hario V60-02",
  kettle: "Fellow Stagg EKG",
};

export default function EquipmentForm({
  initial,
  action,
  submitLabel,
  lockKind,
}: {
  initial?: Partial<Equipment>;
  action: (fd: FormData) => Promise<void>;
  submitLabel: string;
  lockKind?: EquipmentKind;
}) {
  const [kind, setKind] = useState<EquipmentKind>((initial?.kind ?? lockKind ?? "grinder") as EquipmentKind);
  const [submitting, setSubmitting] = useState(false);
  const [isDefault, setIsDefault] = useState(!!initial?.is_default);
  const [tempControl, setTempControl] = useState(!!initial?.temp_control);
  const v = initial ?? {};

  return (
    <form
      action={async (fd) => {
        fd.set("kind", kind);
        if (isDefault) fd.set("is_default", "on");
        if (tempControl) fd.set("temp_control", "on");
        setSubmitting(true);
        try {
          await action(fd);
        } catch (e: any) {
          toast.error(e?.message ?? "Could not save.");
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-8 md:max-w-2xl"
    >
      <section className="space-y-3">
        <Eyebrow index="01">Type</Eyebrow>
        <ToggleGroup
          type="single"
          value={kind}
          onValueChange={(v) => v && setKind(v as EquipmentKind)}
          disabled={!!lockKind}
          className="grid grid-cols-3 gap-0 -mt-2"
        >
          {(["grinder", "dripper", "kettle"] as const).map((k) => (
            <ToggleGroupItem key={k} value={k} className="w-full justify-center">
              {k}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      <section className="space-y-4">
        <Eyebrow index="02">Details</Eyebrow>
        <div>
          <Label htmlFor="name">Name <span className="text-persimmon">*</span></Label>
          <Input id="name" name="name" required defaultValue={v.name ?? ""} placeholder={PLACEHOLDER[kind]} />
        </div>

        {kind === "grinder" && (
          <div>
            <Label htmlFor="grind_unit">Grind unit</Label>
            <Input id="grind_unit" name="grind_unit" defaultValue={v.grind_unit ?? ""} placeholder="clicks, microsteps, numbers…" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mt-2">used as the label when logging</p>
          </div>
        )}

        {kind === "kettle" && (
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-sans text-sm">Temperature control</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mt-0.5">PID / variable</div>
            </div>
            <Switch checked={tempControl} onCheckedChange={setTempControl} />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-rule">
          <div>
            <div className="font-sans text-sm">Default {kind}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mt-0.5">pre-selected when logging</div>
          </div>
          <Switch checked={isDefault} onCheckedChange={setIsDefault} />
        </div>
      </section>

      <Button type="submit" disabled={submitting} variant="ink" size="xl" className="w-full">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
