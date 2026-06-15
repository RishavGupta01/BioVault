'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register sw.js placed in the public directory
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('BioVault Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.error('BioVault Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
