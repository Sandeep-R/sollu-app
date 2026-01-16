'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  setupPushNotifications,
  isPushNotificationSupported,
  getNotificationPermission,
} from '@/lib/notifications/subscribe';

interface NotificationPermissionProps {
  userId: string;
  onComplete?: (granted: boolean) => void;
  showSkip?: boolean;
}

export default function NotificationPermission({
  userId,
  onComplete,
  showSkip = true,
}: NotificationPermissionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [wasDenied, setWasDenied] = useState(false);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await setupPushNotifications(userId);

      if (result.success) {
        setPermission('granted');
        setWasDenied(false);
        onComplete?.(true);
      } else {
        setError(result.error || 'Failed to enable notifications');
        setPermission(result.permission);
        if (result.permission === 'denied') {
          setWasDenied(true);
          onComplete?.(false);
        } else {
          setWasDenied(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete?.(false);
  };

  // Don't show if not supported
  if (!isSupported) {
    return null;
  }

  // Don't show if already granted (unless there's an error to show)
  if (permission === 'granted' && !error) {
    return null;
  }
  
  // Don't show if already denied initially (but show if denied after user action with error)
  if (permission === 'denied' && !error && !wasDenied) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enable Notifications</CardTitle>
        <CardDescription>
          Stay updated with your Tamil learning progress and admin replies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            We&apos;ll send you notifications when:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>An admin replies to your sentence submissions</li>
            <li>It&apos;s time for your daily learning reminder (9 AM IST)</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
            {wasDenied && (
              <p className="mt-2">
                You&apos;ve blocked notifications. To enable them, please update your browser
                settings.
              </p>
            )}
          </div>
        )}

        <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
          You can change notification preferences anytime in settings.
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Enabling...' : 'Enable Notifications'}
        </Button>
        {showSkip && (
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
