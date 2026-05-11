"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import BrewTimeInput from "./BrewTimeInput";
import TasteRatingPicker from "./TasteRatingPicker";
import Eyebrow from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Label, NumInput, Input, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import type { Bean, BrewLog, Equipment, TasteRating } from "@/lib/db-types";

interface Props {
  beans: Bean[];
  equipment: Equipment[];
  recentLogs: BrewLog[];
}

interface SuggestionResp {
  ok?: boolean;
  log_id?: string;
  suggestion?: { content: string; items: { variable: string; change: string; why: string }[] | null } | null;
  rate_limited?: boolean;
  error?: string;
}

export default function BrewLogForm({ beans, equipment, recentLogs }: Props) {
  const router = useRouter();
  const grinders = equipment.filter((e) => e.kind === "grinder");
  const drippers = equipment.filter((e) => e.kind === "dripper");
  const kettles  = equipment.filter((e) => e.kind === "kettle");

  const defaultBean = beans.find((b) => b.is_active) ?? beans[0];
  const defaultGrinder = grinders.find((g) => g.is_default) ?? grinders[0] ?? null;
  const defaultDripper = drippers.find((g) => g.is_default) ?? drippers[0];
  const defaultKettle  = kettles.find((g) => g.is_default) ?? kettles[0] ?? null;

  const [beanId, setBeanId]       = useState<string>(defaultBean?.id ?? "");
  const [grinderId, setGrinderId] = useState<string | null>(defaultGrinder?.id ?? null);
  const [dripperId, setDripperId] = useState<string>(defaultDripper?.id ?? "");
  const [kettleId, setKettleId]   = useState<string | null>(defaultKettle?.id ?? null);

  const prefill = useMemo(() => {
    return (
      recentLogs.find((l) => l.bean_id === beanId && l.dripper_id === dripperId) ??
      recentLogs.find((l) => l.bean_id === beanId) ??
      null
    );
  }, [recentLogs, beanId, dripperId]);

  const [dose, setDose]         = useState<string>(prefill ? String(prefill.dose_g) : "15");
  const [water, setWater]       = useState<string>(prefill ? String(prefill.water_g) : "250");
  const [temp, setTemp]         = useState<string>(prefill?.water_temp_c != null ? String(prefill.water_temp_c) : "94");
  const [grind, setGrind]       = useState<string>(prefill?.grind_size ?? "");
  const [brewSecs, setBrewSecs] = useState<number>(prefill?.brew_time_seconds ?? 180);
  const [showBloom, setShowBloom] = useState<boolean>(!!prefill?.bloom_time_seconds);
  const [bloomS, setBloomS]     = useState<string>(prefill?.bloom_time_seconds ? String(prefill.bloom_time_seconds) : "30");
  const [bloomG, setBloomG]     = useState<string>(prefill?.bloom_water_g ? String(prefill.bloom_water_g) : "");
  const [taste, setTaste]       = useState<TasteRating | null>(null);
  const [note, setNote]         = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<SuggestionResp | null>(null);

  const ratio = useMemo(() => {
    const d = parseFloat(dose);
    const w = parseFloat(water);
    if (!d || !w) return null;
    return w / d;
  }, [dose, water]);

  const grinder = grinders.find((g) => g.id === grinderId) ?? null;
  const grindUnit = grinder?.grind_unit ?? "";

  const canSubmit = beanId && dripperId && dose && water && grind && brewSecs > 0 && taste;

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bean_id: beanId,
          grinder_id: grinderId,
          dripper_id: dripperId,
          kettle_id: kettleId,
          dose_g: Number(dose),
          water_g: Number(water),
          water_temp_c: temp ? Number(temp) : null,
          grind_size: grind,
          brew_time_seconds: brewSecs,
          bloom_time_seconds: showBloom && bloomS ? Number(bloomS) : null,
          bloom_water_g: showBloom && bloomG ? Number(bloomG) : null,
          taste_rating: taste,
          taste_note: note || null,
        }),
      });
      const json: SuggestionResp = await res.json();
      if (!res.ok) {
        toast.error(json.error === "invalid_input" ? "Check the form values." : "Could not save. Try again.");
      } else {
        setResponse(json);
        router.refresh();
      }
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (response?.ok) {
    return <PostSubmit response={response} onLogAnother={() => location.reload()} />;
  }

  return (
    <div className="pb-6 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-10 space-y-8 lg:space-y-0">
      {/* 01 — Bean */}
      <Section index="01" title="Bean">
        <ChipRow>
          {beans.map((b) => (
            <Chip key={b.id} active={beanId === b.id} onClick={() => setBeanId(b.id)}>
              <span className="truncate max-w-[160px]">{b.name}</span>
              {b.is_active ? <span className="text-persimmon">●</span> : null}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      {/* 02 — Gear */}
      <Section index="02" title="Gear">
        <div className="space-y-4">
          <FieldBlock label="Dripper">
            <ChipRow>
              {drippers.map((e) => (
                <Chip key={e.id} active={dripperId === e.id} onClick={() => setDripperId(e.id)}>
                  {e.name}
                </Chip>
              ))}
            </ChipRow>
          </FieldBlock>

          {grinders.length > 0 && (
            <FieldBlock label="Grinder">
              <ChipRow>
                {grinders.map((e) => (
                  <Chip key={e.id} active={grinderId === e.id} onClick={() => setGrinderId(e.id)}>
                    {e.name}
                  </Chip>
                ))}
              </ChipRow>
            </FieldBlock>
          )}

          {kettles.length > 0 && (
            <FieldBlock label="Kettle">
              <ChipRow>
                {kettles.map((e) => (
                  <Chip key={e.id} active={kettleId === e.id} onClick={() => setKettleId(e.id)}>
                    {e.name}
                  </Chip>
                ))}
              </ChipRow>
            </FieldBlock>
          )}
        </div>
      </Section>

      {/* 03 — Recipe */}
      <Section index="03" title="Recipe">
        {/* Big dose/water/ratio row */}
        <div className="border-hairline border-rule-strong p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
            <div>
              <Label>Dose · g</Label>
              <NumInput value={dose} onChange={(e) => setDose(e.target.value)} step="0.1" />
            </div>
            <div className="pb-3 text-ink-3 text-2xl font-serif">:</div>
            <div>
              <Label>Water · g</Label>
              <NumInput value={water} onChange={(e) => setWater(e.target.value)} step="1" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-rule flex items-center justify-between">
            <span className="eyebrow">Ratio</span>
            <span className="num text-lg text-ink">
              {ratio ? `1 ∶ ${ratio.toFixed(1)}` : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 mt-5">
          <div>
            <Label>Temp · °C</Label>
            <NumInput value={temp} onChange={(e) => setTemp(e.target.value)} step="0.5" />
          </div>
          <div>
            <Label>Grind {grindUnit ? `· ${grindUnit}` : ""}</Label>
            <Input
              value={grind}
              onChange={(e) => setGrind(e.target.value)}
              placeholder={grindUnit || "e.g. 22"}
              className="text-center font-mono tabular-nums text-3xl"
            />
          </div>
        </div>

        <div className="mt-5">
          <Label>Total time</Label>
          <BrewTimeInput seconds={brewSecs} onChange={setBrewSecs} />
        </div>

        <button
          type="button"
          onClick={() => setShowBloom((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-2 hover:text-ink transition-colors"
        >
          {showBloom ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showBloom ? "Hide bloom" : "Add bloom"}
        </button>
        {showBloom && (
          <div className="grid grid-cols-2 gap-x-5 mt-3">
            <div>
              <Label>Bloom · s</Label>
              <NumInput value={bloomS} onChange={(e) => setBloomS(e.target.value)} step="1" />
            </div>
            <div>
              <Label>Bloom · g</Label>
              <NumInput value={bloomG} onChange={(e) => setBloomG(e.target.value)} step="1" />
            </div>
          </div>
        )}
      </Section>

      {/* 04 — Taste */}
      <Section index="04" title="Taste">
        <TasteRatingPicker value={taste} onChange={setTaste} />
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes — what you tasted, what to remember…"
          maxLength={500}
          className="mt-4"
        />
      </Section>

      {/* Submit — full width spanning both columns on desktop */}
      <div className="pt-2 lg:col-span-2 lg:pt-4 lg:border-t lg:border-rule">
        <Button
          onClick={submit}
          disabled={!canSubmit || submitting}
          variant={canSubmit ? "ink" : "outline"}
          size="xl"
          className="w-full"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-paper animate-pulse rounded-full" />
              Brewing your suggestion
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Save & dial in
            </span>
          )}
        </Button>
        {!canSubmit && (
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink-3">
            Pick a bean, dripper, recipe & taste to continue
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <Eyebrow index={index}>{title}</Eyebrow>
        <span className="h-px flex-1 ml-4 bg-rule" />
      </div>
      {children}
    </section>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("tag whitespace-nowrap", active && "tag-active")}
    >
      {children}
    </button>
  );
}

function PostSubmit({ response, onLogAnother }: { response: SuggestionResp; onLogAnother: () => void }) {
  const saved = !!response.suggestion && !response.rate_limited;
  return (
    <div className="space-y-6 md:max-w-2xl md:mx-auto animate-page">
      <div className="text-center pt-4 pb-6 border-y border-rule">
        <Eyebrow className="justify-center mb-3">brew saved</Eyebrow>
        <h2 className="display text-3xl mb-2">A note from the master</h2>
        <div className="mx-auto h-px w-12 bg-rule-strong mt-3" />
        {saved ? (
          <div className="font-mono text-[9px] uppercase tracking-kissaten text-matcha mt-3">
            ✓ saved to the journal · won&apos;t re-call AI
          </div>
        ) : null}
      </div>

      {response.rate_limited ? (
        <div className="text-sm text-ink-2 italic text-center leading-relaxed">
          The master is quiet today — daily suggestion limit reached.
          <br />
          Your brew is in the journal.
        </div>
      ) : response.suggestion ? (
        <div className="space-y-4">
          {response.suggestion.items && response.suggestion.items.length > 0 ? (
            <ul className="space-y-5">
              {response.suggestion.items.map((s, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr] gap-3 md:gap-5 animate-ink-fade"
                  style={{ animationDelay: `${120 * i}ms` }}
                >
                  <div className="font-mono text-[10px] tabular-nums uppercase tracking-widest text-persimmon pt-1">
                    {(i + 1).toString().padStart(2, "0")}
                  </div>
                  <div>
                    <div className="font-serif text-lg leading-snug">{s.change}</div>
                    <div className="text-sm text-ink-2 mt-1 leading-relaxed">{s.why}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="whitespace-pre-line font-serif text-base leading-relaxed">{response.suggestion.content}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-2 italic text-center">
          The master was unreachable. Your brew is saved.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-rule">
        <Button variant="outline" size="lg" onClick={onLogAnother}>
          Log another
        </Button>
        <Button asChild variant="ink" size="lg">
          <Link href="/history">Open journal</Link>
        </Button>
      </div>
    </div>
  );
}
