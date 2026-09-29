import { z } from 'genkit';
import { ai } from './genkit';
import Bytez from 'bytez.js';

const bytez = new Bytez(process.env.BYTEZ_API_KEY || '');
const model = bytez.model("openai/gpt-4.1-mini");

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
  async (question: string) => {
    try {
      const results = await model.run([
        { role: "system", content: JAIN_SYSTEM_PROMPT },
        { role: "user", content: question }
      ]);

      if (results.error) {
        console.error('Bytez Guru Error:', results.error);
        return GURU_FALLBACK_RESPONSE;
      }

      return results.output;
    } catch (err) {
      console.error('Bytez Guru Exception:', err);
      return GURU_FALLBACK_RESPONSE;
    }
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
    
    try {
      const results = await model.run([
        { 
          role: "user", 
          content: `Generate a short, uplifting Jain-inspired vibe check for ${today}. It should be 2–3 sentences, grounded in Jain principles of ahimsa (non-violence), satya (truth), anekantavada (many-sidedness), and the Navkar Mantra. Keep the tone modern and relatable for Jain GenZ while staying spiritually respectful. Make it feel personal and motivating for someone doing their daily meditation practice. Start with a relevant emoji.`
        }
      ]);

      if (results.error) {
        console.error('Bytez Vibe Error:', results.error);
        return JAIN_FALLBACK_VIBES[Math.floor(Math.random() * JAIN_FALLBACK_VIBES.length)];
      }

      return results.output;
    } catch (err) {
      console.error('Bytez Vibe Exception:', err);
      return JAIN_FALLBACK_VIBES[Math.floor(Math.random() * JAIN_FALLBACK_VIBES.length)];
    }
  }
);

export const JAIN_FALLBACK_VIBES = [
  "✨ Peace begins with a single thought of forgiveness. Today, let go of any burdens and embrace the purity of your soul. Jai Jinendra!",
  "🌅 Every breath is an opportunity to practice Ahimsa. May your day be filled with kindness towards all living beings, including yourself.",
  "🙏 True strength lies in self-restraint and equanimity. Stay centered in your meditation and find the quiet power within the Navkar Mantra.",
  "✨ Focus on the present moment with Anekantavada—recognizing that every situation has many perspectives. Stay open, stay peaceful.",
  "🧘 Your soul is infinite and pure. Like the Siddhas, you have the potential for ultimate liberation. Carry this light with you today.",
  "🌅 Practice Satya (truthfulness) in your thoughts and words today. A clear mind leads to a peaceful heart. Happy Meditating!",
  "✨ The Navkar Mantra is your spiritual compass. Let its vibrations steady your mind and bring focus to your daily practice.",
  "🔥 Jain GenZ reminder: real glow-up starts within. Choose ahimsa in your words, calm in your reactions, and clarity in your intention today.",
  "💫 Keep your vibe sattvic and your focus sharp. One mindful Navkar mala today can reset the noise and reconnect you to your highest self.",
  "🌿 Soft heart, strong discipline. Walk lightly, speak truthfully, and let Aparigraha free your mind from unnecessary baggage.",
  "🕊️ Pause before every reaction today. In that one breath, choose compassion over ego and your whole day shifts toward shanti.",
  "✨ JainZ check-in: protect your peace, reduce kashayas, and move with maitri for every living being you meet today.",
  "🌱 Ahimsa isn't just avoiding harm—it's actively choosing kindness in every small interaction today. Even your inner dialogue deserves compassion.",
  "🪷 Like a lotus rising clean through muddy water, rise above today's chaos without carrying its stain. Stay rooted, stay pure.",
  "⚖️ Samatva (equanimity) is the real flex—same calm whether you're winning or losing today. That's true Jain strength.",
  "🌙 Before sleep tonight, do a mini Pratikraman in your head: what did you get right, what needs fixing? Growth is a daily rep, not a one-time event.",
  "🍃 Aparigraha check: do your things serve you, or do they own your headspace? Declutter one thing today—physical or mental.",
  "🔥 Tap (austerity) isn't punishment—it's training. Every small discipline today, a skipped snack, a held tongue, builds the willpower for liberation.",
  "🕉️ Karma isn't karma-police, it's cause and effect you're actively writing. Choose your actions like your future self is watching—because they are.",
  "🙌 Kshamapana energy: reach out to one person today and mean it—\"Micchami Dukkadam.\" Forgiveness given and received is the lightest you'll ever feel.",
  "🌸 The Tirthankaras didn't skip the hard parts—they walked through them with clarity. Your struggles today are also part of the path.",
  "📿 Swadhyaya (self-study) hits different: 10 minutes reflecting on your own dharma beats an hour of doomscrolling. Feed your soul first.",
  "🐦 Jiv Daya isn't a once-a-year activity—it's a lifestyle. Every meal, every choice, ask: does this reduce harm? Small shifts, big compassion.",
  "💧 Water your roots today: one Navkar mala, one honest reflection, one kind word. That's all the \"productivity\" your soul actually needs.",
  "🌾 Anekantavada reminder: the person who annoyed you today probably sees it completely differently—and that's okay. Truth has many faces.",
  "🕊️ Brahmacharya isn't outdated—it's about channeling your energy with intention instead of scattering it everywhere. Focus is sacred.",
  "🌟 Moksha isn't a someday goal, it's built from today's choices. One less kashaya—anger, ego, deceit, or greed—one step closer.",
  "🪔 Light a mental diya for someone who's struggling today. Maitri (universal friendship) means their peace matters as much as yours.",
  "🌿 Asteya goes beyond \"don't steal\"—don't steal someone's time, credit, or peace either. Give what's due, take only what's offered.",
  "🧘‍♀️ Your body is a temple for the soul, not a project to perfect. Move through today with gratitude, not judgment."
];

