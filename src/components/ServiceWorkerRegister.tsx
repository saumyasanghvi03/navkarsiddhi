'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
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
