import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { career, profile } = await req.json() as {
      career: { title: string; category: string; top_skills: string[] };
      profile: Record<string, unknown>;
    };

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are Disha AI's roadmap generation engine. Create a personalized 24-week learning roadmap for an Indian student.

Career Goal: ${career.title} (${career.category})
Key Skills Needed: ${career.top_skills?.join(", ")}
User Profile: ${JSON.stringify(profile || {})}

Return ONLY valid JSON in this exact format:
{
  "title": "Your ${career.title} Journey",
  "description": "One sentence description of the roadmap",
  "career": "${career.title}",
  "total_weeks": 24,
  "phases": [
    {
      "phase": 1,
      "title": "Phase Title",
      "weeks": "1–6",
      "color": "#a855f7",
      "focus": "What this phase focuses on",
      "milestones": [
        {
          "week": 3,
          "title": "Milestone Title",
          "done": false,
          "deliverable": "Specific thing to create/accomplish",
          "resources": [
            { "title": "Resource Name", "url": "https://example.com", "free": true }
          ]
        }
      ]
    }
  ],
  "key_certifications": ["Cert 1", "Cert 2", "Cert 3"],
  "first_step": "The single most important first action to take today"
}

Create 4 phases (weeks 1-6, 7-12, 13-18, 19-24).
Each phase should have 2-3 milestones.
Colors: "#a855f7", "#22d3ee", "#f59e0b", "#10b981"
Focus on free/low-cost resources accessible in India.
Be specific and practical.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const roadmap = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Roadmap generate error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