export const QUICK_ANSWERS: Record<string, string> = {
  "What does Namo Arihantanam mean?": "Namo Arihantanam means \"I bow to the Arihantas.\" Arihantas are enlightened souls who have conquered their inner enemies like anger, greed, ego, and deceit. They have shown us the path to liberation while still possessing a physical body. 🙏",
  "What does Namo Siddhanam mean?": "Namo Siddhanam means \"I bow to the Siddhas.\" Siddhas are liberated souls who are completely free from the cycle of birth and death. They reside in Siddhashila, the peak of the universe, in a state of eternal bliss and pure consciousness. ✨",
  "How many malas should I do daily?": "While there is no fixed rule, doing at least one mala (108 repetitions) of the Navkar Mantra daily is a common practice to maintain spiritual discipline. Many devotees perform 5, 11, or more malas depending on their personal commitment and time. 🧘",
  "What is the significance of 108 beads?": "108 beads represent the 108 qualities of the five supreme beings (Panch Parmeshti): 12 of Arihantas, 8 of Siddhas, 36 of Acharyas, 25 of Upadhyayas, and 27 of Sadhus. It is a symbol of completeness and spiritual devotion. ✨",
  "How do I focus during meditation?": "To focus during meditation, sit in a stable posture, close your eyes, and concentrate on the vibrations of each word of the Navkar Mantra. Practice rhythmic breathing and witness your thoughts without judgment, gently bringing your focus back to the mantra whenever the mind wanders. 🙏",
  "What are the five Jain principles?": "The five fundamental Jain principles (Mahavratas/Anuvratas) are: Ahimsa (Non-violence), Satya (Truthfulness), Asteya (Non-stealing), Brahmacharya (Chastity/Purity), and Aparigraha (Non-attachment). These guide a soul towards purity and liberation. 🕊️"
};

export const GURU_FALLBACK_RESPONSE = "I am currently in deep meditation and unable to respond. Please reflect on the Navkar Mantra and try asking again in a few moments. 🙏";
