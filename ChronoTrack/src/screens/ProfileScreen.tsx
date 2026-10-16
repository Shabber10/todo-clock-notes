import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as db from '../database/db';

export const ProfileScreen: React.FC = () => {
  const { settings, toggleTheme, refreshData, triggerAlarm } = useApp();
  const isDark = settings.theme === 'dark';

  const handleResetData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all tasks, goals, and habits?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            db.clearAllData();
            refreshData();
            Alert.alert('Success', 'All tasks, goals, and habits have been cleared.');
          }
        }
      ]
    );
  };

  const userInitials = settings.userName ? settings.userName.slice(0, 2).toUpperCase() : 'U';

  return (
    <ScrollView style={[styles.container, isDark ? styles.darkBg : styles.lightBg]} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Profile Card */}
      <View style={[styles.profileCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.name, isDark ? styles.darkText : styles.lightText]}>
            {settings.userName || 'User'}
          </Text>
          {settings.userEmail ? <Text style={styles.email}>{settings.userEmail}</Text> : null}
        </View>
      </View>

      {/* Appearance Section */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
          Appearance
        </Text>
        <View style={styles.themeToggleRow}>
          <TouchableOpacity
            testID="btn-theme-light"
            accessibilityLabel="Switch to Light Theme"
            accessibilityRole="button"
            accessibilityState={{ selected: !isDark }}
            onPress={toggleTheme}
            style={[styles.themeOption, !isDark && styles.themeActive]}
          >
            <Ionicons name="sunny" size={18} color={!isDark ? "#2563EB" : "#94A3B8"} />
            <Text style={[styles.themeText, !isDark && styles.themeTextActive]}>Light</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-theme-dark"
            accessibilityLabel="Switch to Dark Theme"
            accessibilityRole="button"
            accessibilityState={{ selected: isDark }}
            onPress={toggleTheme}
            style={[styles.themeOption, isDark && styles.themeActive]}
          >
            <Ionicons name="moon" size={18} color={isDark ? "#2563EB" : "#94A3B8"} />
            <Text style={[styles.themeText, isDark && styles.themeTextActive]}>Dark</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
          Preferences
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingIconText}>
            <Ionicons name="time-outline" size={18} color="#2563EB" />
            <Text style={[styles.settingLabel, isDark ? styles.darkText : styles.lightText]}>
              Time Format
            </Text>
          </View>
          <Text style={styles.settingValue}>12-hour (AM/PM)</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingIconText}>
            <Ionicons name="notifications-outline" size={18} color="#2563EB" />
            <Text style={[styles.settingLabel, isDark ? styles.darkText : styles.lightText]}>
              Default Reminder
            </Text>
          </View>
          <Text style={styles.settingValue}>15 mins before</Text>
        </View>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingIconText}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
            <Text style={[styles.settingLabel, isDark ? styles.darkText : styles.lightText]}>
              First Day of Week
            </Text>
          </View>
          <Text style={styles.settingValue}>Monday</Text>
        </View>
      </View>

      {/* Task Alarms & Live Notifications Section */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
            Task Alarms & Notifications
          </Text>
          <View style={styles.activeAlarmPill}>
            <View style={styles.activeAlarmDot} />
            <Text style={styles.activeAlarmText}>Active</Text>
          </View>
        </View>

        <Text style={styles.desc}>
          Alarms trigger automatically when mobile device clock matches your scheduled task times:
        </Text>

        <View style={styles.alarmFeatureItem}>
          <Ionicons name="alarm" size={18} color="#2563EB" />
          <Text style={[styles.alarmFeatureText, isDark ? styles.darkSub : styles.lightSub]}>
            <Text style={{ fontWeight: '700' }}>5-Min Pre-Start Alarm:</Text> Rings 5 mins before next task begins with Snooze (+5m/10m) & OK.
          </Text>
        </View>

        <View style={styles.alarmFeatureItem}>
          <Ionicons name="play-circle" size={18} color="#059669" />
          <Text style={[styles.alarmFeatureText, isDark ? styles.darkSub : styles.lightSub]}>
            <Text style={{ fontWeight: '700' }}>Task Start Alarm:</Text> Rings at exact scheduled start time that task has begun.
          </Text>
        </View>

        <View style={styles.alarmFeatureItem}>
          <Ionicons name="hourglass" size={18} color="#D97706" />
          <Text style={[styles.alarmFeatureText, isDark ? styles.darkSub : styles.lightSub]}>
            <Text style={{ fontWeight: '700' }}>5-Min Wrap-Up Alarm:</Text> Rings 5 mins before completion with next task notice & extend option.
          </Text>
        </View>

        {/* Quick Test Alarm Triggers */}
        <Text style={[styles.testHeader, isDark ? styles.darkText : styles.lightText]}>
          Test Live Alarms
        </Text>
        <View style={styles.testBtnRow}>
          <TouchableOpacity
            testID="btn-test-alarm-prestart"
            accessibilityLabel="Test 5-Min Pre-Start Alarm"
            accessibilityRole="button"
            onPress={() => {
              triggerAlarm({
                id: `test_prestart_${Date.now()}`,
                occurrence: {
                  id: 'occ_sample',
                  taskId: 'task_sample',
                  scheduledDate: '2026-10-16',
                  scheduledStart: '18:30',
                  scheduledEnd: '19:30',
                  status: 'upcoming',
                  progressPercentage: 0,
                  actualData: {},
                  actualDisplay: '0m',
                  task: {
                    id: 'task_sample',
                    title: 'Strategic Planning Session',
                    description: '',
                    categoryId: 'cat_3',
                    priority: 'high',
                    measurementType: 'duration',
                    measurementConfig: { plannedMinutes: 60 },
                    scheduledStart: '18:30',
                    scheduledEnd: '19:30',
                    category: { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' }
                  }
                },
                stage: 'pre_start',
                title: 'Task Starts in 5 Minutes!',
                message: 'Next task "Strategic Planning Session" is going to start in 5 mins (18:30).',
                targetTime: '18:30'
              });
            }}
            style={styles.testBtn}
          >
            <Ionicons name="alarm-outline" size={16} color="#2563EB" />
            <Text style={styles.testBtnText}>Pre-Start (5m)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-test-alarm-start"
            accessibilityLabel="Test Task Start Alarm"
            accessibilityRole="button"
            onPress={() => {
              triggerAlarm({
                id: `test_start_${Date.now()}`,
                occurrence: {
                  id: 'occ_sample',
                  taskId: 'task_sample',
                  scheduledDate: '2026-10-16',
                  scheduledStart: '18:30',
                  scheduledEnd: '19:30',
                  status: 'upcoming',
                  progressPercentage: 0,
                  actualData: {},
                  actualDisplay: '0m',
                  task: {
                    id: 'task_sample',
                    title: 'Strategic Planning Session',
                    description: '',
                    categoryId: 'cat_3',
                    priority: 'high',
                    measurementType: 'duration',
                    measurementConfig: { plannedMinutes: 60 },
                    scheduledStart: '18:30',
                    scheduledEnd: '19:30',
                    category: { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' }
                  }
                },
                stage: 'start',
                title: 'Task Has Begun!',
                message: 'It is time for "Strategic Planning Session". Scheduled until 19:30.',
                targetTime: '18:30'
              });
            }}
            style={styles.testBtn}
          >
            <Ionicons name="play-outline" size={16} color="#059669" />
            <Text style={[styles.testBtnText, { color: '#059669' }]}>Task Begun</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-test-alarm-preend"
            accessibilityLabel="Test 5-Min Pre-End Alarm"
            accessibilityRole="button"
            onPress={() => {
              triggerAlarm({
                id: `test_preend_${Date.now()}`,
                occurrence: {
                  id: 'occ_sample',
                  taskId: 'task_sample',
                  scheduledDate: '2026-10-16',
                  scheduledStart: '18:30',
                  scheduledEnd: '19:30',
                  status: 'in_progress',
                  progressPercentage: 80,
                  actualData: {},
                  actualDisplay: '50m',
                  task: {
                    id: 'task_sample',
                    title: 'Strategic Planning Session',
                    description: '',
                    categoryId: 'cat_3',
                    priority: 'high',
                    measurementType: 'duration',
                    measurementConfig: { plannedMinutes: 60 },
                    scheduledStart: '18:30',
                    scheduledEnd: '19:30',
                    category: { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' }
                  }
                },
                stage: 'pre_end',
                title: 'Last 5 Minutes!',
                message: 'Last 5 mins for "Strategic Planning Session"! Next task "Team Workout" is within 5 mins (19:35).',
                targetTime: '19:30',
                nextTaskTitle: 'Team Workout',
                nextTaskTime: '19:35'
              });
            }}
            style={styles.testBtn}
          >
            <Ionicons name="hourglass-outline" size={16} color="#D97706" />
            <Text style={[styles.testBtnText, { color: '#D97706' }]}>Pre-End (5m)</Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* Database & Data Section */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
          Local Database (SQLite)
        </Text>
        <Text style={styles.desc}>
          All your tasks, habits, and progress are stored safely on this device via SQLite.
        </Text>

        <TouchableOpacity 
          testID="btn-reset-demo-data"
          accessibilityLabel="Clear All Tasks and Data"
          accessibilityRole="button"
          onPress={handleResetData} 
          style={styles.resetBtn}
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={styles.resetBtnText}>Clear All Tasks & Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  lightBg: {
    backgroundColor: '#F8FAFC',
  },
  darkBg: {
    backgroundColor: '#0F172A',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    backgroundColor: '#F1F5F9',
  },
  themeActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  themeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  themeTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 13,
    color: '#64748B',
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  resetBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
  lightSub: {
    color: '#64748B',
  },
  darkSub: {
    color: '#94A3B8',
  },
  activeAlarmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
  },
  activeAlarmDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeAlarmText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  alarmFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  alarmFeatureText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  testHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 8,
  },
  testBtnRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 4,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
