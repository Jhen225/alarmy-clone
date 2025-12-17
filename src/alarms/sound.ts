import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

let sound: Audio.Sound | null = null;

async function ensureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    playThroughEarpieceAndroid: false,
  });
}

export async function startAlarmLoop() {
  try {
    await ensureAudioMode();
    if (!sound) {
      const { sound: created } = await Audio.Sound.createAsync(
        // Simple remote sound so the example runs without bundling extra assets
        {
          uri: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
        },
        {
          isLooping: true,
          volume: 1.0,
        },
      );
      sound = created;
    }

    await sound.setIsLoopingAsync(true);
    await sound.playAsync();
  } catch (e) {
    console.warn('Failed to start alarm sound', e);
  }
}

export async function stopAlarmLoop() {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (e) {
    console.warn('Failed to stop alarm sound', e);
  }
}


