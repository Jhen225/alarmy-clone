import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  progress: number; // 0-1
}

export const ProgressBar: React.FC<Props> = ({ progress }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.accentYellow,
  },
});


