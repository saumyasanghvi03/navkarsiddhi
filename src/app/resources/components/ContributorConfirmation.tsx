import { formatContributorNumber } from '@/lib/contributors/format';

type ContributorConfirmationProps = {
  contributorNumber: number;
  contributorName: string;
};

export default function ContributorConfirmation({
  contributorNumber,
  contributorName,
}: ContributorConfirmationProps) {
  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900" role="status" aria-live="polite">
      <p>Thank you for contributing to Jain knowledge.</p>
      <p className="mt-1 font-medium">{formatContributorNumber(contributorNumber)}</p>
      <p className="mt-1">Your resource has been submitted for review.</p>
      <p className="mt-1">Contributor: {contributorName}</p>
    </div>
  );
}
