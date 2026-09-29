import { NextRequest, NextResponse } from 'next/server';
import { askGuruFlow, GURU_FALLBACK_RESPONSE, QUICK_ANSWERS } from '@/ai/flows';
import { withCors, corsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.BYTEZ_API_KEY) {
    return withCors(NextResponse.json({ answer: GURU_FALLBACK_RESPONSE, isFallback: true }));
  }
  try {
    const body = await request.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return withCors(NextResponse.json({ error: 'question is required' }, { status: 400 }));
    }

    // Check for quick static answers first
    if (QUICK_ANSWERS[question]) {
      return withCors(NextResponse.json({ answer: QUICK_ANSWERS[question], isQuickAnswer: true }));
    }

    const answer = await askGuruFlow(question.slice(0, 500));
    return withCors(NextResponse.json({ answer }));
  } catch (err: any) {
    console.warn('[ai/ask] AI service failed, using fallback:', err.message);
    return withCors(NextResponse.json({ answer: GURU_FALLBACK_RESPONSE, isFallback: true }));
  }
}
