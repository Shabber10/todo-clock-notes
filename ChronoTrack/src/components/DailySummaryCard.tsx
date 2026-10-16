import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { Palette } from '../theme/colors';

export const DailySummaryCard: React.FC = () => {
  const { occurrences, settings } = useApp();
  const isDark = settings.theme === 'dark';

  const total = occurrences.length;
  const completed = occurrences.filter(o => o.status === 'completed').length;
  const inProgress = occurrences.filter(o => o.status === 'in_progress').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate planned vs actual duration
  let plannedMinutes = 0;
  let actualMinutes = 0;

  occurrences.forEach(occ => {
    let dur = 60;
    if (occ.task?.measurementType === 'duration' && occ.task.measurementConfig?.plannedMinutes) {
      dur = Number(occ.task.measurementConfig.plannedMinutes);
    } else if (occ.scheduledStart && occ.scheduledEnd) {
      const [sh, sm] = occ.scheduledStart.split(':').map(Number);
      const [eh, em] = occ.scheduledEnd.split(':').map(Number);
      dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 60;
    }
    plannedMinutes += dur;

    if (occ.task?.measurementType === 'duration' && occ.actualData?.actualMinutes) {
      actualMinutes += Number(occ.actualData.actualMinutes);
    } else if (occ.status === 'completed') {
      actualMinutes += dur;
    } else if (occ.status === 'in_progress') {
      actualMinutes += Math.round(dur * (occ.progressPercentage / 100));
    }
  });

  const plannedFocusDisplay = `${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m`;
  const actualFocusDisplay = `${Math.floor(actualMinutes / 60)}h ${actualMinutes % 60}m`;

  // SVG Circular progress math
  const size = 72;
  const strokeWidth = 7;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionRate) / 100;

  return (
    <View 
      testID="card-daily-summary"
      accessibilityLabel={`Daily summary, ${completed} of ${total} tasks completed, ${completionRate}% progress`}
      style={[styles.card, isDark ? styles.darkCard : styles.lightCard]}
    >
      {/* Top Specular Glass Highlight */}
      <View style={[styles.specularLine, isDark ? styles.darkSpecular : styles.lightSpecular]} />

      {/* Top Banner Row */}
      <View style={styles.contentRow}>
        {/* Glowing Circular Progress Ring */}
        <View style={[styles.circleWrapper, completionRate > 0 && styles.ringGlow]}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="summaryRingGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={Palette.neon.cyan} />
                <Stop offset="100%" stopColor={Palette.neon.emeraldBright} />
              </LinearGradient>
            </Defs>
            <Circle
              stroke={isDark ? 'rgba(51, 65, 85, 0.45)' : '#E2E8F0'}
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="url(#summaryRingGrad)"
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${center}, ${center}`}
            />
          </Svg>
          <View style={styles.percentageContainer}>
            <Text style={[styles.percentageText, isDark ? styles.darkText : styles.lightText]}>
              {completionRate}%
            </Text>
          </View>
        </View>

        {/* Task Completion Text */}
        <View style={styles.textColumn}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.taskCountText, isDark ? styles.darkText : styles.lightText]}>
              {completed} of {total} tasks completed
            </Text>
            {completionRate === 100 && total > 0 && (
              <View style={styles.allDoneBadge}>
                <Text style={styles.allDoneText}>All Done! 🎉</Text>
              </View>
            )}
          </View>
          
          {/* Glowing Progress bar */}
          <View style={[styles.progressBarBackground, isDark ? styles.darkBarBg : styles.lightBarBg]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${completionRate}%`,
                  backgroundColor: Palette.neon.emeraldBright,
                  shadowColor: Palette.neon.emerald,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 6,
                  elevation: 4,
                }
              ]} 
            />
          </View>

          {/* Time Focus Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Planned focus</Text>
              <Text style={[styles.statValue, isDark ? { color: Palette.neon.cyan } : styles.lightText]}>
                {plannedFocusDisplay}
              </Text>
            </View>

            <View style={[styles.statBox, { marginLeft: 20 }]}>
              <Text style={styles.statLabel}>Actual focus</Text>
              <Text style={[styles.statValue, isDark ? { color: Palette.neon.emeraldBright } : styles.lightText]}>
                {actualFocusDisplay}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  lightCard: {
    backgroundColor: Palette.glass.light,
    borderWidth: 1.5,
    borderColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  darkCard: {
    backgroundColor: Palette.glass.dark,
    borderWidth: 1.5,
    borderColor: Palette.glass.darkBorder,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  lightSpecular: {
    backgroundColor: Palette.glass.lightBorderSpecular,
  },
  darkSpecular: {
    backgroundColor: Palette.glass.darkBorderSpecular,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleWrapper: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '800',
  },
  textColumn: {
    flex: 1,
  },
  taskCountText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  lightBarBg: {
    backgroundColor: '#E2E8F0',
  },
  darkBarBg: {
    backgroundColor: '#334155',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statBox: {
    paddingVertical: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  ringGlow: {
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  allDoneBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  allDoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neon.emeraldBright,
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
