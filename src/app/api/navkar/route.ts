import { NextRequest, NextResponse } from 'next/server';
import { incrementGlobalNavkar } from '@/lib/globalStats';

export async function POST(request: NextRequest) {
  // Vercel automatically sets x-vercel-ip-country in production.
  // Fall back to a body-provided countryCode for local development.
  const vercelCountry = request.headers.get('x-vercel-ip-country');

  let bodyCountry: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    bodyCountry = typeof body?.countryCode === 'string' ? body.countryCode : undefined;
  } catch (_) {}

  const countryCode = (vercelCountry || bodyCountry || 'UNKNOWN').toUpperCase();

  await incrementGlobalNavkar(countryCode);

  return NextResponse.json({ ok: true, countryCode });
}
