import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, createDefaultPlayer } from '../models/Player';

const PLAYER_KEY = 'player:v1';

export async function getPlayer(): Promise<Player> {
  try {
    const raw = await AsyncStorage.getItem(PLAYER_KEY);
    if (!raw) return createDefaultPlayer();
    return JSON.parse(raw) as Player;
  } catch (e) {
    console.warn('Failed to load player', e);
    return createDefaultPlayer();
  }
}

export async function savePlayer(player: Player): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  } catch (e) {
    console.warn('Failed to save player', e);
  }
}


