import { NextResponse } from 'next/server';
import { EdgeResolveRequestSchema, EdgeResponseSchema } from '@/engine/validation';

export const runtime = 'edge';

// ─── LLM System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a clinical pharmacology assistant. Given a user's query about a medication, supplement, or food item, resolve it to a structured JSON object.

Return ONLY valid JSON with this exact structure:
{
  "generic_name": "lowercase_underscore_name",
  "category": "medicine" | "supplement" | "food",
  "optimal_slot": "FASTING" | "WITH_MEAL" | "AFTER_MEAL" | "BEFORE_BED",
  "requires_food": true/false,
  "confidence_level": "HIGH" | "MEDIUM" | "THEORETICAL",
  "evidence_sources": [
    {
      "title": "Source title (FDA, PubMed, or clinical guideline)",
      "url": "optional URL",
      "summary": "Brief explanation of the evidence"
    }
  ]
}

Rules:
- generic_name must be lowercase with underscores, no brand names
- Use accurate pharmacological knowledge
- Include at least 1 evidence source
- confidence_level: HIGH for well-established drugs, MEDIUM for supplements, THEORETICAL for novel compounds
- Do NOT include any text outside the JSON object`;

// ─── Gemini API Call ─────────────────────────────────────────────────────────

async function callGemini(query: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nResolve this item: "${query}"`,
          }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const status = response.status;
    throw new Error(`Gemini API error: ${status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

// ─── Grok (xAI) API Call ─────────────────────────────────────────────────────

async function callGrok(query: string): Promise<string> {
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
        { role: 'user', content: `Resolve this item: "${query}"` },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Grok response');
  return text;
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Parse and validate request
    const body: unknown = await request.json();
    const parseResult = EdgeResolveRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { query } = parseResult.data;
    let rawResponse: string;

    // Multi-LLM failover: Gemini → Grok
    try {
      rawResponse = await callGemini(query);
    } catch (geminiError) {
      console.warn('Gemini failed, falling back to Grok:', geminiError);
      try {
        rawResponse = await callGrok(query);
      } catch (grokError) {
        console.error('Both LLMs failed:', grokError);
        const geminiMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        const grokMsg = grokError instanceof Error ? grokError.message : String(grokError);
        return NextResponse.json(
          { 
            error: 'All LLM providers failed',
            details: `Gemini: ${geminiMsg} | Grok: ${grokMsg}`
          },
          { status: 503 }
        );
      }
    }

    // Parse JSON from LLM response
    let parsed: unknown;
    try {
      // Strip markdown code fences if present
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse LLM response as JSON', raw: rawResponse },
        { status: 502 }
      );
    }

    // Zod validation gate — prevents DB pollution
    const validationResult = EdgeResponseSchema.safeParse(parsed);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'LLM response failed validation', details: validationResult.error.flatten() },
        { status: 422 }
      );
    }

    // Return validated, clean data — zero tracking headers
    return NextResponse.json(validationResult.data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
