import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

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
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={14} color="#EA580C" />
                  <Text style={styles.streakText}>
                    {habit.streakCount} day streak
                  </Text>
                </View>
              </View>

              {/* Checkmark Button */}
              <TouchableOpacity
                testID={`btn-habit-toggle-${habit.id}`}
                accessibilityLabel={`Toggle habit ${habit.title}, currently ${habit.completedToday ? 'completed' : 'incomplete'}`}
                accessibilityRole="button"
                accessibilityState={{ selected: habit.completedToday }}
                onPress={() => toggleHabit(habit.id)}
                style={[
                  styles.checkBtn,
                  habit.completedToday ? styles.checkBtnDone : (isDark ? styles.darkCheckBtn : styles.lightCheckBtn)
                ]}
              >
                <Ionicons
                  name={habit.completedToday ? "checkmark" : "ellipse-outline"}
                  size={24}
                  color={habit.completedToday ? "#FFFFFF" : (isDark ? "#64748B" : "#CBD5E1")}
                />
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  darkBg: {
    backgroundColor: '#0F172A',
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
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
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
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkBtnDone: {
    backgroundColor: '#10B981',
  },
  lightCheckBtn: {
    backgroundColor: '#F1F5F9',
  },
  darkCheckBtn: {
    backgroundColor: '#334155',
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
