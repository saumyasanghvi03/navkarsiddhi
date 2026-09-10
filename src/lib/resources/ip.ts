import { headers } from 'next/headers';

const normalizeIp = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withoutPort = trimmed.replace(/^\[?([a-fA-F0-9:.]+)]?(?::\d+)?$/, '$1');
  if (withoutPort === '::1') return '127.0.0.1';
  return withoutPort;
};

export const getRequestIp = async (): Promise<string | null> => {
  const headerStore = await headers();

  const vercelId = headerStore.get('x-vercel-id');
  if (vercelId) {
    const xff = headerStore.get('x-forwarded-for');
    if (xff) {
      const first = xff.split(',')[0]?.trim() ?? '';
      return normalizeIp(first);
    }
  }

  return normalizeIp(headerStore.get('x-real-ip'));
};

export const getRequestUserAgent = async (): Promise<string | null> => {
  const headerStore = await headers();
  const value = headerStore.get('user-agent')?.trim() ?? '';
  return value ? value.slice(0, 1000) : null;
};
