"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTempUnit, type TempUnit } from "@/lib/units";
import { cn } from "@/lib/cn";

export default function SettingsClient({ email }: { email: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [unit, setUnit] = useTempUnit();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        toast.error("Export failed. Try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brewmate-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export ready.");
    } catch {
      toast.error("Network error.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-10 md:max-w-2xl">
      <Section title="Appearance">
        <Row label="Theme">
          <SegmentedToggle
            value={(theme === "dark" || theme === "light") ? theme : "system"}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
            onChange={(v) => setTheme(v)}
          />
        </Row>

        <Row label="Temperature">
          <SegmentedToggle
            value={unit}
            options={[
              { value: "C", label: "°C" },
              { value: "F", label: "°F" },
            ]}
            onChange={(v) => setUnit(v as TempUnit)}
          />
        </Row>
      </Section>

      <Section title="Account">
        <Row label="Email">
          <span className="text-[14px] text-ink-2 font-mono break-all">{email}</span>
        </Row>
        <Row label="Session">
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">Sign out</Button>
          </form>
        </Row>
      </Section>

      <Section title="Data">
        <Row label="Export">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportData}
            disabled={exporting}
          >
            <Download className="h-3 w-3" />
            {exporting ? "Preparing…" : "Download JSON"}
          </Button>
        </Row>
        <Row label="Delete account" warning>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="border-persimmon text-persimmon hover:bg-persimmon hover:text-paper"
          >
            <Trash2 className="h-3 w-3" />
            Delete account
          </Button>
        </Row>
      </Section>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/auth/signout")}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="sublabel mb-3">{title}</h2>
      <div className="border-y border-rule divide-y divide-rule">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
  warning,
}: {
  label: string;
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className={cn("text-[14px]", warning ? "text-persimmon" : "text-ink-2")}>
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex border-hairline border-rule-strong">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-8 px-3 font-mono text-[11px] uppercase tracking-widest transition-colors",
            value === opt.value
              ? "bg-ink text-paper"
              : "bg-transparent text-ink-2 hover:text-ink",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DeleteAccountDialog({
  open,
  onOpenChange,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const canConfirm = text === "DELETE" && !loading;

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (!res.ok) {
        toast.error("Delete failed. Please try again.");
        return;
      }
      onDeleted();
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-paper border-hairline border-rule-strong p-6 data-[state=open]:animate-fade-up">
          <DialogPrimitive.Title className="display text-xl mb-2">
            Delete your account?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm text-ink-2 leading-relaxed mb-4">
            All your beans, equipment, brew logs, and AI suggestions will be permanently
            erased. This cannot be undone. Type <span className="font-mono">DELETE</span>{" "}
            to confirm.
          </DialogPrimitive.Description>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full h-10 px-3 mb-4 bg-transparent border-hairline border-rule-strong font-mono text-sm placeholder:text-ink-3 focus:outline-none focus:border-persimmon"
            autoComplete="off"
            autoCapitalize="characters"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ink"
              size="md"
              onClick={run}
              disabled={!canConfirm}
              className={cn(canConfirm && "bg-persimmon hover:bg-persimmon/90")}
            >
              {loading ? "Deleting…" : "Delete forever"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
