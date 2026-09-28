// Curated seed dataset for the Jain Derasar (Temple) Finder.
// Shwetambar temples only, across Mumbai (city + suburbs) and Thane.
// Sourced from public temple directories (jainmandir.org, jainsite.com and
// similar) plus community-supplied detail; addresses are best-effort and not
// independently verified against each temple in person — this is a seed
// list meant to grow via community submissions (see templeSubmissions.ts),
// not a claim of complete or guaranteed-accurate coverage.

export interface TempleRecord {
  id: string;
  name: string;
  area: string;
  city: 'Mumbai' | 'Thane';
  address: string;
  sect: 'Shwetambar';
  timings?: string; // only set where a source actually confirmed hours
  notes?: string;
  isLandmark?: boolean;
}

export const TEMPLE_DATASET: TempleRecord[] = [
  // ---------- South Mumbai ----------
  {
    id: 'godiji-parshwanath-pydhonie',
    name: 'Shri Godiji Parshwanath Jain Derasar',
    area: 'Pydhonie, Bhuleshwar',
    city: 'Mumbai',
    address: 'Pydhonie, Bhuleshwar, Mumbai',
    sect: 'Shwetambar',
    notes: 'Built 1812 — one of Mumbai’s oldest Jain temples, dedicated to Parshwanath.',
    isLandmark: true,
  },
  {
    id: 'babu-amichand-walkeshwar',
    name: 'Babu Amichand Panalal Adishwarji Jain Temple',
    area: 'Walkeshwar, Malabar Hill',
    city: 'Mumbai',
    address: 'Walkeshwar Road, Malabar Hill, Mumbai',
    sect: 'Shwetambar',
    notes: 'Built 1904 — Mumbai’s most-visited Jain temple, dedicated to Adishwar (Rishabhanatha).',
    isLandmark: true,
  },
  {
    id: 'motisha-mahaveer-bhuleshwar',
    name: 'Shri Mahaveer Swami Shwetamber Jain Derasar (Motisha)',
    area: 'C.P. Tank Road, Bhuleshwar',
    city: 'Mumbai',
    address: 'C.P. Tank Road, Bhuleshwar, Mumbai',
    sect: 'Shwetambar',
    notes: 'Chintamani Parshwanath, Mahavira and Vimalnath across three levels.',
  },
  {
    id: 'adinath-khetwadi-girgaon',
    name: 'Shri Adinath Bhagwan Shwetamber Jain Mandir',
    area: 'Khetwadi, Girgaon',
    city: 'Mumbai',
    address: 'Sardar Vallabhbhai Patel Road, Khetwadi, Girgaon, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'suparshvnath-walkeshwar',
    name: 'Shri Suparshvnath Jain Mandir',
    area: 'Walkeshwar, Malabar Hill',
    city: 'Mumbai',
    address: 'Krishanaraj Society, Walkeshwar, Malabar Hill, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'simandhar-swami-lower-parel',
    name: 'Shri Simandhar Swami Jain Derasar',
    area: 'Lower Parel',
    city: 'Mumbai',
    address: 'Pandurang Budhkar Marg, Lower Parel, Mumbai',
    sect: 'Shwetambar',
    notes: 'Opposite Bombay Dyeing.',
  },
  {
    id: 'vasupujya-byculla',
    name: 'Shri Vasupujya Swami Shwetamber Jain Mandir',
    area: 'Ghodapdeo, Byculla',
    city: 'Mumbai',
    address: 'Arihant Tower, AG Pawar Marg, Ghodapdeo, Byculla, Mumbai',
    sect: 'Shwetambar',
  },

  // ---------- Central Mumbai ----------
  {
    id: 'vasupujya-dadar',
    name: 'Shri Vasupujya Swami Shwetamber Jain Mandir',
    area: 'Dadar East / Naigaon',
    city: 'Mumbai',
    address: 'Lokprakash Bhavan, Dadar East, Naigaon, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'abhinandanswami-sion',
    name: 'Shri Abhinandanswami Shwetamber Jain Mandir',
    area: 'Sion West',
    city: 'Mumbai',
    address: 'Sion West, Mumbai',
    sect: 'Shwetambar',
  },

  // ---------- Matunga ----------
  {
    id: 'vasupujya-matunga',
    name: 'Shree Vasupujya Swami Jain Mandir',
    area: 'King Circle, Matunga',
    city: 'Mumbai',
    address: 'Near King Circle Flyover East, Brahmanwada, Matunga, Mumbai 400019',
    sect: 'Shwetambar',
    timings: '5:30 AM – 11:30 AM, 5:30 PM – 8:30 PM',
  },
  {
    id: 'shahstrafana-parshvnath-matunga',
    name: 'Shri Shahstrafana Parshvnath Shwetamber Jain Derasar',
    area: 'King’s Circle, Matunga',
    city: 'Mumbai',
    address: 'Dr Baba Saheb Ambedkar Road, King’s Circle, Matunga, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'munisuvrat-matunga',
    name: 'Shree Munisuvrat Swami Jain Derasar',
    area: 'Matunga West',
    city: 'Mumbai',
    address: '44-B Jain Bhavan, Bhagat Lane Corner, Manorama Nagarkar Marg, Matunga West, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'vimalnath-matunga',
    name: 'Shree Vimalnath Jain Derasar',
    area: 'Matunga East',
    city: 'Mumbai',
    address: '18 Mugat Mahal, Jame Jamshed Road, Matunga East, Mumbai',
    sect: 'Shwetambar',
  },

  // ---------- Ghatkopar ----------
  {
    id: 'ajitnath-ghatkopar',
    name: 'Shri Ajitnath Bhagwan Jain Temple',
    area: 'Vallabh Baug Lane, Ghatkopar',
    city: 'Mumbai',
    address: 'Vallabh Baug Lane, Ghatkopar, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'adeshwarji-ghatkopar',
    name: 'Shree Adeshwarji Jain Derasar',
    area: 'Ghatkopar West',
    city: 'Mumbai',
    address: 'Ghatkopar West, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'munisuvrat-ghatkopar',
    name: 'Shree Munisuvrat Swami Jain Derasar (Jinalay)',
    area: 'Ghatkopar West',
    city: 'Mumbai',
    address: 'Navroji Lane, Ghatkopar West, Mumbai 400086',
    sect: 'Shwetambar',
    notes: 'Near Ghatkopar railway station.',
  },

  // ---------- Western suburbs ----------
  {
    id: 'vasupujya-malad',
    name: 'Shri Vasupujya Swami Jain Derasar',
    area: 'Liberty Garden, Malad West',
    city: 'Mumbai',
    address: 'Navy Colony, Liberty Garden, Malad West, Mumbai',
    sect: 'Shwetambar',
    notes: 'Idols reportedly around 450 years old.',
  },
  {
    id: 'sambhavnath-borivali',
    name: 'Shree Sambhavnath Jain Temple',
    area: 'Borivali East',
    city: 'Mumbai',
    address: 'Borivali East, Mumbai 400066',
    sect: 'Shwetambar',
  },
  {
    id: 'dharmanath-borivali',
    name: 'Shree Dharmanath Jain Derasar',
    area: 'Mahavir Nagar, Borivali West',
    city: 'Mumbai',
    address: 'Mahavir Nagar, Factory Lane, Borivali West, Mumbai',
    sect: 'Shwetambar',
  },

  // ---------- Mulund ----------
  {
    id: 'vasupujya-mulund',
    name: 'Shri Vasupujya Swami Shwetamber Jain Derasar',
    area: 'Mulund West',
    city: 'Mumbai',
    address: '54-55 Zaver Road, Mulund West, Mumbai 400080',
    sect: 'Shwetambar',
    notes: 'Around 74 years old, per community input (not independently source-verified).',
  },
  {
    id: 'shantinath-tambe-nagar-mulund',
    name: 'Shri Shantinath Jain Derasar',
    area: 'Tambe Nagar, Mulund West',
    city: 'Mumbai',
    address: 'Meeta Building, Tambe Nagar, Siddharth Nagar, Mulund West, Mumbai',
    sect: 'Shwetambar',
    timings: '5:30 AM – 11:30 AM',
  },
  {
    id: 'amijhara-adinath-tambe-nagar-mulund',
    name: 'Shri Amijhara Adinath Jain Derasar',
    area: 'Tambe Nagar, Mulund West',
    city: 'Mumbai',
    address: 'Amrut Tower, S.N. Road, Tambe Nagar, Siddharth Nagar, Mulund West, Mumbai',
    sect: 'Shwetambar',
    timings: '5:30 AM – 11:30 AM',
  },
  {
    id: 'sarvodaya-parshvnath-mulund',
    name: 'Shri Sarvodaya Parshvnath Shwetamber Jain Mandir',
    area: 'Sarvodaya Nagar, Mulund West',
    city: 'Mumbai',
    address: 'Sarvodaya Nagar, Mulund West, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'munisuvratnath-sarvodaya-mulund',
    name: 'Shri 1008 Munisuvratnath Swami Shwetamber Jain Mandir',
    area: 'Sarvodaya Nagar, Mulund West',
    city: 'Mumbai',
    address: 'Munisuvrat Apartment, Sarvodaya Nagar, Mulund West, Mumbai',
    sect: 'Shwetambar',
  },

  // ---------- Chembur ----------
  {
    id: 'rishabhdevji-chembur',
    name: 'Shri Rishabhdevji Swetamber Jain Mandir',
    area: 'Chembur East',
    city: 'Mumbai',
    address: 'Near Post Office, Chembur Gaothan, Chembur East, Mumbai',
    sect: 'Shwetambar',
  },
  {
    id: 'parshvchandra-guru-chembur',
    name: 'Shri Parshvchandra Guru Mandir',
    area: 'Jai Ambe Nagar, Chembur',
    city: 'Mumbai',
    address: '430, 10th Road, Jai Ambe Nagar, Chembur Gaothan, Chembur, Mumbai 400071',
    sect: 'Shwetambar',
  },
  {
    id: 'aadinath-chembur',
    name: 'Shree Aadinath Jain Derasar',
    area: 'Chembur',
    city: 'Mumbai',
    address: 'Shree Adeshwar Dada Jain Chowk, 10th Road, Near Chembur Naka, Chembur, Mumbai',
    sect: 'Shwetambar',
  },

  // ---------- Thane (Mumbai Metropolitan Region, outside Mumbai city/suburban limits) ----------
  {
    id: 'munisuvrat-thana-tirth',
    name: 'Shri Munisuvrat Swami Jain Mandir (Thana Tirth)',
    area: 'Jambli Naka, Thane West',
    city: 'Thane',
    address: 'Kharkar Alley Road, Jambli Naka, Thane West, Thane 400601',
    sect: 'Shwetambar',
    timings: '5:30 AM – 11:30 AM, 5:30 PM – 8:30 PM',
    notes: 'Historic Jain tirth, distinct from Mumbai city/suburban limits.',
    isLandmark: true,
  },
  {
    id: 'shankheshwer-parshwanath-kasarvadavali',
    name: 'Shri Shankheshwer Parshwanath Tirth Dham',
    area: 'Kasarvadavali, Ghodbunder Road, Thane West',
    city: 'Thane',
    address: 'Anand Nagar, Sai Nagar, Ghodbunder Road, Kasarvadavali, Thane West 400615',
    sect: 'Shwetambar',
    notes: 'Large modern tirth complex with lodging/boarding. Outside Mumbai city/suburban limits.',
  },
];

export const buildTempleMapsUrl = (temple: Pick<TempleRecord, 'name' | 'address' | 'city'>): string => {
  const query = `${temple.name}, ${temple.address}, ${temple.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const TEMPLE_AREAS = Array.from(new Set(TEMPLE_DATASET.map(t => t.area))).sort();
