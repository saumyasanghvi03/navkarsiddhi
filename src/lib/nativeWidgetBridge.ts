// Pushes today's Navkar count/malas/streak into the native Android widget's
// cache when this app is running inside the Capacitor shell (capacitor.config.ts
// bundles a static build into the APK — see scripts/build-capacitor-export.mjs —
// so this same web source ships both there and on the regular PWA/browser).
// `window.Capacitor` only exists inside the native wrapper, so this is a
// complete no-op on the normal site — the widget itself is documented in
// android/app/src/main/java/com/navkarsiddhi/app/.

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

// NavBar is `fixed top-0` with `padding-top: env(safe-area-inset-top)`, so
// its real height is that inset + 3rem. Every full-page view sits below it in
// normal document flow with a plain `pt-16` (4rem) to clear it — correct on
// the web, where that inset is 0, but the APK's WebView draws edge-to-edge
// behind the Android status bar, where the inset is real and non-zero, so a
// flat 4rem no longer clears the nav bar there and its content clips under
// it. Pass this in place of a hardcoded `pt-16` on any such page container.
export const pageTopPaddingClass = (): string =>
  isNativeShell() ? 'pt-[calc(4rem+env(safe-area-inset-top))]' : 'pt-16';

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
