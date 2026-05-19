import PageHeader from "@/components/ui/PageHeader";
import { getCurrentUser } from "@/lib/supabase/current-user";
import SettingsClient from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  // (app) layout already redirects to /login if user is null, but TS narrows
  // safer with an explicit guard.
  if (!user) return null;

  return (
    <div>
      <PageHeader title="Settings" sublabel="Preferences and account" />
      <SettingsClient email={user.email ?? "—"} />
    </div>
  );
}
