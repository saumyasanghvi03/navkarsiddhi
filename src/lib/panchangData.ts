// Structured Panchang Reference Dataset mapped to ISO YYYY-MM-DD
// Extracted from Jain calendar PANCHANG pages (20260910_222350.jpg, 20260910_222359.jpg, 20260910_222404.jpg, etc.)

export interface PanchangRecord {
  gregorian_date: string; // ISO format YYYY-MM-DD
  weekdayGu: string;
  weekdayEn: string;
  vikram_samvat: number;
  jain_month: string;
  paksha: 'Sud' | 'Vad';
  tithi: string;
  tithiNum: number;
  sunrise: string;
  sunset: string;
  navkarsi: string;
  porsi: string;
  sadh_porsi: string;
  purimaddh: string;
  nakshatra: string;
  events: string[];
  notes?: string;
  isPanchak?: boolean;
  isEstimated?: boolean;
}

export const PANCHANG_DATASET: Record<string, PanchangRecord> = {
  // --- Bhadarva Sud 2082 (Sept 12 - Sept 26, 2026) ---
  '2026-09-10': {
    gregorian_date: '2026-09-10',
    weekdayGu: 'ગુરૂવાર',
    weekdayEn: 'Thursday',
    vikram_samvat: 2082,
    jain_month: 'શ્રાવણ',
    paksha: 'Vad',
    tithi: 'વદ અગિયારસ',
    tithiNum: 11,
    sunrise: '06:18',
    sunset: '18:45',
    navkarsi: '06:42',
    porsi: '09:18',
    sadh_porsi: '10:48',
    purimaddh: '12:31',
    nakshatra: 'પુષ્ય',
    events: ['પર્યુષણ પર્વ પ્રારંભ પૂર્વ તૈયારી', 'અગિયારસ તપ'],
    notes: 'પવિત્ર અગિયારસ તિથિ'
  },
  '2026-09-11': {
    gregorian_date: '2026-09-11',
    weekdayGu: 'શુક્રવાર',
    weekdayEn: 'Friday',
    vikram_samvat: 2082,
    jain_month: 'શ્રાવણ',
    paksha: 'Vad',
    tithi: 'વદ બારસ',
    tithiNum: 12,
    sunrise: '06:19',
    sunset: '18:44',
    navkarsi: '06:43',
    porsi: '09:19',
    sadh_porsi: '10:49',
    purimaddh: '12:31',
    nakshatra: 'આશ્લેષા',
    events: ['શ્રાવણ અમાસ પૂર્વ દિવસ']
  },
  '2026-09-12': {
    gregorian_date: '2026-09-12',
    weekdayGu: 'શનિવાર',
    weekdayEn: 'Saturday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ એકમ (૧)',
    tithiNum: 1,
    sunrise: '06:19',
    sunset: '18:43',
    navkarsi: '06:43',
    porsi: '09:19',
    sadh_porsi: '10:49',
    purimaddh: '12:31',
    nakshatra: 'મઘા',
    events: ['પર્વાધિરાજ પર્યુષણ મહાપર્વ પ્રથમ દિવસ (૧)', 'પર્યુષણ પ્રારંભ શ્વેતાંબર'],
    isPanchak: false
  },
  '2026-09-13': {
    gregorian_date: '2026-09-13',
    weekdayGu: 'રવિવાર',
    weekdayEn: 'Sunday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ બીજ (૨)',
    tithiNum: 2,
    sunrise: '06:20',
    sunset: '18:42',
    navkarsi: '06:44',
    porsi: '09:20',
    sadh_porsi: '10:50',
    purimaddh: '12:31',
    nakshatra: 'પૂર્વ ફાલ્ગુની',
    events: ['પર્યુષણ દિવસ ૨']
  },
  '2026-09-14': {
    gregorian_date: '2026-09-14',
    weekdayGu: 'સોમવાર',
    weekdayEn: 'Monday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ ત્રીજ (૩)',
    tithiNum: 3,
    sunrise: '06:20',
    sunset: '18:41',
    navkarsi: '06:44',
    porsi: '09:20',
    sadh_porsi: '10:50',
    purimaddh: '12:30',
    nakshatra: 'ઉત્તરા ફાલ્ગુની',
    events: ['પર્યુષણ દિવસ ૩']
  },
  '2026-09-15': {
    gregorian_date: '2026-09-15',
    weekdayGu: 'મંગળવાર',
    weekdayEn: 'Tuesday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ ચોથ (૪)',
    tithiNum: 4,
    sunrise: '06:21',
    sunset: '18:40',
    navkarsi: '06:45',
    porsi: '09:21',
    sadh_porsi: '10:51',
    purimaddh: '12:30',
    nakshatra: 'હસ્ત',
    events: ['પર્યુષણ દિવસ ૪', 'શ્રી કલ્પસૂત્ર પૂજન/વાંચન પ્રારંભ']
  },
  '2026-09-16': {
    gregorian_date: '2026-09-16',
    weekdayGu: 'બુધવાર',
    weekdayEn: 'Wednesday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ પાંચમ (૫)',
    tithiNum: 5,
    sunrise: '06:21',
    sunset: '18:39',
    navkarsi: '06:45',
    porsi: '09:21',
    sadh_porsi: '10:51',
    purimaddh: '12:30',
    nakshatra: 'ચિત્રા',
    events: ['શ્રી મહાવીર સ્વામી જન્મ વાચન મહા મહોત્સવ', 'પર્યુષણ દિવસ ૫']
  },
  '2026-09-17': {
    gregorian_date: '2026-09-17',
    weekdayGu: 'ગુરુવાર',
    weekdayEn: 'Thursday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ છઠ (૬)',
    tithiNum: 6,
    sunrise: '06:22',
    sunset: '18:38',
    navkarsi: '06:46',
    porsi: '09:22',
    sadh_porsi: '10:52',
    purimaddh: '12:30',
    nakshatra: 'સ્વાતિ',
    events: ['પર્યુષણ દિવસ ૬']
  },
  '2026-09-18': {
    gregorian_date: '2026-09-18',
    weekdayGu: 'શુક્રવાર',
    weekdayEn: 'Friday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ સાતમ (૭)',
    tithiNum: 7,
    sunrise: '06:22',
    sunset: '18:36',
    navkarsi: '06:46',
    porsi: '09:22',
    sadh_porsi: '10:52',
    purimaddh: '12:29',
    nakshatra: 'વિશાખા',
    events: ['પર્યુષણ દિવસ ૭', 'બાર્હસ સૂત્ર વાચન']
  },
  '2026-09-19': {
    gregorian_date: '2026-09-19',
    weekdayGu: 'શનિવાર',
    weekdayEn: 'Saturday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ આઠમ (૮)',
    tithiNum: 8,
    sunrise: '06:23',
    sunset: '18:35',
    navkarsi: '06:47',
    porsi: '09:23',
    sadh_porsi: '10:53',
    purimaddh: '12:29',
    nakshatra: 'અનુરાધા',
    events: ['સંવત્સરી મહાપર્વ (શ્વેતાંબર)', 'ક્ષમાપના દિવસ', 'મિચ્છામિ દુકડં'],
    notes: 'સંવત્સરી પ્રતિક્રમણ અને ક્ષમાપના'
  },
  '2026-09-20': {
    gregorian_date: '2026-09-20',
    weekdayGu: 'રવિવાર',
    weekdayEn: 'Sunday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ નોમ (૯)',
    tithiNum: 9,
    sunrise: '06:23',
    sunset: '18:34',
    navkarsi: '06:47',
    porsi: '09:23',
    sadh_porsi: '10:53',
    purimaddh: '12:28',
    nakshatra: 'જ્યેષ્ઠા',
    events: ['સંવત્સરી પારણા દિવસ', 'દશલક્ષણ પર્વ પ્રારંભ (દિગંબર)']
  },
  '2026-09-26': {
    gregorian_date: '2026-09-26',
    weekdayGu: 'શનિવાર',
    weekdayEn: 'Saturday',
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'સુદ ચોદસ (૧૪)',
    tithiNum: 14,
    sunrise: '06:26',
    sunset: '18:27',
    navkarsi: '06:50',
    porsi: '09:26',
    sadh_porsi: '10:56',
    purimaddh: '12:26',
    nakshatra: 'પૂર્વ ભાદ્રપદ',
    events: ['અનંત ચૌદશ', 'દશલક્ષણ પર્વ સમાપન']
  },
  // --- Bhadarva Vad 2082 (Sept 27 - Oct 10, 2026) ---
  '2026-10-25': {
    gregorian_date: '2026-10-25',
    weekdayGu: 'રવિવાર',
    weekdayEn: 'Sunday',
    vikram_samvat: 2082,
    jain_month: 'આસો',
    paksha: 'Sud',
    tithi: 'સુદ ચૌદસ (૧૪)',
    tithiNum: 14,
    sunrise: '06:41',
    sunset: '17:58',
    navkarsi: '07:05',
    porsi: '09:41',
    sadh_porsi: '11:11',
    purimaddh: '12:20',
    nakshatra: 'રેવતી',
    events: ['આસો ઓળી સમાપન', 'ધનતેરસ પૂર્વ સંધ્યા']
  },
  '2026-10-31': {
    gregorian_date: '2026-10-31',
    weekdayGu: 'શનિવાર',
    weekdayEn: 'Saturday',
    vikram_samvat: 2082,
    jain_month: 'આસો',
    paksha: 'Vad',
    tithi: 'વદ અમાસ (૧૫)',
    tithiNum: 30,
    sunrise: '06:44',
    sunset: '17:53',
    navkarsi: '07:08',
    porsi: '09:44',
    sadh_porsi: '11:14',
    purimaddh: '12:19',
    nakshatra: 'સ્વાતિ',
    events: ['શ્રી મહાવીર સ્વામી નિર્વાણ કલ્યાણક', 'દીપાવલી મહાપર્વ', 'શારદા પૂજન / લક્ષ્મી પૂજન']
  },
  '2026-11-01': {
    gregorian_date: '2026-11-01',
    weekdayGu: 'રવિવાર',
    weekdayEn: 'Sunday',
    vikram_samvat: 2083,
    jain_month: 'કાર્તક',
    paksha: 'Sud',
    tithi: 'સુદ એકમ (૧)',
    tithiNum: 1,
    sunrise: '06:45',
    sunset: '17:52',
    navkarsi: '07:09',
    porsi: '09:45',
    sadh_porsi: '11:15',
    purimaddh: '12:19',
    nakshatra: 'વિશાખા',
    events: ['નૂતન વર્ષારંભ વીર નિર્વાણ સંવત ૨૫૫૩', 'વિક્રમ સંવત ૨૦૮૩ પ્રારંભ', 'ગૌતમ સ્વામી કેવલજ્ઞાન પર્વ']
  }
};

