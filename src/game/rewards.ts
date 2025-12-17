import { Alarm } from '../models/Alarm';
import { Player } from '../models/Player';

export function getRewardForAlarm(alarm: Alarm): { xp: number; coins: number } {
  switch (alarm.difficulty) {
    case 'easy':
      return { xp: 20, coins: 5 };
    case 'med':
      return { xp: 35, coins: 8 };
    case 'hard':
      return { xp: 50, coins: 12 };
    default:
      return { xp: 10, coins: 2 };
  }
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function applyAlarmSuccess(
  player: Player,
  alarm: Alarm,
  now: Date = new Date(),
): Player {
  const reward = getRewardForAlarm(alarm);
  let xp = player.xp + reward.xp;
  let level = player.level;
  let xpToNext = player.xpToNext;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = 100 + level * 50;
  }

  const todayStr = formatDateOnly(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateOnly(yesterday);

  let streakDays = player.streakDays;
  if (!player.lastSuccessDate) {
    streakDays = 1;
  } else if (player.lastSuccessDate === todayStr) {
    // unchanged
  } else if (player.lastSuccessDate === yesterdayStr) {
    streakDays += 1;
  } else {
    streakDays = 1;
  }

  return {
    ...player,
    level,
    xp,
    xpToNext,
    coins: player.coins + reward.coins,
    streakDays,
    lastSuccessDate: todayStr,
    totalWakes: player.totalWakes + 1,
  };
}


