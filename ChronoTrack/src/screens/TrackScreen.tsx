import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculatePeriodAnalytics } from '../services/analyticsService';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Palette } from '../theme/colors';

export const TrackScreen: React.FC = () => {
  const { selectedDate, settings } = useApp();
  const isDark = settings.theme === 'dark';
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [chartType, setChartType] = useState<'bar' | 'trading'>('trading');
  const [chartWidth, setChartWidth] = useState<number>(330);

  const stats = calculatePeriodAnalytics(period, selectedDate);

  const PERIODS: { key: 'daily' | 'weekly' | 'monthly' | 'yearly'; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  // SVG plot math for trading graph
  const paddingTop = 24;
  const paddingBottom = 34;
  const paddingLeft = 24;
  const paddingRight = 24;
  const plotWidth = Math.max(220, chartWidth - paddingLeft - paddingRight);
  const plotHeight = 110;
  const totalHeight = paddingTop + plotHeight + paddingBottom;

  const points = stats.trend.map((t, idx) => {
    const x = stats.trend.length <= 1 
      ? paddingLeft + plotWidth / 2 
      : paddingLeft + (idx / (stats.trend.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (t.rate / 100) * plotHeight;
    const prevRate = idx === 0 ? 0 : stats.trend[idx - 1].rate;
    const isUp = t.rate >= prevRate;
    return { ...t, x, y, isUp };
  });

  const activePoints = points.filter(p => !p.isFuture && !p.isBeforeStart);
  const isBullish = stats.growthDirection === 'up' || (activePoints.length > 0 && activePoints[activePoints.length - 1].rate >= activePoints[0].rate && stats.averageRate > 0);
  const isBearish = stats.growthDirection === 'down' || (activePoints.length > 1 && activePoints[activePoints.length - 1].rate < activePoints[0].rate);
  const trendMainColor = isBearish ? '#EF4444' : '#10B981';

  let areaPath = '';
  if (activePoints.length > 1) {
    areaPath = `M ${activePoints[0].x} ${paddingTop + plotHeight} L ${activePoints[0].x} ${activePoints[0].y}`;
    for (let i = 1; i < activePoints.length; i++) {
      areaPath += ` L ${activePoints[i].x} ${activePoints[i].y}`;
    }
    areaPath += ` L ${activePoints[activePoints.length - 1].x} ${paddingTop + plotHeight} Z`;
  } else if (activePoints.length === 1) {
    const pt = activePoints[0];
    const halfW = 22;
    areaPath = `M ${Math.max(paddingLeft, pt.x - halfW)} ${paddingTop + plotHeight} L ${pt.x - halfW} ${pt.y} L ${pt.x + halfW} ${pt.y} L ${Math.min(chartWidth - paddingRight, pt.x + halfW)} ${paddingTop + plotHeight} Z`;
  }


  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 100) {
      setChartWidth(w);
    }
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.darkBg : styles.lightBg]} contentContainerStyle={{ paddingBottom: 36 }}>
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
            {stats.completed} / {stats.totalDue}
          </Text>
          <Text style={[styles.metricSub, { color: isBearish ? '#EF4444' : '#10B981' }]}>
            {stats.completionRate}% completion rate
          </Text>
        </View>

        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Focus Time</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {stats.actualFocusDisplay}
          </Text>
          <Text style={styles.metricSubInfo}>
            Of {stats.plannedFocusDisplay} planned
          </Text>
        </View>

        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Target Achievement</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {stats.targetAchievement}%
          </Text>
          <Text style={styles.metricSubInfo}>Across targets</Text>
        </View>

        <View style={[styles.metricCard, isDark ? styles.darkCard : styles.lightCard]}>
          <Text style={styles.metricLabel}>Plan Adherence</Text>
          <Text style={[styles.metricValue, isDark ? styles.darkText : styles.lightText]}>
            {stats.completionRate}%
          </Text>
          <Text style={styles.metricSubInfo}>Tasks completed on time</Text>
        </View>
      </View>

      {/* Completion Trend Visualization (Bar vs Trading) */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        {/* Card Header with Period Title and View Switcher Toggle */}
        <View style={styles.sectionTitleRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
              {stats.periodTitle}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {period === 'daily' && "Today's timeline intervals"}
              {period === 'weekly' && "7-day performance trajectory"}
              {period === 'monthly' && "Weekly velocity breakdown"}
              {period === 'yearly' && "12-month progress tracking"}
            </Text>
          </View>

          {/* Toggle Button for Bar vs Trading Graph */}
          <View style={[styles.chartToggleContainer, isDark ? styles.darkToggleBg : styles.lightToggleBg]}>
            <TouchableOpacity
              testID="btn-toggle-bar"
              accessibilityLabel="Bar Chart View"
              accessibilityRole="button"
              accessibilityState={{ selected: chartType === 'bar' }}
              onPress={() => setChartType('bar')}
              style={[styles.toggleBtn, chartType === 'bar' && styles.toggleBtnActive]}
            >
              <Ionicons 
                name="bar-chart" 
                size={13} 
                color={chartType === 'bar' ? '#FFF' : (isDark ? '#94A3B8' : '#64748B')} 
              />
              <Text style={[styles.toggleBtnText, chartType === 'bar' && styles.toggleBtnTextActive]}>
                Bar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-toggle-trading"
              accessibilityLabel="Trading Graph View"
              accessibilityRole="button"
              accessibilityState={{ selected: chartType === 'trading' }}
              onPress={() => setChartType('trading')}
              style={[
                styles.toggleBtn, 
                chartType === 'trading' && (isBearish ? styles.toggleBtnActiveBearish : styles.toggleBtnActiveBullish)
              ]}
            >
              <Ionicons 
                name="trending-up" 
                size={13} 
                color={chartType === 'trading' ? '#FFF' : (isDark ? '#94A3B8' : '#64748B')} 
              />
              <Text style={[styles.toggleBtnText, chartType === 'trading' && styles.toggleBtnTextActive]}>
                Trading
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trading Market Status Ticker Row */}
        <View style={[styles.tickerRow, isDark ? styles.darkTickerRow : styles.lightTickerRow]}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={[styles.tradingRateText, isDark ? styles.darkText : styles.lightText]}>
                {stats.averageRate}%
              </Text>
              <Text style={styles.tradingRateLabel}>Average Rate</Text>
            </View>
            <Text style={styles.tradingRangeText}>
              {activePoints.length > 0 
                ? `High: ${Math.max(...activePoints.map(t => t.rate))}%  •  Low: ${Math.min(...activePoints.map(t => t.rate))}%`
                : 'No recorded activity'}
            </Text>
          </View>

          {/* Growth / Dip Badge */}
          <View style={[
            styles.tradingBadge,
            isBearish ? styles.tradingBadgeBearish : (isBullish ? styles.tradingBadgeBullish : styles.tradingBadgeNeutral)
          ]}>
            <Ionicons 
              name={isBearish ? "trending-down" : (isBullish ? "trending-up" : "remove")} 
              size={13} 
              color={isBearish ? "#DC2626" : (isBullish ? "#059669" : "#64748B")} 
            />
            <Text style={[
              styles.tradingBadgeText,
              { color: isBearish ? "#DC2626" : (isBullish ? "#059669" : "#64748B") }
            ]}>
              {isBearish 
                ? `▼ -${stats.growthPercentage}% Dip` 
                : (isBullish 
                  ? (stats.growthPercentage > 0 ? `▲ +${stats.growthPercentage}% Growth` : `▲ ${stats.averageRate}% Active`) 
                  : '● Neutral')}
            </Text>
          </View>
        </View>

        {/* Chart View Content (Trading SVG or Bar Chart) */}
        {chartType === 'trading' ? (
          /* TRADING GRAPH (SVG Line, Area Gradient, Green/Red Segments) */
          <View style={styles.tradingChartWrapper} onLayout={onChartLayout}>
            <Svg width={chartWidth} height={totalHeight}>
              <Defs>
                <LinearGradient id="tradingGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={trendMainColor} stopOpacity="0.32" />
                  <Stop offset="100%" stopColor={trendMainColor} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines */}
              <Line
                x1={paddingLeft}
                y1={paddingTop}
                x2={chartWidth - paddingRight}
                y2={paddingTop}
                stroke={isDark ? '#334155' : '#E2E8F0'}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <Line
                x1={paddingLeft}
                y1={paddingTop + plotHeight / 2}
                x2={chartWidth - paddingRight}
                y2={paddingTop + plotHeight / 2}
                stroke={isDark ? '#334155' : '#E2E8F0'}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <Line
                x1={paddingLeft}
                y1={paddingTop + plotHeight}
                x2={chartWidth - paddingRight}
                y2={paddingTop + plotHeight}
                stroke={isDark ? '#334155' : '#E2E8F0'}
                strokeWidth="1"
              />

              {/* Area Gradient Fill for Active Points */}
              {areaPath ? (
                <Path d={areaPath} fill="url(#tradingGradient)" />
              ) : null}

              {/* Trading Color-Coded Segments among ACTIVE points only */}
              {activePoints.map((p, idx) => {
                if (idx === 0) return null;
                const prev = activePoints[idx - 1];
                const segColor = p.rate >= prev.rate ? '#10B981' : '#EF4444';
                return (
                  <Line
                    key={`seg-${idx}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={p.x}
                    y2={p.y}
                    stroke={segColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Data points & labels */}
              {points.map((p, idx) => {
                const isInactive = p.isFuture || p.isBeforeStart;
                const ptColor = isInactive 
                  ? (isDark ? '#475569' : '#CBD5E1') 
                  : (p.isGrowing ? '#10B981' : '#EF4444');

                return (
                  <React.Fragment key={`point-${idx}`}>
                    {/* Glowing outer halo & core for active points */}
                    {!isInactive ? (
                      <>
                        <Circle cx={p.x} cy={p.y} r="9" fill={ptColor} opacity={0.25} />
                        <Circle cx={p.x} cy={p.y} r="4.5" fill={ptColor} stroke="#FFFFFF" strokeWidth="1.5" />
                        {/* Value percentage tag above point */}
                        <SvgText
                          x={p.x}
                          y={p.y - 10}
                          fontSize="10"
                          fontWeight="800"
                          fill={ptColor}
                          textAnchor="middle"
                        >
                          {`${p.rate}%`}
                        </SvgText>
                      </>
                    ) : (
                      <>
                        {/* Subtle baseline anchor for inactive/future point */}
                        <Circle cx={p.x} cy={paddingTop + plotHeight} r="2.5" fill={isDark ? '#334155' : '#E2E8F0'} />
                        <SvgText
                          x={p.x}
                          y={paddingTop + plotHeight - 8}
                          fontSize="10"
                          fontWeight="500"
                          fill={isDark ? '#475569' : '#94A3B8'}
                          textAnchor="middle"
                        >
                          —
                        </SvgText>
                      </>
                    )}

                    {/* Date/period label below axis */}
                    <SvgText
                      x={p.x}
                      y={paddingTop + plotHeight + 20}
                      fontSize="11"
                      fontWeight={isInactive ? "500" : "700"}
                      fill={isInactive ? (isDark ? '#475569' : '#94A3B8') : (isDark ? '#F1F5F9' : '#0F172A')}
                      textAnchor="middle"
                    >
                      {p.day}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        ) : (
          /* BAR CHART (Color-coded green if growing, red if dropping, subtle for future/pre-install) */
          <View style={styles.chartBarsRow}>
            {stats.trend.map((t, idx) => {
              const isInactive = t.isFuture || t.isBeforeStart;
              const heightPercent = isInactive ? 0 : Math.max(12, t.rate);
              const isUp = t.isGrowing;
              const barColor = isInactive
                ? 'transparent'
                : (isUp ? '#10B981' : (t.rate === 0 ? (isDark ? '#334155' : '#E2E8F0') : '#EF4444'));
              const dotColor = isInactive
                ? (isDark ? '#475569' : '#CBD5E1')
                : (isUp ? '#10B981' : (t.rate === 0 ? '#94A3B8' : '#EF4444'));
              const subLabel = isInactive ? '—' : `${t.rate}%`;

              return (
                <View key={idx} style={styles.barCol}>
                  <View style={[styles.barTrack, isDark && styles.darkBarTrack]}>
                    {heightPercent > 0 && (
                      <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: barColor }]} />
                    )}
                  </View>
                  <Text style={[styles.barLabel, isInactive && { opacity: 0.5 }]}>{t.day}</Text>
                  <View style={styles.barSubRow}>
                    <View style={[styles.miniIndicatorDot, { backgroundColor: dotColor }]} />
                    <Text style={[styles.barSub, { color: isInactive ? (isDark ? '#475569' : '#94A3B8') : dotColor }]}>
                      {subLabel}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Category Breakdown for Selected Period */}
      <View style={[styles.sectionCard, isDark ? styles.darkCard : styles.lightCard]}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, isDark ? styles.darkText : styles.lightText]}>
            Category Distribution
          </Text>
          <Text style={styles.categoryPeriodTag}>
            {stats.totalDue} total {period} tasks
          </Text>
        </View>

        {stats.categoryDistribution.map((cat, idx) => (
          <View key={idx} style={[styles.categoryRow, isDark && styles.darkCategoryRow]}>
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
    backgroundColor: Palette.canvas.light,
  },
  darkBg: {
    backgroundColor: Palette.canvas.dark,
  },
  periodBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  lightPeriodBar: {
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
  },
  darkPeriodBar: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodTabActive: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
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
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
  },
  lightMetricCard: {
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  darkMetricCard: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
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
    fontWeight: '700',
    marginTop: 4,
  },
  metricSubInfo: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  lightSectionCard: {
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  darkSectionCard: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  chartToggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lightToggleBg: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  darkToggleBg: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  toggleBtnActiveBullish: {
    backgroundColor: '#10B981',
  },
  toggleBtnActiveBearish: {
    backgroundColor: '#EF4444',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  lightTickerRow: {
    backgroundColor: '#F8FAFC',
  },
  darkTickerRow: {
    backgroundColor: '#0F172A',
  },
  tradingRateText: {
    fontSize: 18,
    fontWeight: '800',
  },
  tradingRateLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tradingRangeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  tradingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tradingBadgeBullish: {
    backgroundColor: '#DCFCE7',
  },
  tradingBadgeBearish: {
    backgroundColor: '#FEE2E2',
  },
  tradingBadgeNeutral: {
    backgroundColor: '#F1F5F9',
  },
  tradingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tradingChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 125,
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
  darkBarTrack: {
    backgroundColor: '#334155',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  barSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  miniIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  barSub: {
    fontSize: 9,
    fontWeight: '700',
  },
  categoryPeriodTag: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  darkCategoryRow: {
    borderBottomColor: '#334155',
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
    backgroundColor: Palette.glass.light,
    borderColor: Palette.glass.lightBorder,
    borderWidth: 1.5,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: Palette.glass.dark,
    borderColor: Palette.glass.darkBorder,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
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
