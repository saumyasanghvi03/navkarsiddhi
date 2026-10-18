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
  { match: 'અક્ષય તૃતીયા',       name: 'Akshay Tritiya',  label: 'Akshay Tritiya' },
  { match: 'ધનતેરસ',             name: 'Dhanteras',       label: 'Dhanteras' },
  { match: 'ભાઈ બીજ',            name: 'Bhai Dooj',       label: 'Bhai Dooj' },
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

// ── 50+ message pool split into time-of-day tiers ────────────────────────────
// Each entry: `(d: VibeData) => { title: string; body: string }`

type MsgFn = (d: VibeData) => { title: string; body: string };

const MORNING: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  d => ({ title: '☕ Chai se pehle ek kaam', body: `One mala. Literally under 5 minutes. ${d.streak > 0 ? `Streak ${d.streak} 🔥 don't ruin it before breakfast.` : 'Chai baad mein, atma pehle 📿'}` }),
  d => ({ title: '😤 Karma account: ₹0 rn', body: `Your spiritual balance sheet is empty today. ${d.streak > 0 ? `Streak ${d.streak} — ` : ''}One mala fixes that before day even starts 📿` }),
  d => ({ title: '🧠 Morning navkar > doomscroll', body: `You have 5 minutes. Spend 1 on navkar. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'}. Today: waiting 💛` : 'The rest of the day is yours. 📿'}` }),
  d => ({ title: '⚡ Your atma called at 7am', body: `She said — "bro, where are the navkars?" Don't ghost your own atma. One mala, right now. 🙏` }),
  d => ({ title: d.streak >= 7 ? `🔥 ${d.streak} days — don't blow it` : '🔥 Streak waiting to happen', body: d.streak >= 7 ? `${d.streak} days straight. You've outlasted most New Year's resolutions. One morning mala keeps it alive 📿` : `Every streak starts with a morning. This morning. One tap 📿` }),
  d => ({ title: '🤌 Ek mala, phir kuch bhi', body: `Instagram baad mein. Office baad mein. Pehle — 108 taps, Volume ↓, aankhein band. Done in 5. 📿` }),
  d => ({ title: '💅 Hot girl morning routine', body: `Hot girls do navkar before chai. It's science. ${d.streak > 0 ? `${d.streak}-day streak = peak dharma energy 💪` : 'Start today. Glow up is internal.'}` }),
  d => ({ title: '🌅 Before the chaos starts', body: `4 minutes of Navkar Mantra before the day pulls you in. ${d.streak > 0 ? `${d.streak} days of proof it works 🔥` : 'First one is the hardest. It won\'t be 📿'}` }),
  d => ({ title: '📿 9 navkars. That\'s it.', body: `One Navkar Mantra, 9 times, under 3 minutes. The atma won't complain. ${d.streak > 0 ? `Streak ${d.streak} safe 🧘` : 'Open Navkar Siddhi 🌸'}` }),
  d => ({ title: '🌄 Speedrun your sadhana', body: `Any%: 108 taps, Volume ↓, eyes closed, 5 min. ${d.streak > 0 ? `Personal best streak: ${d.streak} days 🏆` : 'Leaderboard: unranked. Fix it 📿'}` }),
  d => ({ title: '😌 Mahavir won\'t cancel you', body: `You didn't wake at 4am. That's fine. But one mala before chai? That's a redemption arc. ${d.streak > 0 ? `Streak ${d.streak} alive if you tap now 😤` : 'Let\'s go 💪'}` }),
  d => ({ title: '📈 Compound dharma', body: `Plant one mala in the morning. Harvest calm all day. Jain version of compound interest. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'} 💛` : 'Today: open. 📿'}` }),
  // ── girlfriend ───────────────────────────────────────────────────────────────
  d => ({
    title: d.streak >= 7 ? `🌸 ${d.streak} din? Seriously?` : d.streak > 0 ? `🌸 Good morning, jaan` : `🌸 Pehla din — let's go`,
    body: d.streak >= 21 ? `${d.streak} din ki streak hai teri — tu toh monk ban gaya 😭💛 Aaj bhi ek mala, please? Chai ke pehle 🙏`
        : d.streak >= 7  ? `${d.streak} din se kar raha hai — main itni proud hoon 🥺 Aaj mat todna, pehle navkar, phir chai, deal? 📿`
        : d.streak > 0   ? `${d.streak} din ho gaye — tu serious hai yaar 💛 Uth ja, ek mala karo, din acha jaayega 🌅`
        :                  `Pehla din hota hai sabka ek baar 🌸 Ab tera hai — ek mala karo, main wait kar rahi hoon 📿`,
  }),
  d => ({
    title: d.todayNavkars > 0 ? `☀️ Already started? 💛` : `☀️ Psst… uth ja`,
    body: d.todayNavkars >= 108 ? `Ek mala toh ho gaya subah se 🔥 Aur ek? Volume ↓ press karo, aankhein band, main bhi kar rahi hoon saath mein 🙏`
        : d.todayNavkars > 0    ? `${d.todayNavkars} kar liye aaj — bas thoda sa aur baki hai pehli mala ka 🥺 Karo na, almost there 📿`
        :                         `Sona band karo 😤 Ek mala karo aur phir kuch bhi karo. Main roz yahi bolungi jab tak nahi karoge 🙏`,
  }),
  d => ({
    title: d.streak === 0 ? `💛 Koi baat nahi, lekin…` : `💛 Morning check-in`,
    body: d.streak === 0 && d.todayNavkars === 0
        ? `Koi streak nahi, koi navkar nahi — aaj se dono shuru karo 🌸 Sirf ek mala. Aur kal ek aur. Main hoon na 📿`
        : d.streak > 0 && d.todayNavkars === 0
        ? `${d.streak} din ki streak hai — aaj khali ja raha hai? Nahi nahi nahi 😤 Ek mala karo pehle, phir main maanti hoon 🙏`
        : `${d.todayNavkars} navkars aaj toh ho gaye 💛 ${d.streak > 0 ? `${d.streak} din ka record bhi hai — aaj bhi pakka? 🔥` : 'Streak bhi shuru karo abhi se 📿'}`,
  }),
  d => ({
    title: d.malas > 0 ? `🌅 Kal se zyada karo?` : `🌅 Ek kaam mera liye`,
    body: d.malas > 0
        ? `Kal ${d.malas} mala kiya tha 💛 Aaj woh beat karo — sirf ek zyada. Mera record check ho jaayega 😌 Navkar Siddhi open hai 📿`
        : `Ek mala — sirf mera liye karo 🥺 Aaj pehla mala complete hoga, aur kal se ${d.streak > 0 ? `streak ${d.streak + 1} on the board` : 'ek naya chapter'}. Chalo? 🙏`,
  }),
  // ── spicy ────────────────────────────────────────────────────────────────────
  d => ({ title: '☀️ Uth ja bhai', body: `The whole universe is already grinding. Your karma account: ₹0 for today. ${d.streak > 0 ? `${d.streak}-day streak on the line 😬` : 'First navkar of the day is free 📿'}` }),
  d => ({ title: '🔥 Brahma Muhurta se pehle?', body: `Okay you didn't wake at 4am. Mahavir Swami won't cancel you. But one mala before chai? That's a redemption arc. ${d.streak > 0 ? `Streak ${d.streak} survives if you tap now 😤` : 'Let\'s go 💪'}` }),
  d => ({ title: '📿 Your atma called', body: `She said — "bro it's morning, where are the navkars?" Don't ghost your own atma. Tap. 🙏` }),
  d => ({ title: '🧘 Ngl this hits', body: `Navkar Mantra before screen time = basically a cheat code for the day. Not spiritual advice. Just data. ${d.streak > 0 ? `${d.streak} days of evidence 🔥` : 'Day 1 is the best day to start 📿'}` }),
  d => ({ title: '😤 Grihastha life', body: `Office, family, social media, Jain guilt — you've got a lot running. One mala buys you peace for all of it. That's compound dharma 📈 Open Navkar Siddhi.` }),
  d => ({ title: '🌅 Morning navkar > morning doomscroll', body: `You have 5 minutes. Spend 1 of them on navkar. The rest is yours. ${d.malas > 0 ? `Yesterday: ${d.malas} mala${d.malas === 1 ? '' : 's'}. Today: waiting 📿` : 'Clean slate. Let\'s wreck it with karma points.'}` }),
  d => ({ title: '⚡ Streak danger', body: d.streak >= 7 ? `${d.streak} days straight 🔥 You've officially outlasted most New Year's resolutions. Don't blow it now.` : `${d.streak > 0 ? `Day ${d.streak} alive.` : 'New streak unlocked:'} One tap is all it takes. Namo Arihantanam 📿` }),
  d => ({ title: '🪔 Mahavir energy unlocked', body: `Tap once for navkar energy ↓ Open Navkar Siddhi. Namo Arihantanam. You're already enlightened (in progress). ${d.streak > 0 ? `${d.streak} days 🙏` : ''}` }),
  d => ({ title: '🌸 Soft launch your sadhana', body: `9 navkars. That's it. One Navkar Mantra 9 times. Under 3 minutes. The atma won't complain 🌸 Open the app.` }),
  d => ({ title: '📿 Hot girl sadhana', body: `Hot girls do navkar in the morning. It's science. ${d.streak > 0 ? `${d.streak}-day streak = peak dharma energy 💅` : 'Start today. Glow up is internal.'}` }),
  d => ({ title: '🤌 Ek kaam kar', body: `Literally one thing before the day takes over — one round of Navkar Mantra. Kitchen baad mein, Instagram baad mein. Pehle tu. Pehle atma. 📿` }),
  d => ({ title: '🌄 Pratah Vandana speedrun', body: `Any% navkar: 108 taps, Volume ↓ button, eyes closed, 5 minutes. World record attempt? ${d.streak > 0 ? `Personal best streak: ${d.streak} days 🏆` : 'Leaderboard position: unranked. Fix it 📿'}` }),
];

const EVENING: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  d => ({ title: d.todayNavkars === 0 ? '🌆 Navkar count today: zero 😬' : `🌆 ${d.todayNavkars} navkars — close it strong`, body: d.todayNavkars === 0 ? `Day's almost done and the count is 0. Evening mala is right here — 5 minutes. Peace in, karma out 🙏` : `Evening mala on top of ${d.todayNavkars}? That's a proper Jain day. Tap 📿` }),
  d => ({ title: '😤 Commute = free navkar time', body: `Train/cab mein baithke Volume ↓ tap karo — no screen, no hands, 108 navkars done by the time you're home 📿 ${d.streak > 0 ? `Streak ${d.streak} stays alive 🔥` : ''}` }),
  d => ({ title: '🔥 5 minutes = Pratikraman lite™', body: `The guilt from today? Gone. The karma from today? Offset. ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} done. One more? 💪` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '📊 Lobh ✓ Maan ✓ Krodh ✓ Maya ✓', body: `All five kashaya running hot today 😅 Factory reset takes 5 minutes. Tap. ${d.todayNavkars > 0 ? `${d.todayNavkars} already in ✅` : 'Open Navkar Siddhi 📿'}` }),
  d => ({ title: '🌇 Golden hour navkar', body: `Sunset hits different when you're mid-mala. ${d.streak > 0 ? `${d.streak}-day streak.` : 'Start your streak tonight.'} Best trade of the evening 💛 📿` }),
  d => ({ title: '✅ Only one box unchecked', body: `Work ✅ Family ✅ Dinner ✅ Navkar ${d.todayNavkars > 0 ? `✅ (${d.todayNavkars} done!)` : '⬜ — one tap. That\'s it.'}  📿` }),
  d => ({ title: '🌙 Shaam warning 🚨', body: `Navkar count: ${d.todayNavkars}. Hours left: shrinking. Ratio: fix it. Evening is still open 📿` }),
  d => ({ title: '💅 Peak Jain behaviour', body: `You know what's attractive? A ${d.streak > 0 ? `${d.streak}-day navkar streak` : 'consistent daily mala'}. Adding to it tonight. Tap. 📿` }),
  d => ({ title: '🏠 Grihastha checklist', body: `Jain householder's evening log: ✅ work ✅ family ${d.todayNavkars > 0 ? '✅ navkar — you\'re winning.' : '⬜ navkar — one tap to close this 📿'}` }),
  d => ({ title: '🪔 Deevo jalao, navkar karo', body: `That's the whole Jain evening in 6 words. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars logged today 🙏` : 'Abhi bhi time hai 📿'}` }),
  d => ({ title: '😌 3 minutes before dinner', body: `One quick mala. Your pitru will nod in approval from wherever they are 🙏 ${d.streak > 0 ? `Streak ${d.streak} survives 🔥` : 'Start it tonight 📿'}` }),
  d => ({ title: '📿 Karmic flush — evening edition', body: `The day threw a lot at you. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars in already — ` : ''}one evening mala to reset the vibe completely 🧘` }),
  // ── girlfriend ───────────────────────────────────────────────────────────────
  d => ({
    title: d.todayNavkars === 0 ? `🌆 Aaj kuch nahi kiya?` : d.todayNavkars >= 108 ? `🌆 Ek mala ho gaya 🔥` : `🌆 Almost there, jaan`,
    body: d.todayNavkars === 0
        ? `Poora din nikal gaya aur ek navkar nahi? 😒 Abhi bhi time hai — ghar aate aate Volume ↓ press karo, 108 taps, mala complete. Simple 📿`
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
  d => ({ title: '🔥 5-minute flip', body: `5 minutes of Navkar Mantra = Pratikraman lite™. The guilt from today? Gone. The karma from today? Offset. ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} done. One more? 💪` : 'Open Navkar Siddhi 🙏'}` }),
  d => ({ title: '🪔 Deevo jalavo', body: `Sandhya time. Deevo jalao, navkar karo — that's the whole Jain evening in 6 words. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars logged 🙏` : 'Abhi bhi time hai 📿'}` }),
  d => ({ title: '😌 Pre-dinner dharma', body: `Literally 3 minutes before dinner. One quick mala. Your pitru will nod in approval from wherever they are 🙏 ${d.streak > 0 ? `Streak ${d.streak} survives 🔥` : ''}` }),
  d => ({ title: '📿 Sanjh ki sadhana', body: `The sun's going down. The kashaya's going up. Counter-attack: one mala, Volume ↓ or finger taps. ${d.todayNavkars > 0 ? `You're at ${d.todayNavkars} today 💛` : 'Evening navkar hits the hardest. Trust 🙏'}` }),
  d => ({ title: '🌙 Shaam warning', body: `Navkar count today: ${d.todayNavkars}. Hours left in day: a few. Ratio: concerning. Fix it 📿` }),
  d => ({ title: '💅 Peak Jain behaviour', body: `You know what's attractive? A ${d.streak > 0 ? `${d.streak}-day navkar streak` : 'consistent sadhana practice'}. You know what's even better? Adding to it tonight. Tap. 📿` }),
  d => ({ title: '🌆 Before you forget', body: `Day's almost done. ${d.todayNavkars === 0 ? 'Zero navkars. The evening session is right here.' : `${d.todayNavkars} navkars in. Evening top-up?`} One tap 📿` }),
];

const NIGHT: MsgFn[] = [
  // ── punchy hooks ─────────────────────────────────────────────────────────────
  d => ({ title: '🌙 Last chance tonight', body: `Navkar count: ${d.todayNavkars}. ${d.todayNavkars === 0 ? 'Zero. Redemption window: now. One mala before sleep 🙏' : `Nice. One more mala before sleep seals it 📿`}` }),
  d => ({ title: '😴 Pre-sleep mala', body: `Jain hack for deep sleep: do a mala lying down, eyes closed, Volume ↓ button counts. Try it tonight 📿` }),
  d => ({ title: '🌟 Raat ki Sadhana', body: `Everyone's asleep. Just you and the mantra. This is the real monk mode 🧘 ${d.streak > 0 ? `Streak: ${d.streak} days 🔥` : 'Start your streak tonight.'}` }),
  d => ({ title: '🪔 Good night, atma', body: `Today: ${d.todayNavkars} navkars${d.malas > 0 ? `, ${d.malas} mala${d.malas === 1 ? '' : 's'}` : ''}. Go to sleep with a clean karma slate — one last round 📿` }),
  d => ({ title: '📿 Bedtime jaap', body: `Ayushi karma starts now 🌙 Lie down, close eyes, Volume ↓ for each navkar. No screen, no effort, pure sadhana.` }),
  d => ({ title: '🌛 Ratri Pratikraman', body: `Mental Pratikraman time: what karma did I bind today? Counter it before sleep. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars ✅` : 'App is open 🙏'}` }),
  d => ({ title: '💤 Almost midnight sadhana', body: `The universe is quiet. The mantra hits different at night. Namo Arihantanam — one mala to close ${d.streak > 0 ? `day ${d.streak} of your streak` : 'today'} 📿` }),
  d => ({ title: '🌙 Night owl dharma', body: `Late nights hit. But even 5 minutes of navkar before sleep rewires your atma slowly. ${d.todayNavkars > 0 ? `You've already done ${d.todayNavkars} today 💛` : 'Open Navkar Siddhi now 🙏'}` }),
  d => ({ title: '📿 Sleep well, Jain', body: `Sadhus chant through the night. You're a grihastha — one mala is enough to call today a win. ${d.malas > 0 ? `${d.malas} done 🙏` : 'Start now, finish before sleep.'}` }),
  d => ({ title: '🌌 Antaratma check', body: `Before sleep: are you at peace? ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars says yes` : 'Navkar Siddhi open, one mala, then peace 😌'} 🪔` }),
  d => ({ title: '🌙 Raat ka hisaab', body: `Karma aaj kitna bandhaa? ${d.todayNavkars} navkars ho gaye — ek mala aur aur din properly close hoga 📿 Jai Jinendra 🙏` }),
  d => ({ title: '✨ Last navkar of the day', body: `Make the last thing you do today a navkar. ${d.streak > 1 ? `${d.streak} days and counting 🔥` : 'A streak starts with one night. This one. 🙏'}` }),
  // ── girlfriend ───────────────────────────────────────────────────────────────
  d => ({
    title: d.todayNavkars === 0 ? `🌙 Aaj kuch nahi kiya 😒` : d.todayNavkars >= 108 ? `🌙 Aaj toh bahut achha tha 💛` : `🌙 So jaoge?`,
    body: d.todayNavkars === 0
        ? `Poora din gaya aur navkar zero? 😒 Koi baat nahi — abhi so jaane se pehle, aankhein band, Volume ↓ in pocket, 108 taps. Raat ka mala = aaj maafi 🙏`
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
    title: d.streak > 0 && d.todayNavkars === 0 ? `🌛 Streak danger 😬` : `🌛 Last message`,
    body: d.streak > 0 && d.todayNavkars === 0
        ? `${d.streak} din ki streak — aaj abhi tak zero navkar 😬 Raat ka ek mala streak bachaa sakta hai. Abhi karo, please? Main wait kar rahi hoon 🥺 📿`
        : d.streak > 0
        ? `Raat ka last message — ${d.streak} din ka record protect karna hai 💛 Ek mala, aankhein band, so jaao. Kal phir milte hain 🙏`
        : `Last chance aaj ke liye — ek mala karke so jaao 🌸 Kal ke liye streak ready rahegi, aur main bhi 💛 Open Navkar Siddhi 📿`,
  }),
  // ── spicy ────────────────────────────────────────────────────────────────────
  d => ({ title: '🌙 Bed pe jaane se pehle', body: `Put the phone down. After the navkars. ${d.todayNavkars > 0 ? `${d.todayNavkars} done — ` : ''}Lie down, Volume ↓ in pocket, eyes shut, 108 taps. That's it. Jai Jinendra 🙏` }),
  d => ({ title: '😴 Jain sleep hack', body: `Sadhus chant all night. You're a grihastha — just do one mala in bed. Eyes closed, Volume ↓ taps, no screen. Drift off mid-mantra if you want 😌 ${d.streak > 0 ? `Streak: ${d.streak} 🔥` : ''}` }),
  d => ({ title: '🌟 Main character era', body: `Everyone else is doom-scrolling at ${new Date().getHours() > 21 ? '11pm' : '10pm'}. You're doing navkar. That's unironically the most Mahavir thing you can do right now 📿` }),
  d => ({ title: '🪔 Ratri Pratikraman', body: `Quick mental audit: Krodh today? A little. Maan? Maybe. Lobh? Yes at the mithai stall 😂 Counter all of it — one mala, now. ${d.todayNavkars > 0 ? `${d.todayNavkars} navkars already in 💛` : ''}` }),
  d => ({ title: '📿 Ayushi karma loading…', body: `Best time to build ayushi karma? Sleep onset. Literally. Navkar Mantra as you fall asleep = punyanubandhipunya activated. Science-adjacent dharma 🙏 Open Navkar Siddhi.` }),
  d => ({ title: '💀 Karma debt collector', body: `Today's karma account balance: pending. Navkar count: ${d.todayNavkars}. Closing time: soon 😬 One mala before sleep pays the tab 📿` }),
  d => ({ title: '🌌 Night mode unlocked', body: `Late nights + navkar = unmatched monk aesthetic. ${d.streak > 0 ? `${d.streak} days on the board.` : 'Start the streak tonight.'} The universe is quiet, the mantra is loud 🔥` }),
  d => ({ title: '😤 Don\'t sleep on this', body: `You can scroll. Or you can do 108 navkars in bed in 5 minutes. One of these rewires your karma. The other gives you neck pain. Choose wisely 📿` }),
  d => ({ title: '🧘 Monk mode: easy edition', body: `Actual monks do 48-minute Samayik. You? Just close your eyes and tap Volume ↓ 108 times. That's your grihastha pass 🙏 ${d.malas > 0 ? `${d.malas} mala${d.malas === 1 ? '' : 's'} today already 💛` : ''}` }),
  d => ({ title: '🌙 Last call', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars. Today was good.` : 'Zero navkars. Redemption window: closing.'} One mala before sleep. Antaratma will thank you 🪔` }),
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
  d => ({ title: '📿 Karma nudge', body: `${d.todayNavkars > 0 ? `${d.todayNavkars} navkars in today 💛 But you know one mala more won't hurt.` : 'The five supreme souls are waiting for your attention. Brief check-in? 🙏'}` }),
  d => ({ title: '🪔 Sadhana status', body: `Streak: ${d.streak > 0 ? `${d.streak} day${d.streak === 1 ? '' : 's'} 🔥` : 'not started — today is perfect for day 1'}. Navkars today: ${d.todayNavkars}. One mala: ${Math.ceil((108 - (d.todayNavkars % 108)) / 108 * 108)} to go 📿` }),
  d => ({ title: '✨ Mid-day reset', body: `Feeling scattered? 5 minutes of Navkar Mantra literally reorganises your thoughts. Science and dharma agree 🙏` }),
  d => ({ title: '🧘 Monk check', body: `You have: a phone. The app. ${d.streak > 0 ? `A ${d.streak}-day streak.` : '108 navkars waiting.'} The only thing missing is a tap 📿` }),
  d => ({ title: '📿 Navkar Siddhi', body: `${d.totalNavkars ? `${d.totalNavkars} total navkars on this journey. ` : ''}Every single one counted. Here's one more 🙏 Jai Jinendra.` }),
  d => ({ title: '🌸 Pause and recite', body: `The whole Navkar Mantra takes 30 seconds. One mala = 45 minutes. One navkar = now. Pick one 📿` }),
  d => ({ title: '🔥 Streak check', body: d.streak >= 21 ? `${d.streak} days. You're literally doing Paryushan prep without knowing it 🙏` : d.streak >= 7 ? `${d.streak} days — Mahavir is nodding 💛` : `Start a streak today. Every ${d.streak === 0 ? 'sadhu started at 0' : `streak started at day ${d.streak}`} 📿` }),
  d => ({ title: '🪔 Jai Jinendra', body: `Navkars completed this session: checking… you need to open the app first 😄 📿` }),
  d => ({ title: '💫 Quick sadhana', body: `Volume ↓ button = +1 navkar. Phone in pocket, eyes anywhere. 108 taps = 1 mala. Go. 🙏` }),
  d => ({ title: '📿 Log karte hai sab', body: `Log karte hai protein, calories, steps. Tu log kar navkar 💪 ${d.todayNavkars > 0 ? `${d.todayNavkars} today already.` : 'Start the count.'}` }),
  d => ({ title: '🌿 Ahimsa in action', body: `Zero ahimsa violations since you opened this notification 🌿 Keep it going with a navkar or ten 📿` }),
  d => ({ title: '✨ Karma compound interest', body: `Every navkar is a karma-credit that compounds across lifetimes 📈 Today's ROI: ${d.todayNavkars > 0 ? `${d.todayNavkars} credits logged.` : 'unlimited potential.'}` }),
  d => ({ title: '🎮 Karma Bubble mode', body: `Pop karma bubbles in the Game tab 🎮 Each pop = 1 navkar. Krodh, Lobh, Maya, Maan, Moha — time to clear the board 🧘` }),
  d => ({ title: '📿 Five beings. One mantra.', body: `Arihant → Siddha → Acharya → Upadhyaya → Sadhu. The OG squad. Namo them all. Right now 🙏` }),
  // ── bhakti mode ──────────────────────────────────────────────────────────────
  () => ({ title: '🎵 Bhakti Mode calling you', body: `Bhaktamar Stotra. Navkar Mantra. Jain music that actually hits. Tap → Bhakti Mode 🙏` }),
  () => ({ title: '🎶 Listen, don\'t just count', body: `Today: open Bhakti Mode. Let Navkar Mantra play while you do literally anything else 📿` }),
  // ── jain vibes ───────────────────────────────────────────────────────────────
  () => ({ title: '✨ Check your vibe today', body: `AI-generated Jain wisdom for exactly today. Tap → Vibes tab. Takes 3 seconds 🌸` }),
  // ── karma bubble game ────────────────────────────────────────────────────────
  () => ({ title: '🎮 Pop some karma today', body: `Krodh, Lobh, Maya, Maan, Moha — clear the board in Karma Bubble Game 🫧 Each pop = 1 navkar` }),
  // ── resources ────────────────────────────────────────────────────────────────
  () => ({ title: '📖 Pratikraman resources inside', body: `English Pratikraman book, recorded audio, videos — all in the Resources tab 🙏 Paryushan prep starts now` }),
];

// ── Parva (Pacham / Aatham / Chaudas) notification pool ──────────────────────
// Used when a parva is today (daysAway=0) or tomorrow (daysAway=1).
type ParvaFn = (name: string, daysAway: number, d: VibeData) => { title: string; body: string };

const PARVA_MSGS: ParvaFn[] = [
  (name, days) => ({
    title: days === 0 ? `🪔 Aaj ${name} hai` : `⚠️ Kal ${name} — ready ho?`,
    body: days === 0
      ? `${name} tithi aaj — upavas, navkar, bhakti 🙏 Spiritual combo of the month. Tap to begin 📿`
      : `Kal ${name} tithi hai — aaj raat chauvihar karo, subah extra mala plan karo. Parv ka din waste mat karo 🪔`,
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
      ? f.name === 'Samvatsari' ? '🙏 Michhami Dukkadam — aaj' : '🌸 Paryushan shuru aaj'
      : `🌿 Paryushan ${f.daysAway === 1 ? 'kal' : `${f.daysAway} din mein`}`,
    body: f.daysAway === 0 && f.name === 'Samvatsari'
      ? `Kshamapana ka din 🙏 Michhami Dukkadam — send karo apne logo ko. Aur ek mala bhi 📿`
      : f.daysAway === 0
      ? `Paryushan Mahaparv shuru hua 🌸 8 din ka spiritual sprint — streak ${d.streak > 0 ? d.streak + ' pe' : 'shuru karo'} 🔥 Open Navkar Siddhi 📿`
      : `Paryushan ${f.daysAway === 1 ? 'kal se' : 'aane wala hai'} 🌸 Abhi se navkar count badao — Paryushan mein entry strong honi chahiye 📿`,
  } : {
    title: f.daysAway === 0 ? `🎉 Aaj ${f.label}` : `📅 Kal ${f.label}`,
    body: f.daysAway === 0
      ? `Parv ka din 🙏 Navkar, bhakti, meditation — sab aaj ke liye banaa hai 📿`
      : `Kal ${f.label} — ready ho jao. Navkar Siddhi open karo 🪔`,
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

    const params = new URLSearchParams({
      slot,
      streak:      String(data.streak),
      navkars:     String(data.todayNavkars),
      malas:       String(data.malas),
      daysInactive: '0',
      lifecycle,
      ...(data.parva && data.parva.daysAway <= 1 ? {
        tithiName:     data.parva.name,
        tithiDaysAway: String(data.parva.daysAway),
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

  // Inject parva data into VibeData
  const parva = getUpcomingParva();
  const dataWithParva: VibeData = { ...data, parva };

  // Try AI-generated messages; fall back to static pool
  const [aiMorning, aiChauvihar, aiEvening, aiNight] = await Promise.all([
    fetchAIMessage('morning',   dataWithParva, lifecycle),
    fetchAIMessage('chauvihar', dataWithParva, lifecycle),
    fetchAIMessage('evening',   dataWithParva, lifecycle),
    fetchAIMessage('night',     dataWithParva, lifecycle),
  ]);

  // Parva override: inject parva-aware message into morning slot (today or advance notice)
  const parvaMsg = parva && parva.daysAway <= 1
    ? PARVA_MSGS[getRotationIdx('parva', PARVA_MSGS.length)](parva.name, parva.daysAway, dataWithParva)
    : null;

  const morningMsg    = aiMorning    ?? parvaMsg ?? pickMsg('morning',   dataWithParva);
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
  const dataWithParva: VibeData = { ...data, parva };
  const parvaMsg = parva && parva.daysAway <= 1
    ? PARVA_MSGS[getRotationIdx('parva', PARVA_MSGS.length)](parva.name, parva.daysAway, dataWithParva)
    : null;

  const fmt = (h: number) => {
    const d = new Date(); d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return [
    { slot: 'morning'    as Slot, hour: morningHour,              time: fmt(morningHour),             ...(parvaMsg ?? pickMsg('morning',    dataWithParva)) },
    { slot: 'chauvihar'  as Slot, hour: DEFAULT_CHAUVIHAR_HOUR,   time: fmt(DEFAULT_CHAUVIHAR_HOUR),  ...pickMsg('chauvihar',  dataWithParva) },
    { slot: 'evening'    as Slot, hour: eveningHour,              time: fmt(eveningHour),             ...pickMsg('evening',    dataWithParva) },
    { slot: 'night'      as Slot, hour: nightHour,                time: fmt(nightHour),               ...pickMsg('night',      dataWithParva) },
  ];
};
