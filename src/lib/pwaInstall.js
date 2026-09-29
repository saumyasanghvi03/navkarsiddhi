// Two independent fixes for the same underlying problem: personal progress
// (Navkar counts, streaks, history) lives only in this browser's
// localStorage, with no server-side backup by design — so the browser's own
// storage-eviction policy is the only thing that can silently wipe it.
//
// 1. requestPersistentStorage() asks the browser (via the Storage API) to
//    exempt this origin from that eviction. Chrome grants this automatically
//    for sites with reasonable engagement — no user prompt appears.
// 2. The beforeinstallprompt capture below lets a banner offer "Add to Home
//    Screen" — installed PWAs get much stronger persistence guarantees than
//    a bare browser tab on Android.

let deferredInstallPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent('pwaInstallAvailable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
  });
}

export const isRunningStandalone = () => {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const iosStandalone = window.navigator?.standalone === true;
  return !!(mq || iosStandalone);
};

export const hasInstallPromptAvailable = () => !!deferredInstallPrompt;

export const showInstallPrompt = async () => {
  if (!deferredInstallPrompt) return { outcome: 'unavailable' };
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return choice; // { outcome: 'accepted' | 'dismissed' }
};

export const requestPersistentStorage = async () => {
  try {
    if (navigator.storage && navigator.storage.persist) {
      return await navigator.storage.persist();
    }
  } catch (_) {
    /* ignore — nothing actionable if this API is unsupported */
  }
  return false;
};
