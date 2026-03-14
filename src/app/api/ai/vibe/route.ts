import { NextRequest, NextResponse } from 'next/server';
import { dailyVibeFlow } from '@/ai/flows';

export async function POST(_request: NextRequest) {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Set GOOGLE_GENAI_API_KEY in your environment.' },
      { status: 503 }
    );
  }
  try {
    const vibe = await dailyVibeFlow();
    return NextResponse.json({ vibe });
  } catch (err) {
    console.error('[ai/vibe]', err);
    return NextResponse.json(
      { error: 'AI service unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
