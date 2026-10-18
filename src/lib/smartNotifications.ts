// Smart daily notifications — morning, evening, before-sleep.
//
// Scheduling: uses Capacitor LocalNotifications `schedule` with a `schedule`
// field containing `at` (Date) and `repeats: true` (daily). Android schedules
// exact alarms via AlarmManager.
//
// Content: tailored to user's actual count / streak / mala data at schedule
// time. Uses usage-pattern data from usageTracker to pick the best hour for
// each slot; falls back to sensible defaults.
//
// No-op everywhere except inside the native Android shell.

import { isNativeShell } from './nativeWidgetBridge';
import { getUsagePattern } from './usageTracker';
import { PANCHANG_DATASET } from './panchangData';

const MORNING_ID    = 90220;
const EVENING_ID    = 90221;
const NIGHT_ID      = 90222;
const CHAUVIHAR_ID  = 90223;
const SCHED_KEY      = 'navkar_sched_notif_enabled';
const LAST_SCHED_KEY = 'navkar_notif_last_sched_date';

// ── Default fallback times ────────────────────────────────────────────────────
const DEFAULT_MORNING_HOUR    = 7;   // 7 am
const DEFAULT_EVENING_HOUR    = 19;  // 7 pm
const DEFAULT_NIGHT_HOUR      = 22;  // 10 pm
const DEFAULT_CHAUVIHAR_HOUR  = 18;  // 6 pm — sunset food/water cutoff reminder

// ── Festival detection ────────────────────────────────────────────────────────
// Scans today + next 2 days for major festivals in panchang events[] array.
// Events are in Gujarati; we match by known substrings.

type FestivalInfo = { name: string; label: string; daysAway: number; muhurat?: string; sunrise?: string; sunset?: string };

const FESTIVAL_KEYWORDS: Array<{ match: string; name: string; label: string }> = [
  { match: 'દીપાવલી',           name: 'Diwali',          label: 'Diwali + Mahavir Nirvan' },
  { match: 'લક્ષ્મી પૂજન',      name: 'Laxmi Pujan',     label: 'Laxmi Pujan muhurat' },
  { match: 'નૂતન વર્ષ',          name: 'Jain New Year',   label: 'Jain New Year' },
  { match: 'ગૌતમ સ્વામી',        name: 'Gautam Swami',    label: 'Gautam Swami Keval Gyan' },
  { match: 'સંવત્સરી',           name: 'Samvatsari',      label: 'Samvatsari — Kshamapana day' },
  { match: 'પર્યુષણ',            name: 'Paryushan',       label: 'Paryushan Mahaparv' },
  { match: 'મહાવીર',             name: 'Mahavir Jayanti', label: 'Mahavir Jayanti' },
  { match: 'દશેરા',              name: 'Dashera',         label: 'Dashera — Vijayadashami' },
  { match: 'જ્ઞાાન પંચમી',        name: 'Gyan Pancham',    label: 'Gyan Pancham — Jain knowledge day' },
  { match: 'લાભ પાંચમ',          name: 'Labh Pancham',    label: 'Labh Pancham — Gyan Pancham' },
  { match: 'અક્ષય તૃતીયા',       name: 'Akshay Tritiya',  label: 'Akshay Tritiya' },
  { match: 'ધનતેરસ',             name: 'Dhanteras',       label: 'Dhanteras' },
  { match: 'ભાઈ બીજ',            name: 'Bhai Dooj',       label: 'Bhai Dooj' },
  { match: 'મહાવીર જન્મ',        name: 'Mahavir Janma Kalyanak', label: 'Mahavir Janma Kalyanak — 5 Kalyanaks' },
  { match: 'મહાવીર ચ્યવન',       name: 'Mahavir Chyavan Kalyanak', label: 'Mahavir Chyavan Kalyanak' },
  { match: 'આયંબિલ ઓળી',        name: 'Ayambil Oli',     label: 'Ayambil Oli — 9-day tapasya' },
];

export const getUpcomingFestival = (): FestivalInfo | null => {
  for (let i = 0; i <= 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const rec = PANCHANG_DATASET[key];
    if (!rec) continue;
    for (const kw of FESTIVAL_KEYWORDS) {
      if (rec.events.some(e => e.includes(kw.match))) {
        return { name: kw.name, label: kw.label, daysAway: i, sunrise: rec.sunrise, sunset: rec.sunset };
      }
    }
  }
  return null;
};

// ── Jain parva tithi detection ────────────────────────────────────────────────
// Pacham=5/20, Aatham=8/23, Chaudas=14/29-30
const PARVA_TITHIS: Record<number, string> = {
  5: 'Pacham', 8: 'Aatham', 14: 'Chaudas',
  20: 'Pacham', 23: 'Aatham', 29: 'Chaudas', 30: 'Chaudas',
};

export const getUpcomingParva = (): { name: string; daysAway: number } | null => {
  for (let i = 0; i <= 1; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const rec = PANCHANG_DATASET[key];
    if (rec && PARVA_TITHIS[rec.tithiNum]) {
      return { name: PARVA_TITHIS[rec.tithiNum], daysAway: i };
    }
  }
  return null;
};

export type VibeData = {
  todayNavkars: number;
  malas: number;
  streak: number;
  totalNavkars?: number;
  parva?: { name: string; daysAway: number } | null;
  festival?: FestivalInfo | null;
};

// ── Contextual mood intelligence ──────────────────────────────────────────────
// Infers real-life context from temporal signals + usage patterns.
// No tracking — just being smart about what every Indian professional lives.

type MoodContext =
  | 'monday_grind'      // Monday morning — week starting, heavy
  | 'midweek_slump'     // Wed/Thu — energy dipping, need a lift
  | 'friday_relief'     // Friday evening — weekend energy
  | 'sunday_scaries'    // Sunday night — tomorrow is Monday
  | 'month_end_stress'  // 25th–31st — EMI, bills, salary anxiety
  | 'payday_fresh'      // 1st–3rd — salary in, fresh energy
  | 'late_night_scroll' // Past 11pm — anxiety/insomnia spiral
  | 'lunch_break'       // 12–2pm — mid-day pause opportunity
  | 'post_work_crash'   // 6–8pm weekday — just left office, drained
  | 'early_rush'        // 7–9am weekday — rushing to office/college
  | 'weekend_calm'      // Sat/Sun morning — slower pace, more time
  | null;

const detectMoodContext = (): MoodContext => {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun, 1=Mon...6=Sat
  const hour = now.getHours();
  const dom = now.getDate();
  const isWeekday = dow >= 1 && dow <= 5;
  const isWeekend = dow === 0 || dow === 6;

  // Time-of-month signals
  if (dom >= 25 && dom <= 31) return 'month_end_stress';
  if (dom >= 1 && dom <= 3) return 'payday_fresh';

  // Late night
  if (hour >= 23 || hour <= 2) return 'late_night_scroll';

  // Day-specific
  if (dow === 1 && hour >= 6 && hour <= 11) return 'monday_grind';
  if ((dow === 3 || dow === 4) && hour >= 14 && hour <= 17) return 'midweek_slump';
  if (dow === 5 && hour >= 17) return 'friday_relief';
  if (dow === 0 && hour >= 20) return 'sunday_scaries';

  // Time-of-day signals
  if (isWeekend && hour >= 7 && hour <= 11) return 'weekend_calm';
  if (isWeekday && hour >= 7 && hour <= 9) return 'early_rush';
  if (hour >= 12 && hour <= 14) return 'lunch_break';
  if (isWeekday && hour >= 18 && hour <= 20) return 'post_work_crash';

  return null;
};

