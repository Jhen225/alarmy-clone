import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface SpinnerColumnProps {
  data: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width?: number;
}

const SpinnerColumn: React.FC<SpinnerColumnProps> = ({
  data,
  selectedIndex,
  onSelect,
  width = 70,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const isScrollingRef = useRef(false);
  const lastSelectedRef = useRef(selectedIndex);

  // Create extended data for infinite scroll illusion
  // We'll pad with extra items at start and end
  const extendedData = [...data, ...data, ...data];
  const dataLength = data.length;

  useEffect(() => {
    // Initial scroll to middle set
    const targetIndex = dataLength + selectedIndex;
    flatListRef.current?.scrollToOffset({
      offset: targetIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  useEffect(() => {
    if (!isScrollingRef.current && selectedIndex !== lastSelectedRef.current) {
      const targetIndex = dataLength + selectedIndex;
      flatListRef.current?.scrollToOffset({
        offset: targetIndex * ITEM_HEIGHT,
        animated: true,
      });
      lastSelectedRef.current = selectedIndex;
    }
  }, [selectedIndex, dataLength]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const centerItem = viewableItems.find(
          (item) => item.index !== null && item.isViewable
        );
        if (centerItem && centerItem.index !== null) {
          const actualIndex = centerItem.index % dataLength;
          if (actualIndex !== lastSelectedRef.current) {
            lastSelectedRef.current = actualIndex;
            Haptics.selectionAsync();
            onSelect(actualIndex);
          }
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 0,
  }).current;

  const onScrollBegin = useCallback(() => {
    isScrollingRef.current = true;
  }, []);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingRef.current = false;
      const offsetY = e.nativeEvent.contentOffset.y;
      let currentIndex = Math.round(offsetY / ITEM_HEIGHT);

      // Handle looping - if we're in first or last set, jump to middle set
      if (currentIndex < dataLength) {
        // In first set, jump to middle
        const actualIndex = currentIndex % dataLength;
        const targetOffset = (dataLength + actualIndex) * ITEM_HEIGHT;
        flatListRef.current?.scrollToOffset({
          offset: targetOffset,
          animated: false,
        });
        currentIndex = dataLength + actualIndex;
      } else if (currentIndex >= dataLength * 2) {
        // In last set, jump to middle
        const actualIndex = currentIndex % dataLength;
        const targetOffset = (dataLength + actualIndex) * ITEM_HEIGHT;
        flatListRef.current?.scrollToOffset({
          offset: targetOffset,
          animated: false,
        });
        currentIndex = dataLength + actualIndex;
      }

      const actualIndex = currentIndex % dataLength;
      if (actualIndex !== lastSelectedRef.current) {
        lastSelectedRef.current = actualIndex;
        onSelect(actualIndex);
      }
    },
    [dataLength, onSelect]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const actualIndex = index % dataLength;
      const isSelected = actualIndex === selectedIndex;
      return (
        <View style={[styles.item, { height: ITEM_HEIGHT, width }]}>
          <Text
            style={[
              styles.itemText,
              isSelected && styles.itemTextSelected,
            ]}
          >
            {item}
          </Text>
        </View>
      );
    },
    [dataLength, selectedIndex, width]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={[styles.columnContainer, { width, height: CONTAINER_HEIGHT }]}>
      <View style={styles.selectionIndicator} pointerEvents="none" />
      <FlatList
        ref={flatListRef}
        data={extendedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={onScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};

interface TimeSpinnerProps {
  hour: number; // 1-12 for 12h format
  minute: number; // 0-59
  period: 'AM' | 'PM';
  onTimeChange: (hour: number, minute: number, period: 'AM' | 'PM') => void;
}

export const TimeSpinner: React.FC<TimeSpinnerProps> = ({
  hour,
  minute,
  period,
  onTimeChange,
}) => {
  // Generate hour values (1-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );

  // Generate minute values (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  const periods = ['AM', 'PM'];

  const hourIndex = hour - 1; // Convert 1-12 to 0-11
  const minuteIndex = minute;
  const periodIndex = period === 'AM' ? 0 : 1;

  const handleHourChange = useCallback(
    (index: number) => {
      const newHour = index + 1; // Convert 0-11 to 1-12
      onTimeChange(newHour, minute, period);
    },
    [minute, period, onTimeChange]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      // Handle crossing from 59 to 00 or 00 to 59
      const prevMinute = minute;
      const newMinute = index;

      // Detect wrap-around
      if (prevMinute === 59 && newMinute === 0) {
        // Going forward past 59
        let newHour = hour + 1;
        let newPeriod = period;
        if (newHour > 12) {
          newHour = 1;
        }
        if (hour === 11 && newHour === 12) {
          newPeriod = period === 'AM' ? 'PM' : 'AM';
        }
        onTimeChange(newHour, newMinute, newPeriod);
      } else if (prevMinute === 0 && newMinute === 59) {
        // Going backward past 00
        let newHour = hour - 1;
        let newPeriod = period;
        if (newHour < 1) {
          newHour = 12;
        }
        if (hour === 12 && newHour === 11) {
          newPeriod = period === 'AM' ? 'PM' : 'AM';
        }
        onTimeChange(newHour, newMinute, newPeriod);
      } else {
        onTimeChange(hour, newMinute, period);
      }
    },
    [hour, minute, period, onTimeChange]
  );

  const handlePeriodChange = useCallback(
    (index: number) => {
      const newPeriod = index === 0 ? 'AM' : 'PM';
      onTimeChange(hour, minute, newPeriod);
    },
    [hour, minute, onTimeChange]
  );

  return (
    <View style={styles.container}>
      <SpinnerColumn
        data={hours}
        selectedIndex={hourIndex}
        onSelect={handleHourChange}
        width={65}
      />
      <Text style={styles.separator}>:</Text>
      <SpinnerColumn
        data={minutes}
        selectedIndex={minuteIndex}
        onSelect={handleMinuteChange}
        width={65}
      />
      <SpinnerColumn
        data={periods}
        selectedIndex={periodIndex}
        onSelect={handlePeriodChange}
        width={60}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  columnContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.sm,
    zIndex: -1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  itemTextSelected: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: 4,
  },
});

