import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskOccurrence } from '../types';
import { useApp } from '../context/AppContext';
import { Palette } from '../theme/colors';
import { PulseGlow } from './PulseGlow';
import { ClayButton } from './ClayButton';

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
  const categoryColor = task.category?.color || Palette.neon.blue;

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'urgent':
        return { label: 'Urgent', bg: 'rgba(255, 51, 102, 0.15)', text: Palette.neon.coralBright, border: 'rgba(255, 51, 102, 0.35)' };
      case 'high':
        return { label: 'High', bg: 'rgba(249, 115, 22, 0.15)', text: '#FB923C', border: 'rgba(249, 115, 22, 0.35)' };
      case 'medium':
        return { label: 'Medium', bg: 'rgba(245, 158, 11, 0.15)', text: Palette.neon.amberBright, border: 'rgba(245, 158, 11, 0.35)' };
      case 'low':
      default:
        return { label: 'Low', bg: 'rgba(59, 130, 246, 0.15)', text: Palette.neon.blueBright, border: 'rgba(59, 130, 246, 0.35)' };
    }
  };

  const priorityStyle = getPriorityBadge();

  return (
    <PulseGlow active={isOngoing} glowColor={Palette.neon.cyan} borderRadius={18} style={{ marginHorizontal: 16, marginBottom: 12 }}>
      <TouchableOpacity
        testID={`card-task-${occurrence.id}`}
        accessibilityLabel={`Task ${task.title}, ${effectiveStatus}, ${actualDisplay || 'Not started'}`}
        accessibilityRole="button"
        activeOpacity={0.88}
        onPress={() => setSelectedOccurrenceForProgress(occurrence)}
        style={[
          styles.card,
          isDark ? styles.darkCard : styles.lightCard,
          isOngoing && styles.ongoingCardBorder,
          { borderLeftColor: categoryColor, borderLeftWidth: 4 }
        ]}
      >
        {/* Top Specular Edge */}
        <View style={[styles.specularLine, isDark ? styles.darkSpecular : styles.lightSpecular]} />

        {/* Top Row: Time, Category & Priority */}
        <View style={styles.topRow}>
          <View style={styles.timeCategory}>
            <Text style={[styles.timeText, isDark ? styles.darkSub : styles.lightSub]}>
              {scheduledStart} – {scheduledEnd}
            </Text>
            <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)', borderColor: categoryColor, borderWidth: 0.5 }]}>
              <Text style={[styles.badgeText, { color: categoryColor }]}>
                {task.category?.name || 'General'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border, borderWidth: 0.5 }]}>
              <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
                {priorityStyle.label}
              </Text>
            </View>
          </View>

          {/* Status Pill with Glowing Badge */}
          {effectiveStatus === 'completed' ? (
            <View style={[styles.statusPill, isDark ? styles.darkCompletedPill : styles.completedPill]}>
              <Text style={[styles.completedText, isDark && styles.darkCompletedText]}>Completed</Text>
              <Ionicons name="checkmark-circle" size={13} color={Palette.neon.emeraldBright} style={{ marginLeft: 3 }} />
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

          {/* 3D Tactile Clay Action Button with Spring Physics */}
          <ClayButton
            testID={`btn-task-action-${occurrence.id}`}
            accessibilityLabel={`Action for ${task.title}`}
            onPress={() => setSelectedOccurrenceForProgress(occurrence)}
            isDark={isDark}
            borderRadius={18}
            variant={isCompleted ? 'success' : (isOngoing ? 'accent' : 'secondary')}
            glowColor={isCompleted ? Palette.neon.emeraldGlow : (isOngoing ? Palette.neon.cyanGlow : undefined)}
            style={styles.clayActionBtn}
          >
            <Ionicons
              name={isCompleted ? "checkmark" : (isOngoing ? "pause" : "play")}
              size={16}
              color={isCompleted ? "#FFFFFF" : (isOngoing ? "#FFFFFF" : (isDark ? "#94A3B8" : "#475569"))}
            />
          </ClayButton>
        </View>

        {/* Progress Bar with Glowing Accent */}
        <View style={[styles.progressTrack, isDark ? styles.darkTrack : styles.lightTrack]}>
          <View
            style={[
              styles.progressThumb,
              {
                width: `${progressPercentage}%`,
                backgroundColor: isCompleted ? Palette.neon.emeraldBright : (isOngoing ? Palette.neon.cyan : Palette.neon.blue),
                shadowColor: isCompleted ? Palette.neon.emerald : (isOngoing ? Palette.neon.cyan : Palette.neon.blue),
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}
          />
        </View>
      </TouchableOpacity>
    </PulseGlow>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  lightCard: {
    backgroundColor: Palette.glass.light,
    borderWidth: 1.5,
    borderColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: Palette.glass.dark,
    borderWidth: 1.5,
    borderColor: Palette.glass.darkBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  ongoingCardBorder: {
    borderColor: 'rgba(0, 240, 255, 0.45)',
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  lightSpecular: {
    backgroundColor: Palette.glass.lightBorderSpecular,
  },
  darkSpecular: {
    backgroundColor: Palette.glass.darkBorderSpecular,
  },
  clayActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