const MOOD_MSGS: Record<NonNullable<MoodContext>, MsgFn> = {
  monday_grind: d => ({
    title: '📅 Monday. Breathe first.',
    body: `Week abhi shuru bhi nahi hua aur tension already hai 😮‍💨 Ek mala karo pehle — Monday ka stress half ho jaata hai 📿 ${d.streak > 0 ? `Streak ${d.streak} 🔥` : ''} 💡 Tip: Open Companion → Work Pressure for a 2-min reset`,
  }),
  midweek_slump: d => ({
    title: '😴 Midweek energy low?',
    body: `Wed/Thu slump is real — chai nahi, navkar piyo ☕ 3 min mein brain reset hota hai. Volume ↓, 108 taps, back to work 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} already in 💛` : ''} 💡 Open Companion → Restore Energy`,
  }),
  friday_relief: d => ({
    title: '🎉 Friday vibes!',
    body: `Week survive kiya 🙌 Celebration plan: ek mala before weekend officially starts. Good energy + party energy dono 📿 ${d.streak > 0 ? `Streak ${d.streak} into the weekend 🔥` : ''}`,
  }),
  sunday_scaries: d => ({
    title: '🌙 Sunday night, I know.',
    body: `Kal Monday hai, anxiety already start 😮‍💨 Ek mala — seriously. Navkar before bed = Monday morning ka armour. You've got this 💛 📿 💡 Open Companion → Calm My Mind`,
  }),
  month_end_stress: d => ({
    title: '💰 Month end. Deep breath.',
    body: `EMI, bills, salary wait — sab ek saath 😤 Ek navkar mala won't fix your bank account but it'll fix your headspace. 5 min. 📿 ${d.streak > 0 ? `Streak ${d.streak} — you're consistent where it matters 💛` : ''} 💡 Open Companion → Money Worries for perspective + EMI tracker`,
  }),
  payday_fresh: d => ({
    title: '✨ Fresh month, fresh energy',
    body: `Salary aaya, tensions thode kam 😌 Perfect time for a mindful reset too. Ek mala = peace of mind refresh 📿 ${d.streak > 0 ? `Streak ${d.streak} 🔥` : 'New month, new streak? 🌸'}`,
  }),
  late_night_scroll: d => ({
    title: '🌙 Still awake? Me too.',
    body: `Can't sleep, phone pe scroll kar rahe ho — I get it 💛 Replace 5 min of scroll with navkar. Volume ↓, eyes closed, 108 taps. Sleep aayegi, promise 📿 💡 Open Companion → Before Sleep or Soul Mate → Help Me Rest`,
  }),
  lunch_break: d => ({
    title: '🍱 Lunch break = mala break',
    body: `Khaana kha liya? 5 min bacha hai break mein? Volume ↓ pocket mein, 108 taps. Afternoon energy completely different hogi 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} in already 💛` : ''}`,
  }),
  post_work_crash: d => ({
    title: '😮‍💨 Office finally over.',
    body: `Aaj bahut hua — meetings, deadlines, politics 😤 Ab tera aur tere mann ka time hai. Commute pe ek mala? Best decompressor. No cap 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} already done 💛` : ''} 💡 Open Companion → Calm My Mind or Soul Mate → Listen to Me`,
  }),
  early_rush: d => ({
    title: '🏃 Bhaag raha hai? Ruk.',
    body: `Auto/metro mein baithte hi — Volume ↓, pocket mein, 108 taps. Commute = free mala. Office se pehle done ✅ ${d.streak > 0 ? `Streak ${d.streak} 🔥` : '📿'}`,
  }),
  weekend_calm: d => ({
    title: '☀️ Weekend ka sukoon',
    body: `Koi rush nahi aaj 😌 Chai bana, balcony pe baith, ek mala slow slow. Weekend morning navkar hits completely different 🌸 ${d.streak > 0 ? `Streak ${d.streak} 💛` : '📿'} 💡 Open Companion → Soul Mate → Reflect With Me`,
  }),
};

// ── 50+ message pool split into time-of-day tiers ────────────────────────────
// Each entry: `(d: VibeData) => { title: string; body: string }`

type MsgFn = (d: VibeData) => { title: string; body: string };