// ---------- Fallback estimation for dates outside the curated dataset ----------
//
// The curated PANCHANG_DATASET only covers specific days pulled from source
// calendar photos. For any other date we estimate Tithi/Nakshatra/Sunrise by
// propagating from the nearest curated entry, instead of returning a single
// hardcoded record for every missing date (which made every non-curated day
// show identical, frozen values).

const SYNODIC_MONTH_DAYS = 29.530588853; // mean lunar month (tithi cycle / 30)
const SIDEREAL_MONTH_DAYS = 27.321661; // mean nakshatra cycle (27 nakshatras)
const MS_PER_DAY = 86400000;

const WEEKDAYS_GU = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરૂવાર', 'શુક્રવાર', 'શનિવાર'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const NAKSHATRA_NAMES = [
  'અશ્વિની', 'ભરણી', 'કૃત્તિકા', 'રોહિણી', 'મૃગશીર્ષ', 'આર્દ્રા', 'પુનર્વસુ', 'પુષ્ય', 'આશ્લેષા',
  'મઘા', 'પૂર્વ ફાલ્ગુની', 'ઉત્તરા ફાલ્ગુની', 'હસ્ત', 'ચિત્રા', 'સ્વાતિ', 'વિશાખા', 'અનુરાધા', 'જ્યેષ્ઠા',
  'મૂળ', 'પૂર્વાષાઢા', 'ઉત્તરાષાઢા', 'શ્રવણ', 'ધનિષ્ઠા', 'શતભિષા', 'પૂર્વ ભાદ્રપદ', 'ઉત્તરા ભાદ્રપદ', 'રેવતી',
];

