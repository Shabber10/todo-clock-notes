import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { CalendarStrip } from '../components/CalendarStrip';
import { DailySummaryCard } from '../components/DailySummaryCard';
import { TaskCard } from '../components/TaskCard';
import { Ionicons } from '@expo/vector-icons';

export const TodayScreen: React.FC = () => {
  const { occurrences, settings, setIsAddTaskModalOpen } = useApp();
  const isDark = settings.theme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      {/* 7-day strip */}
      <CalendarStrip />

      {/* Main timeline */}
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <DailySummaryCard />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
                Today's Tasks
              </Text>
              <Text style={styles.taskCountBadge}>
                {occurrences.length} scheduled
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => <TaskCard occurrence={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={isDark ? '#475569' : '#CBD5E1'} />
            <Text style={[styles.emptyTitle, isDark ? styles.darkText : styles.lightText]}>
              No tasks scheduled
            </Text>
            <Text style={styles.emptySub}>
              Tap the + button below to plan a task for this day
            </Text>
            <TouchableOpacity
              testID="btn-empty-add-task"
              accessibilityLabel="Add a Task"
              accessibilityRole="button"
              onPress={() => setIsAddTaskModalOpen(true)}
              style={styles.emptyAddBtn}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.emptyAddBtnText}>Add a Task</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightBg: {
    backgroundColor: '#F8FAFC',
  },
  darkBg: {
    backgroundColor: '#0F172A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  taskCountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
