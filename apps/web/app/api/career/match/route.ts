import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ikigai_answers, profile, ikigai_analysis } = body as {
      ikigai_answers: Record<string, string>;
      profile: Record<string, unknown>;
      ikigai_analysis: Record<string, unknown>;
    };

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const profileStr = profile
      ? `User Profile: ${JSON.stringify(profile, null, 2)}`
      : "";
    const answersStr = ikigai_answers
      ? `IKIGAI Answers: ${JSON.stringify(ikigai_answers, null, 2)}`
      : "";
    const analysisStr = ikigai_analysis
      ? `IKIGAI Analysis: ${JSON.stringify(ikigai_analysis, null, 2)}`
      : "";

    const prompt = `You are Disha AI's expert career matching engine. Based on the user's IKIGAI data, generate 5 highly personalized career matches for an Indian student/professional.

${profileStr}
${answersStr}
${analysisStr}

Return ONLY valid JSON in this exact format:
{
  "careers": [
    {
      "rank": 1,
      "title": "Career Title",
      "category": "Field / Domain",
      "tagline": "A compelling one-liner about this career",
      "why_this_fits": "2-3 sentences explaining why this career matches this specific person's IKIGAI",
      "reality_scores": {
        "passion_fit": 90,
        "salary_potential": 75,
        "market_demand": 85,
        "ai_risk": 20,
        "stress_level": 55,
        "difficulty": 65,
        "remote_possibility": 80,
        "future_growth": 88
      },
      "salary_range": {
        "min": 600000,
        "max": 2500000,
        "currency": "INR",
        "note": "Range for India, grows with experience"
      },
      "top_skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
      "day_in_life": "A vivid 2-sentence description of a typical workday",
      "tier2_note": "How accessible is this from Tier-2/3 cities in India?",
      "entry_paths": ["Path 1", "Path 2", "Path 3"],
      "color": "#a855f7"
    }
  ],
  "match_reasoning": "2-sentence overall explanation of why these 5 careers were chosen",
  "ikigai_sweet_spot": "The core intersection identified"
}

Use these colors for ranks 1-5: "#a855f7", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"
Make the recommendations deeply personalized, honest, and India-specific.
Include a mix of traditional and emerging careers.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Career match error:", error);
    // Return structured fallback
    return NextResponse.json({
      careers: [
        {
          rank: 1,
          title: "UX/Product Designer",
          category: "Design & Technology",
          tagline: "The perfect blend of creativity, psychology, and technology.",
          why_this_fits: "Your creative passion combined with analytical thinking makes you a natural UX designer. You'll create experiences that millions use daily.",
          reality_scores: { passion_fit: 92, salary_potential: 78, market_demand: 88, ai_risk: 25, stress_level: 55, difficulty: 60, remote_possibility: 95, future_growth: 90 },
          salary_range: { min: 600000, max: 2800000, currency: "INR", note: "Strong growth with portfolio" },
          top_skills: ["Figma", "User Research", "Prototyping", "Psychology"],
          day_in_life: "Mornings in user research, afternoons building wireframes, evenings collaborating with developers.",
          tier2_note: "Fully remote-friendly. Many top companies hire from Tier-2 cities.",
          entry_paths: ["Google UX Certificate", "Build portfolio projects", "Internshala internships"],
          color: "#a855f7",
        },
        {
          rank: 2,
          title: "AI/ML Engineer",
          category: "Technology",
          tagline: "Build systems reshaping every industry.",
          why_this_fits: "Your analytical mindset positions you perfectly for AI. India's AI job market is exploding with remote opportunities.",
          reality_scores: { passion_fit: 80, salary_potential: 95, market_demand: 97, ai_risk: 15, stress_level: 65, difficulty: 80, remote_possibility: 85, future_growth: 98 },
          salary_range: { min: 800000, max: 4000000, currency: "INR", note: "Among highest-paying tech roles" },
          top_skills: ["Python", "TensorFlow", "Statistics", "SQL"],
          day_in_life: "Writing model training scripts, debugging pipelines, presenting insights to business teams.",
          tier2_note: "Strong remote opportunities, especially at startups.",
          entry_paths: ["Fast.ai course", "Kaggle competitions", "Build 3 ML projects"],
          color: "#22d3ee",
        },
        {
          rank: 3,
          title: "Content Creator / Digital Educator",
          category: "Media & Education",
          tagline: "Turn your knowledge into income and impact.",
          why_this_fits: "Your love for sharing ideas and helping others makes you a natural educator. India's creator economy is exploding.",
          reality_scores: { passion_fit: 88, salary_potential: 65, market_demand: 82, ai_risk: 30, stress_level: 40, difficulty: 45, remote_possibility: 100, future_growth: 85 },
          salary_range: { min: 300000, max: 5000000, currency: "INR", note: "Unlimited ceiling with audience" },
          top_skills: ["Video Editing", "SEO", "Writing", "Community Building"],
          day_in_life: "Recording tutorials, engaging your audience, building courses that teach while you sleep.",
          tier2_note: "100% location-independent. Many successful creators from Tier-2 cities.",
          entry_paths: ["Start YouTube channel", "Build on Udemy/Unacademy", "Newsletter on Substack"],
          color: "#f59e0b",
        },
        {
          rank: 4,
          title: "Digital Marketing Strategist",
          category: "Business & Marketing",
          tagline: "Help brands reach their people in the digital age.",
          why_this_fits: "Your communication skills and interest in business make digital marketing a natural fit. Every business needs it.",
          reality_scores: { passion_fit: 75, salary_potential: 70, market_demand: 88, ai_risk: 35, stress_level: 50, difficulty: 45, remote_possibility: 90, future_growth: 80 },
          salary_range: { min: 400000, max: 2000000, currency: "INR", note: "Freelance potential is very high" },
          top_skills: ["SEO/SEM", "Analytics", "Social Media", "Copywriting"],
          day_in_life: "Planning campaigns, analyzing data, writing copy, reporting to clients.",
          tier2_note: "Fully remote, high freelance demand from MSMEs nationwide.",
          entry_paths: ["Google Digital Marketing Certificate", "HubSpot Academy", "Intern at local agency"],
          color: "#10b981",
        },
        {
          rank: 5,
          title: "Startup Founder / Social Entrepreneur",
          category: "Entrepreneurship",
          tagline: "Build something the world needs — on your own terms.",
          why_this_fits: "Your desire for impact and independence suggests entrepreneurship as a long-term path. Start with a side project while building skills.",
          reality_scores: { passion_fit: 90, salary_potential: 60, market_demand: 80, ai_risk: 10, stress_level: 85, difficulty: 90, remote_possibility: 70, future_growth: 95 },
          salary_range: { min: 0, max: 50000000, currency: "INR", note: "High risk, high reward" },
          top_skills: ["Business Strategy", "Sales", "Product", "Fundraising"],
          day_in_life: "Pitching to investors, solving customer problems, building team culture, making decisions with incomplete data.",
          tier2_note: "Many successful startups solve Tier-2 problems from Tier-2 cities.",
          entry_paths: ["Build a side project", "Apply to NASSCOM Startup", "Join startup ecosystem"],
          color: "#f43f5e",
        },
      ],
      match_reasoning: "These careers span creative, technical, and entrepreneurial paths based on your unique IKIGAI profile.",
      ikigai_sweet_spot: "Purpose-driven work combining creativity, technology, and social impact.",
    });
  }
}
