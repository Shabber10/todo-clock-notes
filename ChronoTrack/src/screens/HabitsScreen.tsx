import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ClayButton } from '../components/ClayButton';

export const HabitsScreen: React.FC = () => {
  const { habits, settings, toggleHabit } = useApp();
  const isDark = settings.theme === 'dark';

  return (
    <ScrollView style={[styles.container, isDark ? styles.darkBg : styles.lightBg]} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.darkText : styles.lightText]}>
          Daily Habits
        </Text>
        <Text style={styles.headerSub}>
          Tap checkmark to record today's habit and build your streak
        </Text>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="repeat-outline" size={48} color={isDark ? '#475569' : '#CBD5E1'} />
          <Text style={[styles.emptyTitle, isDark ? styles.darkText : styles.lightText]}>
            No habits tracked yet
          </Text>
          <Text style={styles.emptySub}>
            Build daily routines and streaks to stay consistent and focused
          </Text>
        </View>
      ) : (
        habits.map((habit) => {
          return (
            <View key={habit.id} style={[styles.card, isDark ? styles.darkCard : styles.lightCard]}>
              <View style={styles.infoCol}>
                <Text style={[styles.habitTitle, isDark ? styles.darkText : styles.lightText]}>
                  {habit.title}
                </Text>
                <Text style={styles.habitMeta}>
                  {habit.frequency} • {habit.target}
                </Text>
                <View style={[styles.streakBadge, isDark ? styles.darkStreakBadge : styles.lightStreakBadge]}>
                  <Ionicons name="flame" size={14} color={Palette.neon.amberBright} />
                  <Text style={[styles.streakText, { color: Palette.neon.amberBright }]}>
                    {habit.streakCount} day streak
                  </Text>
                </View>
              </View>

              {/* 3D Tactile Clay Checkmark Button */}
              <ClayButton
                testID={`btn-habit-toggle-${habit.id}`}
                accessibilityLabel={`Toggle habit ${habit.title}, currently ${habit.completedToday ? 'completed' : 'incomplete'}`}
                onPress={() => toggleHabit(habit.id)}
                isDark={isDark}
                variant={habit.completedToday ? 'success' : 'secondary'}
                glowColor={habit.completedToday ? Palette.neon.emeraldGlow : undefined}
                borderRadius={22}
                style={styles.clayCheckBtn}
              >
                <Ionicons
                  name={habit.completedToday ? "checkmark" : "ellipse-outline"}
                  size={22}
                  color={habit.completedToday ? "#FFFFFF" : (isDark ? "#94A3B8" : "#64748B")}
                />
              </ClayButton>
            </View>
          );
        })
      )}
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
    backgroundColor: Palette.canvas.light,
  },
  darkBg: {
    backgroundColor: Palette.canvas.dark,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  lightCard: {
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  infoCol: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  habitMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lightStreakBadge: {
    backgroundColor: '#FEF3C7',
  },
  darkStreakBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clayCheckBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