const TITHI_NAMES = [
  'એકમ', 'બીજ', 'ત્રીજ', 'ચોથ', 'પાંચમ', 'છઠ', 'સાતમ', 'આઠમ', 'નોમ', 'દશમ',
  'અગિયારસ', 'બારસ', 'તેરસ', 'ચૌદસ', 'પુનમ',
];

const GUJARATI_DIGITS = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];

function toGujaratiNumeral(n: number): string {
  return String(n).split('').map(ch => GUJARATI_DIGITS[Number(ch)] ?? ch).join('');
}

/** Local (not UTC) YYYY-MM-DD, so the app's notion of "today" matches the device's calendar day. */
export function getLocalDateISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISODateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

function findNearestAnchorKey(dateStr: string): string {
  const targetTime = parseISODateUTC(dateStr).getTime();
  let nearestKey = '';
  let minDiff = Infinity;
  for (const key of Object.keys(PANCHANG_DATASET)) {
    const diff = Math.abs(parseISODateUTC(key).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      nearestKey = key;
    }
  }
  return nearestKey;
}

function absoluteTithi(record: PanchangRecord): number {
  // 1-30: Sud runs 1-15 (15 = Purnima), Vad runs 16-30 (30 = Amavasya)
  const relative = record.tithiNum > 15 ? 15 : record.tithiNum;
  return record.paksha === 'Sud' ? relative : relative + 15;
}

function buildTithiLabel(paksha: 'Sud' | 'Vad', tithiNum: number): { tithi: string; tithiNum: number } {
  const name = tithiNum === 15 ? (paksha === 'Sud' ? 'પુનમ' : 'અમાસ') : TITHI_NAMES[tithiNum - 1];
  const displayNum = paksha === 'Vad' && tithiNum === 15 ? 30 : tithiNum;
  const label = `${paksha === 'Sud' ? 'સુદ' : 'વદ'} ${name} (${toGujaratiNumeral(displayNum)})`;
  return { tithi: label, tithiNum: displayNum };
}

