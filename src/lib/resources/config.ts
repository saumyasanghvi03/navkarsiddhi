export const RESOURCE_RATE_LIMIT_MAX_SUBMISSIONS = Number.parseInt(
  process.env.RESOURCE_RATE_LIMIT_MAX_SUBMISSIONS ?? '5',
  10,
);

export const RESOURCE_RATE_LIMIT_WINDOW_MS = Number.parseInt(
  process.env.RESOURCE_RATE_LIMIT_WINDOW_MS ?? String(60 * 60 * 1000),
  10,
);

export const RESOURCE_IP_RETENTION_DAYS = Number.parseInt(
  process.env.RESOURCE_IP_RETENTION_DAYS ?? '90',
  10,
);

export const RESOURCE_TITLE_MAX_LENGTH = 200;
