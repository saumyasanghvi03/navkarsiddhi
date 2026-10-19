export type AppLang = 'english' | 'hindi' | 'gujarati';

export const T = {
  // NavBar tabs
  jaap:      { english: 'Jaap',     hindi: 'जाप',      gujarati: 'જાપ'      },
  about:     { english: 'About',    hindi: 'परिचय',    gujarati: 'પરિચય'    },
  tap:       { english: 'Tap',      hindi: 'तप',       gujarati: 'તપ'       },
  progress:  { english: 'Progress', hindi: 'प्रगति',   gujarati: 'પ્રગતિ'   },
  me:        { english: 'Me',       hindi: 'मैं',      gujarati: 'હું'      },
  blog:      { english: 'Blog',     hindi: 'ब्लॉग',    gujarati: 'બ્લૉગ'    },
  vibes:     { english: 'Vibes',    hindi: 'वाइब्स',   gujarati: 'વાઇબ્સ'   },
  contact:   { english: 'Contact',  hindi: 'संपर्क',   gujarati: 'સંપર્ક'   },

  // Onboarding
  ob_name_q:    { english: 'What should I call you?',             hindi: 'मैं आपको क्या कहूँ?',         gujarati: 'હું તમને શું કહું?'              },
  ob_name_sub:  { english: "I'll use your name when I check in.", hindi: 'मैं आपका नाम काम में लूँगा।', gujarati: 'હું ચેક-ઇન વखते તમારું નામ વાપરીશ.'  },
  ob_name_ph:   { english: 'Your name',                          hindi: 'आपका नाम',                    gujarati: 'તમારું નામ'                        },
  ob_city_q:    { english: 'Which city are you in?',             hindi: 'आप किस शहर में हैं?',          gujarati: 'તમે ક્યા શહેરમાં છો?'              },
  ob_city_sub:  { english: 'For local parva & muhurat timings.', hindi: 'स्थानीय पर्व व मुहूर्त के लिए।', gujarati: 'સ્થાનિક પર્વ અને મુહૂર્ત માટે.'  },
  ob_city_ph:   { english: 'e.g. Ahmedabad, Mumbai…',           hindi: 'जैसे अहमदाबाद, मुंबई…',       gujarati: 'દા.ત. અમદાવાદ, મુંબઈ…'            },
  ob_gender_q:  { english: 'How do you identify?',               hindi: 'आप क्या कहलाना पसंद करते हैं?', gujarati: 'તમે કઈ ઓળખ પ્રેફર કરો છો?'     },
  ob_lang_q:    { english: 'Choose your app language',           hindi: 'ऐप भाषा चुनें',               gujarati: 'એપ ભાષા પસંદ કરો'                },
  ob_lang_sub:  { english: 'Mantra, UI and greetings will follow.', hindi: 'मंत्र, UI और अभिवादन इसी भाषा में होगा।', gujarati: 'મંત્ર, UI અને શુભેચ્છા આ ભાષામાં આવશે.' },
  continue:     { english: 'Continue →',    hindi: 'आगे बढ़ें →',  gujarati: 'આગળ વધો →'  },
  skip:         { english: 'Skip →',        hindi: 'छोड़ें →',     gujarati: 'છોડો →'      },
  begin:        { english: 'Begin Sadhana 🪔', hindi: 'साधना शुरू करें 🪔', gujarati: 'સાધના શરૂ કરો 🪔' },

  // Settings
  settings:        { english: 'Settings',           hindi: 'सेटिंग्स',        gujarati: 'સેટિંગ્સ'        },
  settings_title:  { english: 'App Settings',        hindi: 'ऐप सेटिंग्स',    gujarati: 'એપ સેટિંગ્સ'    },
  profile:         { english: 'Your Profile',        hindi: 'आपकी प्रोफ़ाइल', gujarati: 'તમારી પ્રોફાઇલ' },
  name_label:      { english: 'Name',                hindi: 'नाम',             gujarati: 'નામ'             },
  city_label:      { english: 'City',                hindi: 'शहर',             gujarati: 'શહેર'            },
  lang_label:      { english: 'App Language',        hindi: 'ऐप भाषा',        gujarati: 'એપ ભાષા'        },
  save:            { english: 'Save Changes',        hindi: 'बदलाव सहेजें',   gujarati: 'ફેરફાર સાચવો'   },
  saved:           { english: 'Saved ✓',             hindi: 'सहेजा ✓',        gujarati: 'સાચવ્યું ✓'     },
  back:            { english: '← Back',              hindi: '← वापस',         gujarati: '← પાછળ'         },

  // Jaap page
  jai_jinendra:    { english: 'Jai Jinendra 🙏',     hindi: 'जय जिनेन्द्र 🙏', gujarati: 'જય જિનેન્દ્ર 🙏' },
  navkar:          { english: 'Navkar',              hindi: 'नवकार',           gujarati: 'નવકાર'           },
  mala:            { english: 'Mala',                hindi: 'माला',            gujarati: 'માળા'            },
  streak:          { english: 'Streak',              hindi: 'लकीर',            gujarati: 'સ્ટ્રીક'         },
} as const;

export type TKey = keyof typeof T;

export function t(key: TKey, lang: AppLang): string {
  return T[key][lang] ?? T[key]['english'];
}
