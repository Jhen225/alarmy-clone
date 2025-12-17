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

// Use an MP3 format that works on both iOS and Android
// This is a public domain alarm sound in MP3 format
const ALARM_SOUND_URLS = [
  // Primary: MP3 format works on both platforms
  'https://cdn.freesound.org/previews/250/250629_4486188-lq.mp3',
  // Fallback: Another reliable MP3 alarm
  'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9d5b2e.mp3',
];

async function createSoundWithFallback(): Promise<Audio.Sound | null> {
  for (const uri of ALARM_SOUND_URLS) {
    try {
      const { sound: created } = await Audio.Sound.createAsync(
        { uri },
        {
          isLooping: true,
          volume: 1.0,
          shouldPlay: false,
        },
      );
      return created;
    } catch (e) {
      console.warn(`Failed to load sound from ${uri}`, e);
    }
  }
  return null;
}

export async function startAlarmLoop() {
  try {
    await ensureAudioMode();
    if (!sound) {
      sound = await createSoundWithFallback();
      if (!sound) {
        console.warn('Could not load any alarm sound');
        return;
      }
    }

    await sound.setIsLoopingAsync(true);
    await sound.setVolumeAsync(1.0);
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


