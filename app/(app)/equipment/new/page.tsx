import PageHeader from "@/components/ui/PageHeader";
import EquipmentForm from "@/components/equipment/EquipmentForm";
import { createEquipment } from "../actions";

export const metadata = { title: "New equipment — Brewmate" };

export default function NewEquipmentPage() {
  return (
    <div>
      <PageHeader title="New piece" eyebrow="bench · 新規" back="/equipment" />
      <EquipmentForm action={createEquipment} submitLabel="Add to bench" />
    </div>
  );
}
