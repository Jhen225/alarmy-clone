import * as Notifications from 'expo-notifications';
import { Alarm } from '../models/Alarm';
import { getScheduleMap, saveScheduleMap } from '../storage/scheduleMapStorage';

export function parseTimeHHmm(timeHHmm: string): { hour: number; minute: number } {
  const [h, m] = timeHHmm.split(':').map(Number);
  return { hour: h || 0, minute: m || 0 };
}

export function computeNextOccurrence(alarm: Alarm, from: Date = new Date()): Date {
  const { hour, minute } = parseTimeHHmm(alarm.timeHHmm);
  const base = new Date(from);
  base.setSeconds(0, 0);

  const today = base.getDay(); // 0-6
  const targetTimeToday = new Date(base);
  targetTimeToday.setHours(hour, minute, 0, 0);

  if (alarm.repeatDays.length === 0) {
    // One-off: today if in future, else tomorrow
    if (targetTimeToday > base) {
      return targetTimeToday;
    }
    const tomorrow = new Date(targetTimeToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Repeating: find next matching weekday
  const sortedDays = [...alarm.repeatDays].sort();
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(base);
    candidate.setDate(base.getDate() + offset);
    const weekday = candidate.getDay();
    if (!sortedDays.includes(weekday)) continue;
    candidate.setHours(hour, minute, 0, 0);
    if (candidate > base) {
      return candidate;
    }
  }

  // Fallback: one week from now at target time
  const fallback = new Date(targetTimeToday);
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<void> {
  if (!alarm.enabled) return;

  const triggerDate = computeNextOccurrence(alarm);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || 'Alarm',
      body: alarm.timeHHmm,
      data: { alarmId: alarm.id },
      sound: true,
    },
    trigger: triggerDate,
  });

  const map = await getScheduleMap();
  map[alarm.id] = notificationId;
  await saveScheduleMap(map);
}

export async function cancelAlarmNotification(alarmId: string): Promise<void> {
  const map = await getScheduleMap();
  const existing = map[alarmId];
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing);
    delete map[alarmId];
    await saveScheduleMap(map);
  }
}

export async function rescheduleAfterFire(alarm: Alarm): Promise<void> {
  if (!alarm.enabled) return;
  await scheduleAlarmNotification(alarm);
}

export async function scheduleSnooze(
  alarm: Alarm,
  minutes: number,
): Promise<void> {
  const snoozeDate = new Date();
  snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || 'Snoozed alarm',
      body: `Snoozed for ${minutes} minutes`,
      data: { alarmId: alarm.id },
      sound: true,
    },
    trigger: snoozeDate,
  });

  const map = await getScheduleMap();
  map[alarm.id] = notificationId;
  await saveScheduleMap(map);
}


