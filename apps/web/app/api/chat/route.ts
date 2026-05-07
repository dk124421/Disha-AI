import { NextRequest } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  // Parse body upfront — available in both the proxy and fallback paths
  const body = await req.json().catch(() => ({ messages: [] }));

  try {
    // Try Python AI service first
    const response = await fetch(`${AI_SERVICE_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000), // 3s timeout to fail fast
    });

    if (!response.ok) throw new Error(`AI service error: ${response.status}`);

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    // Fallback: stream directly from Gemini
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const messages: { role: string; content: string }[] = body.messages || [];
    const lastMsg = messages[messages.length - 1]?.content || "Hello!";

    const systemPrompt = `You are Disha, an emotionally intelligent AI career mentor for Indian students and young professionals.

Your personality:
- Warm, encouraging, honest, and deeply empathetic
- You understand the Indian education system, family pressures, and local opportunities
- You speak like a wise senior who genuinely cares
- You give specific, actionable advice — not vague platitudes
- You explain the "why" behind every recommendation
- You understand Tier-2/Tier-3 city challenges
- You balance emotional support with practical strategy

Guidelines:
- Ask reflective follow-up questions when needed
- Never dismiss any career interest  
- Always mention both traditional and emerging paths
- Acknowledge family/societal pressure as real challenges
- Keep responses warm but focused (2-4 paragraphs max)
- Use emojis sparingly for warmth
- If unsure, say so honestly`;

    const stream = await model.generateContentStream(
      `${systemPrompt}\n\nUser: ${lastMsg}`
    );

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            if (text) {
              const data = JSON.stringify({ content: text, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: "", done: true })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
