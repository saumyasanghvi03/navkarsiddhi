import type { ResourceSection as ResourceSectionType } from '../data/types';
import ResourceRow from './ResourceRow';

type ResourceSectionProps = {
  section: ResourceSectionType;
};

export default function ResourceSection({ section }: ResourceSectionProps) {
  return (
    <section aria-labelledby={section.id} className="mt-6">
      <h2 id={section.id} className="text-base font-serif font-semibold text-orange-900 mb-2">
        {section.title}
      </h2>
      <ul className="rounded-lg border border-orange-100 bg-white px-3">
        {section.resources.map((resource) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </ul>
    </section>
  );
}
