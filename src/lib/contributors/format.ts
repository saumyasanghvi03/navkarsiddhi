export const formatContributorNumber = (contributorNumber: number): string => {
  return `Contributor #${String(contributorNumber).padStart(6, '0')}`;
};