function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = Math.round(normalized % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function addMinutesToTime(timeStr: string, minsToAdd: number): string {
  return minutesToTimeStr(timeStrToMinutes(timeStr) + minsToAdd);
}

function midpointTime(t1: string, t2: string): string {
  return minutesToTimeStr((timeStrToMinutes(t1) + timeStrToMinutes(t2)) / 2);
}

/**
 * Sunrise/sunset via the standard NOAA sunrise-equation approximation, tuned
 * (lat 27°N, lon 74°E) to match the curated dataset's sunrise/sunset to
 * within ~1-3 minutes. Independent of the lunar/tithi estimate above, so it
 * stays accurate for any Gregorian date regardless of calendar/leap-month
 * effects on the lunar side.
 */
function computeSunTimes(dateStr: string): { sunrise: string; sunset: string } {
  const LAT = 27, LON = 74; // representative reference location (IST)
  const date = parseISODateUTC(dateStr);
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / MS_PER_DAY);

  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  const eqTime = 229.18 * (
    0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma)
  );
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  const latRad = LAT * rad;
  const zenith = 90.833 * rad; // includes atmospheric refraction + solar radius
  const cosH = (Math.cos(zenith) / (Math.cos(latRad) * Math.cos(decl))) - Math.tan(latRad) * Math.tan(decl);
  const ha = Math.acos(Math.min(1, Math.max(-1, cosH))) * deg;

  const solarNoonUTCmin = 720 - 4 * LON - eqTime;
  const sunriseUTCmin = solarNoonUTCmin - 4 * ha;
  const sunsetUTCmin = solarNoonUTCmin + 4 * ha;
  const toIST = (utcMin: number) => minutesToTimeStr(utcMin + 330); // UTC+5:30

  return { sunrise: toIST(sunriseUTCmin), sunset: toIST(sunsetUTCmin) };
}

function estimatePanchang(dateStr: string): PanchangRecord {
  const anchorKey = findNearestAnchorKey(dateStr);
  const anchor = PANCHANG_DATASET[anchorKey];
  const dayOffset = (parseISODateUTC(dateStr).getTime() - parseISODateUTC(anchorKey).getTime()) / MS_PER_DAY;

  let tithiAbs = Math.round(absoluteTithi(anchor) + dayOffset * (30 / SYNODIC_MONTH_DAYS));
  tithiAbs = ((tithiAbs - 1) % 30 + 30) % 30 + 1;
  const paksha: 'Sud' | 'Vad' = tithiAbs <= 15 ? 'Sud' : 'Vad';
  const { tithi, tithiNum } = buildTithiLabel(paksha, tithiAbs <= 15 ? tithiAbs : tithiAbs - 15);

  const anchorNakIdx = Math.max(0, NAKSHATRA_NAMES.indexOf(anchor.nakshatra));
  let nakIdx = Math.round(anchorNakIdx + dayOffset * (27 / SIDEREAL_MONTH_DAYS));
  nakIdx = ((nakIdx % 27) + 27) % 27;

  const dayIndex = parseISODateUTC(dateStr).getUTCDay();
  const { sunrise, sunset } = computeSunTimes(dateStr);

  return {
    gregorian_date: dateStr,
    weekdayGu: WEEKDAYS_GU[dayIndex],
    weekdayEn: WEEKDAYS_EN[dayIndex],
    vikram_samvat: anchor.vikram_samvat,
    jain_month: anchor.jain_month,
    paksha,
    tithi,
    tithiNum,
    sunrise,
    sunset,
    navkarsi: addMinutesToTime(sunrise, 24),
    porsi: addMinutesToTime(sunrise, 180),
    sadh_porsi: addMinutesToTime(sunrise, 270),
    purimaddh: midpointTime(sunrise, sunset),
    nakshatra: NAKSHATRA_NAMES[nakIdx],
    events: [],
    notes: 'અંદાજિત પંચાંગ — આ તારીખ માટે ચોક્કસ ડેટા ઉપલબ્ધ નથી (Estimated, not from curated source)',
    isEstimated: true,
  };
}

/**
 * Returns Panchang record for ISO YYYY-MM-DD. Curated dates come straight
 * from PANCHANG_DATASET; any other date is estimated (see estimatePanchang)
 * so it varies correctly with the requested date instead of returning a
 * single frozen fallback record.
 */
export function getPanchangForDate(dateStr: string): PanchangRecord {
  if (PANCHANG_DATASET[dateStr]) {
    return PANCHANG_DATASET[dateStr];
  }
  return estimatePanchang(dateStr);
}

export function getTodayPanchang(): PanchangRecord {
  return getPanchangForDate(getLocalDateISO());
}
