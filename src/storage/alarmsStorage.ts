import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../models/Alarm';

const ALARMS_KEY = 'alarms:v1';

export async function getAlarms(): Promise<Alarm[]> {
  try {
    const raw = await AsyncStorage.getItem(ALARMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Alarm[];
  } catch (e) {
    console.warn('Failed to load alarms', e);
    return [];
  }
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch (e) {
    console.warn('Failed to save alarms', e);
  }
}

export async function upsertAlarm(alarm: Alarm): Promise<void> {
  const alarms = await getAlarms();
  const idx = alarms.findIndex(a => a.id === alarm.id);
  if (idx >= 0) {
    alarms[idx] = alarm;
  } else {
    alarms.push(alarm);
  }
  await saveAlarms(alarms);
}

export async function deleteAlarm(alarmId: string): Promise<void> {
  const alarms = await getAlarms();
  const next = alarms.filter(a => a.id !== alarmId);
  await saveAlarms(next);
}

export async function getAlarmById(alarmId: string): Promise<Alarm | undefined> {
  const alarms = await getAlarms();
  return alarms.find(a => a.id === alarmId);
}