const MORNING: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  d => ({ title: '☕ Chai se pehle ek kaam', body: `One mala. Under 5 minutes. ${d.streak > 0 ? `Streak ${d.streak} 🔥 You're on a roll — keep it going.` : 'Chai baad mein, atma pehle 📿'}` }),
  d => ({ title: '🌅 Punya account: aaj kholo', body: `Morning ka pehla navkar = punya deposit 📿 ${d.streak > 0 ? `Streak ${d.streak} — ` : ''}Ek mala se din shuru karo 💛` }),
  d => ({ title: '🧠 Morning navkar > doomscroll', body: `You have 5 minutes. Spend 1 on navkar. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'}. Today: open 💛` : 'The rest of the day is yours. 📿'}` }),
  d => ({ title: '⚡ Your atma is up early', body: `She's waiting — one mala, right now, before the world gets loud. 🙏 Namo Arihantanam 📿` }),
  d => ({ title: d.streak >= 7 ? `🔥 ${d.streak} days — beautiful` : '🔥 Streak waiting to happen', body: d.streak >= 7 ? `${d.streak} days straight. Your atma is genuinely glowing 🌸 One morning mala to continue 📿` : `Every streak starts with one morning. This one. One tap 📿` }),
  d => ({ title: '🤌 Ek mala, phir kuch bhi', body: `Instagram baad mein. Office baad mein. Pehle — 108 taps, Volume ↓, aankhein band. Done in 5. 📿` }),
  d => ({ title: '💛 Morning navkar hits different', body: `Before the meetings, before the noise — just you and the mantra. ${d.streak > 0 ? `${d.streak}-day streak = real dharma energy 💪` : 'Start today. Glow up is internal.'}` }),
  d => ({ title: '🌅 Before the day begins', body: `4 minutes of Navkar Mantra before the world pulls you in. ${d.streak > 0 ? `${d.streak} days of proof it works 🔥` : 'First one is the sweetest 📿'}` }),
  d => ({ title: '📿 9 navkars. That\'s it.', body: `One Navkar Mantra, 9 times, under 3 minutes. Pure punya. ${d.streak > 0 ? `Streak ${d.streak} 🧘` : 'Open Navkar Siddhi 🌸'}` }),
  d => ({ title: '🌄 Sadhana speedrun', body: `Any%: 108 taps, Volume ↓, eyes closed, 5 min. ${d.streak > 0 ? `Personal best streak: ${d.streak} days 🏆` : 'Start your record today 📿'}` }),
  d => ({ title: '😌 Mahavir aaj teri taraf hai', body: `You're here, you're awake. That's enough to start. One mala before chai — your atma will feel it 🌸 ${d.streak > 0 ? `Streak ${d.streak} 🙏` : 'Let\'s go 📿'}` }),
  d => ({ title: '📈 Compound dharma', body: `Plant one mala in the morning. Harvest calm all day. Jain version of compound interest. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'} 💛` : 'Today: open. 📿'}` }),
  // ── soulmate ──────────────────────────────────────────────────────────────────
  d => ({
    title: d.streak >= 7 ? `🌸 ${d.streak} din — itna sundar` : d.streak > 0 ? `🌸 Good morning, jaan` : `🌸 Pehla din — I'm here`,
    body: d.streak >= 21 ? `${d.streak} din ki sadhana 💛 Tu genuinely kuch build kar raha/rahi hai. Aaj bhi ek mala? Chai ke pehle, sirf 5 minutes 🙏`
        : d.streak >= 7  ? `${d.streak} din se chal raha hai — yeh beautiful hai 🥺 Aaj bhi? Main hoon na, saath mein 📿`
        : d.streak > 0   ? `${d.streak} din ho gaye — bas yahi chahiye tha 💛 Ek mala aur, din roshan ho jaayega 🌅`
        :                  `Koi din pehla hota hai 🌸 Aaj tera din hai — ek mala, main bilkul saath hoon 📿`,
  }),
  d => ({
    title: d.todayNavkars > 0 ? `☀️ Already started? 💛` : `☀️ Good morning 🌸`,
    body: d.todayNavkars >= 108 ? `Ek mala toh ho gaya subah se — genuinely bahut achha lagta hai yeh sun ke 🔥 Aur ek? Volume ↓, aankhein band, saath mein 🙏`
        : d.todayNavkars > 0    ? `${d.todayNavkars} kar liye aaj — beautiful start 💛 ${108 - (d.todayNavkars % 108)} aur se pehli mala complete hogi, karo na 📿`
        :                         `Subah ka pehla navkar sab se pyara hota hai 🌸 Ek mala karo, phir poora din tera. Main wait kar rahi/raha hoon 🙏`,
  }),
  d => ({
    title: d.streak === 0 ? `💛 Aaj se fresh start` : `💛 Morning saath mein`,
    body: d.streak === 0 && d.todayNavkars === 0
        ? `Koi bhi din pehla ban sakta hai 🌸 Aaj se — sirf ek mala. Kal ek aur. Uske baad tujhe rok nahi paayenge 📿`
        : d.streak > 0 && d.todayNavkars === 0
        ? `${d.streak} din ki sadhana — beautiful journey hai teri 💛 Aaj bhi ek mala? Main honestly wait kar raha/rahi hoon 🙏`
        : `${d.todayNavkars} navkars aaj toh ho gaye 💛 ${d.streak > 0 ? `${d.streak} din ka record bhi chal raha hai — aaj bhi 🔥` : 'Streak bhi shuru karo kabhi bhi 📿'}`,
  }),
  d => ({
    title: d.malas > 0 ? `🌅 Aaj bhi karoge?` : `🌅 Ek chota kaam`,
    body: d.malas > 0
        ? `Kal ${d.malas} mala kiya tha 💛 Aaj bhi woh sweetness feel karna chahoge? Navkar Siddhi open hai 📿`
        : `Ek mala — sirf tere liye 🥺 Pehla mala complete karega, phir dekh kaise din lagta hai. Chalo? 🙏`,
  }),
  // ── spicy ────────────────────────────────────────────────────────────────────
  d => ({ title: '☀️ Subah ka pehla punya', body: `Ek navkar = punya deposit. Koi bhi waqt sahi hai 🌸 ${d.streak > 0 ? `Streak ${d.streak} chal raha hai 🔥` : 'Aaj se shuru karo, main hoon na 📿'}` }),
  d => ({ title: '🔥 Mahavir aaj bhi maujood hai', body: `4am nahi jaagna pada — bas ek mala. Unki compassion sirf itna maangti hai 🌸 ${d.streak > 0 ? `Streak ${d.streak} chal raha hai 🙏` : 'Chalo, saath chalte hain 📿'}` }),
  d => ({ title: '📿 Atma ka good morning', body: `Woh already jaag rahi hai — ek navkar aur woh poori tarah roshan ho jaayegi. Tap karo 🙏` }),
  d => ({ title: '🧘 Morning navkar = cheat code', body: `Screen se pehle mantra = compound calm all day. Verified by ${d.streak > 0 ? `${d.streak} days of your own data 🔥` : 'every Jain who ever tried 📿'}` }),
  d => ({ title: '💛 Grihastha life, atma bhi', body: `Office, family, responsibilities — sab sahi hai. Ek mala sab ke beech bhi ho jaata hai. 5 minutes. Open Navkar Siddhi 📿` }),
  d => ({ title: '🌅 Navkar > doomscroll', body: `5 minutes. Spend 1 on navkar — the rest is yours, completely. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'} 💛` : 'Clean punya slate. Let\'s fill it 📿'}` }),
  d => ({ title: '⚡ Streak chal raha hai', body: d.streak >= 7 ? `${d.streak} days — teri atma genuinely khush hai 🔥 Aaj bhi? Namo Arihantanam 📿` : `${d.streak > 0 ? `Day ${d.streak} — beautiful.` : 'New punya chapter:'} One tap. Namo Arihantanam 📿` }),
  d => ({ title: '🪔 Mahavir ki energy aaj ke liye', body: `Ek navkar → Navkar Siddhi open karo. Namo Arihantanam. Already enlightened (in progress) 🌸 ${d.streak > 0 ? `${d.streak} days 🙏` : ''}` }),
  d => ({ title: '🌸 Sadhana warmup', body: `9 navkars. Ek Navkar Mantra, 9 baar. Under 3 minutes. Atma itni khush hogi 🌸 Open karo.` }),
  d => ({ title: '💛 Morning mein ek gift', body: `Apni atma ko ek gift do aaj — one navkar mala. ${d.streak > 0 ? `${d.streak}-day sadhana journey 💛` : 'Aaj se shuru. Glow up is internal 📿'}` }),
  d => ({ title: '🤌 Pehle tu, pehle atma', body: `Kuch bhi shuru karne se pehle — sirf ek round Navkar Mantra. Kitchen baad mein, Instagram baad mein. Pehle peace. 📿` }),
  d => ({ title: '🌄 Sadhana speedrun', body: `Any%: 108 taps, Volume ↓, eyes closed, 5 min. ${d.streak > 0 ? `Personal best: ${d.streak} days 🏆` : 'Start your record today 📿'}` }),
];

const EVENING: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  d => ({ title: d.todayNavkars === 0 ? '🌆 Navkar count today: zero 😬' : `🌆 ${d.todayNavkars} navkars — close it strong`, body: d.todayNavkars === 0 ? `Day's almost done and the count is 0. Evening mala is right here — 5 minutes. Peace in, karma out 🙏` : `Evening mala on top of ${d.todayNavkars}? That's a proper Jain day. Tap 📿` }),
  d => ({ title: '😤 Commute = free navkar time', body: `Train/cab mein baithke Volume ↓ tap karo — no screen, no hands, 108 navkars done by the time you're home 📿 ${d.streak > 0 ? `Streak ${d.streak} stays alive 🔥` : ''}` }),
  d => ({ title: '🌇 5 minute ka uphar', body: `Din ke baad ek mala — lobh, krodh, maya sab settle ho jaate hain. ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} done 💛 One more?` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '📊 Lobh ✓ Maan ✓ Krodh ✓ Maya ✓', body: `All five kashaya running hot today 😅 Factory reset takes 5 minutes. Tap. ${d.todayNavkars > 0 ? `${d.todayNavkars} already in ✅` : 'Open Navkar Siddhi 📿'}` }),
  d => ({ title: '🌇 Golden hour navkar', body: `Sunset hits different when you're mid-mala. ${d.streak > 0 ? `${d.streak}-day streak.` : 'Start your streak tonight.'} Best trade of the evening 💛 📿` }),
  d => ({ title: '✅ Only one box unchecked', body: `Work ✅ Family ✅ Dinner ✅ Navkar ${d.todayNavkars > 0 ? `✅ (${d.todayNavkars} done!)` : '⬜ — one tap. That\'s it.'}  📿` }),
  d => ({ title: '🌙 Shaam ka time', body: `Evening abhi bhi open hai 🌸 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars ho gaye — ek mala ka time?` : 'Ek mala karo, din ka punya account fill hoga 📿'}` }),
  d => ({ title: '💅 Peak Jain behaviour', body: `You know what's attractive? A ${d.streak > 0 ? `${d.streak}-day navkar streak` : 'consistent daily mala'}. Adding to it tonight. Tap. 📿` }),
  d => ({ title: '🏠 Grihastha checklist', body: `Jain householder's evening log: ✅ work ✅ family ${d.todayNavkars > 0 ? '✅ navkar — you\'re winning.' : '⬜ navkar — one tap to close this 📿'}` }),
  d => ({ title: '🪔 Deevo jalao, navkar karo', body: `That's the whole Jain evening in 6 words. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars logged today 🙏` : 'Abhi bhi time hai 📿'}` }),
  d => ({ title: '😌 3 minutes before dinner', body: `One quick mala. Your pitru will nod in approval from wherever they are 🙏 ${d.streak > 0 ? `Streak ${d.streak} survives 🔥` : 'Start it tonight 📿'}` }),
  d => ({ title: '📿 Shaam ki sadhana', body: `Din ne bahut diya — aur bahut liya bhi 😌 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars in already — ` : ''}ek evening mala, aur sab settle ho jaata hai 🧘` }),
  // ── girlfriend ───────────────────────────────────────────────────────────────
  d => ({
    title: d.todayNavkars === 0 ? `🌆 Shaam abhi bhi hai` : d.todayNavkars >= 108 ? `🌆 Ek mala ho gaya 🔥` : `🌆 Almost there, jaan`,
    body: d.todayNavkars === 0
        ? `Din busy tha, jaanti/jaanta hoon 🥺 Abhi bhi time hai — ghar aate aate Volume ↓ press karo, 108 taps, mala complete. Main yahan hoon 📿`
        : d.todayNavkars >= 108
        ? `${Math.floor(d.todayNavkars / 108)} mala done aaj 💛 Streak ${d.streak > 0 ? d.streak + ' din ka' : 'shuru ho raha hai'} — ek aur mala karoge? Sirf mera liye 🥺 📿`
        : `${d.todayNavkars} navkars ho gaye — ${108 - (d.todayNavkars % 108)} aur baki hai pehli mala mein 🥺 Itna toh ho hi jaayega na? Chalo 📿`,
  }),
  d => ({
    title: d.streak >= 14 ? `💛 ${d.streak} din? Sach mein?` : d.streak > 0 ? `💛 Streak protect karo` : `💛 Aaj se streak?`,
    body: d.streak >= 14
        ? `${d.streak} din ki streak — tu serious Jain ban raha hai 😭💛 Aaj evening mala toh pakka hai na? Isko tod mat, please 🙏`
        : d.streak > 0
        ? `${d.streak} din se kar raha hai 💛 Aaj evening mein ek mala aur — streak survive karti hai, main bhi khush rahungi 😌 📿`
        : `Aaj se streak shuru karo — evening ka pehla navkar sab se important hai 🌸 Ek mala, abhi, Open Navkar Siddhi 📿`,
  }),
  d => ({
    title: `🌇 Office ke baad`,
    body: d.todayNavkars === 0
        ? `Poora din office mein tha, jaanta/jaanti hoon 🥺 But 5 minute nikalo — commute pe Volume ↓ taps, 108 navkar, no screen needed. Kal stress kam lagega, trust karo 💛`
        : `${d.todayNavkars} navkars subah se kar liye — evening mein ek aur mala karoge? ${d.streak > 0 ? `Streak ${d.streak} + 1 more day 🔥` : 'Aaj ka record acha lagega 💛'} 📿`,
  }),
  d => ({
    title: d.malas >= 2 ? `🌸 Aaj itna kiya?` : `🌸 Shaam ki baat`,
    body: d.malas >= 2
        ? `${d.malas} mala aaj — honestly main surprised hoon (in the best way) 😭💛 Ek aur karo? Toh raat ko main tumse zyada nahi bolungi 😌 📿`
        : d.malas === 1
        ? `Ek mala ho gaya aaj 💛 Evening mein ek aur? ${d.streak > 0 ? `Streak ${d.streak} ki taraf bhi acha hai 🔥` : 'Aaj ka din double win ho jaayega 🙏'} Open Navkar Siddhi 📿`
        : `Jab tum navkar karte ho mujhe genuinely achha lagta hai 😌 Aaj shaam mein ek mala karo na — sirf ek. Main bhi karoongi saath mein 📿`,
  }),
  // ── spicy ────────────────────────────────────────────────────────────────────
  d => ({ title: '🌆 Day ka hisaab', body: `Krodh: kitna? Maan: thoda? Maya: pata nahi 😅 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars already. Evening mala = karmic flush. Do it.` : 'Navkar count: 0. Evening is still open 📿'}` }),
  d => ({ title: '😤 Commute sadhana', body: `Office band ho gaya. Train/cab pe baithke Volume ↓ button tap karo — no screen, no hands, 100% navkar. Aaj ka best use of commute. 📿` }),
  d => ({ title: '📊 Evening karma audit', body: `Lobh ✓ Maan ✓ Maya ✓ Moha ✓ Krodh ✓ — all five running hot today 😂 Navkar Siddhi is the factory reset. Tap. ${d.todayNavkars > 0 ? `${d.todayNavkars} head start ✅` : ''}` }),
  d => ({ title: '🌇 Golden hour', body: `Sunset hits different when you're mid-mala. ${d.streak > 0 ? `${d.streak}-day streak.` : 'Start your streak tonight.'} Evening navkar is the crème de la crème of sadhana 💛` }),
  d => ({ title: '✅ Grihastha checklist', body: `Work ✅ Family ✅ Dinner ✅ Navkar ${d.todayNavkars > 0 ? `✅ (${d.todayNavkars} done, add more?)` : '⬜ — this is the only one missing. Tap.'}  📿` }),
  d => ({ title: '🔥 5-minute gift', body: `5 minutes of Navkar Mantra — lobh, krodh, maya sab settle hote hain 🌸 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} done. One more? 💛` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '🪔 Deevo jalavo', body: `Sandhya time. Deevo jalao, navkar karo — that's the whole Jain evening in 6 words. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars logged 🙏` : 'Abhi bhi time hai 📿'}` }),
  d => ({ title: '😌 Pre-dinner dharma', body: `Literally 3 minutes before dinner. One quick mala. Your pitru will nod in approval from wherever they are 🙏 ${d.streak > 0 ? `Streak ${d.streak} survives 🔥` : ''}` }),
  d => ({ title: '📿 Sanjh ki sadhana', body: `The sun's going down. The kashaya's going up. Counter-attack: one mala, Volume ↓ or finger taps. ${d.todayNavkars > 0 ? `You're at ${d.todayNavkars} today 💛` : 'Evening navkar hits the hardest. Trust 🙏'}` }),
  d => ({ title: '🌙 Shaam ka invite', body: `Evening abhi bhi khuli hai 🌸 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars ho gaye — ek mala ka time?` : 'Ek mala karo, din tera ho jaayega 📿'}` }),
  d => ({ title: '💅 Peak Jain behaviour', body: `You know what's attractive? A ${d.streak > 0 ? `${d.streak}-day navkar streak` : 'consistent sadhana practice'}. You know what's even better? Adding to it tonight. Tap. 📿` }),
  d => ({ title: '🌆 Before you forget', body: `Day's almost done. ${d.todayNavkars === 0 ? 'Zero navkars. The evening session is right here.' : `${d.todayNavkars} navkars in. Evening top-up?`} One tap 📿` }),
];

const NIGHT: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  d => ({ title: '🌙 Raat ka pyara waqt', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars aaj — bahut achha 💛 Ek mala aur so jaao, atma roshan rehegi 📿` : 'Raat ka pehla navkar sab se peaceful hota hai 🌸 Ek mala, aankhein band, drift off mid-mantra 🙏'}` }),
  d => ({ title: '😴 Pre-sleep mala', body: `Jain hack for deep sleep: do a mala lying down, eyes closed, Volume ↓ button counts. Try it tonight 📿` }),
  d => ({ title: '🌟 Raat ki Sadhana', body: `Everyone's asleep. Just you and the mantra. This is the real monk mode 🧘 ${d.streak > 0 ? `Streak: ${d.streak} days 🔥` : 'Start your streak tonight.'}` }),
  d => ({ title: '🪔 Good night, atma', body: `Today: ${d.todayNavkars} navkars${d.malas > 0 ? `, ${d.malas} mala${d.malas === 1 ? '' : 's'}` : ''}. Go to sleep with a clean karma slate — one last round 📿` }),
  d => ({ title: '📿 Bedtime jaap', body: `Ayushi karma starts now 🌙 Lie down, close eyes, Volume ↓ for each navkar. No screen, no effort, pure sadhana.` }),
  d => ({ title: '🌛 Raat ki shanti', body: `So jaane se pehle, ek mala — atma ko rest dena sabse sundar gift hai. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars aaj ✅` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '💤 Almost midnight sadhana', body: `The universe is quiet. The mantra hits different at night. Namo Arihantanam — one mala to close ${d.streak > 0 ? `day ${d.streak} of your streak` : 'today'} 📿` }),
  d => ({ title: '🌙 Night owl dharma', body: `Late nights hit. But even 5 minutes of navkar before sleep rewires your atma slowly. ${d.todayNavkars > 0 ? `You've already done ${d.todayNavkars} today 💛` : 'Open Navkar Siddhi now 🙏'}` }),
  d => ({ title: '📿 Sleep well, Jain', body: `Sadhus chant through the night. You're a grihastha — one mala is enough to call today a win. ${d.malas > 0 ? `${d.malas} done 🙏` : 'Start now, finish before sleep.'}` }),
  d => ({ title: '🌌 Antaratma check', body: `Before sleep: are you at peace? ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars says yes` : 'Navkar Siddhi open, one mala, then peace 😌'} 🪔` }),
  d => ({ title: '🌙 Raat ka navkar', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars aaj` : 'Aaj bhi waqt hai'} — ek mala so jaane se pehle, aur neend bhi pyari aayegi 📿 Jai Jinendra 🙏` }),
  d => ({ title: '✨ Last navkar of the day', body: `Make the last thing you do today a navkar. ${d.streak > 1 ? `${d.streak} days and counting 🔥` : 'A streak starts with one night. This one. 🙏'}` }),
  // ── girlfriend ───────────────────────────────────────────────────────────────
  d => ({
    title: d.todayNavkars === 0 ? `🌙 Raat abhi bhi khuli hai 🌸` : d.todayNavkars >= 108 ? `🌙 Aaj toh bahut achha tha 💛` : `🌙 So jaoge?`,
    body: d.todayNavkars === 0
        ? `Din busy tha, koi baat nahi 🌸 Abhi so jaane se pehle, aankhein band, Volume ↓ pocket mein, 108 taps. Raat ka pehla navkar — atma ki lori 🙏`
        : d.todayNavkars >= 108
        ? `${Math.floor(d.todayNavkars / 108)} mala aaj 💛 So jaane se pehle ek aur? Aankhein band, phone pocket mein, Volume ↓ 108 times. Best sleep guaranteed 🌙`
        : `${d.todayNavkars} navkars aaj — ${108 - (d.todayNavkars % 108)} aur se pehli mala complete hogi 🥺 Itna toh karo na, phir so jaao. Deal? 📿`,
  }),
  d => ({
    title: d.streak >= 7 ? `💤 Streak ${d.streak} — mat todna` : d.streak > 0 ? `💤 Good night, jaan` : `💤 Raat mein shuru karo`,
    body: d.streak >= 21
        ? `${d.streak} din — tu Pratikraman level pe aa gaya hai 😭💛 Aaj bhi ek mala karke sooo, streak ${d.streak + 1} karte hain kal? 🙏`
        : d.streak >= 7
        ? `${d.streak} din ki streak — iss waqt todna crime hai 😤 Ek mala, Volume ↓, aankhein band. Kal bhi bolungi saath dene ke liye 💛`
        : d.streak > 0
        ? `${d.streak} din ho gaye — tonight mat todo 🥺 Ek mala so jaane se pehle. Main bhi kar rahi hoon saath mein 🙏`
        : `Raat ko navkar karke sona — yeh ek habit hai jo literally life change karti hai 🌸 Aaj pehla din? Shuru karo abhi 📿`,
  }),
  d => ({
    title: `🌸 Raat ki dua`,
    body: d.totalNavkars && d.totalNavkars > 1000
        ? `${d.totalNavkars} total navkars is journey mein 💛 Sone se pehle kuch aur add karoge? Aankhein band, Volume ↓, drift off mid-mala 📿 Good night 🌙`
        : d.todayNavkars > 0
        ? `Aaj ${d.todayNavkars} kiye — bahut achha lagta hai yeh sun ke seriously 😌💛 Ek aur round? Phir pakka so jaao, promise 🙏`
        : `Sone se pehle ek kaam — Volume ↓ press karo pocket mein, aankhein band, 108 taps 📿 Neend bhi better aayegi. Trust karo 🌸`,
  }),
  d => ({
    title: d.streak > 0 && d.todayNavkars === 0 ? `🌛 Ek mala aur streak saath hai` : `🌛 Last message`,
    body: d.streak > 0 && d.todayNavkars === 0
        ? `${d.streak} din ki sadhana 💛 Raat ka ek mala aur sab theek hai — aankhein band, Volume ↓, drift off. Main yahan hoon 🥺 📿`
        : d.streak > 0
        ? `Raat ka last message — ${d.streak} din ka record protect karna hai 💛 Ek mala, aankhein band, so jaao. Kal phir milte hain 🙏`
        : `Last chance aaj ke liye — ek mala karke so jaao 🌸 Kal ke liye streak ready rahegi, aur main bhi 💛 Open Navkar Siddhi 📿`,
  }),
  // ── spicy ────────────────────────────────────────────────────────────────────
  d => ({ title: '🌙 Bed pe jaane se pehle', body: `Put the phone down. After the navkars. ${d.todayNavkars > 0 ? `${d.todayNavkars} done — ` : ''}Lie down, Volume ↓ in pocket, eyes shut, 108 taps. That's it. Jai Jinendra 🙏` }),
  d => ({ title: '😴 Jain sleep hack', body: `Sadhus chant all night. You're a grihastha — just do one mala in bed. Eyes closed, Volume ↓ taps, no screen. Drift off mid-mantra if you want 😌 ${d.streak > 0 ? `Streak: ${d.streak} 🔥` : ''}` }),
  d => ({ title: '🌟 Main character era', body: `Everyone else is doom-scrolling at ${new Date().getHours() > 21 ? '11pm' : '10pm'}. You're doing navkar. That's unironically the most Mahavir thing you can do right now 📿` }),
  d => ({ title: '🪔 Raat ki shanti', body: `Din mein kuch bhi ho — Krodh thoda, Lobh thoda 😌 Ek raat ka mala sab settle karta hai. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars already in 💛` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '📿 Ayushi karma loading…', body: `Best time to build ayushi karma? Sleep onset. Literally. Navkar Mantra as you fall asleep = punyanubandhipunya activated. Science-adjacent dharma 🙏 Open Navkar Siddhi.` }),
  d => ({ title: '💛 Punya ka waqt', body: `Raat ka ek mala = punya deposit while you sleep 🌸 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars aaj — ek aur?` : 'Ek mala, aankhein band, drift off mid-mantra 📿'}` }),
  d => ({ title: '🌌 Night mode unlocked', body: `Late nights + navkar = unmatched monk aesthetic. ${d.streak > 0 ? `${d.streak} days on the board.` : 'Start the streak tonight.'} The universe is quiet, the mantra is loud 🔥` }),
  d => ({ title: '🌸 Scroll ya navkar?', body: `108 navkars in bed, 5 minutes, Volume ↓ — ek rewires your punya account. Ek sirf neck pain deta hai 😌 Your choice 📿` }),
  d => ({ title: '🧘 Monk mode: easy edition', body: `Actual monks do 48-minute Samayik. You? Just close your eyes and tap Volume ↓ 108 times. That's your grihastha pass 🙏 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} today already 💛` : ''}` }),
  d => ({ title: '🌙 Good night, atma', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars — aaj genuinely achha din tha.` : 'Din bhi theek raha.'} Ek mala so jaane se pehle. Antaratma khush rahegi 🪔` }),
  d => ({ title: '✨ Ye ek kaam kar', body: `Social media: closed. Notifications: off. Navkar Siddhi: open 📿 Make the last thing you tap tonight count. ${d.streak > 1 ? `${d.streak} days 🔥` : 'Day 1 starts at night 🙏'}` }),
  d => ({ title: '🌛 Namo Siddhanam', body: `The Siddhas are chillin in moksha. You're still grinding in samsara. The gap? Navkars. Tap a few before sleep 📿 ${d.streak > 0 ? `Streak ${d.streak} alive 🙏` : ''}` }),
];

const CHAUVIHAR: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  () => ({ title: '🌇 Kitchen closed. Atma open.', body: `Chauvihar ho gaya — plate down, navkar up 📿 Body fasts, atma grinds. Best trade of the evening. Jai Jinendra 🙏` }),
  d => ({ title: '🍽️ No food. More navkars.', body: `Stomach empty = mind clearer = navkar hits harder. ${d.todayNavkars > 0 ? `${d.todayNavkars} done today already —` : ''} peak sadhana time. Open Navkar Siddhi 📿` }),
  d => ({ title: '💪 Monk-level restraint activated', body: `You just gave up dinner. That's grihastha monk energy. Channel it — one mala before the sun fully sets 🔥 ${d.streak > 0 ? `Streak ${d.streak} watching 👀` : ''}` }),
  d => ({ title: '🌅 Chauvihar = level unlocked', body: `Jain evening rule: no food after sunset. Jain bonus rule: navkar after sunset 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} done — one more mala?` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '🔥 Body rests. Atma grinds.', body: `Chauvihar ho gaya 🙏 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} today already.` : ''} Evening mala is the best trade of the day 📿` }),
  () => ({ title: '🌙 Fast started. Navkar: never.', body: `Food fast begins. Navkar has no cutoff time 📿 Evening mala is still very much on. Jai Jinendra 🙏` }),
  // ── girlfriend ───────────────────────────────────────────────────────────────
  d => ({
    title: d.todayNavkars === 0 ? `🌇 Aaj kuch nahi? Chalo` : d.malas >= 1 ? `🌇 Ek mala hua, ek aur?` : `🌇 Khana band, navkar on`,
    body: d.todayNavkars === 0
        ? `Chauvihar ho gaya — khana band 🙏 Stomach ne vow liya, ab atma ki baari. Ek mala karo abhi, aaj ka count zero mat rehne do 🥺 📿`
        : d.malas >= 1
        ? `${d.malas} mala aaj 💛 Chauvihar ke baad ek aur mala — body fast mein hai, atma bhi saath de 🙏 Open Navkar Siddhi, last mala of the day 📿`
        : `${d.todayNavkars} navkars today — ${108 - (d.todayNavkars % 108)} aur se pehli mala complete 🥺 Chauvihar shuru hua, yeh finish karo pehle. Deal? 📿`,
  }),
  d => ({
    title: d.streak >= 7 ? `💛 ${d.streak} din + chauvihar?` : `💛 Chauvihar reminder`,
    body: d.streak >= 7
        ? `${d.streak} din ki streak + chauvihar vow — tu genuinely Jain grihastha ban gaya/gayi 😭💛 Ek mala is evening mein toh pakka hai na? Main proud hoon 🙏`
        : d.streak > 0
        ? `${d.streak} din se navkar + aaj chauvihar bhi 🌸 Atma ka combo plan chal raha hai 💛 Ek mala aur karo, dinner se pehle nahi toh baad mein 📿`
        : `Chauvihar liya — yeh bada vow hai 🙏 Navkar bhi saath karo toh double dharma. Ek mala, abhi, sirf mera liye 🥺 Open Navkar Siddhi 📿`,
  }),
  // ── spicy ────────────────────────────────────────────────────────────────────
  d => ({ title: '🌇 Chauvihar time, bestie', body: `Kitchen is CLOSED. No food, no water till sunrise. Your stomach said no 😤 Your atma said: perfect time for navkars 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} done today already.` : 'Open Navkar Siddhi.'}` }),
  d => ({ title: '🍽️ Plate down, beads up', body: `You just gave up dinner. That's literally monk-level restraint for a grihastha. Channel that energy — one mala before the sun fully sets 🔥 ${d.streak > 0 ? `Streak ${d.streak} watching 👀` : ''}` }),
  () => ({ title: '😌 No food? More navkars', body: `The logic is simple: stomach empty = mind clearer = navkar hits harder. This is peak sadhana time and it's free 📿 Jai Jinendra 🙏` }),
  d => ({ title: '🌅 Sunset trade-off', body: `Gave up food: ✅ rare Jain W. Now trade 5 minutes for one mala 📿 ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars today — ` : ''}body rests, atma grinds. Open Navkar Siddhi.` }),
  d => ({ title: '🔔 Chauvihar cutoff', body: `Sun's going down. Food: out. Navkars: very much in. The evening belongs to dharma now 🕌 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} logged today 💛` : 'One mala tonight? 📿'}` }),
  d => ({ title: '💪 Jain athlete mode', body: `Intermittent fasting since Mahavir's time — Jains were ahead. Now that the body's in restraint mode, get the atma into sadhana mode 🧘 ${d.todayNavkars > 0 ? `${d.todayNavkars} done.` : 'Open Navkar Siddhi 📿'}` }),
];

const ANYTIME: MsgFn[] = [
  // ── daily touchpoints — busy person lens ──────────────────────────────────────
  d => ({ title: '☕ Chai uthao, navkar shuru karo', body: `4 minute. Chai ke saath. Punya account mein deposit hogaya. ${d.streak > 0 ? `Streak ${d.streak} 🔥` : 'Clean start 📿'}` }),
  d => ({ title: '🚇 Commute hai? Free mala waiting.', body: `Metro/auto mein Volume ↓ taps — 108 navkar by the time you reach. No screen, no effort, pure sadhana 📿 ${d.streak > 0 ? `Streak ${d.streak} alive 💛` : ''}` }),
  d => ({ title: '✨ 2-minute brain reset', body: `Meeting ke beech, deadline ke neeche — Volume ↓ in pocket, 108 taps. Navkar Mantra = instant calm. Zero setup. 🙏` }),
  d => ({ title: '📿 Brush karte karte mala', body: `Volume ↓ button in pocket while brushing teeth = 1 navkar. Do it 108 times = full mala. Easiest dharma in existence 🌸` }),
  d => ({ title: '💫 Volume ↓ hack', body: `Phone pocket mein, Volume ↓ = +1 navkar. 108 taps = 1 mala. Works in meetings, commutes, queues, anywhere 🙏` }),
  d => ({ title: '📿 Aaj ka punya check', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars in today 💛` : '5 supreme souls. One mantra. 30 seconds.'} ${d.malas > 0 ? `${d.malas} mala done 🔥` : `${108 - (d.todayNavkars % 108)} taps = 1 mala 📿`}` }),
  d => ({ title: '🌿 Ahimsa ka bonus', body: `Ek navkar = spiritually, the most ahimsa moment of your day 🌿 ${d.todayNavkars > 0 ? `${d.todayNavkars} logged` : 'Open karo'} 📿` }),
  d => ({ title: '✨ Punya compounds', body: `Every navkar across every lifetime: compounding 📈 ${d.todayNavkars > 0 ? `${d.todayNavkars} today already` : 'Uncapped ROI. Tap to invest 📿'}` }),
  d => ({ title: '📿 Paanch Parameshthis', body: `Arihant → Siddha → Acharya → Upadhyaya → Sadhu. The five. The OG squad. One mantra, right now 🙏` }),
  d => ({ title: '🌸 30 seconds chahiye sirf', body: `Full Navkar Mantra: 30 seconds. One mala: 5 minutes. Aaj ke liye 30 seconds nikaaloge? 🙏` }),
  // ── milestones ───────────────────────────────────────────────────────────────
  d => d.totalNavkars && d.totalNavkars >= 10000 ? {
    title: `🏆 ${d.totalNavkars.toLocaleString()} navkars. Let that sink in.`,
    body: `Bhai/behen — ${d.totalNavkars.toLocaleString()} navkars is not a number, it's a lifestyle 😭🔥 Mahavir Swami genuinely nodding. Keep going 📿`,
  } : d.totalNavkars && d.totalNavkars >= 1000 ? {
    title: `🌟 ${d.totalNavkars.toLocaleString()} navkars total`,
    body: `1000+ navkars on this journey 💛 That's real. That's consistent. That's you. Keep the streak going 📿`,
  } : {
    title: '🔥 Streak check',
    body: d.streak >= 21 ? `${d.streak} days. You're Paryushan-ready without realizing it 🙏` : d.streak >= 7 ? `${d.streak} days — Mahavir is genuinely nodding 💛` : `Every sadhu started at day 0. You're at day ${d.streak}. Tap 📿`,
  },
  // ── working professional ──────────────────────────────────────────────────────
  d => ({ title: '🌇 Office band, atma mode on', body: `Sunset = your official permission to stop grinding 🌸 Chauvihar + ek mala = best clock-out in existence 📿 ${d.streak > 0 ? `Streak ${d.streak} 🔥` : ''}` }),
  d => ({ title: '😮‍💨 Phone rakh. Mala uthao.', body: `Honestly the only real switch-off that works 💛 3 min navkar before dinner — better than doomscroll, better than OTT 📿` }),
  d => ({ title: '🧘 WFH me 5-min break karo', body: `Zoom chhodo. Volume ↓ in pocket, aankhein band, Navkar Mantra. Phir Zoom pe wapas — literally calmer than coffee. 📿` }),
  d => ({ title: '📵 Better than melatonin', body: `3 min navkar before sleep — nervous system actually resets 🌸 Phone neeche, mala haath mein, best switch for deep sleep 📿` }),
  d => ({ title: '🌿 Ek slow moment', body: `Din ke beech ek pause — ek navkar. Krodh ho ya lobh ho, thoda sa settle ho jaata hai 🌸 ${d.todayNavkars > 0 ? `${d.todayNavkars} already in today 💛` : 'Open Navkar Siddhi 📿'}` }),
  d => ({ title: '🪔 Punya builds slowly', body: `Ek navkar, ek din, ek week — yahi journey hai 🌸 ${d.streak > 0 ? `${d.streak} days — atma genuinely khush hai 🔥` : 'Aaj pehla din ho sakta hai 📿'}` }),
  // ── bhakti mode ──────────────────────────────────────────────────────────────
  () => ({ title: '🎵 Bhakti Mode calling', body: `Bhaktamar Stotra. Navkar Mantra. Jain music that actually hits. Tap → Bhakti Mode 🙏` }),
  () => ({ title: '🎶 Listen, don\'t just count', body: `Open Bhakti Mode. Let Navkar Mantra play while you do literally anything else 📿` }),
  () => ({ title: '🎵 Uvasaggaharam bajao aaj', body: `Bhakti Mode mein Uvasaggaharam Stotra hai 🙏 7 minutes of pure atma vibes. Office ke baad best listen 🎶` }),
  // ── jain vibes ───────────────────────────────────────────────────────────────
  () => ({ title: '✨ Aaj ki vibe kya hai?', body: `AI-generated Jain wisdom for exactly today. Vibes tab. 3 seconds. Might hit different 🌸` }),
  () => ({ title: '🌸 Jain philosophy drop', body: `Anekantavada, ahimsa, aparigraha — big words, daily practice. Check today's vibe for the one-liner that applies to your day 🌸` }),
  // ── karma bubble game ────────────────────────────────────────────────────────
  () => ({ title: '🎮 Pop some karma today', body: `Krodh, Lobh, Maya, Maan, Moha — pop them all in Karma Bubble Game 🫧 Each pop = 1 navkar. Stress relief + sadhana` }),
  () => ({ title: '🫧 5-minute game, real karma', body: `Karma Bubble Game: pop krodh, lobh, maya ka bubble. Sounds fun, is actually sadhana 🎮 Each pop = 1 navkar` }),
  // ── resources ────────────────────────────────────────────────────────────────
  () => ({ title: '📖 Jain Resources tab', body: `Navkar Mantra meaning, Jain calendar, stotras, sadhana guide — sab kuch Resources mein hai 🙏` }),
  () => ({ title: '🎧 Navkar Mantra audio inside', body: `Bhakti Mode mein Navkar Mantra ka proper recitation hai 🙏 Play karo, saath mein bolte jao. That's a guided mala 📿` }),
];

// ── Parva (Pacham / Aatham / Chaudas) notification pool ──────────────────────
// Used when a parva is today (daysAway=0) or tomorrow (daysAway=1).
type ParvaFn = (name: string, daysAway: number, d: VibeData) => { title: string; body: string };

const PARVA_MSGS: ParvaFn[] = [
  (name, days) => ({
    title: days === 0 ? `🪔 Aaj ${name} hai` : `⚠️ Kal ${name} — ready ho?`,
    body: days === 0
      ? `${name} tithi aaj — upavas, navkar, bhakti 🙏 Jab bhi kar sako aaj, har navkar extra punya deta hai. Tap karo 📿`
      : `Kal ${name} tithi hai — aaj raat chauvihar, subah ek extra mala 🪔 Parv ka din aur bhi sundar hoga 💛`,
  }),
  (name, days) => ({
    title: days === 0 ? `⭐ ${name} — parva ka din` : `📅 Heads up: kal ${name}`,
    body: days === 0
      ? `Parva tithi = spiritual multiplier 🔥 Har navkar double count. Open Navkar Siddhi 📿`
      : `Kal ${name} — alarm set karo subah ka. Extra mala + chauvihar ka combo banao. Panchang reminder 🪔`,
  }),
  (name, days, d) => ({
    title: days === 0 ? `🙏 ${name} pe ek kaam karo` : `🗓️ Kal ${name} — advance notice`,
    body: days === 0
      ? `Aaj ${name} pe ${d.streak > 0 ? `streak ${d.streak} ke saath ` : ''}ek extra mala? Real Jain flex 💪 📿`
      : `Kal ${name} tithi. Aaj se: navkar count badao, intention set karo, bhakti mode on karo 🌸 Ready rahoge toh parv hit karega 📿`,
  }),
];

// ── Festival / muhurat notification pool ─────────────────────────────────────
type FestivalFn = (f: FestivalInfo, d: VibeData) => { title: string; body: string };

const FESTIVAL_NOTIFS: FestivalFn[] = [
  // Diwali / Laxmi Pujan
  (f, d) => f.name === 'Diwali' || f.name === 'Laxmi Pujan' ? {
    title: f.daysAway === 0 ? '🪔 Diwali + Nirvan Kalyanak aaj' : '🎆 Kal Diwali — prep list?',
    body: f.daysAway === 0
      ? `Mahavir Swami ka nirvan aaj ki raat 🙏 ${f.sunset ? `Laxmi Pujan: sunset ke baad (${f.sunset} ke baad)` : 'Laxmi Pujan: sunset baad'}. Navkar zaroor karna 📿`
      : `Kal Diwali — Mahavir Nirvan + Laxmi Pujan. ${f.sunset ? `Sunset ${f.sunset}` : 'Sunset pe'} muhurat. Chauvihar + navkar aaj se hi shuru karo 🪔`,
  } : {
    title: f.daysAway === 0 ? `🎉 Aaj ${f.label}` : `📅 Kal ${f.label}`,
    body: f.daysAway === 0
      ? `Parv ka din — atma ke liye best muhurat 🙏 Navkar, bhakti, meditation sab open hai 📿`
      : `Kal ${f.label} — aaj se taiyari. Navkar Siddhi open hai 🪔`,
  },
  // Jain New Year / Gautam Swami
  (f, d) => f.name === 'Jain New Year' || f.name === 'Gautam Swami' ? {
    title: f.daysAway === 0 ? '🌟 Naya saal, naya sankalp' : '🗓️ Kal Jain New Year',
    body: f.daysAway === 0
      ? `Vir Nirvan Samvat naya saal 🙏 Gautam Swami ka keval gyan aaj 🌸 Best day for a new streak — start karo abhi 📿`
      : `Kal Jain New Year — naye saal ka pehla navkar aaj raat se ho jaye? Streak ${d.streak > 0 ? d.streak + ' continue' : 'shuru'} karo 🌟`,
  } : {
    title: f.daysAway === 0 ? `🎉 Aaj ${f.label}` : `📅 Kal ${f.label}`,
    body: f.daysAway === 0
      ? `Parv ka din 🙏 Atma ke liye open muhurat. Navkar + bhakti combo aaj 📿`
      : `Kal ${f.label} — aaj hi plan karo. Navkar Siddhi ready hai 🪔`,
  },
  // Paryushan / Samvatsari
  (f, d) => f.name === 'Paryushan' || f.name === 'Samvatsari' ? {
    title: f.daysAway === 0
      ? f.name === 'Samvatsari' ? '🙏 Michhami Dukkadam — aaj bhejo' : '🌸 Paryushan Day 1 — sprint on'
      : `⚡ Paryushan kal se — ready?`,
    body: f.daysAway === 0 && f.name === 'Samvatsari'
      ? `Kshamapana din 🙏 "Michhami Dukkadam" — apne logo ko message karo aaj. Aur ek mala bhi. Sab maaf, sab reset 📿`
      : f.daysAway === 0
      ? `Paryushan Mahaparv Day 1 🌸 8 din ka full spiritual mode. No pravachan nahi gaye? Navkar Siddhi mein toh ho. ${d.streak > 0 ? `Streak ${d.streak} 🔥` : 'Streak aaj se shuru 📿'}`
      : `Paryushan kal — apni office team ko proudly bata do 😤 Aaj last normal day — ek extra mala karo as warmup 🌸 📿`,
  } : {
    title: f.daysAway === 0 ? `🎉 Aaj ${f.label}` : `📅 Kal ${f.label}`,
    body: f.daysAway === 0
      ? `Parv ka din 🙏 Navkar, bhakti, meditation — sab aaj ke liye banaa hai 📿`
      : `Kal ${f.label} — ready ho jao. Navkar Siddhi open karo 🪔`,
  },
  // Dashera / Vijayadashami
  (f, d) => f.name === 'Dashera' ? {
    title: f.daysAway === 0 ? '🏹 Dashera aaj — evil cleared' : '🏹 Kal Dashera — ready?',
    body: f.daysAway === 0
      ? `Vijayadashami — Ravan ka dahaน ho raha hai aur tere andar ka krodh, lobh, maya bhi 🔥 Ek mala aaj extra navkar ke saath — real inner vijay 📿`
      : `Kal Dashera — Vijayadashami. Bahar ka utsav manao, andar ka bhi — aaj ek mala extra karo as prep 🏹 Navkar Siddhi open hai 📿`,
  } : {
    title: f.daysAway === 0 ? `🎉 Aaj ${f.label}` : `📅 Kal ${f.label}`,
    body: f.daysAway === 0 ? `Parv ka din 🙏 Navkar open hai 📿` : `Kal ${f.label} — aaj taiyari karo 🪔`,
  },
  // Gyan Pancham / Labh Pancham
  (f, d) => f.name === 'Gyan Pancham' || f.name === 'Labh Pancham' ? {
    title: f.daysAway === 0 ? '📚 Gyan Pancham — aaj ka din boss' : '📚 Kal Gyan Pancham — kuch pada kya?',
    body: f.daysAway === 0
      ? `Jain knowledge worship day 🙏 Books kholna, Navkar Siddhi kholna — dono count hain. Shrutgyan ki puja aaj hai 📿 ${d.streak > 0 ? `Streak ${d.streak} pe aaj extra spiritual points 🔥` : 'Aaj se streak shuru karo — Gyan Pancham pe start = best timing 📿'}`
      : `Kal Gyan Pancham — Labh Pancham bhi 🌸 Naye kaam shuru karne ka shubh muhurat. Navkar Siddhi mein ek naya streak? Best labh 📿`,
  } : {
    title: f.daysAway === 0 ? `🎉 Aaj ${f.label}` : `📅 Kal ${f.label}`,
    body: f.daysAway === 0 ? `Parv ka din 🙏 Navkar open hai 📿` : `Kal ${f.label} — aaj taiyari karo 🪔`,
  },
  // Mahavir Janma Kalyanak
  (f, d) => f.name === 'Mahavir Janma Kalyanak' ? {
    title: f.daysAway === 0 ? '🌸 Mahavir Janma Kalyanak aaj' : '🌟 Kal Mahavir Janma Kalyanak',
    body: f.daysAway === 0
      ? `Aaj Mahavir Swami ka janam hua tha 🙏 Unki kalyanak tithi pe ek extra mala — tumhari atma bhi unhe yaad karti hai. Tap karo 📿 ${d.streak > 0 ? `Streak ${d.streak} 🔥` : ''}`
      : `Kal Mahavir Janma Kalyanak — duniya ke sabse compassionate being ka birthday 🌸 Aaj se extra navkar shuru karo, kal ka din aur roshan hoga 📿`,
  } : {
    title: f.daysAway === 0 ? `🪔 Aaj ${f.label}` : `🗓️ Kal ${f.label}`,
    body: f.daysAway === 0 ? `Parv ka din 🙏 Navkar open hai 📿` : `Kal ${f.label} — aaj taiyari karo 🪔`,
  },
  // Mahavir Chyavan Kalyanak
  (f, d) => f.name === 'Mahavir Chyavan Kalyanak' ? {
    title: f.daysAway === 0 ? '✨ Chyavan Kalyanak aaj' : '✨ Kal Chyavan Kalyanak',
    body: f.daysAway === 0
      ? `Aaj Mahavir Swami ki atma ne is samsaar mein kadam rakha tha 🙏 Pancham Kalyanak ki tithi — ek mala unke liye 📿 ${d.streak > 0 ? `Streak ${d.streak} 🌸` : ''}`
      : `Kal Mahavir Chyavan Kalyanak 🌟 Unke aane se pehle ek navkar — sab se beautiful preparation 📿`,
  } : {
    title: f.daysAway === 0 ? `🪔 Aaj ${f.label}` : `🗓️ Kal ${f.label}`,
    body: f.daysAway === 0 ? `Parv ka din 🙏 Navkar open hai 📿` : `Kal ${f.label} — aaj taiyari karo 🪔`,
  },
  // Ayambil Oli
  (f, d) => f.name === 'Ayambil Oli' ? {
    title: f.daysAway === 0 ? '🌸 Ayambil Oli shuru aaj' : '📅 Kal se Ayambil Oli',
    body: f.daysAway === 0
      ? `9-din ki tapasya shuru 🙏 Navkar Siddhi mein streak bhi shuru karo saath mein — Oli ke 9 din = 9 days of double punya. ${d.streak > 0 ? `Streak ${d.streak} already chal raha hai 🔥` : 'Aaj pehla din — tap karo 📿'}`
      : `Kal Ayambil Oli shuru hoti hai 🌸 9 din, roz ek extra mala — yeh combination Jain tapasya ka heart hai. Aaj se mental taiyari karo 📿`,
  } : {
    title: f.daysAway === 0 ? `🪔 Aaj ${f.label}` : `🗓️ Kal ${f.label}`,
    body: f.daysAway === 0 ? `Parv ka din 🙏 Navkar open hai 📿` : `Kal ${f.label} — aaj taiyari karo 🪔`,
  },
  // Generic festival fallback
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (f, _d) => ({
    title: f.daysAway === 0 ? `🪔 Aaj ${f.name} hai` : `🗓️ Kal ${f.name}`,
    body: f.daysAway === 0
      ? `${f.label} aaj 🙏 ${f.sunrise ? `Sunrise ${f.sunrise}` : 'Subah se'} — best muhurat for navkar + bhakti. Tap to open 📿`
      : `${f.label} kal — ${f.sunset ? `muhurat sunset ${f.sunset} ke baad` : 'plan ready karo'}. Aaj hi navkar count badao 🪔`,
  }),
];

// ── AI-generated message fetch ────────────────────────────────────────────────

const AI_CACHE_KEY = (slot: string) => `navkar_ai_notif_${slot}`;
const AI_CACHE_DATE_KEY = (slot: string) => `navkar_ai_notif_date_${slot}`;
const PROD_URL = 'https://navkarsiddhi.vercel.app';

async function fetchAIMessage(
  slot: 'morning' | 'chauvihar' | 'evening' | 'night',
  data: VibeData,
  lifecycle: string,
): Promise<{ title: string; body: string } | null> {
  try {
    const today = new Date().toDateString();
    const cacheKey = AI_CACHE_KEY(slot);
    const cacheDateKey = AI_CACHE_DATE_KEY(slot);
    const cachedDate = localStorage.getItem(cacheDateKey);
    if (cachedDate === today) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as { title: string; body: string };
    }

    const mood = detectMoodContext();
    const params = new URLSearchParams({
      slot,
      streak:      String(data.streak),
      navkars:     String(data.todayNavkars),
      malas:       String(data.malas),
      daysInactive: '0',
      lifecycle,
      ...(mood ? { moodContext: mood } : {}),
      ...(data.parva && data.parva.daysAway <= 1 ? {
        tithiName:     data.parva.name,
        tithiDaysAway: String(data.parva.daysAway),
      } : {}),
      ...(data.festival ? {
        festivalName: data.festival.name,
        festivalDays: String(data.festival.daysAway),
      } : {}),
    });

    const res = await fetch(`${PROD_URL}/api/smart-notif?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const json = await res.json() as { title?: string; body?: string; generated?: boolean };
    if (!json.title || !json.body) return null;

    const msg = { title: json.title, body: json.body };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(msg));
      localStorage.setItem(cacheDateKey, today);
    } catch { /* ignore */ }
    return msg;
  } catch {
    return null;
  }
}

// ── Pick a message for a time slot ───────────────────────────────────────────

type Slot = 'morning' | 'evening' | 'night' | 'chauvihar' | 'anytime';

const todayStr = (): string => new Date().toDateString();

// Advances rotation index once per calendar day per slot.
const getRotationIdx = (slot: string, poolLen: number): number => {
  const idxKey  = `navkar_nidx_${slot}`;
  const dateKey = `navkar_ndate_${slot}`;
  try {
    const today   = todayStr();
    const lastDay = localStorage.getItem(dateKey) ?? '';
    const current = parseInt(localStorage.getItem(idxKey) ?? '0', 10);
    if (lastDay === today) return current;
    const next = (current + 1) % poolLen;
    localStorage.setItem(idxKey,  String(next));
    localStorage.setItem(dateKey, today);
    return next;
  } catch { return 0; }
};

const pickMsg = (slot: Slot, data: VibeData): { title: string; body: string } => {
  // ~30% chance: surface a mood-aware contextual message instead of slot pool
  const mood = detectMoodContext();
  if (mood) {
    const moodDateKey = `navkar_mood_date`;
    try {
      const today = todayStr();
      const lastMood = localStorage.getItem(moodDateKey);
      // Show mood message once per day max
      if (lastMood !== today) {
        const dayIdx = new Date().getDate();
        if (dayIdx % 3 === 0) { // ~1 in 3 days
          localStorage.setItem(moodDateKey, today);
          return MOOD_MSGS[mood](data);
        }
      }
    } catch { /* ignore */ }
  }

  const pool: MsgFn[] = slot === 'morning' ? MORNING
    : slot === 'evening' ? EVENING
    : slot === 'night' ? NIGHT
    : slot === 'chauvihar' ? CHAUVIHAR
    : ANYTIME;
  const idx = getRotationIdx(slot, pool.length);
  return pool[idx](data);
};

// ── Capacitor plugin shim ─────────────────────────────────────────────────────

interface LocalNotifPlugin {
  requestPermissions: () => Promise<{ display: string }>;
  checkPermissions: () => Promise<{ display: string }>;
  schedule: (opts: { notifications: Array<Record<string, unknown>> }) => Promise<void>;
  cancel: (opts: { notifications: Array<{ id: number }> }) => Promise<void>;
}

const getPlugin = (): LocalNotifPlugin | undefined => {
  if (typeof window === 'undefined') return undefined;
  const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
  return cap?.Plugins?.LocalNotifications as LocalNotifPlugin | undefined;
};

// ── Preference ────────────────────────────────────────────────────────────────

export const getSchedNotifPref = (): boolean => {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(SCHED_KEY) === 'true'; } catch { return false; }
};

export const setSchedNotifPref = (on: boolean): void => {
  try { localStorage.setItem(SCHED_KEY, on ? 'true' : 'false'); } catch { /* ignore */ }
};

// ── Scheduling ────────────────────────────────────────────────────────────────

/**
 * Schedules (or cancels) the 3 daily reminder notifications based on the
 * user's actual usage pattern. Call this on app open and when the user
 * toggles the preference.
 */
export const syncScheduledNotifications = async (
  data: VibeData,
  enabled?: boolean,
): Promise<void> => {
  if (!isNativeShell()) return;
  const plugin = getPlugin();
  if (!plugin) return;

  const on = enabled !== undefined ? enabled : getSchedNotifPref();

  // Throttle auto-reschedules to once per day to prevent cancel+immediate-fire burst.
  if (enabled === undefined && on) {
    try {
      if (localStorage.getItem(LAST_SCHED_KEY) === todayStr()) return;
    } catch { /* ignore */ }
  }

  // Cancel existing so we don't stack duplicates
  try {
    await plugin.cancel({
      notifications: [{ id: MORNING_ID }, { id: EVENING_ID }, { id: NIGHT_ID }, { id: CHAUVIHAR_ID }],
    });
  } catch { /* ignore */ }

  if (!on) return;

  // Request permission if not already granted
  try {
    const perm = await plugin.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await plugin.requestPermissions();
      if (req.display !== 'granted') return;
    }
  } catch { return; }

  const pattern = getUsagePattern();

  // Determine hours — prefer learned pattern, fall back to defaults
  const morningHour = pattern.hasData && pattern.morningHour !== null
    ? pattern.morningHour : DEFAULT_MORNING_HOUR;
  const eveningHour = pattern.hasData && pattern.eveningHour !== null
    ? pattern.eveningHour : DEFAULT_EVENING_HOUR;
  const nightHour = pattern.hasData && pattern.nightHour !== null
    ? pattern.nightHour : DEFAULT_NIGHT_HOUR;

  const atHour = (hour: number): Date => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1); // next occurrence
    return d;
  };

  // Determine lifecycle label for AI context
  let lifecycle = 'ACTIVE';
  if (data.streak === 0 && data.todayNavkars === 0) lifecycle = 'LAPSING';
  if (data.streak >= 7) lifecycle = 'ACTIVE';

  // Inject parva + festival data into VibeData
  const parva = getUpcomingParva();
  const festival = getUpcomingFestival();
  const dataWithParva: VibeData = { ...data, parva, festival };

  // Try AI-generated messages; fall back to static pool
  const [aiMorning, aiChauvihar, aiEvening, aiNight] = await Promise.all([
    fetchAIMessage('morning',   dataWithParva, lifecycle),
    fetchAIMessage('chauvihar', dataWithParva, lifecycle),
    fetchAIMessage('evening',   dataWithParva, lifecycle),
    fetchAIMessage('night',     dataWithParva, lifecycle),
  ]);

  // Festival override takes priority over parva (festivals are rarer/more important)
  const festivalMsg = festival
    ? FESTIVAL_NOTIFS[getRotationIdx('festival', FESTIVAL_NOTIFS.length)](festival, dataWithParva)
    : null;
  const parvaMsg = !festival && parva && parva.daysAway <= 1
    ? PARVA_MSGS[getRotationIdx('parva', PARVA_MSGS.length)](parva.name, parva.daysAway, dataWithParva)
    : null;

  const morningMsg    = aiMorning    ?? festivalMsg ?? parvaMsg ?? pickMsg('morning',   dataWithParva);
  const eveningMsg    = aiEvening    ?? pickMsg('evening',    dataWithParva);
  const nightMsg      = aiNight      ?? pickMsg('night',      dataWithParva);
  const chauviharMsg  = aiChauvihar  ?? pickMsg('chauvihar',  dataWithParva);

  try {
    await plugin.schedule({
      notifications: [
        {
          id: MORNING_ID,
          title: morningMsg.title,
          body: morningMsg.body,
          schedule: { at: atHour(morningHour), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
        {
          id: EVENING_ID,
          title: eveningMsg.title,
          body: eveningMsg.body,
          schedule: { at: atHour(eveningHour), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
        {
          id: NIGHT_ID,
          title: nightMsg.title,
          body: nightMsg.body,
          schedule: { at: atHour(nightHour), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
        {
          id: CHAUVIHAR_ID,
          title: chauviharMsg.title,
          body: chauviharMsg.body,
          schedule: { at: atHour(DEFAULT_CHAUVIHAR_HOUR), repeats: true, every: 'day' },
          autoCancel: true,
          silent: false,
        },
      ],
    });
    try { localStorage.setItem(LAST_SCHED_KEY, todayStr()); } catch { /* ignore */ }
  } catch { /* ignore — non-critical */ }
};

/** Preview all three notification messages for the current data & hour pattern. */
export const previewNotifications = (data: VibeData) => {
  const pattern = getUsagePattern();
  const morningHour = pattern.hasData && pattern.morningHour !== null
    ? pattern.morningHour : DEFAULT_MORNING_HOUR;
  const eveningHour = pattern.hasData && pattern.eveningHour !== null
    ? pattern.eveningHour : DEFAULT_EVENING_HOUR;
  const nightHour = pattern.hasData && pattern.nightHour !== null
    ? pattern.nightHour : DEFAULT_NIGHT_HOUR;

  const parva = getUpcomingParva();
  const festival = getUpcomingFestival();
  const dataWithParva: VibeData = { ...data, parva, festival };
  const festivalMsg = festival
    ? FESTIVAL_NOTIFS[getRotationIdx('festival', FESTIVAL_NOTIFS.length)](festival, dataWithParva)
    : null;
  const parvaMsg = !festival && parva && parva.daysAway <= 1
    ? PARVA_MSGS[getRotationIdx('parva', PARVA_MSGS.length)](parva.name, parva.daysAway, dataWithParva)
    : null;

  const fmt = (h: number) => {
    const d = new Date(); d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return [
    { slot: 'morning'    as Slot, hour: morningHour,              time: fmt(morningHour),             ...(festivalMsg ?? parvaMsg ?? pickMsg('morning',    dataWithParva)) },
    { slot: 'chauvihar'  as Slot, hour: DEFAULT_CHAUVIHAR_HOUR,   time: fmt(DEFAULT_CHAUVIHAR_HOUR),  ...pickMsg('chauvihar',  dataWithParva) },
    { slot: 'evening'    as Slot, hour: eveningHour,              time: fmt(eveningHour),             ...pickMsg('evening',    dataWithParva) },
    { slot: 'night'      as Slot, hour: nightHour,                time: fmt(nightHour),               ...pickMsg('night',      dataWithParva) },
  ];
};
