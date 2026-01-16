'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getNotSupportedReason,
  setupPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
} from '@/lib/notifications/subscribe'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Notification states
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [hasSubscription, setHasSubscription] = useState(false)

  // Preference states
  const [actionNotifications, setActionNotifications] = useState(true)
  const [scheduledNotifications, setScheduledNotifications] = useState(true)
  const [originalPreferences, setOriginalPreferences] = useState({
    action: true,
    scheduled: true,
  })

  useEffect(() => {
    async function initialize() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      setUserId(user.id)
      setIsSupported(isPushNotificationSupported())
      setPermission(getNotificationPermission())

      // Check if user has a push subscription
      const subscription = await getPushSubscription()
      setHasSubscription(!!subscription)

      // Fetch user's notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (prefs) {
        setActionNotifications(prefs.action_notifications_enabled)
        setScheduledNotifications(prefs.scheduled_notifications_enabled)
        setOriginalPreferences({
          action: prefs.action_notifications_enabled,
          scheduled: prefs.scheduled_notifications_enabled,
        })
      }

      setLoading(false)
    }

    initialize()
  }, [router])

  const handleEnableNotifications = async () => {
    if (!userId) return

    setSaving(true)
    try {
      console.log('[Settings] Starting notification setup...')
      const result = await setupPushNotifications(userId)
      console.log('[Settings] Setup result:', result)

      if (result.success) {
        setPermission('granted')
        setHasSubscription(true)
        alert('Notifications enabled successfully!')
      } else {
        alert(`Failed to enable notifications: ${result.error}`)
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDisableNotifications = async () => {
    setSaving(true)
    try {
      await unsubscribeFromPushNotifications()
      setHasSubscription(false)
    } catch (error) {
      console.error('Error disabling notifications:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!userId) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          action_notifications_enabled: actionNotifications,
          scheduled_notifications_enabled: scheduledNotifications,
        })
        .eq('user_id', userId)

      if (!error) {
        setOriginalPreferences({
          action: actionNotifications,
          scheduled: scheduledNotifications,
        })
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges =
    actionNotifications !== originalPreferences.action ||
    scheduledNotifications !== originalPreferences.scheduled

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your push notification preferences
          </p>
        </div>

        {!isSupported && (
          <Card>
            <CardHeader>
              <CardTitle>Not Supported</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {getNotSupportedReason() || 'Push notifications are not supported in your browser.'}
              </p>
            </CardContent>
          </Card>
        )}

        {isSupported && (
          <>
            {/* iOS PWA Info */}
            {/iPad|iPhone|iPod/.test(navigator.userAgent) && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">📱 iOS Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-800">
                    Make sure you&apos;ve added this app to your Home Screen and opened it from there.
                    Notifications only work when the app is installed as a PWA on iOS.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Browser Notifications</CardTitle>
                <CardDescription>
                  Enable or disable push notifications in your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notification Permission</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {permission === 'granted' ? 'Granted' : permission === 'denied' ? 'Denied' : 'Not requested'}
                    </p>
                  </div>
                  {permission === 'denied' && (
                    <p className="text-sm text-red-600">
                      Please enable in browser settings
                    </p>
                  )}
                </div>

                {permission === 'granted' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        {hasSubscription ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <Button
                      onClick={hasSubscription ? handleDisableNotifications : handleEnableNotifications}
                      variant={hasSubscription ? 'destructive' : 'default'}
                      disabled={saving}
                    >
                      {saving ? 'Processing...' : hasSubscription ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                )}

                {permission === 'default' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Click the button below to request notification permission from your browser.
                    </p>
                    <Button onClick={handleEnableNotifications} disabled={saving} className="w-full">
                      {saving ? 'Requesting Permission...' : 'Request Notification Permission'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which types of notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="action-notifications">Action Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when admins reply to your sentences
                      </p>
                    </div>
                    <Switch
                      id="action-notifications"
                      checked={actionNotifications}
                      onCheckedChange={setActionNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="scheduled-notifications">Daily Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily reminders to complete your Tamil lessons (9 AM IST)
                      </p>
                    </div>
                    <Switch
                      id="scheduled-notifications"
                      checked={scheduledNotifications}
                      onCheckedChange={setScheduledNotifications}
                    />
                  </div>

                  {hasChanges && (
                    <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  )
}
