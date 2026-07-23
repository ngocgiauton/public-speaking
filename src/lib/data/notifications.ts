import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getNotificationsForProfile(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
