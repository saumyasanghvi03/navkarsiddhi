import { BookOpen, Headphones, PlayCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Resource } from '../data/types';

const formatToCta: Record<Resource['format'], string> = {
  book: 'Book',
  audio: 'Listen',
  video: 'Watch',
  article: 'Read',
  document: 'Open',
  external: 'Open',
};

const formatToIcon: Record<Resource['format'], ComponentType<{ className?: string }>> = {
  book: BookOpen,
  audio: Headphones,
  video: PlayCircle,
  article: BookOpen,
  document: BookOpen,
  external: BookOpen,
};

type ResourceRowProps = {
  resource: Resource;
};

export default function ResourceRow({ resource }: ResourceRowProps) {
  const Icon = formatToIcon[resource.format];
  const cta = formatToCta[resource.format];

  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b border-orange-100 last:border-b-0">
      <div className="min-w-0 flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-700 shrink-0" aria-hidden="true" />
        <span className="text-sm text-gray-800 truncate">{resource.title}</span>
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center rounded-full border border-orange-300 px-3 py-1 text-xs font-medium text-orange-800 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
        aria-label={`${cta} ${resource.title}`}
      >
        {cta}
      </a>
    </li>
  );
}
