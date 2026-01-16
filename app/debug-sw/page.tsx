'use client';

import { useEffect, useState } from 'react';

export default function DebugSWPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [swStatus, setSwStatus] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔵 Debug page loaded');

    async function checkSW() {
      addLog('🔵 Checking service worker support...');

      if (typeof window === 'undefined') {
        addLog('❌ Not in browser environment');
        return;
      }

      if (!('serviceWorker' in navigator)) {
        addLog('❌ Service workers NOT supported');
        return;
      }

      addLog('✅ Service workers are supported');
      addLog(`📍 Current URL: ${window.location.href}`);
      addLog(`🔒 Secure context: ${window.isSecureContext}`);

      // Check if SW file is accessible
      try {
        addLog('🔵 Checking if /sw.js is accessible...');
        const response = await fetch('/sw.js', { method: 'HEAD', cache: 'no-store' });
        addLog(`✅ /sw.js accessible: ${response.status} ${response.statusText}`);
        addLog(`📋 Content-Type: ${response.headers.get('content-type')}`);
      } catch (error) {
        addLog(`❌ Error fetching /sw.js: ${error}`);
      }

      // Check existing registration
      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (registration) {
          addLog('✅ Service worker already registered');
          setSwStatus({
            scope: registration.scope,
            active: registration.active?.scriptURL || 'None',
            installing: registration.installing?.scriptURL || 'None',
            waiting: registration.waiting?.scriptURL || 'None',
          });
        } else {
          addLog('⚠️ No service worker registered');
        }
      } catch (error) {
        addLog(`❌ Error checking registration: ${error}`);
      }

      // Try to register
      try {
        addLog('🔵 Attempting to register service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        addLog('✅ Service worker registration initiated');
        setSwStatus({
          scope: registration.scope,
          active: registration.active?.scriptURL || 'None',
          installing: registration.installing?.scriptURL || 'None',
          waiting: registration.waiting?.scriptURL || 'None',
        });

        // Wait for ready
        await navigator.serviceWorker.ready;
        addLog('✅ Service worker is ready');
      } catch (error) {
        addLog(`❌ Error registering service worker: ${error}`);
      }
    }

    checkSW();
  }, []);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Service Worker Debug</h1>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Service Worker Status</h2>
          {swStatus ? (
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(swStatus, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">Checking...</p>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="bg-muted p-4 rounded max-h-96 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No logs yet...</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="text-foreground">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-900">
            <strong>Instructions:</strong> Open your browser&apos;s DevTools (F12) and check the Console tab.
            You should see logs starting with 🔵, ✅, or ❌.
          </p>
        </div>
      </div>
    </main>
  );
}
