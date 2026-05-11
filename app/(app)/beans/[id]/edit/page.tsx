import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import BeanForm from "@/components/beans/BeanForm";
import { Button } from "@/components/ui/Button";
import { updateBean, deleteBean } from "../../actions";
import type { Bean } from "@/lib/db-types";

export default async function EditBeanPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("beans").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const bean = data as Bean;

  const bound = updateBean.bind(null, bean.id);
  const del = deleteBean.bind(null, bean.id);

  return (
    <div>
      <PageHeader title="Edit bean" eyebrow="cupboard · 編集" back={`/beans/${bean.id}`} />
      <BeanForm initial={bean} action={bound} submitLabel="Save changes" />
      <form action={del} className="mt-8 pt-6 border-t border-rule">
        <Button type="submit" variant="ghost" size="md" className="w-full text-persimmon hover:bg-persimmon/10">
          Delete bean
        </Button>
      </form>
    </div>
  );
}
