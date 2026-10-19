// On-device AI bridge for Soul Mate — wraps the native SoulMateAIPlugin
// (MediaPipe LLM Inference + Gemma 2B). Falls back gracefully when running
// in a browser or when the model hasn't been downloaded yet.

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  Plugins?: {
    SoulMateAI?: {
      getStatus: () => Promise<{
        modelReady: boolean;
        modelExists: boolean;
        modelSizeMB: number;
        downloadProgress: number;
      }>;
      downloadModel: () => Promise<{ status: string }>;
      loadModel: () => Promise<{ status: string }>;
      generate: (opts: {
        systemPrompt?: string;
        userMessage: string;
      }) => Promise<{ text: string }>;
      addListener: (
        event: string,
        cb: (data: { progress: number }) => void,
      ) => Promise<{ remove: () => void }>;
    };
  };
}

const getPlugin = () => {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  return cap.Plugins?.SoulMateAI ?? null;
};

export const isAIAvailable = (): boolean => !!getPlugin();

export async function getAIStatus() {
  const plugin = getPlugin();
  if (!plugin) return { modelReady: false, modelExists: false, modelSizeMB: 0, downloadProgress: 0 };
  try {
    return await plugin.getStatus();
  } catch {
    return { modelReady: false, modelExists: false, modelSizeMB: 0, downloadProgress: 0 };
  }
}

export async function downloadAIModel(
  onProgress?: (pct: number) => void,
): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    let listener: { remove: () => void } | null = null;
    if (onProgress) {
      listener = await plugin.addListener('downloadProgress', (data) => {
        onProgress(data.progress);
      });
    }
    await plugin.downloadModel();
    listener?.remove();
    return true;
  } catch {
    return false;
  }
}

export async function loadAIModel(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    await plugin.loadModel();
    return true;
  } catch {
    return false;
  }
}

export async function generateResponse(
  userMessage: string,
  systemPrompt?: string,
): Promise<string | null> {
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    const result = await plugin.generate({ userMessage, systemPrompt });
    return result.text;
  } catch {
    return null;
  }
}

// Convenience: ensure model is downloaded + loaded, returns true when ready
export async function ensureAIReady(
  onProgress?: (pct: number) => void,
): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;

  const status = await getAIStatus();
  if (status.modelReady) return true;

  if (!status.modelExists) {
    const downloaded = await downloadAIModel(onProgress);
    if (!downloaded) return false;
  }

  return await loadAIModel();
}
