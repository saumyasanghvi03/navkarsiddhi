import { NextRequest, NextResponse } from 'next/server';
import { dailyVibeFlow, JAIN_FALLBACK_VIBES } from '@/ai/flows';

export async function POST(_request: NextRequest) {
  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.BYTEZ_API_KEY) {
    const fallback = JAIN_FALLBACK_VIBES[Math.floor(Math.random() * JAIN_FALLBACK_VIBES.length)];
    return NextResponse.json({ vibe: fallback, isFallback: true });
  }
  try {
    const vibe = await dailyVibeFlow();
    return NextResponse.json({ vibe });
  } catch (err: any) {
    console.warn('[ai/vibe] AI service failed, using fallback:', err.message);
    const fallback = JAIN_FALLBACK_VIBES[Math.floor(Math.random() * JAIN_FALLBACK_VIBES.length)];
    return NextResponse.json({ vibe: fallback, isFallback: true });
  }
}
