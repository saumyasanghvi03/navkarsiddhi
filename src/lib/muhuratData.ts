// Structured Muhurat, Choghadiya & Hora Reference Dataset
// Extracted from Jain calendar MUHURAT page (20260910_222458.jpg)

export interface ChoghadiyaType {
  nameGu: string;
  nameEn: string;
  quality: 'Shubh' | 'Medium' | 'Ashubh';
  description: string;
  color: string;
}

export const CHOGHADIYA_TYPES: Record<string, ChoghadiyaType> = {
  amrit: { nameGu: 'અમૃત', nameEn: 'Amrit', quality: 'Shubh', description: 'સર્વોત્તમ, કાર્યોમાં સફળતા આપનાર', color: '#10B981' },
  shubh: { nameGu: 'શુભ', nameEn: 'Shubh', quality: 'Shubh', description: 'મંગલકારક, ધાર્મિક કાર્ય માટે શ્રેષ્ઠ', color: '#059669' },
  labh: { nameGu: 'લાભ', nameEn: 'Labh', quality: 'Shubh', description: 'વ્યાપાર, ધન લાભ તથા પ્રગતિ માટે ઉત્તમ', color: '#3B82F6' },
  chal: { nameGu: 'ચલ', nameEn: 'Chal', quality: 'Medium', description: 'સામાન્ય, યાત્રા તથા ચલ કાર્યો માટે યોગ્ય', color: '#F59E0B' },
  udveg: { nameGu: 'ઉદ્વેગ', nameEn: 'Udveg', quality: 'Ashubh', description: 'ચિંતાજનક, મહત્વના કાર્યો ટાળવા', color: '#EF4444' },
  kaal: { nameGu: 'કાળ', nameEn: 'Kaal', quality: 'Ashubh', description: 'હાનિકારક, શુભ કાર્ય ન કરવું', color: '#DC2626' },
  rog: { nameGu: 'રોગ', nameEn: 'Rog', quality: 'Ashubh', description: 'અશુભ, રોગ-પીડા દાયક', color: '#B91C1C' }
};

// Day Choghadiya sequence starting from Sunrise for each weekday (0=Sunday to 6=Saturday)
export const DAY_CHOGHADIYA_TABLE: Record<number, string[]> = {
  0: ['udveg', 'amrit', 'rog', 'labh', 'amrit', 'kaal', 'shubh', 'rog'], // Sunday (રવિ)
  1: ['amrit', 'kaal', 'shubh', 'rog', 'udveg', 'chhat', 'labh', 'amrit'], // Monday (સોમ)
  2: ['rog', 'udveg', 'chhat', 'labh', 'amrit', 'kaal', 'shubh', 'rog'], // Tuesday (મંગળ)
  3: ['labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'chhat', 'labh'], // Wednesday (બુધ)
  4: ['shubh', 'rog', 'udveg', 'chhat', 'labh', 'amrit', 'kaal', 'shubh'], // Thursday (ગુરુ)
  5: ['chhat', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'chhat'], // Friday (શુક્ર)
  6: ['kaal', 'shubh', 'rog', 'udveg', 'chhat', 'labh', 'amrit', 'kaal']  // Saturday (શનિ)
};

// Night Choghadiya sequence starting from Sunset for each weekday
export const NIGHT_CHOGHADIYA_TABLE: Record<number, string[]> = {
  0: ['shubh', 'amrit', 'chal', 'rog', 'kaal', 'labh', 'udveg', 'shubh'], // Sun night
  1: ['chal', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'chal'], // Mon night
  2: ['kaal', 'labh', 'udveg', 'shubh', 'amrit', 'chal', 'rog', 'kaal'], // Tue night
  3: ['udveg', 'shubh', 'amrit', 'chal', 'rog', 'kaal', 'labh', 'udveg'], // Wed night
  4: ['amrit', 'chal', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit'], // Thu night
  5: ['labh', 'udveg', 'shubh', 'amrit', 'chal', 'rog', 'kaal', 'labh'], // Fri night
  6: ['rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'chal', 'rog']   // Sat night
};

// Hora Planets & Characteristics ( Extracted from page 20260910_222458.jpg )
export const HORA_NOTES = {
  shubhHora: 'ચંદ્ર, બુધ, ગુરૂ અને શુકની હોરા શુભ રાજય સેવા કરવામાં, બુદ્ધિના હોરા જ્ઞાન પ્રાપ્ત કરવામાં, શુક્રની હોરા પ્રવાસમાં, શનિની હોરા દ્રવ્ય સંગ્રહમાં, ગુરુની હોરા દીક્ષા, તપ કે વિવાહ કરવામાં, મંગળની હોરા યુદ્ધ/વાદ વિવાદમાં અને ચંદ્રની હોરા દરેક કાર્યોમાં શુભ છે.',
  salanaPoonam2026: [
    { month: 'કારતક પૂનમ', date: '4-11-24', day: 'ગુરૂવાર' },
    { month: 'માગશર પૂનમ', date: '4-12-24', day: 'શુક્રવાર' },
    { month: 'પોષ પૂનમ', date: '3-1-25', day: 'શનિવાર' },
    { month: 'મહા પૂનમ', date: '1-2-25', day: 'રવિવાર' },
    { month: 'ફાગણ પૂનમ', date: '3-3-25', day: 'મંગળવાર' },
    { month: 'ચૈત્ર પૂનમ', date: '2-4-25', day: 'બુધવાર' },
    { month: 'વૈશાખ પૂનમ', date: '1-5-25', day: 'શુક્રવાર' },
    { month: 'જેઠ પૂનમ', date: '31-5-25', day: 'શનિવાર' },
    { month: 'અષાઢ પૂનમ', date: '29-6-25', day: 'સોમવાર' },
    { month: 'શ્રાવણ પૂનમ', date: '28-7-25', day: 'મંગળવાર' },
    { month: 'ભાદરવો પૂનમ', date: '26-8-25', day: 'બુધવાર' },
    { month: 'આસો પૂનમ', date: '25-10-25', day: 'સોમવાર' }
  ]
};

/**
 * Calculates time slots for 8 Choghadiya periods between start and end time
 */
export function getChoghadiyaSlots(startTimeStr: string = '06:30', endTimeStr: string = '18:30', isNight: boolean = false, date: Date = new Date()) {
  const weekday = date.getDay();
  const sequence = isNight ? NIGHT_CHOGHADIYA_TABLE[weekday] : DAY_CHOGHADIYA_TABLE[weekday];
  
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);
  
  let startMins = startH * 60 + startM;
  let endMins = endH * 60 + endM;
  
  if (endMins <= startMins) {
    endMins += 24 * 60; // Next day wrap
  }
  
  const totalDuration = endMins - startMins;
  const slotDuration = totalDuration / 8;
  
  return sequence.map((typeKey, idx) => {
    const slotStartMins = Math.floor(startMins + idx * slotDuration);
    const slotEndMins = Math.floor(startMins + (idx + 1) * slotDuration);
    
    const fmt = (mins: number) => {
      const h = Math.floor((mins % (24 * 60)) / 60);
      const m = mins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const details = CHOGHADIYA_TYPES[typeKey] || { nameGu: typeKey, nameEn: typeKey, quality: 'Medium', description: '', color: '#9CA3AF' };
    
    return {
      index: idx + 1,
      typeKey,
      nameGu: details.nameGu,
      nameEn: details.nameEn,
      quality: details.quality,
      description: details.description,
      color: details.color,
      startTime: fmt(slotStartMins),
      endTime: fmt(slotEndMins)
    };
  });
}
