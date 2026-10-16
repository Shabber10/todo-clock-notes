import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculateDailyAnalytics, calculateWeeklyAnalytics } from '../services/analyticsService';
import { Ionicons } from '@expo/vector-icons';

export const TrackScreen: React.FC = () => {
  const { selectedDate, settings } = useApp();
  const isDark = settings.theme === 'dark';
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const dailyStats = calculateDailyAnalytics(selectedDate);
  const weeklyStats = calculateWeeklyAnalytics(selectedDate);

  const PERIODS: { key: 'daily' | 'weekly' | 'monthly' | 'yearly'; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  return (
    <ScrollView style={[styles.container, isDark ? styles.darkBg : styles.lightBg]} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Period Tabs */}
      <View style={[styles.periodBar, isDark ? styles.darkPeriodBar : styles.lightPeriodBar]}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            testID={`btn-period-${p.key}`}
            accessibilityLabel={`${p.label} Analytics Period`}
            accessibilityRole="tab"
            accessibilityState={{ selected: period === p.key }}
            onPress={() => setPeriod(p.key)}
            style={[styles.periodTab, period === p.key && styles.periodTabActive]}
          >
            <Text style={[
              styles.periodText,
              period === p.key ? styles.periodTextActive : (isDark ? styles.darkSub : styles.lightSub)
            ]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4 Summary Metric Cards */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Tasks Completed</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {dailyStats.completed} / {dailyStats.totalDue}
          </Text>
          <Text style={styles.metricSub}>{dailyStats.completionRate}% completion rate</Text>
        </View>

        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Focus Time</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {dailyStats.actualFocusDisplay}
          </Text>
          <Text style={styles.metricSub}>Of {dailyStats.plannedFocusDisplay} planned</Text>
        </View>

        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Target Achievement</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {dailyStats.targetAchievement}%
          </Text>
          <Text style={styles.metricSub}>Across targets</Text>
        </View>

        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Plan Adherence</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {dailyStats.completionRate}%
          </Text>
          <Text style={styles.metricSub}>Tasks completed on time</Text>
        </View>
      </View>

      {/* Completion Trend Bar Visualization */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
            Weekly Completion Trend
          </Text>
          <Text style={styles.avgBadge}>{weeklyStats.averageRate}% Avg</Text>
        </View>

        <View style={styles.chartBarsRow}>
          {weeklyStats.trend.map((t, idx) => {
            const heightPercent = Math.max(12, t.rate);
            return (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                </View>
                <Text style={styles.barLabel}>{t.day}</Text>
                <Text style={styles.barSub}>{t.rate}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText, { marginBottom: 12 }]}>
          Category Distribution
        </Text>

        {dailyStats.categoryDistribution.map((cat, idx) => (
          <View key={idx} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.catName, isDark ? styles.darkText : styles.lightText]}>
                {cat.name}
              </Text>
            </View>
            <Text style={styles.catStats}>
              {cat.count} tasks ({cat.percentage}%)
            </Text>
          </View>
        ))}
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
  periodBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  lightPeriodBar: {
    backgroundColor: '#EEF2F6',
  },
  darkPeriodBar: {
    backgroundColor: '#1E293B',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodTabActive: {
    backgroundColor: '#2563EB',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  avgBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingVertical: 8,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  barSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catStats: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
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
});
