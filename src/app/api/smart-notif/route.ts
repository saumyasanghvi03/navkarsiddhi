import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export const runtime = 'nodejs';
export const maxDuration = 10;

const SYSTEM_PROMPT = `You write push notification copy for a Jain meditation app called Navkar Siddhi.

RULES:
- Title: ≤7 words, 1 emoji at start, must be an IMMEDIATE HOOK — not a label
- Body: ≤18 words, punchy, direct, ends with action or payoff
- Tone: like a best friend who texts in Hinglish — warm, real, slightly cheeky
- Use: "atma", "mala", "navkar", "streak", "chauvihar", "karma", "kashaya" naturally
- Reference user data (streak, navkars, name) whenever provided
- Never say: "app", "notification", "click", "download", "reminder", "time for", "check-in"
- BANNED title patterns (too boring/generic): "Morning Jaap", "Evening Jaap", "Sadhana",
  "Vandana", "Pratah", "Ratri", "Jai Jinendra", "Navkar Siddhi" (app name as title)
- Title must NOT start with a time label like "Morning [X]" or "Evening [X]"
- First 3 words of title must create curiosity or urgency — not describe what the notification is

Output ONLY valid JSON: {"title": "...", "body": "..."}`;

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
