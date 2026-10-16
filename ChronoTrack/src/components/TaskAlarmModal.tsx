import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Vibration, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TaskAlarm } from '../services/alarmService';
import * as db from '../database/db';

interface TaskAlarmModalProps {
  alarm: TaskAlarm | null;
  onDismiss: () => void;
}

export const TaskAlarmModal: React.FC<TaskAlarmModalProps> = ({ alarm, onDismiss }) => {
  const { settings, refreshData } = useApp();
  const isDark = settings.theme === 'dark';

  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (alarm) {
      // Start vibration alarm
      Vibration.vibrate([0, 500, 300, 500, 300, 500], true);

      // Start pulsing animation
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true
          })
        ])
      );
      loop.start();

      return () => {
        Vibration.cancel();
        loop.stop();
      };
    } else {
      Vibration.cancel();
      setShowSnoozeOptions(false);
    }
  }, [alarm]);

  if (!alarm) return null;

  const handleOk = () => {
    Vibration.cancel();
    if (alarm.stage === 'start') {
      // Transition task occurrence to in_progress
      db.saveOccurrenceProgressInDb(
        alarm.occurrence.id,
        alarm.occurrence.progressPercentage || 10,
        alarm.occurrence.actualData,
        alarm.occurrence.actualDisplay,
        'in_progress'
      );
      refreshData();
    }
    onDismiss();
  };

  const handleSnooze = (minutes: number) => {
    Vibration.cancel();
    if (alarm.stage === 'pre_end') {
      // Extend task completion time by X minutes
      db.extendOccurrenceInDb(alarm.occurrence.id, minutes);
    } else {
      // Postpone start and end time by X minutes
      db.postponeOccurrenceInDb(alarm.occurrence.id, minutes);
    }
    refreshData();
    onDismiss();
  };

  const getThemeColors = () => {
    switch (alarm.stage) {
      case 'pre_start':
        return {
          icon: 'alarm' as const,
          badgeBg: '#EFF6FF',
          badgeText: '#2563EB',
          accent: '#2563EB',
          tag: 'NEXT TASK IN 5 MINS'
        };
      case 'start':
        return {
          icon: 'play-circle' as const,
          badgeBg: '#ECFDF5',
          badgeText: '#059669',
          accent: '#10B981',
          tag: 'TASK HAS BEGUN'
        };
      case 'pre_end':
        return {
          icon: 'hourglass' as const,
          badgeBg: '#FFFBEB',
          badgeText: '#D97706',
          accent: '#F59E0B',
          tag: 'LAST 5 MINUTES'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <Modal
      visible={Boolean(alarm)}
      transparent
      animationType="fade"
      onRequestClose={handleOk}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, isDark ? styles.darkCard : styles.lightCard]}>
          {/* Pulsing Alarm Icon */}
          <Animated.View style={[styles.iconHalo, { backgroundColor: colors.accent + '25', transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.iconInner, { backgroundColor: colors.accent }]}>
              <Ionicons name={colors.icon} size={36} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Alarm Stage Badge */}
          <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.badgeText, { color: colors.badgeText }]}>
              {colors.tag}
            </Text>
          </View>

          {/* Title & Message */}
          <Text style={[styles.alarmTitle, isDark ? styles.darkText : styles.lightText]}>
            {alarm.title}
          </Text>

          <Text style={[styles.alarmMessage, isDark ? styles.darkSub : styles.lightSub]}>
            {alarm.message}
          </Text>

          {/* Task Info Pill */}
          <View style={[styles.taskInfoBox, isDark ? styles.darkTaskInfoBox : styles.lightTaskInfoBox]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.catDot, { backgroundColor: alarm.occurrence.task.category?.color || '#2563EB' }]} />
              <Text style={[styles.taskInfoTitle, isDark ? styles.darkText : styles.lightText]} numberOfLines={1}>
                {alarm.occurrence.task.title}
              </Text>
            </View>
            <Text style={styles.taskTimeRange}>
              {alarm.occurrence.scheduledStart} - {alarm.occurrence.scheduledEnd}
            </Text>
          </View>

          {/* Next Task Notice if available */}
          {alarm.nextTaskTitle && (
            <View style={styles.nextTaskBanner}>
              <Ionicons name="information-circle" size={16} color="#2563EB" />
              <Text style={styles.nextTaskText} numberOfLines={1}>
                Next: {alarm.nextTaskTitle} at {alarm.nextTaskTime}
              </Text>
            </View>
          )}

          {/* Snooze Sub-options Menu */}
          {showSnoozeOptions ? (
            <View style={styles.snoozeOptionsContainer}>
              <Text style={styles.snoozeHeader}>Choose postponement duration:</Text>
              <View style={styles.snoozeRow}>
                {[5, 10, 15].map(mins => (
                  <TouchableOpacity
                    key={mins}
                    testID={`btn-snooze-${mins}`}
                    accessibilityLabel={`Postpone by ${mins} minutes`}
                    accessibilityRole="button"
                    style={styles.snoozeChip}
                    onPress={() => handleSnooze(mins)}
                  >
                    <Text style={styles.snoozeChipText}>+{mins} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowSnoozeOptions(false)}
                style={styles.cancelSnoozeBtn}
              >
                <Text style={styles.cancelSnoozeText}>Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Main Actions: OK and Snooze */
            <View style={styles.actionsRow}>
              <TouchableOpacity
                testID="btn-alarm-snooze"
                accessibilityLabel="Snooze or Postpone Alarm"
                accessibilityRole="button"
                onPress={() => setShowSnoozeOptions(true)}
                style={[styles.btnSnooze, isDark ? styles.darkBtnSnooze : styles.lightBtnSnooze]}
              >
                <Ionicons name="time-outline" size={18} color={isDark ? "#94A3B8" : "#475569"} />
                <Text style={[styles.btnSnoozeText, isDark ? styles.darkBtnSnoozeText : styles.lightBtnSnoozeText]}>
                  Snooze
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-alarm-ok"
                accessibilityLabel="Acknowledge Alarm OK"
                accessibilityRole="button"
                onPress={handleOk}
                style={[styles.btnOk, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                <Text style={styles.btnOkText}>
                  {alarm.stage === 'start' ? 'Start Task' : 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16
  },
  lightCard: {
    backgroundColor: '#FFFFFF'
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1
  },
  iconHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  alarmTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  alarmMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 8
  },
  lightText: {
    color: '#0F172A'
  },
  darkText: {
    color: '#F8FAFC'
  },
  lightSub: {
    color: '#64748B'
  },
  darkSub: {
    color: '#94A3B8'
  },
  taskInfoBox: {
    width: '100%',
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  lightTaskInfoBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1
  },
  darkTaskInfoBox: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1
  },
  catDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5
  },
  taskInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 180
  },
  taskTimeRange: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  nextTaskBanner: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  nextTaskText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    flex: 1
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 6
  },
  btnSnooze: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  lightBtnSnooze: {
    backgroundColor: '#F1F5F9'
  },
  darkBtnSnooze: {
    backgroundColor: '#334155'
  },
  btnSnoozeText: {
    fontSize: 15,
    fontWeight: '700'
  },
  lightBtnSnoozeText: {
    color: '#475569'
  },
  darkBtnSnoozeText: {
    color: '#F1F5F9'
  },
  btnOk: {
    flex: 1.2,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  btnOkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  snoozeOptionsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 6
  },
  snoozeHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10
  },
  snoozeRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 10
  },
  snoozeChip: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  snoozeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  cancelSnoozeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  cancelSnoozeText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13
  }
});
