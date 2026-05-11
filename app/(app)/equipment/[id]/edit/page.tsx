import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import EquipmentForm from "@/components/equipment/EquipmentForm";
import { Button } from "@/components/ui/Button";
import { updateEquipment, deleteEquipment } from "../../actions";
import type { Equipment } from "@/lib/db-types";

export default async function EditEquipment({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("equipment").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const e = data as Equipment;
  const bound = updateEquipment.bind(null, e.id);
  const del = deleteEquipment.bind(null, e.id);

  return (
    <div>
      <PageHeader title={`Edit ${e.kind}`} eyebrow="bench · 編集" back="/equipment" />
      <EquipmentForm initial={e} action={bound} submitLabel="Save changes" lockKind={e.kind} />
      <form action={del} className="mt-8 pt-6 border-t border-rule">
        <Button type="submit" variant="ghost" size="md" className="w-full text-persimmon hover:bg-persimmon/10">
          Delete
        </Button>
      </form>
    </div>
  );
}
