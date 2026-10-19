"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "navkar_apk_banner_dismissed";

export default function ApkDownloadBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on web (not inside Capacitor native shell)
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isNative = cap?.isNativePlatform?.() ?? false;
    if (isNative) return;

    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch { /* ignore */ }

    setVisible(true);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ background: "#e06400" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">📿</span>
          <p className="text-white text-xs font-medium leading-snug">
            Your full spiritual companion lives here.
            <br />
            <span className="opacity-85">Offline navkar · widgets · parva alerts</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/navkar-siddhi.apk"
            download="NavkarSiddhi.apk"
            className="bg-white text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
            onClick={dismiss}
          >
            Download free
          </a>
          <button
            onClick={dismiss}
            className="text-white/70 hover:text-white text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
