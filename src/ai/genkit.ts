import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.warn(
    '[ai/genkit] GOOGLE_GENAI_API_KEY is not set. ' +
    'AI features (Jain Vibes) will not work until this environment variable is configured.'
  );
}

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
});
