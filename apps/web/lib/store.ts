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

export async function saveRoadmapData(
  roadmap: unknown,
  milestoneStates: Record<string, boolean>,
  userId?: string
): Promise<void> {
  saveToStore(STORE_KEYS.ROADMAP, roadmap);
  saveToStore("disha_milestones", milestoneStates);
  if (!userId) return;

  try {
    const supabase = await getSupabase();
    
    // First find if there's an existing active roadmap for this user
    const { data: existing } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const rm = roadmap as Record<string, unknown>;
    const payload = {
      user_id: userId,
      title: rm.title as string,
      description: rm.description as string,
      total_duration_weeks: rm.total_weeks as number,
      milestones: milestoneStates,
      resources: rm.phases,
      status: "active",
      updated_at: new Date().toISOString()
    };

    if (existing?.id) {
      await supabase.from("roadmaps").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("roadmaps").insert([payload]);
    }
  } catch (e) {
    console.warn("Supabase roadmap save failed (offline mode):", e);
  }
}

// ─── CHAT SYNC HELPERS ──────────────────────────────────────

export async function getOrCreateConversation(userId: string): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    // Try to find the most recent conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id;

    // Create new conversation
    const { data: newConv } = await supabase
      .from("conversations")
      .insert([{ user_id: userId, title: "My Career Chat" }])
      .select("id")
      .single();

    return newConv?.id || null;
  } catch (e) {
    console.warn("Could not get or create conversation:", e);
    return null;
  }
}

export async function loadChatMessages(conversationId: string) {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    return data || [];
  } catch (e) {
    console.warn("Could not load chat messages:", e);
    return [];
  }
}

export async function saveChatMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    const supabase = await getSupabase();
    await supabase.from("messages").insert([{
      conversation_id: conversationId,
      role,
      content,
    }]);
} catch (e) {
    console.warn("Could not save chat message:", e);
  }
}

// ─── PROFILE AVATAR HELPERS ─────────────────────────────────

export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Update user metadata in auth.users
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    // Update public.users
    await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}

// ─── PHASE 2: SKILL ANALYSIS ──────────────────────────────────────────────

export async function saveSkillAnalysis(
  analysis: Record<string, unknown>,
  userId?: string
): Promise<void> {
  saveToStore("disha_skill_analysis", analysis);
  if (!userId) return;

  try {
    const supabase = await getSupabase();
    await supabase.from("skill_analyses").insert([{
      user_id: userId,
      career_target: analysis.career_target as string | null,
      current_skills: analysis.strengths || [],
      skill_gaps: analysis.skill_gaps || [],
      strengths: Array.isArray(analysis.strengths)
        ? (analysis.strengths as Record<string, unknown>[]).map((s) => s.skill as string)
        : [],
      improvement_areas: Array.isArray(analysis.skill_gaps)
        ? (analysis.skill_gaps as Record<string, unknown>[]).map((g) => g.skill as string)
        : [],
      readiness_score: analysis.readiness_score as number ?? 0,
      learning_roadmap: analysis.learning_path || [],
      raw_input: analysis.raw_input as string | null,
      ai_analysis: analysis,
      updated_at: new Date().toISOString(),
    }]);
  } catch (e) {
    console.warn("Supabase skill analysis save failed (offline mode):", e);
  }
}

export function loadSkillAnalysis(): Record<string, unknown> | null {
  return loadFromStore<Record<string, unknown>>("disha_skill_analysis");
}

// ─── PHASE 2: MILESTONE PROGRESS ─────────────────────────────────────────

export async function saveMilestoneProgress(
  roadmapId: string,
  milestoneKey: string,
  isCompleted: boolean,
  userId: string,
  aiFeedback?: string
): Promise<void> {
  try {
    const supabase = await getSupabase();
    await supabase.from("roadmap_progress").upsert({
      user_id: userId,
      roadmap_id: roadmapId,
      milestone_key: milestoneKey,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      ai_feedback: aiFeedback || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "roadmap_id,milestone_key" });
  } catch (e) {
    console.warn("Milestone progress save failed:", e);
  }
}

export async function loadMilestoneProgress(
  roadmapId: string
): Promise<Record<string, boolean>> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("roadmap_progress")
      .select("milestone_key, is_completed")
      .eq("roadmap_id", roadmapId);

    if (!data) return {};

    return data.reduce<Record<string, boolean>>((acc, row) => {
      acc[row.milestone_key] = row.is_completed;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

// ─── PHASE 2: DASHBOARD SUMMARY ──────────────────────────────────────────

export async function getDashboardSummary(userId: string) {
  try {
    const supabase = await getSupabase();

    const [profileRes, roadmapRes, careerRes, skillRes, conversationRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("roadmaps")
        .select("id, title, total_duration_weeks, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("career_matches")
        .select("career_title, reality_scores")
        .eq("user_id", userId)
        .eq("is_primary", true)
        .maybeSingle(),
      supabase
        .from("skill_analyses")
        .select("readiness_score, career_target, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // Roadmap progress
    let milestoneProgress = 0;
    if (roadmapRes.data?.id) {
      const { data: progressRows } = await supabase
        .from("roadmap_progress")
        .select("is_completed")
        .eq("roadmap_id", roadmapRes.data.id);
      if (progressRows && progressRows.length > 0) {
        const completed = progressRows.filter((r) => r.is_completed).length;
        milestoneProgress = Math.round((completed / progressRows.length) * 100);
      }
    }

    return {
      profile: profileRes.data,
      activeRoadmap: roadmapRes.data,
      primaryCareer: careerRes.data,
      latestSkillAnalysis: skillRes.data,
      milestoneProgress,
      hasConversation: !!conversationRes.data,
    };
  } catch (e) {
    console.warn("Dashboard summary load failed:", e);
    return null;
  }
}
