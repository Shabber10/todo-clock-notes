import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

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
  const size = 68;
  const strokeWidth = 6;
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
      {/* Top Banner Row */}
      <View style={styles.contentRow}>
        {/* Circular Progress Ring */}
        <View style={styles.circleWrapper}>
          <Svg width={size} height={size}>
            <Circle
              stroke={isDark ? '#334155' : '#E2E8F0'}
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="#10B981"
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
          <Text style={[styles.taskCountText, isDark ? styles.darkText : styles.lightText]}>
            {completed} of {total} tasks completed
          </Text>
          
          {/* Progress bar */}
          <View style={[styles.progressBarBackground, isDark ? styles.darkBarBg : styles.lightBarBg]}>
            <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
          </View>

          {/* Time Focus Stats */}
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Planned focus</Text>
              <Text style={[styles.statValue, isDark ? styles.darkText : styles.lightText]}>
                {plannedFocusDisplay}
              </Text>
            </View>

            <View style={{ marginLeft: 24 }}>
              <Text style={styles.statLabel}>Actual focus</Text>
              <Text style={[styles.statValue, isDark ? styles.darkText : styles.lightText]}>
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
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
