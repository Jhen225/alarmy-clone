import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { theme } from '../theme';

interface TimeSpinnerProps {
  hour12: number; // 1-12
  minute: number; // 0-59
  ampm: 'AM' | 'PM';
  onTimeChange: (hour12: number, minute: number, ampm: 'AM' | 'PM') => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const REPEAT_COUNT = 100; // Number of times to repeat items for infinite scroll

export const TimeSpinner: React.FC<TimeSpinnerProps> = ({
  hour12,
  minute,
  ampm,
  onTimeChange,
}) => {
  const [localHour, setLocalHour] = useState(hour12);
  const [localMinute, setLocalMinute] = useState(minute);
  const [localAmpm, setLocalAmpm] = useState(ampm);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const ampmScrollRef = useRef<ScrollView>(null);

  // Generate arrays for spinners
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampmOptions: ('AM' | 'PM')[] = ['AM', 'PM'];

  // Calculate initial scroll positions (start in the middle for infinite scroll)
  const getInitialHourScrollY = (hour: number) => {
    const index = hour - 1;
    return (Math.floor(REPEAT_COUNT / 2) * 12 + index) * ITEM_HEIGHT;
  };

  const getInitialMinuteScrollY = (minute: number) => {
    return (Math.floor(REPEAT_COUNT / 2) * 60 + minute) * ITEM_HEIGHT;
  };

  const getInitialAmpmScrollY = (ampm: 'AM' | 'PM') => {
    const index = ampm === 'AM' ? 0 : 1;
    return (Math.floor(REPEAT_COUNT / 2) * 2 + index) * ITEM_HEIGHT;
  };

  useEffect(() => {
    // Update local state when props change
    setLocalHour(hour12);
    setLocalMinute(minute);
    setLocalAmpm(ampm);
    
    // Scroll to correct position
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({
        y: getInitialHourScrollY(hour12),
        animated: false,
      });
      minuteScrollRef.current?.scrollTo({
        y: getInitialMinuteScrollY(minute),
        animated: false,
      });
      ampmScrollRef.current?.scrollTo({
        y: getInitialAmpmScrollY(ampm),
        animated: false,
      });
    }, 100);
  }, [hour12, minute, ampm]);

  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newHour = ((index % 12) + 12) % 12 + 1;
    
    // Handle looping back to middle if scrolled too far
    const middleIndex = Math.floor(REPEAT_COUNT / 2) * 12;
    if (index < middleIndex - 6 || index > middleIndex + 6) {
      const targetIndex = middleIndex + (newHour - 1);
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: targetIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
    
    if (newHour !== localHour) {
      const oldHour = localHour;
      setLocalHour(newHour);
      
      // Handle AM/PM toggle when crossing 12/1 boundary
      if ((oldHour === 12 && newHour === 1) || (oldHour === 1 && newHour === 12)) {
        const newAmpm = localAmpm === 'AM' ? 'PM' : 'AM';
        setLocalAmpm(newAmpm);
        onTimeChange(newHour, localMinute, newAmpm);
      } else {
        onTimeChange(newHour, localMinute, localAmpm);
      }
    }
  };

  const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newMinute = ((index % 60) + 60) % 60;
    
    // Handle looping back to middle if scrolled too far
    const middleIndex = Math.floor(REPEAT_COUNT / 2) * 60;
    if (index < middleIndex - 30 || index > middleIndex + 30) {
      const targetIndex = middleIndex + newMinute;
      setTimeout(() => {
        minuteScrollRef.current?.scrollTo({
          y: targetIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
    
    if (newMinute !== localMinute) {
      setLocalMinute(newMinute);
      onTimeChange(localHour, newMinute, localAmpm);
    }
  };

  const handleAmpmScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newAmpm = (index % 2 === 0) ? 'AM' : 'PM';
    
    // Handle looping back to middle if scrolled too far
    const middleIndex = Math.floor(REPEAT_COUNT / 2) * 2;
    if (index < middleIndex - 1 || index > middleIndex + 1) {
      const targetIndex = middleIndex + (newAmpm === 'AM' ? 0 : 1);
      setTimeout(() => {
        ampmScrollRef.current?.scrollTo({
          y: targetIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
    
    if (newAmpm !== localAmpm) {
      setLocalAmpm(newAmpm);
      onTimeChange(localHour, localMinute, newAmpm);
    }
  };

  const renderSpinner = (
    items: (number | string)[],
    selectedValue: number | string,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    scrollRef: React.RefObject<ScrollView>,
    isAmpm: boolean = false,
  ) => {
    // Create repeated items for infinite scroll
    const allItems: (number | string)[] = [];
    for (let i = 0; i < REPEAT_COUNT; i++) {
      allItems.push(...items);
    }

    return (
      <View style={[styles.spinnerContainer, isAmpm && styles.spinnerContainerAmpm]}>
        <View style={styles.spinnerMask} />
        <ScrollView
          ref={scrollRef}
          style={styles.spinner}
          contentContainerStyle={styles.spinnerContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          onScrollEndDrag={onScroll}
        >
          {allItems.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <View key={index} style={[styles.spinnerItem, { height: ITEM_HEIGHT }]}>
                <Text
                  style={[
                    styles.spinnerItemText,
                    isSelected && styles.spinnerItemTextSelected,
                  ]}
                >
                  {String(item).padStart(isAmpm ? 0 : 2, '0')}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSpinner(hours, localHour, handleHourScroll, hourScrollRef)}
      <Text style={styles.separator}>:</Text>
      {renderSpinner(minutes, localMinute, handleMinuteScroll, minuteScrollRef)}
      {renderSpinner(ampmOptions, localAmpm, handleAmpmScroll, ampmScrollRef, true)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    marginVertical: theme.spacing.md,
  },
  spinnerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    overflow: 'hidden',
    width: 80,
  },
  spinnerContainerAmpm: {
    width: 60,
  },
  spinner: {
    flex: 1,
  },
  spinnerContent: {
    // Content will be sized by items
  },
  spinnerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerItemText: {
    fontSize: 32,
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  spinnerItemTextSelected: {
    fontSize: 40,
    color: theme.colors.text,
    fontWeight: '700',
  },
  spinnerMask: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(94, 242, 184, 0.1)',
    borderRadius: theme.radii.md,
    zIndex: 1,
    pointerEvents: 'none',
  },
  separator: {
    fontSize: 40,
    color: theme.colors.text,
    fontWeight: '700',
    marginHorizontal: theme.spacing.sm,
  },
});
