import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme';
import { Alarm, AlarmDifficulty, time24To12, time12To24 } from '../models/Alarm';
import {
  deleteAlarm,
  getAlarmById,
  upsertAlarm,
} from '../storage/alarmsStorage';
import { Button } from '../components/Button';
import { TimeSpinner } from '../components/TimeSpinner';
import {
  cancelAlarmNotification,
  scheduleAlarmNotification,
} from '../alarms/scheduler';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmForm'>;

const defaultAlarm = (): Alarm => ({
  id: Math.random().toString(36).slice(2),
  timeHHmm: '07:00',
  label: 'Morning mission',
  enabled: true,
  repeatDays: [],
  soundId: 'default',
  volume: 1,
  snoozeEnabled: true,
  snoozeMinutes: 5,
  snoozeMax: 3,
  difficulty: 'easy',
  snoozeCount: 0,
});

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const AlarmFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const editingId = route.params?.alarmId;
  const [alarm, setAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    (async () => {
      if (editingId) {
        const existing = await getAlarmById(editingId);
        setAlarm(existing ?? defaultAlarm());
      } else {
        setAlarm(defaultAlarm());
      }
    })();
  }, [editingId]);

  if (!alarm) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const update = (patch: Partial<Alarm>) => {
    setAlarm(prev => (prev ? { ...prev, ...patch } : prev));
  };

  const toggleRepeatDay = (dayIndex: number) => {
    const exists = alarm.repeatDays.includes(dayIndex);
    const next = exists
      ? alarm.repeatDays.filter(d => d !== dayIndex)
      : [...alarm.repeatDays, dayIndex];
    update({ repeatDays: next });
  };

  const setDifficulty = (difficulty: AlarmDifficulty) => update({ difficulty });

  const onSave = async () => {
    await upsertAlarm(alarm);
    if (alarm.enabled) {
      await scheduleAlarmNotification(alarm);
    } else {
      await cancelAlarmNotification(alarm.id);
    }
    navigation.goBack();
  };

  const onDelete = async () => {
    if (editingId) {
      await deleteAlarm(editingId);
      await cancelAlarmNotification(editingId);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Button
          label="← Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>
          {editingId ? 'Edit Alarm' : 'New Alarm'}
        </Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Time</Text>
        <TimeSpinner
          {...time24To12(alarm.timeHHmm)}
          onTimeChange={(hour12, minute, ampm) => {
            const timeHHmm = time12To24(hour12, minute, ampm);
            update({ timeHHmm });
          }}
        />

        <Text style={styles.label}>Label</Text>
        <TextInput
          style={styles.input}
          value={alarm.label}
          onChangeText={text => update({ label: text })}
          placeholder="Morning mission"
          placeholderTextColor={theme.colors.textMuted}
        />

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Enabled</Text>
          <Switch
            value={alarm.enabled}
            onValueChange={val => update({ enabled: val })}
            thumbColor={alarm.enabled ? theme.colors.primary : '#777'}
          />
        </View>

        <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>
          Repeat days
        </Text>
        <View style={styles.weekRow}>
          {weekdayLabels.map((d, i) => {
            const active = alarm.repeatDays.includes(i);
            return (
              <Button
                key={i}
                label={d}
                variant={active ? 'primary' : 'secondary'}
                style={styles.weekButton}
                onPress={() => toggleRepeatDay(i)}
              />
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>
          Difficulty
        </Text>
        <View style={styles.row}>
          {(['easy', 'med', 'hard'] as AlarmDifficulty[]).map(d => (
            <Button
              key={d}
              label={d.toUpperCase()}
              variant={alarm.difficulty === d ? 'primary' : 'secondary'}
              style={styles.diffButton}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </View>

        <View style={[styles.rowBetween, { marginTop: theme.spacing.lg }]}>
          <Text style={styles.label}>Snooze enabled</Text>
          <Switch
            value={alarm.snoozeEnabled}
            onValueChange={val => update({ snoozeEnabled: val })}
            thumbColor={alarm.snoozeEnabled ? theme.colors.primary : '#777'}
          />
        </View>

        <Text style={styles.hint}>
          Snooze: {alarm.snoozeMinutes} min · up to {alarm.snoozeMax} times
          (fixed in v1).
        </Text>

        <Button label="Save alarm" onPress={onSave} style={styles.saveButton} />

        {editingId && (
          <Button
            label="Delete"
            variant="danger"
            onPress={onDelete}
            style={styles.deleteButton}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  loading: {
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.text.subtitle,
    color: theme.colors.text,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
  label: {
    ...theme.text.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  weekButton: {
    flex: 1,
    minWidth: 35,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  diffButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  hint: {
    ...theme.text.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
  },
  deleteButton: {
    marginTop: theme.spacing.md,
  },
});


