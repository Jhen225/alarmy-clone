import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { AppNavigation, navigationRef } from './src/navigation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();

      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      const alarmId = lastResponse?.notification.request.content.data
        ?.alarmId as string | undefined;
      if (alarmId && navigationRef.current) {
        navigationRef.current.navigate('AlarmRinging', { alarmId });
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data
        ?.alarmId as string | undefined;
      if (alarmId && navigationRef.current) {
        navigationRef.current.navigate('AlarmRinging', { alarmId });
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigation />
    </>
  );
}
