export type AlarmDifficulty = 'easy' | 'med' | 'hard';

export interface Alarm {
  id: string;
  timeHHmm: string; // "HH:mm"
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


