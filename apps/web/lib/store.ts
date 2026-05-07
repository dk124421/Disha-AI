/**
 * Disha AI — Client-side local state store
 * Uses localStorage to persist IKIGAI answers, profile, and career data.
 * Supabase sync helpers use createClient() from @supabase/ssr (browser).
 */

export const STORE_KEYS = {
  ONBOARDING: "disha_onboarding",
  IKIGAI_ANSWERS: "disha_ikigai_answers",
  IKIGAI_ANALYSIS: "disha_ikigai_analysis",
  CAREER_MATCHES: "disha_career_matches",
  SELECTED_CAREER: "disha_selected_career",
  ROADMAP: "disha_roadmap",
};

// ─── LOCAL STORAGE ────────────────────────────────────────────

export function saveToStore<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Store write failed:", e);
  }
}

export function loadFromStore<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (e) {
    console.warn("Store read failed:", e);
    return null;
  }
}

export function clearStore(key?: string): void {
  if (typeof window === "undefined") return;
  if (key) {
    localStorage.removeItem(key);
  } else {
    Object.values(STORE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("disha_milestones");
  }
}

// ─── SUPABASE SYNC HELPERS ────────────────────────────────────
// Save to Supabase when authenticated; always saves to localStorage first.

async function getSupabase() {
  const { createClient } = await import("@/lib/supabase");
  return createClient();
}

export async function saveOnboardingProfile(
  data: Record<string, unknown>,
  userId?: string
): Promise<void> {
  saveToStore(STORE_KEYS.ONBOARDING, data);
  if (!userId) return;

  try {
    const supabase = await getSupabase();
    await supabase.from("profiles").upsert({
      user_id: userId,
      age: data.age ? Number(data.age) : null,
      gender: data.gender as string | null,
      education_level: data.education_level as string | null,
      location_city: data.location_city as string | null,
      location_state: data.location_state as string | null,
      interests: Array.isArray(data.interests) ? data.interests : [],
      work_style_preferences: data.work_style || {},
      life_goals: data.life_goals as string | null,
      biggest_fears: data.biggest_fears as string | null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Supabase profile save failed (offline mode):", e);
  }
}

export async function saveIkigaiData(
  answers: Record<string, string>,
  analysis: Record<string, unknown>,
  userId?: string
): Promise<void> {
  saveToStore(STORE_KEYS.IKIGAI_ANSWERS, answers);
  saveToStore(STORE_KEYS.IKIGAI_ANALYSIS, analysis);
  if (!userId) return;

  try {
    const supabase = await getSupabase();
    await supabase.from("ikigai_responses").upsert({
      user_id: userId,
      loves: [answers.love_1, answers.love_2].filter(Boolean),
      good_at: [answers.skill_1, answers.skill_2].filter(Boolean),
      world_needs: [answers.world_1, answers.world_2].filter(Boolean),
      can_earn: [answers.earn_1, answers.earn_2].filter(Boolean),
      ai_analysis: analysis,
    });
  } catch (e) {
    console.warn("Supabase IKIGAI save failed (offline mode):", e);
  }
}

export async function saveCareerMatches(
  careers: unknown[],
  userId?: string
): Promise<void> {
  saveToStore(STORE_KEYS.CAREER_MATCHES, { careers });
  if (!userId) return;

  try {
    const supabase = await getSupabase();
    // Delete old matches first, then insert fresh
    await supabase.from("career_matches").delete().eq("user_id", userId);

    const rows = (careers as Record<string, unknown>[]).map((c, i) => ({
      user_id: userId,
      career_title: c.title as string,
      career_category: c.category as string | null,
      reality_scores: c.reality_scores || {},
      ai_reasoning: c.reasoning as string | null,
      salary_range: c.salary_range || {},
      rank: i + 1,
      is_primary: i === 0,
    }));

    await supabase.from("career_matches").insert(rows);
  } catch (e) {
    console.warn("Supabase career save failed (offline mode):", e);
  }
}
