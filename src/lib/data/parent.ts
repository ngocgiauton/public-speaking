import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getRankForXp } from "@/features/xp/xp";

export interface LinkedStudent {
  profileId: string;
  fullName: string;
  avatarUrl: string | null;
}

export async function getLinkedStudents(parentProfileId: string): Promise<LinkedStudent[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("parent_student_links")
    .select("student_profile_id")
    .eq("parent_profile_id", parentProfileId)
    .eq("status", "active");

  const studentIds = (links ?? []).map((l) => l.student_profile_id);
  if (studentIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", studentIds);

  return (profiles ?? []).map((p) => ({ profileId: p.id, fullName: p.full_name, avatarUrl: p.avatar_url }));
}

export async function verifyParentOwnsStudent(parentProfileId: string, studentProfileId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("parent_student_links")
    .select("id")
    .eq("parent_profile_id", parentProfileId)
    .eq("student_profile_id", studentProfileId)
    .eq("status", "active")
    .maybeSingle();
  return Boolean(data);
}

export interface ParentStudentSummary {
  profileId: string;
  fullName: string;
  totalXp: number;
  rankName: string;
  completionPercent: number;
  pendingReview: number;
  needsRevision: number;
}

export async function getParentDashboardSummaries(parentProfileId: string): Promise<ParentStudentSummary[]> {
  const students = await getLinkedStudents(parentProfileId);
  const { getStudentDashboard } = await import("@/lib/data/student");

  return Promise.all(
    students.map(async (s) => {
      const dashboard = await getStudentDashboard(s.profileId);
      return {
        profileId: s.profileId,
        fullName: s.fullName,
        totalXp: dashboard.totalXp,
        rankName: getRankForXp(dashboard.totalXp).name,
        completionPercent: dashboard.completionPercent,
        pendingReview: dashboard.pendingReview,
        needsRevision: dashboard.needsRevision,
      };
    }),
  );
}

export type XpHistoryPoint = {
  date: string;
  cumulativeXp: number;
};

export async function getXpHistory(studentProfileId: string): Promise<XpHistoryPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("xp_transactions")
    .select("amount, created_at")
    .eq("student_profile_id", studentProfileId)
    .order("created_at", { ascending: true });

  let running = 0;
  const byDate = new Map<string, number>();
  for (const row of data ?? []) {
    running += row.amount;
    const date = row.created_at.slice(0, 10);
    byDate.set(date, running);
  }

  return [...byDate.entries()].map(([date, cumulativeXp]) => ({ date, cumulativeXp }));
}

export type ScoreHistoryPoint = {
  date: string;
  score: number;
};

export async function getScoreHistory(studentProfileId: string): Promise<ScoreHistoryPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("best_score, submitted_at, created_at")
    .eq("student_profile_id", studentProfileId)
    .not("best_score", "is", null)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    date: (row.submitted_at ?? row.created_at).slice(0, 10),
    score: row.best_score ?? 0,
  }));
}
