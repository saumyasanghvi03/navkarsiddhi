import { NextRequest, NextResponse } from 'next/server';
import { incrementGlobalNavkar } from '@/lib/globalStats';

export async function POST(request: NextRequest) {
  // Vercel automatically sets x-vercel-ip-country and x-vercel-ip-city in production.
  // Fall back to body-provided values for local development.
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  const vercelCity = request.headers.get('x-vercel-ip-city');

  let bodyCountry: string | undefined;
  let bodyCity: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    bodyCountry = typeof body?.countryCode === 'string' ? body.countryCode : undefined;
    bodyCity = typeof body?.city === 'string' ? body.city : undefined;
  } catch (_) {}

  const countryCode = (vercelCountry || bodyCountry || 'UNKNOWN').toUpperCase();
  // Decode URL-encoded city name (Vercel encodes spaces as %20, etc.).
  // Guard against malformed percent-encoding sequences that would throw URIError.
  let city: string | undefined;
  try {
    const rawCity = vercelCity ?? bodyCity;
    if (rawCity) city = decodeURIComponent(rawCity).trim().slice(0, 80) || undefined;
  } catch (_) {
    // malformed encoding — skip city tracking
  }

  await incrementGlobalNavkar(countryCode, city);

  return NextResponse.json({ ok: true, countryCode, city: city ?? null });
}
