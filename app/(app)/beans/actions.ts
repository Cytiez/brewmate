"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beanSchema } from "@/lib/validation/bean";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { log } from "@/lib/log";

function emptyToNull<T extends Record<string, unknown>>(o: T): T {
  const out: any = { ...o };
  for (const k of Object.keys(out)) if (out[k] === "" || out[k] === undefined) out[k] = null;
  return out;
}

function parseForm(fd: FormData) {
  const raw = {
    name: String(fd.get("name") ?? "").trim(),
    roaster: String(fd.get("roaster") ?? "").trim() || null,
    origin_country: String(fd.get("origin_country") ?? "").trim() || null,
    origin_region: String(fd.get("origin_region") ?? "").trim() || null,
    process: (fd.get("process") || null) as any,
    roast_level: (fd.get("roast_level") || null) as any,
    altitude_masl: fd.get("altitude_masl") ? Number(fd.get("altitude_masl")) : null,
    density: (fd.get("density") || null) as any,
    flavor_notes: String(fd.get("flavor_notes") ?? "")
      .split(",").map((s) => s.trim()).filter(Boolean),
    roast_date: String(fd.get("roast_date") ?? "") || null,
    is_active: fd.get("is_active") === "on",
  };
  return beanSchema.safeParse(emptyToNull(raw));
}

export async function createBean(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    log.warn({ scope: "createBean.validation", user_id: user.id });
    redirect("/beans/new?err=validation");
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("beans").insert({ ...parsed.data, user_id: user.id });
  if (error) {
    log.error("createBean", error, { user_id: user.id });
    redirect("/beans/new?err=save");
  }
  revalidatePath("/beans");
  redirect("/beans?ok=saved");
}

export async function updateBean(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    log.warn({ scope: "updateBean.validation", user_id: user.id });
    redirect(`/beans/${id}/edit?err=validation`);
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("beans").update(parsed.data).eq("id", id);
  if (error) {
    log.error("updateBean", error, { user_id: user.id });
    redirect(`/beans/${id}/edit?err=save`);
  }
  revalidatePath("/beans");
  revalidatePath(`/beans/${id}`);
  redirect(`/beans/${id}?ok=saved`);
}

export async function toggleBeanActive(id: string, next: boolean) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("beans").update({ is_active: next }).eq("id", id);
  if (error) {
    log.error("toggleBeanActive", error, { user_id: user.id });
    return;
  }
  revalidatePath("/beans");
  revalidatePath(`/beans/${id}`);
}

export async function deleteBean(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("beans").delete().eq("id", id);
  if (error) {
    log.error("deleteBean", error, { user_id: user.id });
    redirect(`/beans/${id}/edit?err=delete`);
  }
  revalidatePath("/beans");
  redirect("/beans?ok=deleted");
}
