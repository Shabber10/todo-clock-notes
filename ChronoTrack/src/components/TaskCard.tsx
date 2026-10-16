import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskOccurrence } from '../types';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  occurrence: TaskOccurrence;
}

export const TaskCard: React.FC<TaskCardProps> = ({ occurrence }) => {
  const { settings, setSelectedOccurrenceForProgress, currentTimeMinutes, selectedDate } = useApp();
  const isDark = settings.theme === 'dark';
  const { task, status, progressPercentage, actualDisplay, scheduledStart, scheduledEnd } = occurrence;

  const isCompleted = status === 'completed';

  // Compute effective dynamic status based on real mobile clock time
  const now = new Date();
  const currentMinutes = typeof currentTimeMinutes === 'number'
    ? currentTimeMinutes
    : (now.getHours() * 60 + now.getMinutes());

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const occDate = occurrence.scheduledDate || selectedDate || todayStr;
  const isToday = occDate === todayStr;

  const startTimeStr = scheduledStart || task?.scheduledStart || '00:00';
  const endTimeStr = scheduledEnd || task?.scheduledEnd || '23:59';
  const [sh, sm] = startTimeStr.split(':').map(Number);
  const [eh, em] = endTimeStr.split(':').map(Number);
  const startMins = (sh || 0) * 60 + (sm || 0);
  const endMins = (eh || 0) * 60 + (em || 0);

  let effectiveStatus: 'completed' | 'ongoing' | 'overdue' | 'upcoming' = 'upcoming';

  if (isCompleted) {
    effectiveStatus = 'completed';
  } else if (isToday) {
    if (status === 'in_progress') {
      effectiveStatus = 'ongoing';
    } else if (currentMinutes >= startMins && currentMinutes < endMins) {
      effectiveStatus = 'ongoing';
    } else if (currentMinutes >= endMins) {
      effectiveStatus = 'overdue';
    } else {
      effectiveStatus = 'upcoming';
    }
  } else if (occDate < todayStr) {
    effectiveStatus = 'overdue';
  } else {
    effectiveStatus = 'upcoming';
  }

  const isOngoing = effectiveStatus === 'ongoing';

  const categoryColor = task.category?.color || '#2563EB';

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'urgent':
        return { label: 'Urgent', bg: '#FEE2E2', text: '#DC2626' };
      case 'high':
        return { label: 'High', bg: '#FFEDD5', text: '#EA580C' };
      case 'medium':
        return { label: 'Medium', bg: '#FEF3C7', text: '#D97706' };
      case 'low':
      default:
        return { label: 'Low', bg: '#E0F2FE', text: '#0284C7' };
    }
  };

  const priorityStyle = getPriorityBadge();

  return (
    <TouchableOpacity
      testID={`card-task-${occurrence.id}`}
      accessibilityLabel={`Task ${task.title}, ${effectiveStatus}, ${actualDisplay || 'Not started'}`}
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={() => setSelectedOccurrenceForProgress(occurrence)}
      style={[
        styles.card,
        isDark ? styles.darkCard : styles.lightCard,
        { borderLeftColor: categoryColor, borderLeftWidth: 4 }
      ]}
    >
      {/* Top Row: Time, Category & Priority */}
      <View style={styles.topRow}>
        <View style={styles.timeCategory}>
          <Text style={[styles.timeText, isDark ? styles.darkSub : styles.lightSub]}>
            {scheduledStart} – {scheduledEnd}
          </Text>
          <View style={[styles.badge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>
              {task.category?.name || 'General'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
            <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
              {priorityStyle.label}
            </Text>
          </View>
        </View>

        {/* Status Pill */}
        {effectiveStatus === 'completed' ? (
          <View style={[styles.statusPill, isDark ? styles.darkCompletedPill : styles.completedPill]}>
            <Text style={[styles.completedText, isDark && styles.darkCompletedText]}>Completed</Text>
            <Ionicons name="checkmark-circle" size={14} color={isDark ? "#34D399" : "#10B981"} style={{ marginLeft: 3 }} />
          </View>
        ) : effectiveStatus === 'ongoing' ? (
          <View style={[styles.statusPill, isDark ? styles.darkOngoingPill : styles.ongoingPill]}>
            <View style={styles.ongoingDot} />
            <Text style={[styles.ongoingText, isDark && styles.darkOngoingText]}>Ongoing</Text>
          </View>
        ) : effectiveStatus === 'overdue' ? (
          <View style={[styles.statusPill, isDark ? styles.darkOverduePill : styles.overduePill]}>
            <Text style={[styles.overdueText, isDark && styles.darkOverdueText]}>Ended</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, isDark ? styles.darkUpcomingPill : styles.upcomingPill]}>
            <Text style={[styles.upcomingText, isDark && styles.darkUpcomingText]}>Upcoming</Text>
          </View>
        )}
      </View>

      {/* Title & Target Row */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, isDark ? styles.darkText : styles.lightText]}>
            {task.title}
          </Text>
          <Text style={[styles.targetText, isDark ? styles.darkSub : styles.lightSub]}>
            {actualDisplay || 'Not started'}
          </Text>
        </View>

        {/* Action Icon / Check */}
        <TouchableOpacity
          testID={`btn-task-action-${occurrence.id}`}
          accessibilityLabel={`Action for ${task.title}`}
          accessibilityRole="button"
          onPress={() => setSelectedOccurrenceForProgress(occurrence)}
          style={[styles.actionCircle, isCompleted ? styles.actionCompleted : (isOngoing ? styles.actionActive : styles.actionDefault)]}
        >
          <Ionicons
            name={isCompleted ? "checkmark" : (isOngoing ? "pause" : "play")}
            size={16}
            color={isCompleted ? "#FFFFFF" : (isOngoing ? "#2563EB" : (isDark ? "#94A3B8" : "#64748B"))}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, isDark ? styles.darkTrack : styles.lightTrack]}>
        <View
          style={[
            styles.progressThumb,
            {
              width: `${progressPercentage}%`,
              backgroundColor: isCompleted ? '#10B981' : '#2563EB'
            }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  completedPill: {
    backgroundColor: '#ECFDF5',
  },
  darkCompletedPill: {
    backgroundColor: '#064E3B',
  },
  completedText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  darkCompletedText: {
    color: '#34D399',
  },
  ongoingPill: {
    backgroundColor: '#EFF6FF',
  },
  darkOngoingPill: {
    backgroundColor: '#1E3A8A',
  },
  ongoingText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  darkOngoingText: {
    color: '#60A5FA',
  },
  ongoingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 4,
  },
  overduePill: {
    backgroundColor: '#FEF2F2',
  },
  darkOverduePill: {
    backgroundColor: '#450A0A',
  },
  overdueText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  darkOverdueText: {
    color: '#F87171',
  },
  inProgressPill: {
    backgroundColor: '#EFF6FF',
  },
  inProgressText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  upcomingPill: {
    backgroundColor: '#FFFBEB',
  },
  darkUpcomingPill: {
    backgroundColor: '#451A03',
  },
  upcomingText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  darkUpcomingText: {
    color: '#FBBF24',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  targetText: {
    fontSize: 12,
    marginTop: 2,
  },
  actionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionCompleted: {
    backgroundColor: '#10B981',
  },
  actionActive: {
    backgroundColor: '#DBEAFE',
  },
  actionDefault: {
    backgroundColor: '#F1F5F9',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  lightTrack: {
    backgroundColor: '#E2E8F0',
  },
  darkTrack: {
    backgroundColor: '#334155',
  },
  progressThumb: {
    height: '100%',
    borderRadius: 2,
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
});
