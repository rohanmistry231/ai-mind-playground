import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set in .env.local");
}

const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "Gemini API key not configured on server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { prompt } = body as { prompt?: string };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const instruction = `
You are an assistant that analyzes how people use AI models.
Given a single user prompt (something they would ask ChatGPT/Gemini),
you will classify it and score it based on how much it grows their mind
versus how much it makes them dependent.

Respond ONLY with valid JSON in this exact format, no markdown, no extra text:

{
  "promptType": "Learning" | "Delegation" | "Creation" | "Trivial" | "Mixed",
  "growthScore": 0-100,
  "dependencyScore": 0-100,
  "shortFeedback": "one or two sentences of constructive feedback"
}

User prompt:
"""${prompt}"""
    `.trim();

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: instruction,
    });

    // In the new SDK, text is a property, NOT a function
    const rawText = (response.text ?? "").toString().trim();

    console.log("📦 RAW GEMINI RESPONSE:", rawText);

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ JSON parse failed:", rawText);
      return NextResponse.json(
        { error: "Failed to parse JSON from Gemini.", raw: rawText },
        { status: 500 }
      );
    }

    const safe = {
      promptType: parsed.promptType ?? "Unknown",
      growthScore: Math.max(
        0,
        Math.min(100, Number(parsed.growthScore) || 0)
      ),
      dependencyScore: Math.max(
        0,
        Math.min(100, Number(parsed.dependencyScore) || 0)
      ),
      shortFeedback: parsed.shortFeedback ?? "",
    };

    console.log("✅ Parsed analysis:", safe);

    return NextResponse.json(safe);
  } catch (error) {
    console.error("💥 Error in /api/analyze:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
