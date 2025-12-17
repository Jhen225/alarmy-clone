import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme';
import { getPlayer } from '../storage/playerStorage';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNext, setXpToNext] = useState(150);
  const [coins, setCoins] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalWakes, setTotalWakes] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const player = await getPlayer();
      if (!mounted) return;
      setLevel(player.level);
      setXp(player.xp);
      setXpToNext(player.xpToNext);
      setCoins(player.coins);
      setStreakDays(player.streakDays);
      setTotalWakes(player.totalWakes);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const progress = xpToNext > 0 ? xp / xpToNext : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NeoWake</Text>
      <Text style={styles.subtitle}>Gamified mornings, minimal v1.</Text>

      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.levelText}>Lv. {level}</Text>
          <Text style={styles.coinsText}>◎ {coins} coins</Text>
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>
            XP {xp} / {xpToNext}
          </Text>
        </View>
        <ProgressBar progress={progress} />
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{streakDays} days</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Total wakes</Text>
            <Text style={styles.statValue}>{totalWakes}</Text>
          </View>
        </View>
      </Card>

      <Button
        label={loading ? 'Loading...' : 'Go to Alarms'}
        onPress={() => navigation.navigate('AlarmsList')}
        style={styles.primaryButton}
        disabled={loading}
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
  card: {
    marginBottom: theme.spacing.xl,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelText: {
    ...theme.text.subtitle,
    color: theme.colors.text,
  },
  coinsText: {
    ...theme.text.subtitle,
    color: theme.colors.accentYellow,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  xpLabel: {
    ...theme.text.body,
    color: theme.colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  statLabel: {
    ...theme.text.label,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    ...theme.text.subtitle,
    color: theme.colors.text,
    marginTop: 4,
  },
  primaryButton: {
    marginTop: theme.spacing.xl,
  },
});


