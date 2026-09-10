import { formatContributorNumber } from '@/lib/contributors/format';
import {
  RESOURCE_RATE_LIMIT_MAX_SUBMISSIONS,
  RESOURCE_RATE_LIMIT_WINDOW_MS,
} from './config';
import { supabaseAdmin } from './supabaseAdmin';

const ANONYMOUS_CONTRIBUTOR = 'Anonymous Contributor';

type ContributorRecord = {
  id: string;
  contributor_number: number;
  name: string;
};

type CreateSubmissionInput = {
  contributorNumber?: number;
  name?: string;
  title: string;
  url: string;
  submitterIp: string | null;
  userAgent: string | null;
};

export class ResourceSubmissionError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const displayNameFromContributor = (name: string): string => {
  return name === ANONYMOUS_CONTRIBUTOR ? 'Anonymous' : name;
};

const enforceRateLimit = async (submitterIp: string | null): Promise<void> => {
  if (!submitterIp) return;

  const since = new Date(Date.now() - RESOURCE_RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error } = await supabaseAdmin
    .from('resource_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('submitter_ip', submitterIp)
    .gte('submitted_at', since);

  if (error) {
    throw new ResourceSubmissionError('Unable to submit this resource. Please try again.', 500);
  }

  if ((count ?? 0) >= RESOURCE_RATE_LIMIT_MAX_SUBMISSIONS) {
    throw new ResourceSubmissionError('Too many submissions. Please try again later.', 429);
  }
};

const getContributorByNumber = async (contributorNumber: number): Promise<ContributorRecord> => {
  const { data, error } = await supabaseAdmin
    .from('contributors')
    .select('id, contributor_number, name')
    .eq('contributor_number', contributorNumber)
    .maybeSingle<ContributorRecord>();

  if (error || !data) {
    throw new ResourceSubmissionError('Contributor number not found.', 404);
  }

  return data;
};

const createContributor = async (name?: string): Promise<ContributorRecord> => {
  const contributorName = name || ANONYMOUS_CONTRIBUTOR;
  const { data, error } = await supabaseAdmin
    .from('contributors')
    .insert({ name: contributorName })
    .select('id, contributor_number, name')
    .single<ContributorRecord>();

  if (error || !data) {
    throw new ResourceSubmissionError('Unable to submit this resource. Please try again.', 500);
  }

  return data;
};

export const createResourceSubmission = async ({
  contributorNumber,
  name,
  title,
  url,
  submitterIp,
  userAgent,
}: CreateSubmissionInput): Promise<{
  contributorNumber: number;
  contributorName: string;
  contributorLabel: string;
}> => {
  await enforceRateLimit(submitterIp);

  const contributor = contributorNumber
    ? await getContributorByNumber(contributorNumber)
    : await createContributor(name);

  const { error } = await supabaseAdmin
    .from('resource_submissions')
    .insert({
      contributor_id: contributor.id,
      title,
      url,
      status: 'pending',
      submitter_ip: submitterIp,
      user_agent: userAgent,
    });

  if (error?.code === '23505') {
    throw new ResourceSubmissionError('This resource has already been submitted.', 409);
  }

  if (error) {
    throw new ResourceSubmissionError('Unable to submit this resource. Please try again.', 500);
  }

  return {
    contributorNumber: contributor.contributor_number,
    contributorName: displayNameFromContributor(contributor.name),
    contributorLabel: formatContributorNumber(contributor.contributor_number),
  };
};
