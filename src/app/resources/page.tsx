import type { Metadata } from 'next';
import AddResourceForm from './components/AddResourceForm';
import ResourceSection from './components/ResourceSection';
import { resourceSections } from './data/resources';

export const metadata: Metadata = {
  title: 'Jain Resources | Navkar Siddhi',
  description:
    'Explore Jain Pratikraman books, audio and video resources for Paryushan and Samvatsari.',
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-orange-200 pb-6">
          <h1 className="text-3xl font-serif font-bold text-orange-900">Paryushan &amp; Samvatsari</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            On the auspicious occasion of Paryushan and Das-Lakshan Parva, we sincerely ask for forgiveness for any hurt caused by our thoughts, words, or actions, knowingly or unknowingly.
          </p>
          <p className="mt-3 text-base font-semibold text-orange-800">MICHCHHAMI DUKKADDAM 🙏</p>
          <p className="mt-1 text-sm text-gray-700">Jai Jinendra</p>
          <p className="mt-4 text-sm text-gray-600">
            Pratikraman resources for children, youth and families, available in book, audio and video formats.
          </p>
        </header>

        <section className="mt-6" aria-label="Pratikraman resources">
          {resourceSections.map((section) => (
            <ResourceSection key={section.id} section={section} />
          ))}
        </section>

        <AddResourceForm />
      </div>
    </main>
  );
}
