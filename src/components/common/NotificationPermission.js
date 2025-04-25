/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Switch, notification, Space } from "antd";
import { supabase } from "configs/SupabaseConfig";

const NotificationPermission = ({
  size = "default", // Ant Design Switch size: 'small' or 'default'
  label = "Notifications", // Label text
  style = {}, // Custom styles for the Space container
  labelStyle = {}, // Custom styles for the label
  switchStyle = {}, // Custom styles for the Switch
}) => {
  const { session } = useSelector((state) => state.auth);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // VAPID public key
  const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BMr-4WJsZHer9LyiG8KiUy-kSH4RRIAWVLizSihOwN1raQrkLLuWIkilc1RY46B2RaMmxnwzEfDZLL60YYvePFU';

  // Persistent device ID (stored in localStorage)
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  // Check existing subscription on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            setIsNotificationsEnabled(true);
            setSubscription(existingSubscription);
            console.log('[Notifications] Existing subscription found:', existingSubscription.endpoint);
          } else {
            console.log('[Notifications] No existing subscription');
          }
        } catch (error) {
          console.error('[Notifications] Error checking subscription:', error);
        }
      } else {
        console.warn('[Notifications] PushManager not supported in this browser');
      }
    };
    checkSubscription();
  }, []);

  // Open browser notification settings instructions
  const openNotificationSettings = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isChrome = /Chrome|Edg/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !isChrome;

    let description = '';
    if (isIOS) {
      description = 'To enable notifications, go to Settings > Notifications, find your browser, and allow notifications for this app.';
    } else if (isAndroid) {
      description = 'To enable notifications, go to Settings > Apps > [Your Browser] > Notifications, and allow notifications for this app.';
    } else if (isChrome) {
      description = 'To enable notifications, click the menu (three dots) in Chrome, go to Settings > Privacy and Security > Site Settings > Notifications, and allow notifications for this site.';
    } else if (isFirefox) {
      description = 'To enable notifications, click the menu (three lines) in Firefox, go to Settings > Privacy & Security > Permissions > Notifications > Settings, and allow notifications for this site.';
    } else if (isSafari) {
      description = 'To enable notifications, go to Safari > Preferences > Websites > Notifications, and allow notifications for this site.';
    } else {
      description = 'To enable notifications, go to your browser’s settings, find the Notifications or Site Settings section, and allow notifications for this site.';
    }

    notification.info({
      message: 'Enable Notifications',
      description,
      duration: 15, // Longer duration for users to read instructions
    });

    // Attempt platform-specific deep links for mobile (optional, may not work in all browsers)
    if (isIOS) {
      window.location.href = 'App-Prefs:NOTIFICATIONS'; // May not work in Safari
    } else if (isAndroid) {
      window.location.href = 'intent://settings#Intent;scheme=android.settings.APP_NOTIFICATION_SETTINGS;end'; // May not work in all browsers
    }
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    console.log('[Toggle Notifications] Clicked, isNotificationsEnabled:', isNotificationsEnabled);
    if (!session?.user?.id) {
      console.error('[Toggle Notifications] No user session found');
      notification.error({
        message: 'Authentication Required',
        description: 'Please log in to enable notifications.',
      });
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('[Toggle Notifications] Push notifications not supported');
      notification.error({
        message: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
      });
      return;
    }

    // Check if notifications are enabled in app settings
    const notificationsEnabledInSettings = session?.user?.organization?.module_features?.notifications;
    if (!notificationsEnabledInSettings) {
      console.error('[Toggle Notifications] Notifications disabled in app settings');
      notification.error({
        message: 'Notifications Disabled',
        description: 'Notifications are disabled in app settings. Please enable them first.',
      });

      // Remove current device's subscription if exists
      try {
        if (subscription) {
          await subscription.unsubscribe();
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('subscriptions')
            .eq('auth_id', session.user.id)
            .single();

          if (fetchError) {
            console.error('[Toggle Notifications] Supabase fetch error:', fetchError);
            throw fetchError;
          }

          const deviceId = getDeviceId();
          const updatedDevices = userData.subscriptions?.devices?.filter(
            (device) => device.device_id !== deviceId
          ) || [];

          const { error } = await supabase
            .from('users')
            .update({
              subscriptions: {
                ...userData.subscriptions,
                devices: updatedDevices,
              },
            })
            .eq('auth_id', session.user.id);

          if (error) {
            console.error('[Toggle Notifications] Supabase update error:', error);
            throw error;
          }

          setIsNotificationsEnabled(false);
          setSubscription(null);
          console.log('[Toggle Notifications] Device subscription removed due to disabled settings');
        }
      } catch (error) {
        console.error('[Toggle Notifications] Error removing device subscription:', error);
      }
      return;
    }

    if (isNotificationsEnabled) {
      // Disable notifications
      try {
        if (subscription) {
          await subscription.unsubscribe();
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('subscriptions')
            .eq('auth_id', session.user.id)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          const deviceId = getDeviceId();
          const updatedDevices = userData.subscriptions?.devices?.filter(
            (device) => device.device_id !== deviceId
          ) || [];

          const { error } = await supabase
            .from('users')
            .update({
              subscriptions: {
                ...userData.subscriptions,
                devices: updatedDevices,
              },
            })
            .eq('auth_id', session.user.id);

          if (error) {
            throw error;
          }

          setIsNotificationsEnabled(false);
          setSubscription(null);
          notification.success({
            message: 'Notifications Disabled',
            description: 'You will no longer receive push notifications.',
          });
        }
      } catch (error) {
        console.error('[Toggle Notifications] Error disabling notifications:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to disable notifications. Please try again.',
        });
      }
    } else {
      // Enable notifications
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('[Toggle Notifications] Notification permission denied');
          notification.error({
            message: 'Permission Denied',
            description: 'You need to allow notifications to enable this feature.',
            onClose: openNotificationSettings,
          });
          return;
        }

        console.log('[Toggle Notifications] Getting service worker registration');
        let registration;
        try {
          registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)),
          ]);
          console.log('[Toggle Notifications] Service worker ready:', registration.scope);
        } catch (error) {
          console.error('[Toggle Notifications] Service worker error:', error);
          throw new Error(`Failed to get service worker: ${error.message}`);
        }

        console.log('[Toggle Notifications] Subscribing to push notifications');
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('[Toggle Notifications] New subscription:', newSubscription.endpoint);

        console.log('[Toggle Notifications] Checking for existing subscriptions');
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('subscriptions')
          .eq('auth_id', session.user.id)
          .single();

        if (fetchError) {
          console.error('[Toggle Notifications] Supabase fetch error:', fetchError);
          throw fetchError;
        }

        const deviceId = getDeviceId();
        // Remove existing subscription for this device if it exists
        const updatedDevices = userData.subscriptions?.devices?.filter(
          (device) => device.device_id !== deviceId
        ) || [];

        // Add new subscription
        updatedDevices.push({
          endpoint: newSubscription.endpoint,
          keys: {
            p256dh: newSubscription.getKey('p256dh')
              ? btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('p256dh'))))
              : '',
            auth: newSubscription.getKey('auth')
              ? btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('auth'))))
              : '',
          },
          device_id: deviceId,
          created_at: new Date().toISOString(),
        });

        console.log('[Toggle Notifications] Saving subscription to Supabase');
        const { error } = await supabase
          .from('users')
          .update({
            subscriptions: {
              ...userData.subscriptions,
              devices: updatedDevices,
            },
          })
          .eq('auth_id', session.user.id);

        if (error) {
          console.error('[Toggle Notifications] Supabase save error:', error);
          throw error;
        }

        setIsNotificationsEnabled(true);
        setSubscription(newSubscription);
        notification.success({
          message: 'Notifications Enabled',
          description: 'You will now receive push notifications.',
        });
      } catch (error) {
        console.error('[Toggle Notifications] Error enabling notifications:', error);
        notification.error({
          message: 'Error',
          description: `Failed to enable notifications: ${error.message}`,
        });
      }
    }
  };

  return (
    <Space style={{ alignItems: 'center', ...style }}>
      <Switch
        checked={isNotificationsEnabled}
        onChange={toggleNotifications}
        size={size}
        // style={{
        //     backgroundColor: isNotificationsEnabled ? '#1890ff' : '#d9d9d9',
        //     ...switchStyle,
        // }}
      />
            <span style={{ color: isNotificationsEnabled ? '#1890ff' : '#999', ...labelStyle }}>
              {label}{isNotificationsEnabled?" Enabled":" Disabled"}
            </span>
    </Space>
  );
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default NotificationPermission;