
import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AlarmsListScreen } from '../screens/AlarmsListScreen';
import { AlarmFormScreen } from '../screens/AlarmFormScreen';
import { AlarmRingingScreen } from '../screens/AlarmRingingScreen';
import { MathMissionScreen } from '../screens/MathMissionScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  AlarmsList: undefined;
  AlarmForm: { alarmId?: string } | undefined;
  AlarmRinging: { alarmId: string };
  MathMission: { alarmId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>();

export function AppNavigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AlarmsList" component={AlarmsListScreen} />
        <Stack.Screen name="AlarmForm" component={AlarmFormScreen} />
        <Stack.Screen name="AlarmRinging" component={AlarmRingingScreen} />
        <Stack.Screen name="MathMission" component={MathMissionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}