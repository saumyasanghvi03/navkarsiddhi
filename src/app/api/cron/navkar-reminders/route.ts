import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, getAdminDb, getAdminMessaging } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// IST = UTC+5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Cron fires at UTC 01:30 (morning IST 07:00), 13:30 (evening IST 19:00),
// 16:30 (night IST 22:00), and 12:30 (chauvihar IST 18:00).
// Each window accepts ±60 min of drift (Vercel cron is ~minute-accurate).
const SLOTS = [
  { name: 'morning',   istHour: 7,  window: 60 },
  { name: 'chauvihar', istHour: 18, window: 60 },
  { name: 'evening',   istHour: 19, window: 60 },
  { name: 'night',     istHour: 22, window: 60 },
] as const;

type Slot = typeof SLOTS[number]['name'];

// Light message pools — server side (no import of full client pool)
const MESSAGES: Record<Slot, Array<{ title: string; body: string }>> = {
  morning: [
    { title: '🌅 Subah ki Sadhana', body: 'New day, new karma account. First navkar of the day is waiting 🙏 Open Navkar Siddhi.' },
    { title: '📿 Morning Jaap', body: 'One mala before chai hits different. Start your day with dharma — open Navkar Siddhi.' },
    { title: '🪔 Jai Jinendra', body: 'Brahma Muhurta energy — best time to do navkar. Start light: even 9 counts is a win 🙏' },
    { title: '🌞 Atma se good morning', body: 'The five supreme souls are already awake. Your atma is waiting for a morning check-in 📿' },
    { title: '🧘 Navkar Siddhi', body: 'Morning navkar > morning doomscroll. Easy math. Open the app and begin your mala 🙏' },
  ],
  chauvihar: [
    { title: '🌇 Chauvihar Time', body: 'Sunset approaching — last call for food & water. Close your plate, open Navkar Siddhi 📿 Jai Jinendra 🙏' },
    { title: '🌅 Chauvihar Reminder', body: 'Chauvihar begins now. No food, no water till sunrise 💪 Counter it with navkars tonight.' },
    { title: '🍽️ Plate down, beads up', body: 'Chauvihar vow time 🙏 What the body gives up, the atma gains. Open Navkar Siddhi 📿' },
    { title: '🌇 Sunset Sadhana', body: 'No food after sunset — that\'s the rule. Evening navkar is the reward 📿 Open Navkar Siddhi.' },
    { title: '🔔 Chauvihar Cutoff', body: 'Sunset now. Chauvihar starts. The evening is for dharma, not dinner 😌 Open the app 📿' },
  ],
  evening: [
    { title: '🌆 Evening check-in', body: 'Day not done yet. Evening navkar hits the hardest — peace in, karma out 🙏 Open Navkar Siddhi.' },
    { title: '🪔 Sandhya Vandana', body: 'Sunset is prime navkar time. One mala before dark hits different 🌇 Open Navkar Siddhi.' },
    { title: '📿 Evening Jaap', body: 'The day threw a lot at you. Counter it: one mala to reset the vibe 🧘 Open the app.' },
    { title: '✨ Karma cleanse', body: 'Evening karma audit time 📊 Open Navkar Siddhi and fix today\'s count 📿 Jai Jinendra.' },
    { title: '📿 Navkar Siddhi', body: 'Office band ho gaya. Commute pe navkar? Volume ↓ button = +1 navkar, no screen needed 📱' },
  ],
  night: [
    { title: '🌙 Pre-sleep mala', body: 'Jain hack for deep sleep: do a mala lying down, eyes closed. Volume ↓ button counts 📿 Try tonight.' },
    { title: '🌟 Raat ki Sadhana', body: 'Everyone\'s asleep. Just you and the mantra. This is the real monk mode 🧘 Open Navkar Siddhi.' },
    { title: '🪔 Good night, atma', body: 'Go to sleep with a clean karma slate — one last round before you close your eyes 📿 Jai Jinendra.' },
    { title: '📿 Bedtime jaap', body: 'Lie down, close eyes, Volume ↓ for each navkar. No screen, no effort, pure sadhana 🌙' },
    { title: '✨ Last navkar of the day', body: 'Make the last thing you do today a navkar. A streak starts with one night. This one. 🙏' },
  ],
};

const getIstHour = (): number => {
  const istMs = Date.now() + IST_OFFSET_MS;
  return new Date(istMs).getUTCHours();
};

const pickSlot = (istHour: number): Slot | null => {
  for (const s of SLOTS) {
    if (Math.abs(istHour - s.istHour) <= 1) return s.name;
  }
  return null;
};

const pickMsg = (slot: Slot): { title: string; body: string } => {
  const pool = MESSAGES[slot];
  return pool[Math.floor(Math.random() * pool.length)];
};

const sendPush = async (
  token: string,
  payload: { title: string; body: string }
): Promise<'sent' | 'stale' | 'error'> => {
  try {
    await getAdminMessaging().send({
      token,
      data: { title: payload.title, body: payload.body, tag: 'navkar-reminder', url: '/' },
      webpush: { headers: { Urgency: 'normal' } },
    });
    return 'sent';
  } catch (err: any) {
    const code = err?.errorInfo?.code || err?.code;
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token'
    ) return 'stale';
    console.error('[cron/navkar-reminders] send failed:', code || err);
    return 'error';
  }
};

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  if (!isFirebaseAdminConfigured) {
    return NextResponse.json({ skipped: true, reason: 'Firebase Admin not configured' });
  }

  const istHour = getIstHour();
  const slot = pickSlot(istHour);

  if (!slot) {
    return NextResponse.json({ skipped: true, reason: 'not in a notification window', istHour });
  }

  const msg = pickMsg(slot);
  const db = getAdminDb();
  const snapshot = await db.collection('push_subscriptions').where('navkarEnabled', '==', true).get();

  let sent = 0;
  let removed = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const token = data.token as string | undefined;
    if (!token) continue;

    const result = await sendPush(token, msg);
    if (result === 'sent') {
      sent++;
    } else if (result === 'stale') {
      await docSnap.ref.delete();
      removed++;
    }
  }

  return NextResponse.json({ sent, removed, slot, istHour });
}
