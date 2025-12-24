import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;

async function ensureAudioMode() {
  await setAudioModeAsync({
    allowsRecording: false,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
    playsInSilentMode: true,
    shouldRouteThroughEarpiece: false,
  });
}

export async function startAlarmLoop() {
  try {
    await ensureAudioMode();
    if (player) {
      // Remove existing player first
      player.remove();
      player = null;
    }

    player = createAudioPlayer(
      {
        uri: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
      },
      { updateInterval: 500 }
    );

    player.loop = true;
    player.volume = 1.0;
    player.play();
  } catch (e) {
    console.warn('Failed to start alarm sound', e);
  }
}

export async function stopAlarmLoop() {
  try {
    if (player) {
      player.pause();
      player.remove();
      player = null;
    }
  } catch (e) {
    console.warn('Failed to stop alarm sound', e);
  }
}
