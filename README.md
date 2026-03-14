# Navkar Siddhi Tap

A meditative tapping app to help improve focus by writing a mantra word-by-word, with AI-powered spiritual guidance and a real-time global counter.

## How to Use

- Tap anywhere on the screen to reveal the next word of the mantra.
- The app provides haptic feedback on each tap.
- Once a mantra is complete, your total count increases.
- Progress is tracked on the circular Mala ring.
- Your total count is saved automatically in your browser.
- Use the **Bhakti Music** button to play devotional YouTube tracks.
- Use **Mala Reset** (orange button) to restart your current mala without losing completed malas.
- Use **Lock Mode** to hide all controls for distraction-free practice.

## Features

- **Sequential Mantra Display**: Reveals one word at a time.
- **Mala Tracker**: Visual representation of mala progress with 9, 27, 36, or 108 beads.
- **Dynamic Themes**: Changes color themes upon mala completion.
- **Haptic Feedback**: Vibration feedback for taps and completions.
- **Data Persistence**: Saves progress in localStorage.
- **Bhakti Music**: Integrated devotional music player with YouTube tracks.
- **Mala Reset**: Reset current mala progress while preserving completed mala count.
- **Lock Mode**: Hide controls for focused, distraction-free meditation.
- **PWA Support**: Install as a mobile app on iOS/Android devices.
- **Mobile Optimized**: Responsive design with safe area support for mobile webviews.
- **AI-Powered Jain Vibes**: Daily spiritual affirmations and a "Ask the Guru" Q&A powered by Google Gemini AI.
- **Global Navkar Counter**: Real-time worldwide navkar count with a country heatmap powered by Firebase Firestore.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values before running locally, or add them in your Vercel project settings before deploying.

### AI Features — required for Jain Vibes & Ask the Guru

| Variable | Description |
|---|---|
| `GOOGLE_GENAI_API_KEY` | Google Gemini API key — get one at [Google AI Studio](https://aistudio.google.com/app/apikey) |

### Global Navkar Counter — optional (feature is silently disabled when absent)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

## Development Setup

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # starts Next.js on http://localhost:9003
```

To develop AI flows interactively:

```bash
npm run genkit:dev
```

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. In **Settings → Environment Variables**, add at minimum `GOOGLE_GENAI_API_KEY` (and the Firebase variables if you want the global counter).
4. Deploy — Vercel automatically rebuilds on every push.

