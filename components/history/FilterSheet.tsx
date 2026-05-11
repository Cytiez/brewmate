"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/Sheet";
import Eyebrow from "@/components/ui/Eyebrow";

interface Props {
  beans: { id: string; name: string }[];
  drippers: { id: string; name: string }[];
  current: {
    bean?: string;
    dripper?: string;
    taste?: string;
    from?: string;
    to?: string;
  };
}

export default function FilterSheet({ beans, drippers, current }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const active = !!(current.bean || current.dripper || current.taste || current.from || current.to);
  const count = [current.bean, current.dripper, current.taste, current.from, current.to].filter(Boolean).length;

  const [bean, setBean]       = useState(current.bean ?? "");
  const [dripper, setDripper] = useState(current.dripper ?? "");
  const [taste, setTaste]     = useState(current.taste ?? "");
  const [from, setFrom]       = useState(current.from ?? "");
  const [to, setTo]           = useState(current.to ?? "");

  function apply() {
    const p = new URLSearchParams(params);
    [["bean", bean], ["dripper", dripper], ["taste", taste], ["from", from], ["to", to]].forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    router.push(`/history${p.toString() ? `?${p.toString()}` : ""}`);
    setOpen(false);
  }

  function reset() {
    setBean(""); setDripper(""); setTaste(""); setFrom(""); setTo("");
    router.push("/history");
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-ink transition-colors">
          <Filter className="h-3.5 w-3.5" />
          Filter{active ? <span className="text-persimmon"> · {count}</span> : null}
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="px-5 pt-6 pb-4">
        <SheetTitle>Filter the journal</SheetTitle>
        <p className="sublabel mb-6">Narrow by bean, dripper, taste, or date.</p>

        <div className="space-y-5">
          <div>
            <Label>Bean</Label>
            <Select value={bean} onValueChange={setBean}>
              <SelectTrigger><SelectValue placeholder="All beans" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All beans</SelectItem>
                {beans.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dripper</Label>
            <Select value={dripper} onValueChange={setDripper}>
              <SelectTrigger><SelectValue placeholder="All drippers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All drippers</SelectItem>
                {drippers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Taste</Label>
            <Select value={taste} onValueChange={setTaste}>
              <SelectTrigger><SelectValue placeholder="Any taste" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any taste</SelectItem>
                <SelectItem value="great">Great</SelectItem>
                <SelectItem value="too_bitter">Too bitter</SelectItem>
                <SelectItem value="too_sour">Too sour</SelectItem>
                <SelectItem value="too_weak">Too weak</SelectItem>
                <SelectItem value="too_strong">Too strong</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-x-5">
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="font-mono tabular-nums" />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="font-mono tabular-nums" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-7">
          <Button variant="outline" size="lg" onClick={reset}>Reset</Button>
          <Button variant="ink" size="lg" onClick={apply}>Apply</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
