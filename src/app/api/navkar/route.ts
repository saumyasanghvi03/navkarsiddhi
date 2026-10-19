import { NextRequest, NextResponse } from 'next/server';
import { incrementGlobalNavkar, getGlobalStats, getCityHeatmap, incrementCityNavkar } from '@/lib/globalStats';
import { withCors, corsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  const [stats, cities] = await Promise.all([getGlobalStats(), getCityHeatmap()]);
  return withCors(NextResponse.json({ ...stats, cities }));
}

export async function POST(request: NextRequest) {
  // Vercel automatically sets x-vercel-ip-country in production.
  // Fall back to a body-provided countryCode for local development.
  const vercelCountry = request.headers.get('x-vercel-ip-country');

  let bodyCountry: string | undefined;
  let cityId: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    bodyCountry = typeof body?.countryCode === 'string' ? body.countryCode : undefined;
    cityId = typeof body?.cityId === 'string' ? body.cityId : undefined;
  } catch (_) {}

  const countryCode = (vercelCountry || bodyCountry || 'UNKNOWN').toUpperCase();

  await incrementGlobalNavkar(countryCode);
  if (cityId) await incrementCityNavkar(cityId);

  return withCors(NextResponse.json({ ok: true, countryCode, cityId }));
}
