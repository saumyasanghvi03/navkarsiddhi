import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export const runtime = 'nodejs';
export const maxDuration = 10;

const SYSTEM_PROMPT = `You write push notification copy for a Jain meditation app called Navkar Siddhi.
Rules:
- Title: ≤7 words, include 1 emoji at start
- Body: ≤18 words, punchy and direct
- Tone: warm, like a caring friend who understands Jain values — not corporate or generic
- Mix Hindi/English naturally (Hinglish) — e.g. "atma", "mala", "navkar", "streak", "sadhana"
- Never say "app", "notification", "click", "download"
- Reference the user's actual data (streak, navkars, name) when provided
- Output ONLY valid JSON: {"title": "...", "body": "..."}`;

type Slot = 'morning' | 'chauvihar' | 'evening' | 'night';

function slotContext(slot: Slot, name: string, streak: number, navkars: number, malas: number, daysInactive: number, lifecycle: string): string {
  const nameStr = name ? ` User's name: ${name}.` : '';
  const streakStr = streak > 0 ? ` Current streak: ${streak} days.` : ' No active streak.';
  const navkarStr = navkars > 0 ? ` Today's navkars so far: ${navkars}.` : ' No navkars today yet.';
  const malaStr = malas > 0 ? ` Malas today: ${malas}.` : '';
  const inactiveStr = daysInactive > 0 ? ` Days since last session: ${daysInactive}.` : '';
  const lcStr = ` Lifecycle stage: ${lifecycle}.`;

  const slotPrompts: Record<Slot, string> = {
    morning: `Write a MORNING notification (6–9am). Energy: gentle, hopeful, motivating start of day.${nameStr}${streakStr}${navkarStr}${malaStr}${inactiveStr}${lcStr}`,
    chauvihar: `Write a CHAUVIHAR notification (sunset, ~6pm). Context: Jain chauvihar vow — no food/water after sunset. Energy: spiritual, proud, Jain-specific.${nameStr}${streakStr}${navkarStr}${malaStr}${inactiveStr}${lcStr}`,
    evening: `Write an EVENING notification (7–9pm). Energy: reflective, warm, end-of-day wrap-up.${nameStr}${streakStr}${navkarStr}${malaStr}${inactiveStr}${lcStr}`,
    night: `Write a NIGHT notification (10pm–midnight). Energy: peaceful, pre-sleep, bedtime sadhana vibe.${nameStr}${streakStr}${navkarStr}${malaStr}${inactiveStr}${lcStr}`,
  };

  return slotPrompts[slot];
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const slot       = (searchParams.get('slot') ?? 'morning') as Slot;
  const streak     = parseInt(searchParams.get('streak') ?? '0', 10);
  const navkars    = parseInt(searchParams.get('navkars') ?? '0', 10);
  const malas      = parseInt(searchParams.get('malas') ?? '0', 10);
  const daysInact  = parseInt(searchParams.get('daysInactive') ?? '0', 10);
  const name       = searchParams.get('name') ?? '';
  const lifecycle  = searchParams.get('lifecycle') ?? 'ACTIVE';

  if (!['morning', 'chauvihar', 'evening', 'night'].includes(slot)) {
    return NextResponse.json({ error: 'invalid slot' }, { status: 400 });
  }

  try {
    const prompt = slotContext(slot as Slot, name, streak, navkars, malas, daysInact, lifecycle);

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: SYSTEM_PROMPT,
      prompt,
      config: { temperature: 0.9, maxOutputTokens: 120 },
    });

    // Parse and validate response
    const raw = text.trim().replace(/^```json\n?|\n?```$/g, '');
    const parsed = JSON.parse(raw) as { title?: string; body?: string };

    if (!parsed.title || !parsed.body) throw new Error('missing fields');

    return NextResponse.json({
      title: String(parsed.title).slice(0, 80),
      body:  String(parsed.body).slice(0, 200),
      slot,
      generated: true,
    });
  } catch {
    return NextResponse.json({ error: 'generation_failed', generated: false }, { status: 500 });
  }
}
