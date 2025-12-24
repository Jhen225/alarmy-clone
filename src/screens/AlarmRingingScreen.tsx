import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme';
import { getAlarmById, upsertAlarm } from '../storage/alarmsStorage';
import { Alarm } from '../models/Alarm';
import { Button } from '../components/Button';
import { scheduleSnooze } from '../alarms/scheduler';
import { startAlarmLoop } from '../alarms/sound';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmRinging'>;

export const AlarmRingingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { alarmId } = route.params;
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    (async () => {
      const data = await getAlarmById(alarmId);
      if (data) {
        setAlarm(data);
      }
    })();
  }, [alarmId]);

  useEffect(() => {
    startAlarmLoop();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!alarm) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Alarm</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  const snoozesRemaining =
    alarm.snoozeMax - (alarm.snoozeCount ?? 0) > 0
      ? alarm.snoozeMax - (alarm.snoozeCount ?? 0)
      : 0;

  const onSnooze = async () => {
    if (!alarm.snoozeEnabled || snoozesRemaining <= 0) return;
    const updated: Alarm = {
      ...alarm,
      snoozeCount: (alarm.snoozeCount ?? 0) + 1,
    };
    await upsertAlarm(updated);
    await scheduleSnooze(updated, alarm.snoozeMinutes);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const onStartMission = () => {
    navigation.replace('MathMission', { alarmId: alarm.id });
  };

  const minutes = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.ringingText}>Wake mission ready</Text>
      <Text style={styles.time}>{alarm.timeHHmm}</Text>
      <Text style={styles.label}>{alarm.label}</Text>
      <Text style={styles.elapsed}>Ringing for {minutes}:{seconds}</Text>

      <View style={styles.buttons}>
        <Button
          label={
            alarm.snoozeEnabled && snoozesRemaining > 0
              ? `Snooze (${snoozesRemaining})`
              : 'Snooze disabled'
          }
          variant="secondary"
          onPress={onSnooze}
          disabled={!alarm.snoozeEnabled || snoozesRemaining <= 0}
          style={styles.button}
        />
        <Button
          label="Start Math Mission"
          onPress={onStartMission}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  ringingText: {
    ...theme.text.label,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  time: {
    fontSize: 56,
    fontWeight: '800',
    color: theme.colors.text,
  },
  label: {
    ...theme.text.subtitle,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  elapsed: {
    ...theme.text.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  buttons: {
    marginTop: theme.spacing.xl,
    width: '100%',
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});


