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
- **Jain Vibes ✨**: AI-powered spiritual affirmations with a resilient fallback system for offline use.
- **Ask the Guru 🙏**: Instant answers for common spiritual questions and AI-powered guidance for deeper inquiries.
- **PWA Support**: Install as a mobile app on iOS/Android devices.
- **Mobile Optimized**: Responsive design with safe area support for mobile webviews.
- **Global Navkar Counter**: Real-time worldwide navkar count with a country heatmap powered by Firebase Firestore.

## Local Development

To run the application locally on your machine:

1.  **Clone the repository**: `git clone https://github.com/saumyasanghvi03/navkarsiddhi`
2.  **Install dependencies**: `npm install`
3.  **Run the dev server**: `npm run dev`
4.  **Access the app**: The application starts on **[http://localhost:9003](http://localhost:9003)**.

## Configuration

To enable AI features (**Jain Vibes** and **Ask the Guru**), configure the following environment variable in Vercel or your local `.env` file:

- `BYTEZ_API_KEY`: Your Bytez API key (for latest gpt-4.1-mini model).
- `GOOGLE_GENAI_API_KEY`: (Optional) Legacy support for Gemini.

> [!NOTE]
> If the API key is not configured, the app will automatically use high-quality **fallback affirmations** to ensure a seamless experience.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values before running locally, or add them in your Vercel project settings before deploying.

### AI Features — required for Jain Vibes & Ask the Guru

| Variable | Description |
|---|---|
| `BYTEZ_API_KEY` | Bytez API key — required for latest AI models |

### Global Navkar Counter — optional (feature is silently disabled when absent)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### Resources submissions (/resources) — required for submission backend

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key for secure submissions |
| `RESOURCE_RATE_LIMIT_MAX_SUBMISSIONS` | Max submissions per IP per window (default: 5) |
| `RESOURCE_RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds (default: 3600000) |
| `RESOURCE_IP_RETENTION_DAYS` | Retention period before IP/user-agent anonymization (default: 90) |

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. In **Settings → Environment Variables**, add at minimum `BYTEZ_API_KEY` (and the Firebase variables if you want the global counter).
4. Deploy — Vercel automatically rebuilds on every push.
