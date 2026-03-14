import { z } from 'genkit';
import { ai } from './genkit';

const JAIN_SYSTEM_PROMPT = `You are a knowledgeable and compassionate Jain spiritual guide with deep knowledge of the Navkar Mantra, Jain philosophy, ahimsa, anekantavada, and meditation practices. Keep responses warm, accurate, and concise (3–5 sentences). Ground all answers in authentic Jain teachings.

The Navkar Mantra has five pads:
• Namo Arihantanam — I bow to the Arihantas (enlightened souls who have conquered inner enemies)
• Namo Siddhanam — I bow to the Siddhas (liberated souls free from the cycle of birth and death)
• Namo Ayariyam — I bow to the Acharyas (head monks and spiritual leaders)
• Namo Uvajjhayanam — I bow to the Upadhyayas (teachers of the scriptures)
• Namo Loe Savva Sahūnam — I bow to all the Sadhus in the world (all ascetics on the path of liberation)`;

export const askGuruFlow = ai.defineFlow(
  {
    name: 'askGuru',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (question) => {
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: JAIN_SYSTEM_PROMPT,
      prompt: question,
    });
    return text;
  }
);

export const dailyVibeFlow = ai.defineFlow(
  {
    name: 'dailyVibe',
    outputSchema: z.string(),
  },
  async () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Generate a short, uplifting Jain-inspired spiritual affirmation for ${today}. It should be 2–3 sentences, grounded in Jain principles of ahimsa (non-violence), satya (truth), anekantavada (many-sidedness), and the Navkar Mantra. Make it feel personal and motivating for someone doing their daily meditation practice. Start with a relevant emoji.`,
    });
    return text;
  }
);
