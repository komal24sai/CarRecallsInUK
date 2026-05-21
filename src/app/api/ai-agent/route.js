import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context, isUnlocked } = body;

    if (!message || !context) {
      return NextResponse.json({ error: 'Missing message or vehicle context' }, { status: 400 });
    }

    const systemPrompt = `You are an expert automotive forensic analyst and master mechanic working for "IsThisCarSafe.co.uk".
Your goal is to help a prospective car buyer evaluate a specific vehicle based entirely on its real historical data.
Provide highly professional, concise, and incredibly insightful advice.
You must ground all your answers in the following strict data context. Do not invent history or facts.

*** PAYWALL INSTRUCTIONS (CRITICAL) ***
The current user is on the ${isUnlocked ? 'PREMIUM (Unlocked)' : 'FREE'} tier.
- FREE Features: Basic MOT History (pass/fail), basic vehicle specs, mileage, MOT expiry.
- PAID/PREMIUM Features: AI Market Valuation, Predictive Maintenance Forecast (future failures/repair costs), Dealer Negotiation Dossier, Safety Score, Market Position Comparison.

If the user is on the FREE tier and asks about a PAID feature (like valuation, costs, predictive failures, or dealer dossiers), you MUST enthusiastically inform them that this is a Premium insight, and explicitly advise them to "unlock the full report" or "upgrade" to get that exact answer. 
If they ask about a FREE feature, answer normally using the context.
If the user is PREMIUM, answer all questions normally with no restrictions.

--- VEHICLE CONTEXT ---
Vehicle: ${context.vehicle?.make} ${context.vehicle?.model} (Registration: ${context.vehicle?.registration})
Manufacture Year: ${context.specification?.year_of_manufacture || 'Unknown'} (Age: ${context.vehicle?.vehicle_age_years || 'Unknown'} years)
Specifications:
- Engine: ${context.specification?.engine_capacity || 'Unknown'}cc, ${context.specification?.fuel_type || 'Unknown'}
- Colour: ${context.specification?.primary_colour || 'Unknown'}
- Revenue Weight: ${context.specification?.revenue_weight ? context.specification.revenue_weight + ' kg' : 'Unknown'}
- CO2 Emissions: ${context.specification?.co2_emissions ? context.specification.co2_emissions + ' g/km' : 'Unknown'}

Safety Score: ${context.safetyScore?.safetyScore || 'Unknown'}/100
Market Valuation (Fair Price): £${context.provenance?.market_valuation?.low || 'Unknown'} - £${context.provenance?.market_valuation?.high || 'Unknown'} (Average: £${context.provenance?.market_valuation?.average || 'Unknown'})
Recent Defects & Advisories:
${JSON.stringify(context.defects?.slice(0, 10) || [], null, 2)}
-----------------------

Use markdown formatting (bolding, lists) to make your response easy to read. Be objective.`;

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
