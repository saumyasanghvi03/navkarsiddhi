// The Capacitor APK now bundles a static export (see apiBase.ts) and calls
// these routes cross-origin from https://localhost, so they need explicit
// CORS headers. None of these endpoints read cookies or auth headers — they're
// public POST actions (submit a resource, bump a counter, ask the AI guru) —
// so a wildcard origin doesn't widen access beyond what's already public.
import { NextResponse } from 'next/server';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function withCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
