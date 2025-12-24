export type AlarmDifficulty = 'easy' | 'med' | 'hard';

export interface Alarm {
  id: string;
  timeHHmm: string; // "HH:mm" (24-hour format)
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0-6, Sunday = 0
  soundId: string;
  volume: number; // 0-1
  snoozeEnabled: boolean;
  snoozeMinutes: number;
  snoozeMax: number;
  difficulty: AlarmDifficulty;
  snoozeCount?: number;
}

// Utility functions for 12-hour format conversion
export function time24To12(timeHHmm: string): { hour12: number; minute: number; ampm: 'AM' | 'PM' } {
  const [h, m] = timeHHmm.split(':').map(Number);
  const hour24 = h || 0;
  const minute = m || 0;
  
  if (hour24 === 0) {
    return { hour12: 12, minute, ampm: 'AM' };
  } else if (hour24 === 12) {
    return { hour12: 12, minute, ampm: 'PM' };
  } else if (hour24 < 12) {
    return { hour12: hour24, minute, ampm: 'AM' };
  } else {
    return { hour12: hour24 - 12, minute, ampm: 'PM' };
  }
}

export function time12To24(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let hour24 = hour12;
  if (ampm === 'AM' && hour12 === 12) {
    hour24 = 0;
  } else if (ampm === 'PM' && hour12 !== 12) {
    hour24 = hour12 + 12;
  }
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}


