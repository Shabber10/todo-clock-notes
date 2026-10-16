import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Palette } from '../theme/colors';
import { ClayButton } from '../components/ClayButton';
import * as db from '../database/db';

const ALARM_SOUNDS = [
  'Default (Gentle Chime)',
  'Digital Beep',
  'Morning Sunbird',
  'Zen Temple Bell',
  'Radar Alert',
  'Energetic Wave',
];

const SNOOZE_OPTIONS = [5, 10, 15, 20, 30];
const REMINDER_OPTIONS = [5, 10, 15, 30];
const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export const SettingsScreen: React.FC = () => {
  const { settings, toggleTheme, updateSetting, refreshData, triggerAlarm } = useApp();
  const isDark = settings.theme === 'dark';

  // Alarm & Sound state (persisted via updateSetting)
  const isAlarmEnabled = settings.alarmEnabled !== false;
  const pauseAlarmMins = settings.pauseAlarmMins || 10;
  const alarmSound = settings.alarmSound || 'Default (Gentle Chime)';
  const isVibrateEnabled = settings.vibrateEnabled !== false;

  // Popups state
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tempName, setTempName] = useState(settings.userName || 'User');
  const [tempEmail, setTempEmail] = useState(settings.userEmail || '');

  // Reset / Clear Data
  const handleClearCompleted = () => {
    Alert.alert(
      'Clear Completed Tasks',
      'This will remove all completed task records from your history. Active and upcoming tasks will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Completed',
          style: 'destructive',
          onPress: () => {
            db.clearCompletedOccurrencesFromDb();
            refreshData();
            Alert.alert('Cleared', 'Completed task history has been cleared.');
          },
        },
      ]
    );
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to completely erase all tasks, occurrences, goals, and habits? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase All Data',
          style: 'destructive',
          onPress: () => {
            db.clearAllData();
            refreshData();
            Alert.alert('Reset Complete', 'All data has been reset.');
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    updateSetting('userName', tempName.trim() || 'User');
    updateSetting('userEmail', tempEmail.trim());
    setIsEditProfileOpen(false);
  };

  const userInitials = settings.userName ? settings.userName.slice(0, 2).toUpperCase() : 'US';

  const accentColor = isDark ? Palette.neon.cyan : '#2563EB';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <ScrollView
      style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Title */}
      <View style={styles.headerTitleRow}>
        <View style={[styles.headerIconBox, isDark ? styles.darkIconBox : styles.lightIconBox]}>
          <Ionicons name="settings" size={20} color={accentColor} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.mainTitle, isDark ? styles.darkText : styles.lightText]}>
            Settings
          </Text>
          <Text style={[styles.mainSubtitle, { color: subtextColor }]}>
            Preferences, alarms & system configuration
          </Text>
        </View>
      </View>

     

      {/* 3. Appearance Section (Dark & Light Mode) */}
      <View style={[styles.glassCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.specularLine} />
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleIconRow}>
            <Ionicons name="color-palette-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Appearance
            </Text>
          </View>
          <Text style={[styles.badgeText, { color: accentColor }]}>Theme</Text>
        </View>

        <Text style={[styles.sectionDesc, { color: subtextColor }]}>
          Choose your interface mode:
        </Text>

        <View style={[styles.themeSegmentTrack, isDark ? styles.darkSegmentTrack : styles.lightSegmentTrack]}>
          <TouchableOpacity
            testID="btn-theme-light"
            accessibilityLabel="Switch to Light Mode"
            accessibilityRole="button"
            accessibilityState={{ selected: !isDark }}
            onPress={() => {
              if (isDark) toggleTheme();
            }}
            style={[
              styles.themeSegmentItem,
              !isDark ? styles.activeSegmentLight : styles.inactiveSegment,
            ]}
          >
            <View style={[styles.themeIconCircle, !isDark ? styles.sunCircleActive : styles.iconCircleInactive]}>
              <Ionicons
                name="sunny"
                size={18}
                color={!isDark ? '#F59E0B' : (isDark ? '#94A3B8' : '#64748B')}
              />
            </View>
            <Text
              style={[
                styles.themeSegmentText,
                !isDark ? styles.activeTextLight : (isDark ? styles.inactiveTextDark : styles.inactiveTextLight),
              ]}
            >
              Light Mode
            </Text>
            {!isDark && (
              <Ionicons name="checkmark-circle" size={16} color="#2563EB" style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-theme-dark"
            accessibilityLabel="Switch to Dark Mode"
            accessibilityRole="button"
            accessibilityState={{ selected: isDark }}
            onPress={() => {
              if (!isDark) toggleTheme();
            }}
            style={[
              styles.themeSegmentItem,
              isDark ? styles.activeSegmentDark : styles.inactiveSegment,
            ]}
          >
            <View style={[styles.themeIconCircle, isDark ? styles.moonCircleActive : styles.iconCircleInactive]}>
              <Ionicons
                name="moon"
                size={18}
                color={isDark ? Palette.neon.cyan : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.themeSegmentText,
                isDark ? styles.activeTextDark : (isDark ? styles.inactiveTextDark : styles.inactiveTextLight),
              ]}
            >
              Dark Mode
            </Text>
            {isDark && (
              <Ionicons name="checkmark-circle" size={16} color={Palette.neon.cyan} style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Alarm & Sound Settings (Matching Reference Image 2 EXACTLY) */}
      <View style={[styles.glassCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.specularLine} />
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleIconRow}>
            <Ionicons name="alarm" size={18} color="#0D9488" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Alarm & Sound Settings
            </Text>
          </View>
          <View style={[styles.liveStatusPill, { backgroundColor: isAlarmEnabled ? 'rgba(13, 148, 136, 0.2)' : 'rgba(148, 163, 184, 0.2)' }]}>
            <View style={[styles.liveStatusDot, { backgroundColor: isAlarmEnabled ? '#0D9488' : '#94A3B8' }]} />
            <Text style={[styles.liveStatusText, { color: isAlarmEnabled ? '#0D9488' : '#94A3B8' }]}>
              {isAlarmEnabled ? 'Active' : 'Muted'}
            </Text>
          </View>
        </View>

        {/* The Exact Card from User's Second Image */}
        <View style={[styles.referenceAlarmCard, isDark ? styles.referenceDarkCard : styles.referenceLightCard]}>
          {/* Row 1: Alarm is on / off */}
          <View style={styles.alarmRow}>
            <View style={styles.alarmRowLeft}>
              <Ionicons name="alarm-outline" size={20} color="#0D9488" style={{ marginRight: 10 }} />
              <Text style={[styles.alarmLabel, isDark ? styles.darkText : styles.lightText]}>
                {isAlarmEnabled ? 'Alarm is on' : 'Alarm is off'}
              </Text>
            </View>
            <Switch
              testID="switch-alarm-master"
              accessibilityLabel="Master Alarm Toggle"
              value={isAlarmEnabled}
              onValueChange={(val) => updateSetting('alarmEnabled', val)}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#0D9488' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Row 2: Pause alarm (Snooze) */}
          <TouchableOpacity
            testID="btn-pause-alarm-setting"
            accessibilityLabel={`Pause alarm snooze: ${pauseAlarmMins} minutes. Tap to change.`}
            accessibilityRole="button"
            onPress={() => setIsPauseModalOpen(true)}
            style={styles.alarmOptionRow}
          >
            <View style={styles.alarmRowLeft}>
              <Ionicons name="time-outline" size={19} color={subtextColor} style={{ marginRight: 10 }} />
              <Text style={[styles.alarmOptionLabel, isDark ? styles.darkText : styles.lightText]}>
                Pause alarm (Snooze)
              </Text>
            </View>
            <View style={styles.alarmOptionRight}>
              <Text style={[styles.alarmOptionVal, { color: '#0D9488' }]}>{pauseAlarmMins} mins</Text>
              <Ionicons name="chevron-forward" size={16} color={subtextColor} />
            </View>
          </TouchableOpacity>

          {/* Row 3: Sound */}
          <TouchableOpacity
            testID="btn-sound-setting"
            accessibilityLabel={`Alarm sound: ${alarmSound}. Tap to change sound.`}
            accessibilityRole="button"
            onPress={() => setIsSoundModalOpen(true)}
            style={styles.alarmOptionRow}
          >
            <View style={styles.alarmRowLeft}>
              <Ionicons name="notifications-outline" size={19} color={subtextColor} style={{ marginRight: 10 }} />
              <Text style={[styles.alarmOptionLabel, isDark ? styles.darkText : styles.lightText]}>
                Sound
              </Text>
            </View>
            <View style={styles.alarmOptionRight}>
              <Text style={[styles.alarmOptionVal, { color: '#0D9488', maxWidth: 170 }]} numberOfLines={1}>
                {alarmSound}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={subtextColor} />
            </View>
          </TouchableOpacity>

          {/* Row 4: Vibrate */}
          <View style={[styles.alarmOptionRow, { borderBottomWidth: 0 }]}>
            <View style={styles.alarmRowLeft}>
              <Ionicons name="phone-portrait-outline" size={19} color={subtextColor} style={{ marginRight: 10 }} />
              <Text style={[styles.alarmOptionLabel, isDark ? styles.darkText : styles.lightText]}>
                Vibrate
              </Text>
            </View>
            <Switch
              testID="switch-vibrate-setting"
              accessibilityLabel="Vibrate Toggle"
              value={isVibrateEnabled}
              onValueChange={(val) => updateSetting('vibrateEnabled', val)}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#0D9488' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Task Notification Stages Configuration */}
        <Text style={[styles.subSectionHeader, isDark ? styles.darkText : styles.lightText]}>
          Notification Triggers
        </Text>

        <View style={styles.triggerItemRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.triggerTitle, isDark ? styles.darkText : styles.lightText]}>
              5-Minute Pre-Start Alarm
            </Text>
            <Text style={[styles.triggerDesc, { color: subtextColor }]}>
              Chimes 5 minutes before scheduled start time with Snooze options.
            </Text>
          </View>
          <Switch
            testID="switch-prestart-trigger"
            accessibilityLabel="Pre-Start Alarm Trigger"
            value={settings.preStartAlarmEnabled !== false}
            onValueChange={(val) => updateSetting('preStartAlarmEnabled', val)}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: Palette.neon.cyan }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.triggerItemRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.triggerTitle, isDark ? styles.darkText : styles.lightText]}>
              Task Start Alarm
            </Text>
            <Text style={[styles.triggerDesc, { color: subtextColor }]}>
              Alerts exactly when task scheduled start time arrives.
            </Text>
          </View>
          <Switch
            testID="switch-start-trigger"
            accessibilityLabel="Task Start Trigger"
            value={settings.startAlarmEnabled !== false}
            onValueChange={(val) => updateSetting('startAlarmEnabled', val)}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: Palette.neon.emerald }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.triggerItemRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.triggerTitle, isDark ? styles.darkText : styles.lightText]}>
              5-Minute Wrap-Up Alarm
            </Text>
            <Text style={[styles.triggerDesc, { color: subtextColor }]}>
              Reminds you 5 minutes before completion to wrap up or extend time.
            </Text>
          </View>
          <Switch
            testID="switch-wrapup-trigger"
            accessibilityLabel="Wrap-Up Alarm Trigger"
            value={settings.wrapUpAlarmEnabled !== false}
            onValueChange={(val) => updateSetting('wrapUpAlarmEnabled', val)}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: Palette.neon.amber }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Live Alarm Simulator Test Buttons */}
        <Text style={[styles.subSectionHeader, isDark ? styles.darkText : styles.lightText]}>
          Test Live Alarms
        </Text>
        <View style={styles.testBtnGroup}>
          <TouchableOpacity
            testID="btn-test-prestart"
            accessibilityLabel="Test Pre-Start Alarm"
            accessibilityRole="button"
            onPress={() => {
              triggerAlarm({
                id: `test_prestart_${Date.now()}`,
                occurrence: {
                  id: 'occ_test',
                  taskId: 'task_test',
                  scheduledDate: '2026-10-17',
                  scheduledStart: '10:00',
                  scheduledEnd: '11:00',
                  status: 'upcoming',
                  progressPercentage: 0,
                  actualData: {},
                  actualDisplay: '0m',
                  task: {
                    id: 'task_test',
                    title: 'Strategic Planning Session',
                    description: '',
                    categoryId: 'cat_3',
                    priority: 'high',
                    measurementType: 'duration',
                    measurementConfig: { plannedMinutes: 60 },
                    scheduledStart: '10:00',
                    scheduledEnd: '11:00',
                    category: { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' },
                  },
                },
                stage: 'pre_start',
                title: 'Task Starts in 5 Minutes!',
                message: 'Next task "Strategic Planning Session" begins in 5 mins (10:00).',
                targetTime: '10:00',
              });
            }}
            style={[styles.testPillBtn, isDark ? styles.darkTestBtn : styles.lightTestBtn]}
          >
            <Ionicons name="alarm-outline" size={15} color={Palette.neon.cyan} style={{ marginRight: 6 }} />
            <Text style={[styles.testPillBtnText, { color: Palette.neon.cyan }]}>Pre-Start (5m)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-test-begun"
            accessibilityLabel="Test Task Begun Alarm"
            accessibilityRole="button"
            onPress={() => {
              triggerAlarm({
                id: `test_start_${Date.now()}`,
                occurrence: {
                  id: 'occ_test',
                  taskId: 'task_test',
                  scheduledDate: '2026-10-17',
                  scheduledStart: '10:00',
                  scheduledEnd: '11:00',
                  status: 'upcoming',
                  progressPercentage: 0,
                  actualData: {},
                  actualDisplay: '0m',
                  task: {
                    id: 'task_test',
                    title: 'Strategic Planning Session',
                    description: '',
                    categoryId: 'cat_3',
                    priority: 'high',
                    measurementType: 'duration',
                    measurementConfig: { plannedMinutes: 60 },
                    scheduledStart: '10:00',
                    scheduledEnd: '11:00',
                    category: { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' },
                  },
                },
                stage: 'start',
                title: 'Task Has Begun!',
                message: 'It is time for "Strategic Planning Session". Scheduled until 11:00.',
                targetTime: '10:00',
              });
            }}
            style={[styles.testPillBtn, isDark ? styles.darkTestBtn : styles.lightTestBtn]}
          >
            <Ionicons name="play-outline" size={15} color={Palette.neon.emerald} style={{ marginRight: 6 }} />
            <Text style={[styles.testPillBtnText, { color: Palette.neon.emerald }]}>Task Begun</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-test-wrapup"
            accessibilityLabel="Test Wrap-Up Alarm"
            accessibilityRole="button"
            onPress={() => {
              triggerAlarm({
                id: `test_preend_${Date.now()}`,
                occurrence: {
                  id: 'occ_test',
                  taskId: 'task_test',
                  scheduledDate: '2026-10-17',
                  scheduledStart: '10:00',
                  scheduledEnd: '11:00',
                  status: 'in_progress',
                  progressPercentage: 80,
                  actualData: {},
                  actualDisplay: '48m',
                  task: {
                    id: 'task_test',
                    title: 'Strategic Planning Session',
                    description: '',
                    categoryId: 'cat_3',
                    priority: 'high',
                    measurementType: 'duration',
                    measurementConfig: { plannedMinutes: 60 },
                    scheduledStart: '10:00',
                    scheduledEnd: '11:00',
                    category: { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' },
                  },
                },
                stage: 'pre_end',
                title: '5 Minutes Remaining!',
                message: '"Strategic Planning Session" ends at 11:00. Time to review and wrap up!',
                targetTime: '11:00',
              });
            }}
            style={[styles.testPillBtn, isDark ? styles.darkTestBtn : styles.lightTestBtn]}
          >
            <Ionicons name="hourglass-outline" size={15} color={Palette.neon.amber} style={{ marginRight: 6 }} />
            <Text style={[styles.testPillBtnText, { color: Palette.neon.amber }]}>Pre-End (5m)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Scheduling & Time Preferences */}
      <View style={[styles.glassCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.specularLine} />
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleIconRow}>
            <Ionicons name="calendar-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Scheduling & Preferences
            </Text>
          </View>
        </View>

        {/* Time Format */}
        <TouchableOpacity
          testID="btn-toggle-timeformat"
          accessibilityLabel="Toggle Time Format"
          accessibilityRole="button"
          onPress={() => {
            const next = settings.timeFormat === '12h' ? '24h' : '12h';
            updateSetting('timeFormat', next);
          }}
          style={styles.settingNavRow}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="time-outline" size={18} color={accentColor} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabelText, isDark ? styles.darkText : styles.lightText]}>
              Time Format
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValueText, { color: accentColor }]}>
              {settings.timeFormat === '24h' ? '24-hour' : '12-hour (AM/PM)'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </View>
        </TouchableOpacity>

        {/* First Day of Week */}
        <TouchableOpacity
          testID="btn-toggle-firstday"
          accessibilityLabel="Toggle First Day of Week"
          accessibilityRole="button"
          onPress={() => {
            const next = settings.firstDayOfWeek === 'Sunday' ? 'Monday' : 'Sunday';
            updateSetting('firstDayOfWeek', next);
          }}
          style={styles.settingNavRow}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="calendar" size={18} color={accentColor} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabelText, isDark ? styles.darkText : styles.lightText]}>
              First Day of Week
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValueText, { color: accentColor }]}>
              {settings.firstDayOfWeek || 'Monday'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </View>
        </TouchableOpacity>

        {/* Default Reminder Before Task */}
        <TouchableOpacity
          testID="btn-reminder-mins"
          accessibilityLabel="Select Default Reminder"
          accessibilityRole="button"
          onPress={() => setIsReminderModalOpen(true)}
          style={styles.settingNavRow}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="timer-outline" size={18} color={accentColor} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabelText, isDark ? styles.darkText : styles.lightText]}>
              Default Reminder
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValueText, { color: accentColor }]}>
              {settings.defaultReminderMins || 15} mins before
            </Text>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </View>
        </TouchableOpacity>

        {/* Default Task Duration */}
        <TouchableOpacity
          testID="btn-duration-mins"
          accessibilityLabel="Select Default Task Duration"
          accessibilityRole="button"
          onPress={() => setIsDurationModalOpen(true)}
          style={[styles.settingNavRow, { borderBottomWidth: 0 }]}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="hourglass-outline" size={18} color={accentColor} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabelText, isDark ? styles.darkText : styles.lightText]}>
              Default Task Duration
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValueText, { color: accentColor }]}>
              {settings.defaultTaskDuration || 60} mins
            </Text>
            <Ionicons name="chevron-forward" size={16} color={subtextColor} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 6. Interaction & Automation Settings */}
      <View style={[styles.glassCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.specularLine} />
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleIconRow}>
            <Ionicons name="finger-print-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Interactions & Feedback
            </Text>
          </View>
        </View>

        <View style={styles.switchSettingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.triggerTitle, isDark ? styles.darkText : styles.lightText]}>
              Haptic Tactile Feedback
            </Text>
            <Text style={[styles.triggerDesc, { color: subtextColor }]}>
              Physical vibration response on clay button taps and slider changes.
            </Text>
          </View>
          <Switch
            testID="switch-haptic"
            accessibilityLabel="Haptic Feedback Toggle"
            value={settings.hapticFeedback !== false}
            onValueChange={(val) => updateSetting('hapticFeedback', val)}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: accentColor }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchSettingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.triggerTitle, isDark ? styles.darkText : styles.lightText]}>
              Completion Sound Chime
            </Text>
            <Text style={[styles.triggerDesc, { color: subtextColor }]}>
              Plays an audio celebratory chime when marking tasks or habits complete.
            </Text>
          </View>
          <Switch
            testID="switch-completion-sound"
            accessibilityLabel="Completion Sound Toggle"
            value={settings.completionSound !== false}
            onValueChange={(val) => updateSetting('completionSound', val)}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: Palette.neon.emerald }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.switchSettingRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.triggerTitle, isDark ? styles.darkText : styles.lightText]}>
              Auto Roll-Forward
            </Text>
            <Text style={[styles.triggerDesc, { color: subtextColor }]}>
              Automatically reschedule incomplete tasks to tomorrow morning.
            </Text>
          </View>
          <Switch
            testID="switch-autoroll"
            accessibilityLabel="Auto Roll-Forward Toggle"
            value={settings.autoRollForward === true}
            onValueChange={(val) => updateSetting('autoRollForward', val)}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: Palette.neon.amber }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 7. Data Management & Storage */}
      <View style={[styles.glassCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.specularLine} />
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleIconRow}>
            <Ionicons name="server-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              Data & Storage
            </Text>
          </View>
          <Text style={[styles.badgeText, { color: '#10B981' }]}>SQLite</Text>
        </View>

        <TouchableOpacity
          testID="btn-clear-completed"
          accessibilityLabel="Clear Completed Tasks History"
          accessibilityRole="button"
          onPress={handleClearCompleted}
          style={styles.dataActionBtn}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="checkmark-done-circle-outline" size={18} color={accentColor} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabelText, isDark ? styles.darkText : styles.lightText]}>
              Clear Completed Tasks History
            </Text>
          </View>
          <Ionicons name="trash-outline" size={16} color={subtextColor} />
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-reset-all"
          accessibilityLabel="Reset All Data"
          accessibilityRole="button"
          onPress={handleResetAllData}
          style={[styles.dataActionBtn, { borderBottomWidth: 0 }]}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabelText, { color: '#EF4444', fontWeight: '600' }]}>
              Reset All Tasks & Habits Data
            </Text>
          </View>
          <Ionicons name="warning-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* 8. About & App Version */}
      <View style={[styles.glassCard, isDark ? styles.darkCard : styles.lightCard, { marginBottom: 30 }]}>
        <View style={styles.specularLine} />
        <View style={styles.aboutRow}>
          <View style={[styles.appIconBadge, isDark ? styles.darkIconGlow : styles.lightIconGlow]}>
            <Ionicons name="time" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.appNameText, isDark ? styles.darkText : styles.lightText]}>
              Chrono<Text style={{ color: Palette.neon.cyan }}>Track</Text>
            </Text>
            <Text style={[styles.appVersionText, { color: subtextColor }]}>
              Version 2.0.0 (Release APK)
            </Text>
            <Text style={[styles.appMetaText, { color: subtextColor }]}>
              Cyber Glass & Neon Clay Edition • React Native 0.86
            </Text>
          </View>
        </View>
      </View>

      {/* POPUP MODAL 1: Pause / Snooze Picker */}
      <Modal
        visible={isPauseModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPauseModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPauseModalOpen(false)}
        >
          <View style={[styles.modalCard, isDark ? styles.darkModalCard : styles.lightModalCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
                Pause Alarm (Snooze Duration)
              </Text>
              <TouchableOpacity onPress={() => setIsPauseModalOpen(false)}>
                <Ionicons name="close" size={22} color={subtextColor} />
              </TouchableOpacity>
            </View>

            {SNOOZE_OPTIONS.map((mins) => {
              const isSelected = pauseAlarmMins === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    updateSetting('pauseAlarmMins', mins);
                    setIsPauseModalOpen(false);
                  }}
                  style={[
                    styles.modalOptionItem,
                    isSelected && (isDark ? styles.modalOptionSelectedDark : styles.modalOptionSelectedLight),
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected ? styles.modalOptionTextActive : (isDark ? styles.darkText : styles.lightText),
                    ]}
                  >
                    {mins} minutes
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#0D9488" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL 2: Alarm Sound Picker */}
      <Modal
        visible={isSoundModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSoundModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSoundModalOpen(false)}
        >
          <View style={[styles.modalCard, isDark ? styles.darkModalCard : styles.lightModalCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
                Alarm Sound
              </Text>
              <TouchableOpacity onPress={() => setIsSoundModalOpen(false)}>
                <Ionicons name="close" size={22} color={subtextColor} />
              </TouchableOpacity>
            </View>

            {ALARM_SOUNDS.map((snd) => {
              const isSelected = alarmSound === snd;
              return (
                <TouchableOpacity
                  key={snd}
                  onPress={() => {
                    updateSetting('alarmSound', snd);
                    setIsSoundModalOpen(false);
                  }}
                  style={[
                    styles.modalOptionItem,
                    isSelected && (isDark ? styles.modalOptionSelectedDark : styles.modalOptionSelectedLight),
                  ]}
                >
                  <View style={styles.titleIconRow}>
                    <Ionicons
                      name="musical-note-outline"
                      size={18}
                      color={isSelected ? '#0D9488' : subtextColor}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected ? styles.modalOptionTextActive : (isDark ? styles.darkText : styles.lightText),
                      ]}
                    >
                      {snd}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#0D9488" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL 3: Default Reminder Picker */}
      <Modal
        visible={isReminderModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReminderModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsReminderModalOpen(false)}
        >
          <View style={[styles.modalCard, isDark ? styles.darkModalCard : styles.lightModalCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
                Default Task Reminder
              </Text>
              <TouchableOpacity onPress={() => setIsReminderModalOpen(false)}>
                <Ionicons name="close" size={22} color={subtextColor} />
              </TouchableOpacity>
            </View>

            {REMINDER_OPTIONS.map((mins) => {
              const isSelected = (settings.defaultReminderMins || 15) === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    updateSetting('defaultReminderMins', mins);
                    setIsReminderModalOpen(false);
                  }}
                  style={[
                    styles.modalOptionItem,
                    isSelected && (isDark ? styles.modalOptionSelectedDark : styles.modalOptionSelectedLight),
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected ? styles.modalOptionTextActive : (isDark ? styles.darkText : styles.lightText),
                    ]}
                  >
                    {mins} minutes before
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color={accentColor} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL 4: Default Duration Picker */}
      <Modal
        visible={isDurationModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDurationModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDurationModalOpen(false)}
        >
          <View style={[styles.modalCard, isDark ? styles.darkModalCard : styles.lightModalCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
                Default Task Duration
              </Text>
              <TouchableOpacity onPress={() => setIsDurationModalOpen(false)}>
                <Ionicons name="close" size={22} color={subtextColor} />
              </TouchableOpacity>
            </View>

            {DURATION_OPTIONS.map((mins) => {
              const isSelected = (settings.defaultTaskDuration || 60) === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    updateSetting('defaultTaskDuration', mins);
                    setIsDurationModalOpen(false);
                  }}
                  style={[
                    styles.modalOptionItem,
                    isSelected && (isDark ? styles.modalOptionSelectedDark : styles.modalOptionSelectedLight),
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected ? styles.modalOptionTextActive : (isDark ? styles.darkText : styles.lightText),
                    ]}
                  >
                    {mins} minutes
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color={accentColor} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL 5: Edit Profile Dialog */}
      <Modal
        visible={isEditProfileOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditProfileOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsEditProfileOpen(false)}
        >
          <View style={[styles.modalCard, isDark ? styles.darkModalCard : styles.lightModalCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark ? styles.darkText : styles.lightText]}>
                Edit Account Profile
              </Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <Ionicons name="close" size={22} color={subtextColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputFieldLabel, { color: subtextColor }]}>Display Name</Text>
            <TextInput
              testID="input-profile-name"
              value={tempName}
              onChangeText={setTempName}
              placeholder="Your Name"
              placeholderTextColor={subtextColor}
              style={[styles.textInput, isDark ? styles.darkInput : styles.lightInput]}
            />

            <Text style={[styles.inputFieldLabel, { color: subtextColor, marginTop: 12 }]}>Email Address</Text>
            <TextInput
              testID="input-profile-email"
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={subtextColor}
              style={[styles.textInput, isDark ? styles.darkInput : styles.lightInput]}
            />

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                onPress={() => setIsEditProfileOpen(false)}
                style={[styles.cancelBtn, isDark ? styles.darkPillBtn : styles.lightPillBtn]}
              >
                <Text style={[styles.dialogBtnText, { color: subtextColor }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-save-profile"
                onPress={handleSaveProfile}
                style={[styles.saveBtn, { backgroundColor: accentColor }]}
              >
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF', fontWeight: '700' }]}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },
  lightBg: {
    backgroundColor: '#F4F7FB',
  },
  darkBg: {
    backgroundColor: '#080C16',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  lightIconBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  darkIconBox: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  glassCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    position: 'relative',
    overflow: 'hidden',
  },
  lightCard: {
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightAvatarGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  darkAvatarGlow: {
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#080C16',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  lightPillBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  darkPillBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  themeSegmentTrack: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 18,
    gap: 8,
  },
  lightSegmentTrack: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  darkSegmentTrack: {
    backgroundColor: '#0A0F1E',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  themeSegmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  activeSegmentLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  activeSegmentDark: {
    backgroundColor: '#131D33',
    borderWidth: 1.2,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveSegment: {
    backgroundColor: 'transparent',
  },
  themeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sunCircleActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  moonCircleActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  iconCircleInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  themeSegmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTextLight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  activeTextDark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inactiveTextLight: {
    color: '#64748B',
  },
  inactiveTextDark: {
    color: '#64748B',
  },
  referenceAlarmCard: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  referenceLightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(13, 148, 136, 0.2)',
  },
  referenceDarkCard: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  alarmRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  alarmOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  alarmOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  alarmOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmOptionVal: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  liveStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subSectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  triggerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  triggerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  triggerDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  testBtnGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  testPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  lightTestBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  darkTestBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingValueText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  switchSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  dataActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightIconGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  darkIconGlow: {
    backgroundColor: Palette.neon.cyan,
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  appNameText: {
    fontSize: 17,
    fontWeight: '800',
  },
  appVersionText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  appMetaText: {
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
  },
  lightModalCard: {
    backgroundColor: '#FFFFFF',
    borderColor: Palette.glass.lightBorder,
  },
  darkModalCard: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 3,
  },
  modalOptionSelectedLight: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  modalOptionSelectedDark: {
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  lightInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  darkInput: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  dialogBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  dialogBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  darkText: {
    color: '#F8FAFC',
  },
  lightText: {
    color: '#0F172A',
  },
});
