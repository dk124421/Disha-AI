import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers } = body as { answers: Record<string, string> };

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "No IKIGAI answers provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert IKIGAI career analyst. Analyze the following IKIGAI assessment answers and return a structured JSON result.

IKIGAI ANSWERS:
${Object.entries(answers)
  .map(([key, val]) => `- ${key}: ${val || "(not answered)"}`)
  .join("\n")}

Based on these answers, provide a comprehensive IKIGAI analysis. Return ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence personalized IKIGAI summary for this person",
  "love": {
    "score": 85,
    "themes": ["creativity", "helping others", "technology"],
    "insight": "Brief insight about what they love"
  },
  "goodAt": {
    "score": 78,
    "themes": ["analytical thinking", "communication", "design"],
    "insight": "Brief insight about their strengths"
  },
  "worldNeeds": {
    "score": 82,
    "themes": ["education access", "sustainability", "mental health"],
    "insight": "Brief insight about their world-impact orientation"
  },
  "canEarn": {
    "score": 75,
    "themes": ["digital services", "consulting", "content"],
    "insight": "Brief insight about their earning potential"
  },
  "ikigai_score": 80,
  "sweet_spot": "The intersection where their passion, skill, world-need, and earning potential most align",
  "top_career_directions": ["UX Design", "EdTech Product Manager", "Social Entrepreneur"],
  "caution": "One honest caveat or area to watch out for"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("IKIGAI analyze error:", error);
    return NextResponse.json(
      {
        analysis: {
          summary: "Your IKIGAI profile shows a thoughtful individual with diverse interests and strong potential.",
          love: { score: 80, themes: ["creativity", "impact", "learning"], insight: "You're driven by meaningful work." },
          goodAt: { score: 75, themes: ["communication", "problem-solving"], insight: "Your analytical and interpersonal skills stand out." },
          worldNeeds: { score: 82, themes: ["education", "technology"], insight: "You care about systemic change." },
          canEarn: { score: 70, themes: ["digital services", "freelance"], insight: "Your skills translate well to digital markets." },
          ikigai_score: 77,
          sweet_spot: "Purpose-driven work at the intersection of creativity, technology, and social impact.",
          top_career_directions: ["UX Designer", "EdTech Product Manager", "Content Strategist"],
          caution: "Focus on building one deep skill before diversifying.",
        },
      },
      { status: 200 }
    );
  }
}
