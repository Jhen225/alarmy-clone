import AsyncStorage from '@react-native-async-storage/async-storage';

const MAP_KEY = 'alarmScheduleMap:v1';

export interface AlarmScheduleMap {
  [alarmId: string]: string | undefined; // notificationId
}

export async function getScheduleMap(): Promise<AlarmScheduleMap> {
  try {
    const raw = await AsyncStorage.getItem(MAP_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AlarmScheduleMap;
  } catch (e) {
    console.warn('Failed to load schedule map', e);
    return {};
  }
}

export async function saveScheduleMap(map: AlarmScheduleMap): Promise<void> {
  try {
    await AsyncStorage.setItem(MAP_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save schedule map', e);
  }
}


