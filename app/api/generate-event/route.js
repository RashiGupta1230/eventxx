import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "GROQ_API_KEY is not configured in .env.local" },
                { status: 500 }
            );
        }
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

CRITICAL: Return ONLY valid JSON with properly escaped strings. No newlines in string values - use spaces instead.

Return this exact JSON structure:
{
  "title": "Event title (catchy and professional, single line)",
  "description": "Detailed event description in a single paragraph. Use spaces instead of line breaks. Make it 2-3 sentences describing what attendees will learn and experience.",
  "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All string values must be on a single line with no line breaks
- Use spaces instead of \\n or line breaks in description
- Make title catchy and under 80 characters
- Description should be 2-3 sentences, informative, single paragraph
- suggestedTicketType should be either "free" or "paid"
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            response_format: { type: "json_object" },
        });

        const text = chatCompletion.choices[0]?.message?.content || "";

        console.log(text);

        const eventData = JSON.parse(text);

        return NextResponse.json(eventData);
    } catch (error) {
        console.error("Error generating event with Groq:", error);
        return NextResponse.json(
            { error: "Failed to generate event: " + error.message },
            { status: 500 }
        );
    }
}