// Pushes today's Navkar count/malas/streak into the native Android widget's
// cache when this app is running inside the Capacitor shell (capacitor.config.ts
// points the WebView at the live production site, so this same web code runs
// both there and on the regular PWA/browser). `window.Capacitor` only exists
// inside the native wrapper, so this is a complete no-op on the normal site —
// the widget itself is documented in android/app/src/main/java/com/navkarsiddhi/app/.

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  Plugins?: {
    NavkarWidgetBridge?: {
      updateWidgetData: (data: {
        todayNavkars: number;
        todayMalas: number;
        streak: number;
      }) => Promise<{ success: boolean }>;
    };
  };
}

const getCapacitor = (): CapacitorGlobal | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
};

export const isNativeShell = (): boolean => {
  const capacitor = getCapacitor();
  return !!(capacitor?.isNativePlatform && capacitor.isNativePlatform());
};

export const syncWidgetData = (data: {
  todayNavkars: number;
  todayMalas: number;
  streak: number;
}): void => {
  if (!isNativeShell()) return;
  try {
    getCapacitor()?.Plugins?.NavkarWidgetBridge?.updateWidgetData(data)?.catch(() => {
      /* ignore — widget just stays on its last-synced value */
    });
  } catch (_) {
    /* ignore */
  }
};
