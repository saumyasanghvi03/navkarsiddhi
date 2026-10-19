import type { Metadata } from 'next';
import AddResourceForm from './components/AddResourceForm';
import ResourceSection from './components/ResourceSection';
import { resourceSections } from './data/resources';

export const metadata: Metadata = {
  title: 'Jain Resources | Navkar Siddhi',
  description:
    'Navkar Mantra meaning, Jain calendar guide, sadhana resources, stotras and bhakti — everything for your daily practice.',
};

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
      "Pacham, Aatham, Chaudas — these aren't just dates on a calendar. They're the natural breath of the Jain year. Paryushan, Diwali Nirvan, Ayambil Oli — each parva is a doorway. You don't need to do everything. Just knowing they're coming is enough to let them land.",
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
      "A mala is 108 navkars. Chauvihar is the sunset vow. Ayambil is the 9-day fast. These aren't rules — they're tools, available whenever you want them. A grihastha can use all of them without giving up their life. That's the whole point of Jain householder dharma.",
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
      "Bhaktamar Stotra. Uvasaggaharam. Logassa. These stotras have been recited for centuries — not because devotees were told to, but because something in the atma responds to them. Play Bhakti Mode in the app and let them wash over you. You don't need to understand every word. The vibration does the work.",
    punyaNote: 'Listening to a stotra with intention = your atma recognises something ancient in itself.',
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50/30">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 px-5 pt-12 pb-10">
        <div className="relative max-w-2xl mx-auto">
          <div className="text-5xl mb-4">📿</div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Jain Resources
          </h1>
          <p className="mt-2 text-orange-100 text-sm leading-relaxed max-w-sm">
            Navkar Mantra · Parva Calendar · Sadhana · Stotras — everything for your daily practice.
          </p>
          <div className="mt-5 inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
            <p className="text-xs text-white/90 font-medium">
              💛 &ldquo;Uttamam Khalu Tattvam — the highest truth is inner self.&rdquo;
            </p>
            <p className="text-xs text-orange-100 mt-0.5">— Kundakunda, Samayasara</p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />
      </div>

      {/* Punya insight strip */}
      <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 max-w-2xl mx-auto">
        <p className="text-xs text-amber-800 text-center leading-relaxed">
          🌟 Every mala = 108 navkars · One navkar = salutation to the five supreme beings · The punya isn&apos;t earned — it&apos;s remembered
        </p>
      </div>

      {/* Section cards */}
      <div className="px-4 max-w-2xl mx-auto py-6 space-y-4">
        {SECTIONS.map(sec => (
          <div key={sec.id} className={`rounded-2xl border ${sec.border} overflow-hidden shadow-sm`}>
            {/* Coloured header band */}
            <div className={`bg-gradient-to-r ${sec.gradient} px-5 py-3 flex items-center gap-3`}>
              <span className="text-3xl">{sec.emoji}</span>
              <div>
                <div className="font-bold text-white text-base leading-tight">{sec.title}</div>
                <div className="text-xs text-white/80">{sec.subtitle}</div>
              </div>
            </div>
            {/* Body */}
            <div className={`${sec.bg} px-5 py-4`}>
              <p className="text-sm text-gray-700 leading-relaxed">{sec.description}</p>
              <div className={`mt-3 border rounded-xl px-3 py-2 ${sec.punya}`}>
                <p className="text-xs font-medium">🌟 {sec.punyaNote}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Curated resources */}
      <div className="px-4 max-w-2xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-orange-100" />
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest whitespace-nowrap">Curated Resources</h2>
          <div className="flex-1 h-px bg-orange-100" />
        </div>
        <p className="text-xs text-gray-400 text-center mb-6 -mt-2">
          Books, audio and video — for Paryushan, Samvatsari and daily practice
        </p>

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
