import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, getAdminDb, getAdminMessaging } from '@/lib/firebaseAdmin';
import { getPanchangForDate } from '@/lib/panchangData';

export const dynamic = 'force-dynamic';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const SUNSET_LEAD_MINUTES = 30; // remind this many minutes before sunset

// Vercel's Hobby plan only runs cron jobs once per day (a sub-daily schedule
// fails the deployment outright), and even then the actual fire time is only
// guaranteed within its scheduled hour. So vercel.json fires this route
// twice daily at fixed UTC times (~08:00 and ~16:45 IST) instead of polling
// every 15 minutes, and the checks below use wide/one-sided windows to
// reliably catch the right reminder despite that imprecision.
const CATCH_UP_WINDOW_MINUTES = 90;

const timeStrToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Wall-clock IST date + minutes-of-day, computed from a fixed UTC+5:30
 * offset so this is correct regardless of the server's own timezone
 * (Vercel functions run in UTC). */
const getIstNow = () => {
  const istMs = Date.now() + IST_OFFSET_MS;
  const ist = new Date(istMs);
  const dateISO = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
  const minutesOfDay = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return { dateISO, minutesOfDay };
};

const sendPush = async (
  token: string,
  payload: { title: string; body: string; tag: string }
): Promise<'sent' | 'stale' | 'error'> => {
  try {
    await getAdminMessaging().send({
      token,
      data: {
        title: payload.title,
        body: payload.body,
        tag: payload.tag,
        url: '/',
      },
      webpush: {
        headers: { Urgency: 'high' },
      },
    });
    return 'sent';
  } catch (err: any) {
    const code = err?.errorInfo?.code || err?.code;
    if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
      return 'stale';
    }
    console.error('[cron/meal-reminders] send failed:', code || err);
    return 'error';
  }
};

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  if (!isFirebaseAdminConfigured) {
    return NextResponse.json({ skipped: true, reason: 'Firebase Admin not configured' });
  }

  const { dateISO: todayIST, minutesOfDay: nowMinutes } = getIstNow();
  const panchang = getPanchangForDate(todayIST);

  const navkarsiMinutes = timeStrToMinutes(panchang.navkarsi);
  const sunsetReminderMinutes = timeStrToMinutes(panchang.sunset) - SUNSET_LEAD_MINUTES;

  // Navkarsi: due any time after it's passed today — the morning run always
  // lands well after it, and a later catch-up beats no reminder if a run is
  // ever missed. No upper bound needed; "already sent today" guards re-sends.
  const dueNavkarsi = nowMinutes >= navkarsiMinutes - CATCH_UP_WINDOW_MINUTES;

  // Sunset-lead: needs both bounds, so the morning run (hours earlier)
  // doesn't also fire this one prematurely.
  const dueSunset = Math.abs(nowMinutes - sunsetReminderMinutes) <= CATCH_UP_WINDOW_MINUTES;

  if (!dueNavkarsi && !dueSunset) {
    return NextResponse.json({ sent: 0, dueNavkarsi, dueSunset, todayIST, nowMinutes });
  }

  const db = getAdminDb();
  const snapshot = await db.collection('push_subscriptions').where('enabled', '==', true).get();

  let sent = 0;
  let removed = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const token = data.token as string | undefined;
    if (!token) continue;

    const updates: Record<string, unknown> = {};
    let staleToken = false;

    if (dueNavkarsi && data.lastSentNavkarsiDate !== todayIST) {
      const result = await sendPush(token, {
        title: 'Navkarsi Time 🙏',
        body: `It's ${panchang.navkarsi} — you may now break your fast for the day.`,
        tag: 'navkarsi',
      });
      if (result === 'sent') {
        updates.lastSentNavkarsiDate = todayIST;
        sent++;
      } else if (result === 'stale') {
        staleToken = true;
      }
    }

    if (dueSunset && data.lastSentSunsetDate !== todayIST) {
      const result = await sendPush(token, {
        title: 'Sunset Cutoff Approaching 🌇',
        body: `Sunset is at ${panchang.sunset} — finish your meal before dark.`,
        tag: 'sunset-cutoff',
      });
      if (result === 'sent') {
        updates.lastSentSunsetDate = todayIST;
        sent++;
      } else if (result === 'stale') {
        staleToken = true;
      }
    }

    if (staleToken) {
      await docSnap.ref.delete();
      removed++;
    } else if (Object.keys(updates).length > 0) {
      await docSnap.ref.update(updates);
    }
  }

  return NextResponse.json({ sent, removed, todayIST, dueNavkarsi, dueSunset });
}
