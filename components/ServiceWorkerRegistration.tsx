'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * 
 * Automatically registers the service worker when the app loads
 * This ensures push notifications work even if the user hasn't explicitly enabled them yet
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    async function registerSW() {
      // Only register in browser environment
      if (typeof window === 'undefined') return;

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.log('[SW Registration] Service workers not supported');
        return;
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        console.warn('[SW Registration] Not in secure context - service workers require HTTPS');
        return;
      }

      try {
        // Check if service worker is already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration('/');
        
        if (existingRegistration) {
          console.log('[SW Registration] Service worker already registered:', {
            scope: existingRegistration.scope,
            active: existingRegistration.active?.scriptURL,
          });
          
          // Check for updates
          try {
            await existingRegistration.update();
            console.log('[SW Registration] Service worker updated');
          } catch (updateError) {
            console.log('[SW Registration] No update available');
          }
          return;
        }

        // Verify service worker file is accessible
        try {
          const response = await fetch('/sw.js', { 
            method: 'HEAD',
            cache: 'no-store' 
          });
          
          if (!response.ok) {
            console.error(`[SW Registration] Service worker file not accessible: ${response.status} ${response.statusText}`);
            return;
          }
          
          console.log('[SW Registration] Service worker file is accessible');
        } catch (fetchError) {
          console.error('[SW Registration] Error checking service worker file:', fetchError);
          return;
        }

        // Register the service worker
        console.log('[SW Registration] Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW Registration] Service worker registered successfully:', {
          scope: registration.scope,
          installing: registration.installing?.scriptURL,
          waiting: registration.waiting?.scriptURL,
          active: registration.active?.scriptURL,
        });

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('[SW Registration] Service worker is ready');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('[SW Registration] Service worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW Registration] New service worker installed, reloading...');
                // Optionally reload the page to activate the new service worker
                // window.location.reload();
              }
            });
          }
        });

      } catch (error) {
        console.error('[SW Registration] Error registering service worker:', error);
      }
    }

    // Register service worker after a short delay to avoid blocking page load
    const timeoutId = setTimeout(() => {
      registerSW();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null; // This component doesn't render anything
}
