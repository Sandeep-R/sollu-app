'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getPushSubscription,
} from '@/lib/notifications/subscribe';

/**
 * Banner that prompts existing users to enable push notifications
 * Shows only if:
 * - Browser supports notifications
 * - User hasn't granted permission yet OR has no active subscription
 * - User hasn't dismissed the banner
 */
export default function NotificationPromptBanner() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkNotificationStatus() {
      try {
        // Check if dismissed before
        const dismissed = localStorage.getItem('notification-banner-dismissed');
        if (dismissed === 'true') {
          setIsChecking(false);
          return;
        }

        // Check browser support
        if (!isPushNotificationSupported()) {
          setIsChecking(false);
          return;
        }

        const permission = getNotificationPermission();

        // If permission denied, don't show banner
        if (permission === 'denied') {
          setIsChecking(false);
          return;
        }

        // If permission granted, check if user has an active subscription
        if (permission === 'granted') {
          const subscription = await getPushSubscription();
          if (subscription) {
            // User already has notifications enabled
            setIsChecking(false);
            return;
          }
        }

        // Show banner: permission not granted OR no active subscription
        setShowBanner(true);
      } catch (error) {
        console.error('Error checking notification status:', error);
      } finally {
        setIsChecking(false);
      }
    }

    checkNotificationStatus();
  }, []);

  const handleEnableClick = () => {
    router.push('/setup-notifications');
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (isChecking || !showBanner) {
    return null;
  }

  return (
    <Card className="mx-4 my-4 p-4 bg-blue-50 border-blue-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">
            Enable Push Notifications
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Get notified when admins reply to your sentences and receive daily learning reminders at 9 AM IST.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleEnableClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Enable
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-700"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}
