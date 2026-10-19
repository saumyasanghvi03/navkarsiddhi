'use client';

import AddResourceForm from './AddResourceForm';
import ResourceSection from './ResourceSection';
import { resourceSections } from '../data/resources';

const SECTIONS = [
  {
    id: 'navkar',
    emoji: '📿',
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    punya: 'bg-orange-100 border-orange-200 text-orange-800',
    title: 'Navkar Mantra',
    subtitle: 'The foundation of everything',
    description:
      'Five supreme souls. Nine lines. The most powerful mantra in Jain dharma — not a prayer to a god, but a tribute to the path of liberation itself. Every time you recite it, your atma aligns with the highest possible vibration.',
    punyaNote: 'Every mala = 108 navkars = one of the most powerful punya deposits you can make today.',
  },
  {
    id: 'calendar',
    emoji: '🪔',
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    punya: 'bg-amber-100 border-amber-200 text-amber-800',
    title: 'Jain Calendar & Parva',
    subtitle: 'Tithi, parva, upavas — your spiritual rhythm',
    description:
      "Pacham, Aatham, Chaudas — these aren't just dates on a calendar. They're the natural breath of the Jain year. Paryushan, Diwali Nirvan, Ayambil Oli — each parva is a doorway. Just knowing they're coming is enough to let them land.",
    punyaNote: 'Parva tithis carry extra spiritual weight. One navkar on Aatham > five on an ordinary day.',
  },
  {
    id: 'sadhana',
    emoji: '🧘',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    punya: 'bg-emerald-100 border-emerald-200 text-emerald-800',
    title: 'Sadhana Guide',
    subtitle: 'Malas, chauvihar, ayambil — the practice',
    description:
      "A mala is 108 navkars. Chauvihar is the sunset vow. Ayambil is the 9-day fast. These aren't rules — they're tools. A grihastha can use all of them without giving up their life. That's the whole point of Jain householder dharma.",
    punyaNote: 'Chauvihar + one mala = the highest grihastha combo you can do any evening.',
  },
  {
    id: 'bhakti',
    emoji: '🎵',
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    punya: 'bg-purple-100 border-purple-200 text-purple-800',
    title: 'Stotras & Bhakti',
    subtitle: 'Bhaktamar, Uvasaggaharam, and more',
    description:
      "Bhaktamar Stotra. Uvasaggaharam. Logassa. Recited for centuries because something in the atma responds to them. Play Bhakti Mode in the app and let them wash over you. You don't need to understand every word.",
    punyaNote: 'Listening to a stotra with intention = your atma recognises something ancient in itself.',
  },
];

export default function ResourcesContent() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 px-5 pt-8 pb-8">
        <div className="relative">
          <div className="text-4xl mb-3">📿</div>
          <h1 className="text-2xl font-bold text-white leading-tight">Jain Resources</h1>
          <p className="mt-1 text-orange-100 text-xs leading-relaxed max-w-xs">
            Navkar · Parva · Sadhana · Stotras — for your daily practice
          </p>
        </div>
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-2 w-44 h-44 bg-white/5 rounded-full" />
      </div>

      {/* Punya strip */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
        <p className="text-[11px] text-amber-700 text-center leading-relaxed">
          🌟 Every mala = 108 navkars · The punya isn&apos;t earned — it&apos;s remembered
        </p>
      </div>

      {/* Section cards */}
      <div className="px-4 py-5 space-y-3">
        {SECTIONS.map(sec => (
          <div key={sec.id} className={`rounded-2xl border ${sec.border} overflow-hidden shadow-sm`}>
            <div className={`bg-gradient-to-r ${sec.gradient} px-4 py-3 flex items-center gap-3`}>
              <span className="text-2xl">{sec.emoji}</span>
              <div>
                <div className="font-bold text-white text-sm leading-tight">{sec.title}</div>
                <div className="text-[10px] text-white/80">{sec.subtitle}</div>
              </div>
            </div>
            <div className={`${sec.bg} px-4 py-3`}>
              <p className="text-xs text-gray-700 leading-relaxed">{sec.description}</p>
              <div className={`mt-2 border rounded-xl px-3 py-2 ${sec.punya}`}>
                <p className="text-[11px] font-medium">🌟 {sec.punyaNote}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Curated resources */}
      <div className="px-4 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-orange-100" />
          <h2 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest whitespace-nowrap">Curated Resources</h2>
          <div className="flex-1 h-px bg-orange-100" />
        </div>

        <section aria-label="Jain resources">
          {resourceSections.map((section) => (
            <ResourceSection key={section.id} section={section} />
          ))}
        </section>

        <AddResourceForm />
      </div>
    </main>
  );
}
