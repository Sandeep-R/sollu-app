'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestNotificationsPage() {
  const [status, setStatus] = useState<{
    swSupported: boolean;
    swRegistered: boolean;
    swActive: boolean;
    permission: NotificationPermission;
    subscription: boolean;
    error?: string;
  }>({
    swSupported: false,
    swRegistered: false,
    swActive: false,
    permission: 'default',
    subscription: false,
  });

  useEffect(() => {
    async function checkStatus() {
      const newStatus: {
        swSupported: boolean;
        swRegistered: boolean;
        swActive: boolean;
        permission: NotificationPermission;
        subscription: boolean;
        error?: string;
      } = {
        swSupported: false,
        swRegistered: false,
        swActive: false,
        permission: 'default' as NotificationPermission,
        subscription: false,
      };

      // Check if service workers are supported
      newStatus.swSupported = 'serviceWorker' in navigator;

      if (newStatus.swSupported) {
        try {
          // Check if service worker is registered
          const registration = await navigator.serviceWorker.getRegistration('/');
          newStatus.swRegistered = !!registration;

          if (registration) {
            newStatus.swActive = registration.active !== null;

            // Check if we have a push subscription
            const sub = await registration.pushManager.getSubscription();
            newStatus.subscription = !!sub;
          }
        } catch (error) {
          newStatus.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // Check notification permission
      if ('Notification' in window) {
        newStatus.permission = Notification.permission;
      }

      setStatus(newStatus);
    }

    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegisterSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service worker registered:', registration);
      window.location.reload();
    } catch (error) {
      alert('Failed to register service worker: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSendTestNotification = async () => {
    const response = await fetch('/api/notifications/test-send');
    const data = await response.json();
    alert(JSON.stringify(data, null, 2));
  };

  const handleShowNotificationDirectly = () => {
    if (Notification.permission === 'granted') {
      new Notification('Direct Test Notification', {
        body: 'This is sent directly without service worker',
        icon: '/icon-192.png',
      });
    } else {
      alert('Notification permission not granted');
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Notification Diagnostics</h1>

        <Card>
          <CardHeader>
            <CardTitle>Service Worker Status</CardTitle>
            <CardDescription>Check if service worker is working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Service Worker Supported:</div>
              <div className={status.swSupported ? 'text-green-600' : 'text-red-600'}>
                {status.swSupported ? '✅ Yes' : '❌ No'}
              </div>

              <div>Service Worker Registered:</div>
              <div className={status.swRegistered ? 'text-green-600' : 'text-red-600'}>
                {status.swRegistered ? '✅ Yes' : '❌ No'}
              </div>

              <div>Service Worker Active:</div>
              <div className={status.swActive ? 'text-green-600' : 'text-red-600'}>
                {status.swActive ? '✅ Yes' : '❌ No'}
              </div>

              <div>Notification Permission:</div>
              <div className={status.permission === 'granted' ? 'text-green-600' : 'text-yellow-600'}>
                {status.permission === 'granted' ? '✅ Granted' : `⚠️ ${status.permission}`}
              </div>

              <div>Push Subscription:</div>
              <div className={status.subscription ? 'text-green-600' : 'text-red-600'}>
                {status.subscription ? '✅ Active' : '❌ None'}
              </div>
            </div>

            {status.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                Error: {status.error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Test different notification methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!status.swRegistered && (
              <Button onClick={handleRegisterSW} className="w-full">
                Register Service Worker
              </Button>
            )}

            <Button onClick={handleShowNotificationDirectly} variant="outline" className="w-full">
              Show Notification Directly (No SW)
            </Button>

            <Button onClick={handleSendTestNotification} variant="outline" className="w-full">
              Send Test Push Notification
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Results</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>✅ All checks should be green</p>
            <p>✅ &ldquo;Show Notification Directly&rdquo; should show a notification immediately</p>
            <p>✅ &ldquo;Send Test Push Notification&rdquo; should show a notification via service worker</p>
            <p className="mt-4 text-muted-foreground">
              If service worker is not registered or active, click &ldquo;Register Service Worker&rdquo;
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
