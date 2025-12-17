import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme';
import { Alarm } from '../models/Alarm';
import { getAlarmById } from '../storage/alarmsStorage';
import { Button } from '../components/Button';
import { stopAlarmLoop } from '../alarms/sound';
import { getPlayer, savePlayer } from '../storage/playerStorage';
import { applyAlarmSuccess } from '../game/rewards';

type Props = NativeStackScreenProps<RootStackParamList, 'MathMission'>;

interface Problem {
  a: number;
  b: number;
  op: '+' | '-' | '*';
  answer: number;
}

function generateProblem(difficulty: Alarm['difficulty']): Problem {
  let a = 0;
  let b = 0;
  let op: Problem['op'] = '+';

  if (difficulty === 'easy') {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    op = Math.random() < 0.5 ? '+' : '-';
  } else if (difficulty === 'med') {
    a = Math.floor(Math.random() * 20) + 5;
    b = Math.floor(Math.random() * 20) + 5;
    const r = Math.random();
    if (r < 0.4) op = '+';
    else if (r < 0.8) op = '-';
    else op = '*';
  } else {
    a = Math.floor(Math.random() * 40) + 10;
    b = Math.floor(Math.random() * 20) + 5;
    op = Math.random() < 0.6 ? '*' : Math.random() < 0.5 ? '+' : '-';
  }

  let answer = 0;
  if (op === '+') answer = a + b;
  if (op === '-') answer = a - b;
  if (op === '*') answer = a * b;

  return { a, b, op, answer };
}

function targetStreak(d: Alarm['difficulty']): number {
  if (d === 'easy') return 3;
  if (d === 'med') return 5;
  return 7;
}

export const MathMissionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { alarmId } = route.params;
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [correctStreak, setCorrectStreak] = useState(0);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getAlarmById(alarmId);
      if (!data) return;
      setAlarm(data);
      setProblem(generateProblem(data.difficulty));
    })();
  }, [alarmId]);

  const onSubmit = async () => {
    if (!alarm || !problem) return;
    const parsed = Number(answer.trim());
    if (Number.isNaN(parsed)) {
      setStatus('wrong');
      return;
    }

    if (parsed === problem.answer) {
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);
      setStatus('correct');
      setAnswer('');

      if (nextStreak >= targetStreak(alarm.difficulty)) {
        // Mission success
        await stopAlarmLoop();
        const player = await getPlayer();
        const updated = applyAlarmSuccess(player, alarm);
        await savePlayer(updated);
        setCompleted(true);
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }, 1500);
      } else {
        setProblem(generateProblem(alarm.difficulty));
      }
    } else {
      setStatus('wrong');
      setCorrectStreak(0);
      setAnswer('');
      setProblem(generateProblem(alarm.difficulty));
    }
  };

  if (!alarm || !problem) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Math mission</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  const needed = targetStreak(alarm.difficulty);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Math Mission</Text>
      <Text style={styles.subtitle}>
        Solve {needed} in a row ({correctStreak}/{needed})
      </Text>

      <View style={styles.problemCard}>
        <Text style={styles.problemText}>
          {problem.a} {problem.op} {problem.b} = ?
        </Text>
      </View>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={answer}
        onChangeText={setAnswer}
        placeholder="Your answer"
        placeholderTextColor={theme.colors.textMuted}
        onSubmitEditing={onSubmit}
      />

      <Button label="Submit" onPress={onSubmit} style={styles.submit} />

      {status === 'correct' && (
        <Text style={styles.correctText}>Nice! Keep going.</Text>
      )}
      {status === 'wrong' && (
        <Text style={styles.wrongText}>Missed it. Streak reset.</Text>
      )}
      {completed && (
        <View style={styles.victoryCard}>
          <Text style={styles.victoryTitle}>Victory!</Text>
          <Text style={styles.victoryBody}>
            Alarm cleared. XP and coins awarded.
          </Text>
        </View>
      )}
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
  title: {
    ...theme.text.title,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.text.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  problemCard: {
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  problemText: {
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  input: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  submit: {
    marginTop: theme.spacing.md,
  },
  correctText: {
    ...theme.text.body,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
  wrongText: {
    ...theme.text.body,
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
  },
  victoryCard: {
    marginTop: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primarySoft,
    padding: theme.spacing.lg,
  },
  victoryTitle: {
    ...theme.text.subtitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  victoryBody: {
    ...theme.text.body,
    color: theme.colors.text,
  },
});


