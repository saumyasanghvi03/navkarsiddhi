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
    title: 'Navkar Mantra',
    subtitle: 'The foundation of everything',
    description:
      'Five supreme souls. Nine lines. The most powerful mantra in Jain dharma — not a prayer to a god, but a tribute to the path of liberation itself. Every time you recite it, your atma aligns with the highest possible vibration.',
    punyaNote: 'Every mala = 108 navkars = one of the most powerful punya deposits you can make today.',
  },
  {
    id: 'calendar',
    emoji: '🪔',
    title: 'Jain Calendar & Parva',
    subtitle: 'Tithi, parva, upavas — your spiritual rhythm',
    description:
      'Pacham, Aatham, Chaudas — these aren\'t just dates on a calendar. They\'re the natural breath of the Jain year. Paryushan, Diwali Nirvan, Ayambil Oli — each parva is a doorway. You don\'t need to do everything. Just knowing they\'re coming is enough to let them land.',
    punyaNote: 'Parva tithis carry extra spiritual weight. One navkar on Aatham > five on an ordinary day.',
  },
  {
    id: 'sadhana',
    emoji: '🧘',
    title: 'Sadhana Guide',
    subtitle: 'Malas, chauvihar, ayambil — the practice',
    description:
      'A mala is 108 navkars. Chauvihar is the sunset vow. Ayambil is the 9-day fast. These aren\'t rules — they\'re tools, available whenever you want them. A grihastha can use all of them without giving up their life. That\'s the whole point of Jain householder dharma.',
    punyaNote: 'Chauvihar + one mala = the highest grihastha combo you can do any evening.',
  },
  {
    id: 'bhakti',
    emoji: '🎵',
    title: 'Stotras & Bhakti',
    subtitle: 'Bhaktamar, Uvasaggaharam, and more',
    description:
      'Bhaktamar Stotra. Uvasaggaharam. Logassa. These stotras have been recited for centuries — not because devotees were told to, but because something in the atma responds to them. Play Bhakti Mode in the app and let them wash over you. You don\'t need to understand every word. The vibration does the work.',
    punyaNote: 'Listening to a stotra with intention = your atma recognises something ancient in itself.',
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50/40 to-white">
      {/* Hero */}
      <div className="px-5 pt-10 pb-8 max-w-2xl mx-auto">
        <div className="text-4xl mb-3">📿</div>
        <h1 className="text-2xl font-bold text-orange-900 leading-snug">
          Your Jain Practice, <br />
          <span className="text-orange-600">close at hand</span>
        </h1>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          &ldquo;Uttamam Khalu Tattvam — the highest truth is inner self.&rdquo;
          <br />
          <span className="text-gray-400 text-xs">— Kundakunda, Samayasara</span>
        </p>
        <div className="mt-4 bg-orange-100 border border-orange-200 rounded-2xl px-4 py-3">
          <p className="text-xs text-orange-800 font-semibold leading-relaxed">
            💛 Punya insight
          </p>
          <p className="text-xs text-orange-700 mt-1 leading-relaxed">
            Every mala = 108 navkars. One navkar = one salutation to the five supreme beings.
            The punya isn&apos;t earned — it&apos;s remembered. Your atma already knows the way.
          </p>
        </div>
      </div>

      {/* New soul-mate section cards */}
      <div className="px-4 max-w-2xl mx-auto space-y-4 mb-8">
        {SECTIONS.map(sec => (
          <div key={sec.id} className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{sec.emoji}</span>
                <div>
                  <div className="font-bold text-gray-900 text-base leading-tight">{sec.title}</div>
                  <div className="text-xs text-orange-500 font-medium">{sec.subtitle}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">{sec.description}</p>
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <p className="text-xs text-amber-700">🌟 {sec.punyaNote}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing curated resources */}
      <div className="px-4 max-w-2xl mx-auto">
        <div className="border-t border-orange-100 pt-6 pb-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Curated Resources</h2>
          <p className="text-xs text-gray-400 mb-5">Books, audio and video from the community — for Paryushan, Samvatsari and daily practice.</p>
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
