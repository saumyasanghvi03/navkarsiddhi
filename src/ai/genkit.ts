import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

export const ai = genkit({
  plugins: [googleAI(apiKey ? { apiKey } : undefined)],
});
