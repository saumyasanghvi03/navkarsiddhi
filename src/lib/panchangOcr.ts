import { PanchangRecord } from './panchangData';

export interface RawOcrInput {
  raw_text: string;
  source_image_name: string;
  target_gregorian_date?: string;
}

export interface ValidationResult {
  record: PanchangRecord;
  warnings: string[];
  isValid: boolean;
}

export function parseAndValidateOcrPanchang(input: RawOcrInput): ValidationResult {
  const warnings: string[] = [];
  const raw = input.raw_text || '';

  // Extract ISO Gregorian Date
  let isoDate = input.target_gregorian_date;
  if (!isoDate) {
    const match = raw.match(/\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/);
    if (match) {
      isoDate = `${match[1]}-${match[2]}-${match[3]}`;
    } else {
      isoDate = new Date().toISOString().split('T')[0];
      warnings.push('Gregorian date could not be parsed automatically from OCR text. Defaulted to today.');
    }
  }

  // Extract Paksha & Tithi
  let paksha = 'Sud';
  if (/vad|krishna|vadh/i.test(raw)) {
    paksha = 'Vad';
  }

  let tithi = 'Tithi';
  const tithiMatch = raw.match(/(ekam|beej|trij|chauth|pancham|chhath|satam|aatham|noam|dasam|ekadashi|baras|teras|chaudas|poonam|amavasya)/i);
  if (tithiMatch) {
    tithi = `${tithiMatch[1]} (${paksha})`;
  } else {
    warnings.push('Tithi could not be unambiguously resolved from OCR image text.');
  }

  // Check for events / festivals
  const events: string[] = [];
  if (/paryushan/i.test(raw)) events.push('Paryushan Parva');
  if (/samvatsari/i.test(raw)) events.push('Samvatsari Mahaparva');
  if (/mahavir|janma/i.test(raw)) events.push('Mahavir Janma Kalyanak');
  if (/ayambil/i.test(raw)) events.push('Ayambil Oli');

  if (events.length === 0) {
    events.push('Daily Jain Sadhana');
  }

  const record: PanchangRecord = {
    gregorian_date: isoDate,
    day: new Date(isoDate).toLocaleDateString('en-US', { weekday: 'long' }),
    jain_month: /bhadrapad|bhadarvo/i.test(raw) ? 'Bhadrapad' : 'Kartik',
    paksha,
    tithi,
    samvat: 'Vira Nirvana 2552 / Vikram 2082',
    events,
    source_image: input.source_image_name,
    validation_status: warnings.length > 0 ? 'REQUIRES_REVIEW' : 'VALIDATED',
  };

  return {
    record,
    warnings,
    isValid: warnings.length === 0,
  };
}
