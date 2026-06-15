import { NextResponse } from 'next/server';
import { SymptomAnalysisRequestSchema, SymptomAnalysisResponseSchema } from '@/engine/validation';

export const runtime = 'edge';

// ─── System Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a clinical pharmacology assistant specializing in drug-food interactions and gastric symptoms. Given a list of recently consumed items with their timing, analyze potential causes of stomach discomfort.

Return ONLY valid JSON with this exact structure:
{
  "likely_causes": [
    {
      "item": "item name",
      "mechanism": "detailed pharmacological mechanism",
      "confidence": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "interactions_detected": [
    {
      "item_a": "first item",
      "item_b": "second item",
      "interaction_type": "type of interaction",
      "mechanism": "how these interact"
    }
  ],
  "recommendations": ["actionable recommendation strings"],
  "severity": "MILD" | "MODERATE" | "SEVERE"
}

Be clinically accurate. Focus on GI-relevant mechanisms.`;

// ─── LLM Calls ──────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callGrok(prompt: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error('GROK_API_KEY not configured');

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error(`Grok error: ${response.status}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parseResult = SymptomAnalysisRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { symptom, recent_items } = parseResult.data;

    // Build analysis prompt
    const itemList = recent_items
      .map((item) => `- ${item.item_name} (${item.generic_resolved}) at ${item.scheduled_time} with ${item.vehicle}`)
      .join('\n');

    const prompt = `Patient reports: "${symptom}"\n\nItems consumed in the last 3 hours:\n${itemList}\n\nAnalyze potential causes of the reported symptom.`;

    let rawResponse: string;

    // Gemini → Grok failover
    try {
      rawResponse = await callGemini(prompt);
    } catch {
      try {
        rawResponse = await callGrok(prompt);
      } catch {
        return NextResponse.json({ error: 'All LLM providers failed' }, { status: 503 });
      }
    }

    // Parse and validate
    let parsed: unknown;
    try {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse response' }, { status: 502 });
    }

    const validationResult = SymptomAnalysisResponseSchema.safeParse(parsed);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Response validation failed', details: validationResult.error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(validationResult.data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
