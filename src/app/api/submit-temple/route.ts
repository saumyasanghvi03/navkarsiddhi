import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withCors, corsPreflight } from '@/lib/cors';

const COLLECTION = 'temple_submissions';
const looksLikeSpam = (v: string) => /https?:\/\/|www\./i.test(v);

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  if (!db) {
    return withCors(NextResponse.json({ ok: false, error: 'Temple submissions unavailable.' }, { status: 503 }));
  }

  let body: { name?: string; area?: string; address?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return withCors(NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 }));
  }

  const name = (body.name || '').trim();
  const area = (body.area || '').trim();
  const address = (body.address || '').trim();
  const notes = (body.notes || '').trim().slice(0, 300);

  if (!name || !area || !address) {
    return withCors(NextResponse.json({ ok: false, error: 'Name, area, and address are required.' }, { status: 400 }));
  }
  if (name.length > 150 || area.length > 100 || address.length > 300) {
    return withCors(NextResponse.json({ ok: false, error: 'One of the fields is too long.' }, { status: 400 }));
  }
  if (looksLikeSpam(name) || looksLikeSpam(area)) {
    return withCors(NextResponse.json({ ok: false, error: 'That submission looks like spam.' }, { status: 400 }));
  }

  try {
    await addDoc(collection(db, COLLECTION), {
      name,
      area,
      address,
      notes,
      status: 'unverified',
      flagCount: 0,
      submittedAt: serverTimestamp(),
    });
  } catch {
    return withCors(NextResponse.json({ ok: false, error: 'Could not save submission. Try again.' }, { status: 500 }));
  }

  return withCors(NextResponse.json({ ok: true }));
}
