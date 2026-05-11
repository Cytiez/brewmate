"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import type { Bean } from "@/lib/db-types";

export default function BeanForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: Partial<Bean>;
  action: (fd: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [active, setActive] = useState(!!initial?.is_active);
  const v = initial ?? {};

  return (
    <form
      action={async (fd) => {
        if (active) fd.set("is_active", "on");
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
      {/* Identity */}
      <FormSection index="01" title="Identity">
        <div>
          <Label htmlFor="name">Name <span className="text-persimmon">*</span></Label>
          <Input id="name" name="name" required defaultValue={v.name ?? ""} placeholder="Ethiopia Halo Beriti" />
        </div>
        <div>
          <Label htmlFor="roaster">Roaster</Label>
          <Input id="roaster" name="roaster" defaultValue={v.roaster ?? ""} placeholder="Sey · La Cabra · …" />
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div>
            <Label htmlFor="origin_country">Country</Label>
            <Input id="origin_country" name="origin_country" defaultValue={v.origin_country ?? ""} />
          </div>
          <div>
            <Label htmlFor="origin_region">Region</Label>
            <Input id="origin_region" name="origin_region" defaultValue={v.origin_region ?? ""} />
          </div>
        </div>
      </FormSection>

      {/* Profile */}
      <FormSection index="02" title="Profile">
        <div className="grid grid-cols-2 gap-x-5">
          <div>
            <Label>Process</Label>
            <Select name="process" defaultValue={v.process ?? ""}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="washed">Washed</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="honey">Honey</SelectItem>
                <SelectItem value="anaerobic">Anaerobic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Roast level</Label>
            <Select name="roast_level" defaultValue={v.roast_level ?? ""}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <div>
            <Label htmlFor="altitude_masl">Altitude · masl</Label>
            <Input id="altitude_masl" name="altitude_masl" type="number" inputMode="numeric" defaultValue={v.altitude_masl ?? ""} className="font-mono tabular-nums" />
          </div>
          <div>
            <Label>Density</Label>
            <Select name="density" defaultValue={v.density ?? ""}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection index="03" title="Notes">
        <div>
          <Label htmlFor="flavor_notes">Flavor notes</Label>
          <Input
            id="flavor_notes"
            name="flavor_notes"
            defaultValue={(v.flavor_notes ?? []).join(", ")}
            placeholder="bergamot, peach, jasmine"
          />
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mt-2">comma-separated</p>
        </div>
        <div>
          <Label htmlFor="roast_date">Roast date</Label>
          <Input id="roast_date" name="roast_date" type="date" defaultValue={v.roast_date ?? ""} className="font-mono tabular-nums" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-rule">
          <div>
            <div className="font-sans text-sm text-ink">Mark as active</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mt-0.5">Shows in quick-log picker</div>
          </div>
          <Switch checked={active} onCheckedChange={setActive} name="is_active_switch" />
        </div>
      </FormSection>

      <Button type="submit" disabled={submitting} variant="ink" size="xl" className="w-full">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function FormSection({ title, children }: { index?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="display text-xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
