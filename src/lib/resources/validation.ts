import { z } from 'zod';
import { RESOURCE_TITLE_MAX_LENGTH } from './config';

const stripControlChars = (value: string) => value.replace(/[\u0000-\u001F\u007F]/g, '');

const titleSchema = z
  .string()
  .transform((value) => stripControlChars(value.trim()))
  .refine((value) => value.length > 0, {
    message: 'Please enter a resource title.',
  })
  .refine((value) => value.length <= RESOURCE_TITLE_MAX_LENGTH, {
    message: 'Please enter a resource title.',
  });

const urlSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, {
    message: 'Please enter a valid web link.',
  })
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, {
    message: 'Please enter a valid web link.',
  });

const contributorSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '')
  .transform((value) => value.replace(/^#/, ''))
  .refine((value) => value === '' || /^\d+$/.test(value), {
    message: 'Contributor number not found.',
  })
  .transform((value) => {
    if (!value) return undefined;
    const normalized = value.replace(/^0+/, '') || '0';
    return Number.parseInt(normalized, 10);
  })
  .refine((value) => value === undefined || (Number.isFinite(value) && value > 0), {
    message: 'Contributor number not found.',
  });

export const submitResourceSchema = z.object({
  name: z
    .string()
    .optional()
    .transform((value) => stripControlChars((value ?? '').trim()))
    .transform((value) => value.slice(0, 120)),
  contributorNumber: contributorSchema,
  title: titleSchema,
  url: urlSchema,
  honeypot: z.string().optional().transform((value) => value?.trim() ?? ''),
});

export type SubmitResourceInput = z.infer<typeof submitResourceSchema>;
