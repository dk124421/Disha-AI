/**
 * Disha AI — Client-side local state store
 * Uses localStorage to persist IKIGAI answers, profile, and career data
 * across pages without requiring auth for the MVP flow.
 */

export const STORE_KEYS = {
  ONBOARDING: "disha_onboarding",
  IKIGAI_ANSWERS: "disha_ikigai_answers",
  IKIGAI_ANALYSIS: "disha_ikigai_analysis",
  CAREER_MATCHES: "disha_career_matches",
  SELECTED_CAREER: "disha_selected_career",
  ROADMAP: "disha_roadmap",
};

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
  }
}

// ─── SUPABASE SAVE HELPERS ─────────────────────────────────
// These save data to Supabase when a user is authenticated.
// Falls back to local store when no session exists.

export async function saveOnboardingProfile(
  data: Record<string, unknown>,
  userId?: string
): Promise<void> {
  saveToStore(STORE_KEYS.ONBOARDING, data);

  if (!userId) return;

  try {
    const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs");
    const supabase = createClientComponentClient();

    await supabase.from("user_profiles").upsert({
      user_id: userId,
      full_name: data.name,
      age: data.age ? Number(data.age) : null,
      gender: data.gender,
      education_level: data.education_level,
      location_city: data.location_city,
      location_state: data.location_state,
      interests: data.interests,
      work_style: data.work_style,
      life_goals: data.life_goals,
      biggest_fears: data.biggest_fears,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Supabase save failed (offline mode):", e);
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
    const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs");
    const supabase = createClientComponentClient();

    await supabase.from("ikigai_responses").upsert({
      user_id: userId,
      love_responses: { love_1: answers.love_1, love_2: answers.love_2 },
      good_at_responses: { skill_1: answers.skill_1, skill_2: answers.skill_2 },
      world_needs_responses: { world_1: answers.world_1, world_2: answers.world_2 },
      can_earn_responses: { earn_1: answers.earn_1, earn_2: answers.earn_2 },
      analysis_result: analysis,
      ikigai_score: (analysis as { ikigai_score?: number }).ikigai_score || 0,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Supabase save failed (offline mode):", e);
  }
}

export async function saveCareerMatches(
  careers: unknown[],
  userId?: string
): Promise<void> {
  saveToStore(STORE_KEYS.CAREER_MATCHES, careers);

  if (!userId) return;

  try {
    const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs");
    const supabase = createClientComponentClient();

    const topCareer = careers[0] as Record<string, unknown>;
    await supabase.from("career_matches").upsert({
      user_id: userId,
      career_title: topCareer.title,
      career_category: topCareer.category,
      match_score: (topCareer.reality_scores as Record<string, number>)?.passion_fit || 0,
      all_matches: careers,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Supabase save failed (offline mode):", e);
  }
}
