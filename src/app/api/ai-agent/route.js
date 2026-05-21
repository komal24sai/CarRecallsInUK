import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message || !context) {
      return NextResponse.json({ error: 'Missing message or vehicle context' }, { status: 400 });
    }

    const systemPrompt = `You are an expert automotive forensic analyst and master mechanic working for "IsThisCarSafe.co.uk".
Your goal is to help a prospective car buyer evaluate a specific vehicle based entirely on its real historical data.
Provide highly professional, concise, and incredibly insightful advice.
You must ground all your answers in the following strict data context. Do not invent history or facts.

--- VEHICLE CONTEXT ---
Vehicle: ${context.vehicle?.make} ${context.vehicle?.model} (Age: ${context.vehicle?.vehicle_age_years} years)
Safety Score: ${context.safetyScore?.safetyScore || 'Unknown'}/100
Market Valuation (Fair Price): £${context.provenance?.market_valuation?.low || 'Unknown'} - £${context.provenance?.market_valuation?.high || 'Unknown'} (Average: £${context.provenance?.market_valuation?.average || 'Unknown'})
Recent Defects & Advisories:
${JSON.stringify(context.defects?.slice(0, 10) || [], null, 2)}
-----------------------

Use markdown formatting (bolding, lists) to make your response easy to read. Be objective. If a car is bad, tell them. If it's good, reassure them.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand the vehicle context and my role as a forensic analyst. Please proceed with your question.' }] },
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('[AI Agent API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI response.' }, { status: 500 });
  }
}
