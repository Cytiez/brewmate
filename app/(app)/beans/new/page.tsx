import PageHeader from "@/components/ui/PageHeader";
import BeanForm from "@/components/beans/BeanForm";
import { createBean } from "../actions";

export const metadata = { title: "New bean — Brewmate" };

export default function NewBeanPage() {
  return (
    <div>
      <PageHeader title="New bean" back="/beans" />
      <BeanForm action={createBean} submitLabel="Add to cupboard" />
    </div>
  );
}
