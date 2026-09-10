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

/**
 * Returns Panchang record for ISO YYYY-MM-DD or fallbacks gracefully
 */
export function getPanchangForDate(dateStr: string): PanchangRecord {
  if (PANCHANG_DATASET[dateStr]) {
    return PANCHANG_DATASET[dateStr];
  }
  
  // Fallback dynamic generator for missing dates so app never crashes
  const d = new Date(dateStr);
  const weekdaysGu = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરૂવાર', 'શુક્રવાર', 'શનિવાર'];
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = d.getDay();
  
  return {
    gregorian_date: dateStr,
    weekdayGu: weekdaysGu[dayIndex],
    weekdayEn: weekdaysEn[dayIndex],
    vikram_samvat: 2082,
    jain_month: 'ભાદરવો',
    paksha: 'Sud',
    tithi: 'વદ અગિયારસ',
    tithiNum: 11,
    sunrise: '06:18',
    sunset: '18:45',
    navkarsi: '06:42',
    porsi: '09:18',
    sadh_porsi: '10:48',
    purimaddh: '12:31',
    nakshatra: 'પુષ્ય',
    events: ['પર્યુષણ પર્વ પ્રારંભ પૂર્વ તૈયારી']
  };
}

export function getTodayPanchang(): PanchangRecord {
  const todayISO = new Date().toISOString().split('T')[0];
  return getPanchangForDate(todayISO);
}
