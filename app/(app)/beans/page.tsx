import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import BeanCard from "@/components/beans/BeanCard";
import EmptyState from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";
import type { Bean } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("beans")
    .select("*")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });
  const beans = (data ?? []) as Bean[];
  const activeCount = beans.filter((b) => b.is_active).length;

  return (
    <div>
      <PageHeader
        title="The cupboard"
        sublabel={beans.length === 0
          ? "Empty."
          : `${beans.length} bag${beans.length === 1 ? "" : "s"}${activeCount ? `, ${activeCount} active` : ""}.`}
        action={
          <Link
            href="/beans/new"
            className="inline-flex items-center gap-1.5 text-[14px] text-ink hover:text-persimmon transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New bag
          </Link>
        }
      />

      {beans.length === 0 ? (
        <EmptyState
          title="An empty cupboard."
          body="Every brew begins with a bean. Add one to start your journal."
          ctaLabel="Add a bean"
          ctaHref="/beans/new"
        />
      ) : (
        <ul className="border-t border-rule lg:grid lg:grid-cols-2 lg:gap-x-10 lg:border-t-0">
          {beans.map((b) => (
            <li key={b.id} className="lg:border-t lg:border-rule">
              <BeanCard bean={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
