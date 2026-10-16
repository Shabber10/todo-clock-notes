import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../theme/colors';

export const GoalsScreen: React.FC = () => {
  const { goals, settings } = useApp();
  const isDark = settings.theme === 'dark';
  const [tab, setTab] = useState<'active' | 'completed' | 'archived'>('active');

  const filteredGoals = goals.filter(g => g.status === tab);

  return (
    <ScrollView style={[styles.container, isDark ? styles.darkBg : styles.lightBg]} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Tabs */}
      <View style={[styles.tabBar, isDark ? styles.darkTabBar : styles.lightTabBar]}>
        {(['active', 'completed', 'archived'] as const).map(t => (
          <TouchableOpacity
            key={t}
            testID={`btn-goal-tab-${t}`}
            accessibilityLabel={`${t.charAt(0).toUpperCase() + t.slice(1)} Goals`}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[
              styles.tabText,
              tab === t ? styles.tabTextActive : (isDark ? styles.darkSub : styles.lightSub)
            ]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goal Cards */}
      {filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color={isDark ? '#475569' : '#CBD5E1'} />
          <Text style={[styles.emptyTitle, isDark ? styles.darkText : styles.lightText]}>
            No {tab} goals
          </Text>
          <Text style={styles.emptySub}>
            Create goals to track long-term targets and personal achievements
          </Text>
        </View>
      ) : (
        filteredGoals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

          return (
            <View 
              key={goal.id} 
              testID={`card-goal-${goal.id}`}
              accessibilityLabel={`Goal ${goal.title}, ${goal.currentValue} of ${goal.targetValue} ${goal.unit}`}
              style={[styles.card, isDark ? styles.darkCard : styles.lightCard]}
            >
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{goal.category}</Text>
                </View>
                <Text style={styles.periodText}>{goal.period.toUpperCase()}</Text>
              </View>

              <Text style={[styles.title, isDark ? styles.darkText : styles.lightText]}>
                {goal.title}
              </Text>
              <Text style={styles.desc}>{goal.description}</Text>

              {/* Target and progress info */}
              <View style={styles.progressRow}>
                <Text style={[styles.progressValues, isDark ? styles.darkText : styles.lightText]}>
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </Text>
                <Text style={styles.percentageText}>{pct}%</Text>
              </View>

              {/* Progress Track */}
              <View style={[styles.track, isDark ? styles.darkTrack : styles.lightTrack]}>
                <View style={[styles.thumb, { width: `${pct}%` }]} />
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.deadlineText}>Deadline: {goal.deadline}</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
              </View>
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
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  lightTabBar: {
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
  },
  darkTabBar: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
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
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  periodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressValues: {
    fontSize: 13,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  lightTrack: {
    backgroundColor: '#E2E8F0',
  },
  darkTrack: {
    backgroundColor: '#334155',
  },
  thumb: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 11,
    color: '#94A3B8',
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
