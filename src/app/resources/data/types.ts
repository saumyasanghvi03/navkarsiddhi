export type ResourceFormat = 'book' | 'audio' | 'video' | 'article' | 'document' | 'external';
export type ResourceStatus = 'approved' | 'pending' | 'rejected';

export type Resource = {
  id: string;
  title: string;
  category: string;
  format: ResourceFormat;
  url: string;
  year?: number;
  tags?: string[];
  featured?: boolean;
  status?: ResourceStatus;
  contributorId?: string;
};

export type ResourceSection = {
  id: string;
  title: string;
  resources: Resource[];
};
