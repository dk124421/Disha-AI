import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { career, profile } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      You are an expert career strategist. Create a 5-year career simulation for a student entering the following career.

      User Profile: ${JSON.stringify(profile)}
      Career: ${JSON.stringify(career)}

      Generate a 5-year trajectory (Years 1 to 5).
      For each year, provide:
      - year: number (1 to 5)
      - title: Job title for that year
      - salary: Expected salary (in INR)
      - lifestyle: A short sentence describing their lifestyle/work setup (e.g., "Working remote from Goa", "Leading a small team", "Freelancing on the side")
      - milestone: A key professional milestone achieved that year.

      Return ONLY a JSON object in this exact format:
      {
        "simulation": [
          {
            "year": 1,
            "title": "...",
            "salary": "...",
            "lifestyle": "...",
            "milestone": "..."
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Twin generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate simulation" },
      { status: 500 }
    );
  }
}
