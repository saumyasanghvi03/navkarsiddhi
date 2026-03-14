import { NextRequest, NextResponse } from 'next/server';
import { askGuruFlow } from '@/ai/flows';

export async function POST(request: NextRequest) {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured. Set GOOGLE_GENAI_API_KEY in your environment.' },
      { status: 503 }
    );
  }
  try {
    const body = await request.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }
    const answer = await askGuruFlow(question.slice(0, 500));
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[ai/ask]', err);
    return NextResponse.json(
      { error: 'AI service unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
