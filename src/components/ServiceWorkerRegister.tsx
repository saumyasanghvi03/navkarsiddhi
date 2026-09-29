'use client';

import { useEffect } from 'react';
// Importing this attaches its module-level `beforeinstallprompt` listener as
// early as possible (see src/lib/pwaInstall.js) — this is the earliest-mounting
// component in the app (rendered directly in the root layout).
import { requestPersistentStorage } from '@/lib/pwaInstall';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        // Ask the browser to exempt this origin from storage eviction, so a
        // long-idle period can't silently clear a user's Navkar history —
        // fire-and-forget, no UI either way (Chrome grants this silently for
        // sites with reasonable engagement; there's nothing actionable to
        // show the user if it's declined).
        requestPersistentStorage();

        if (!('serviceWorker' in navigator)) return;

        // Register service worker on all environments (including localhost for dev/testing)
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered with scope:', registration.scope);

                // Check for updates periodically
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') {
                                console.log('New ServiceWorker activated');
                            }
                        });
                    }
                });
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed:', err);
            });
    }, []);

    return null;
}
