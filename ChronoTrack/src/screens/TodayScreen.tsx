import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { CalendarStrip } from '../components/CalendarStrip';
import { DailySummaryCard } from '../components/DailySummaryCard';
import { TaskCard } from '../components/TaskCard';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ClayButton } from '../components/ClayButton';

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
              <View style={[styles.taskCountBadge, isDark ? styles.darkCountBadge : styles.lightCountBadge]}>
                <Text style={[styles.taskCountText, isDark ? { color: Palette.neon.cyan } : { color: '#2563EB' }]}>
                  {occurrences.length} scheduled
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => <TaskCard occurrence={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, isDark ? styles.darkEmptyIcon : styles.lightEmptyIcon]}>
              <Ionicons name="calendar-outline" size={38} color={isDark ? Palette.neon.cyan : '#2563EB'} />
            </View>
            <Text style={[styles.emptyTitle, isDark ? styles.darkText : styles.lightText]}>
              No tasks scheduled
            </Text>
            <Text style={styles.emptySub}>
              Tap the + button below to plan a task for this day
            </Text>
            <ClayButton
              testID="btn-empty-add-task"
              accessibilityLabel="Add a Task"
              onPress={() => setIsAddTaskModalOpen(true)}
              isDark={isDark}
              variant="accent"
              glowColor={Palette.neon.cyanGlow}
              borderRadius={14}
              style={styles.emptyAddBtn}
            >
              <View style={styles.emptyAddBtnContent}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.emptyAddBtnText}>Add a Task</Text>
              </View>
            </ClayButton>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightBg: {
    backgroundColor: Palette.canvas.light,
  },
  darkBg: {
    backgroundColor: Palette.canvas.dark,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  taskCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  lightCountBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  darkCountBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  taskCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lightEmptyIcon: {
    backgroundColor: '#EFF6FF',
  },
  darkEmptyIcon: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  emptyAddBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyAddBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyAddBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
