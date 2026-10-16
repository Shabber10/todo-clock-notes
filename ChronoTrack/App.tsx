import React from 'react';
import { View, StyleSheet, StatusBar, Platform, LogBox } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { BottomNavBar } from './src/components/BottomNavBar';
import { TodayScreen } from './src/screens/TodayScreen';
import { TrackScreen } from './src/screens/TrackScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { HabitsScreen } from './src/screens/HabitsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AddTaskModal } from './src/components/AddTaskModal';
import { RecordProgressModal } from './src/components/RecordProgressModal';
import { MonthCalendarModal } from './src/components/MonthCalendarModal';

import { TaskAlarmModal } from './src/components/TaskAlarmModal';
import { checkTaskAlarms, markAlarmTriggered, TaskAlarm } from './src/services/alarmService';

// Suppress deprecation and minor dev warning banners on mobile view
LogBox.ignoreAllLogs(true);

const MainNavigator: React.FC = () => {
  const { activeTab, settings, isAddTaskModalOpen, selectedOccurrenceForProgress, activeAlarm, dismissAlarm } = useApp();
  const isDark = settings.theme === 'dark';
  const isAnyModalOpen = isAddTaskModalOpen || Boolean(selectedOccurrenceForProgress);

  return (
    <View style={[styles.safeArea, isDark ? styles.darkBg : styles.lightBg]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#0F172A" : "#FFFFFF"}
        translucent={Platform.OS === 'android'}
      />

      {/* Top Header */}
      <Header />

      {/* Active Screen */}
      <View style={styles.screenContainer}>
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'track' && <TrackScreen />}
        {activeTab === 'goals' && <GoalsScreen />}
        {activeTab === 'habits' && <HabitsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Fixed Bottom Navigation */}
      {!isAnyModalOpen && !activeAlarm && <BottomNavBar />}

      {/* Interactive Modals */}
      <AddTaskModal />
      <RecordProgressModal />
      <MonthCalendarModal />
      <TaskAlarmModal alarm={activeAlarm} onDismiss={dismissAlarm} />
    </View>
  );
};



export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  lightBg: {
    backgroundColor: '#FFFFFF',
  },
  darkBg: {
    backgroundColor: '#0F172A',
  },
  screenContainer: {
    flex: 1,
  },
});
