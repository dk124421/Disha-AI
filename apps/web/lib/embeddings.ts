/**
 * Disha AI — Phase 2: Embeddings & Semantic Memory Client
 * Handles generating embeddings via the AI service and storing/querying them in Supabase (pgvector).
 */

const AI_SERVICE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

// ─── EMBEDDING GENERATION ─────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/memory/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding as number[];
  } catch {
    return null;
  }
}

export async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/memory/recall-query-embedding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding as number[];
  } catch {
    return null;
  }
}

// ─── STORE EMBEDDING IN SUPABASE ─────────────────────────────────────────

export async function storeMessageEmbedding(
  userId: string,
  messageId: string,
  contentSnippet: string,
  embedding: number[]
): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();

    await supabase.from("message_embeddings").insert({
      user_id: userId,
      message_id: messageId,
      content_snippet: contentSnippet.slice(0, 500), // store up to 500 chars
      embedding: JSON.stringify(embedding), // pgvector accepts array notation
    });
  } catch (e) {
    console.warn("Failed to store embedding:", e);
  }
}

// ─── SEMANTIC MEMORY RECALL ───────────────────────────────────────────────

export interface MemoryChunk {
  id: string;
  content_snippet: string;
  similarity: number;
}

export async function recallRelevantMemory(
  currentMessage: string,
  userId: string,
  limit = 5
): Promise<string[]> {
  try {
    // 1. Generate query embedding
    const embedding = await generateQueryEmbedding(currentMessage);
    if (!embedding) return [];

    // 2. Query Supabase match_messages function
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();

    const { data, error } = await supabase.rpc("match_messages", {
      query_embedding: embedding,
      match_user_id: userId,
      match_count: limit,
      match_threshold: 0.65,
    });

    if (error || !data) return [];

    // 3. Return content snippets as context strings
    return (data as MemoryChunk[])
      .filter((m) => m.similarity > 0.65)
      .map((m) => m.content_snippet);
  } catch {
    return [];
  }
}

// ─── BACKGROUND EMBED & STORE ─────────────────────────────────────────────
// Called after a user message is saved — generates and stores embedding silently.

export async function embedAndStoreMessage(
  userId: string,
  messageId: string,
  content: string
): Promise<void> {
  const embedding = await generateEmbedding(content);
  if (!embedding) return;
  await storeMessageEmbedding(userId, messageId, content, embedding);
}
