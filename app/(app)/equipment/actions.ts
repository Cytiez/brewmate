"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { equipmentSchema } from "@/lib/validation/equipment";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { log } from "@/lib/log";

function parseForm(fd: FormData) {
  const raw = {
    kind: fd.get("kind") as any,
    name: String(fd.get("name") ?? "").trim(),
    grind_unit: String(fd.get("grind_unit") ?? "").trim() || null,
    temp_control: fd.has("temp_control") ? fd.get("temp_control") === "on" : null,
    is_default: fd.get("is_default") === "on",
  };
  return equipmentSchema.safeParse(raw);
}

async function clearOtherDefaults(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userId: string,
  kind: string,
  exceptId?: string,
) {
  let q = supabase.from("equipment").update({ is_default: false }).eq("user_id", userId).eq("kind", kind).eq("is_default", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function createEquipment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    log.warn({ scope: "createEquipment.validation", user_id: user.id });
    redirect("/equipment/new?err=validation");
  }
  const supabase = createSupabaseServerClient();
  if (parsed.data.is_default) await clearOtherDefaults(supabase, user.id, parsed.data.kind);
  const { error } = await supabase.from("equipment").insert({ ...parsed.data, user_id: user.id });
  if (error) {
    log.error("createEquipment", error, { user_id: user.id });
    redirect("/equipment/new?err=save");
  }
  revalidatePath("/equipment");
  redirect("/equipment?ok=saved");
}

export async function updateEquipment(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    log.warn({ scope: "updateEquipment.validation", user_id: user.id });
    redirect(`/equipment/${id}/edit?err=validation`);
  }
  const supabase = createSupabaseServerClient();
  if (parsed.data.is_default) await clearOtherDefaults(supabase, user.id, parsed.data.kind, id);
  const { error } = await supabase.from("equipment").update(parsed.data).eq("id", id);
  if (error) {
    log.error("updateEquipment", error, { user_id: user.id });
    redirect(`/equipment/${id}/edit?err=save`);
  }
  revalidatePath("/equipment");
  redirect("/equipment?ok=saved");
}

export async function deleteEquipment(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) {
    log.error("deleteEquipment", error, { user_id: user.id });
    redirect(`/equipment/${id}/edit?err=delete`);
  }
  revalidatePath("/equipment");
  redirect("/equipment?ok=deleted");
}
