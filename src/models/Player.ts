export interface Player {
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  streakDays: number;
  lastSuccessDate?: string; // ISO date (yyyy-mm-dd)
  totalWakes: number;
}

export const createDefaultPlayer = (): Player => ({
  level: 1,
  xp: 0,
  xpToNext: 100 + 1 * 50,
  coins: 0,
  streakDays: 0,
  totalWakes: 0,
});


