import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme';
import { getAlarms, upsertAlarm } from '../storage/alarmsStorage';
import { Alarm } from '../models/Alarm';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useFocusEffect } from '@react-navigation/native';
import { cancelAlarmNotification, scheduleAlarmNotification } from '../alarms/scheduler';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmsList'>;

export const AlarmsListScreen: React.FC<Props> = ({ navigation }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const load = useCallback(async () => {
    const loaded = await getAlarms();
    setAlarms(loaded);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    load();
  }, [load]);

  const toggleEnabled = async (alarm: Alarm) => {
    const updated: Alarm = { ...alarm, enabled: !alarm.enabled };
    setAlarms(prev => prev.map(a => (a.id === alarm.id ? updated : a)));
    await upsertAlarm(updated);
    if (updated.enabled) {
      await scheduleAlarmNotification(updated);
    } else {
      await cancelAlarmNotification(updated.id);
    }
  };

  const renderItem = ({ item }: { item: Alarm }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AlarmForm', { alarmId: item.id })}
        activeOpacity={0.8}
        style={styles.alarmItemWrapper}
      >
        <Card>
          <View style={styles.alarmRow}>
            <View>
              <Text style={styles.time}>{item.timeHHmm}</Text>
              <Text style={styles.label}>{item.label || 'No label'}</Text>
              <Text style={styles.meta}>
                {item.repeatDays.length === 0 ? 'One-off' : 'Repeats'} ·{' '}
                {item.difficulty.toUpperCase()}
              </Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => toggleEnabled(item)}
              thumbColor={item.enabled ? theme.colors.primary : '#777'}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Button
          label="← Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Alarms</Text>
        <View style={{ width: 80 }} />
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No alarms yet</Text>
          <Text style={styles.emptyBody}>
            Create your first mission alarm to start waking up with XP.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          contentContainerStyle={styles.listContent}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}

      <Button
        label="+ Add Alarm"
        onPress={() => navigation.navigate('AlarmForm')}
        style={styles.addButton}
      />
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
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  alarmItemWrapper: {
    marginBottom: theme.spacing.md,
  },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
  },
  label: {
    ...theme.text.body,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  meta: {
    ...theme.text.label,
    color: theme.colors.primary,
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignSelf: 'center',
    width: '80%',
  },
  emptyState: {
    marginTop: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.text.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyBody: {
    ...theme.text.body,
    color: theme.colors.textMuted,
  },
});


