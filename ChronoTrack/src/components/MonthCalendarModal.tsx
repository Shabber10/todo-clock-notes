import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';
import { useApp } from '../context/AppContext';

export const MonthCalendarModal: React.FC = () => {
  const { isMonthCalendarOpen, setIsMonthCalendarOpen, selectedDate, setSelectedDate, settings } = useApp();
  const isDark = settings.theme === 'dark';

  const currentDate = parseISO(selectedDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleSelectDay = (day: Date) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setIsMonthCalendarOpen(false);
  };

  return (
    <Modal
      visible={isMonthCalendarOpen}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setIsMonthCalendarOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, isDark ? styles.darkDialog : styles.lightDialog]}>
          <View style={styles.header}>
            <Text style={[styles.monthTitle, isDark ? styles.darkText : styles.lightText]}>
              {format(currentDate, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity 
              testID="btn-close-month-calendar"
              accessibilityLabel="Close Month Calendar"
              accessibilityRole="button"
              onPress={() => setIsMonthCalendarOpen(false)}
            >
              <Ionicons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekLabels}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
              <Text key={w} style={styles.weekdayText}>{w}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {days.map(d => {
              const dStr = format(d, 'yyyy-MM-dd');
              const isSelected = selectedDate === dStr;
              const isCurrentMonth = isSameMonth(d, monthStart);
              const isRealToday = isSameDay(d, new Date());

              return (
                <TouchableOpacity
                  key={dStr}
                  testID={`btn-calendar-day-${dStr}`}
                  accessibilityLabel={`Select Date ${format(d, 'MMMM do yyyy')}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelectDay(d)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedCell
                  ]}
                >
                  <Text style={[
                    styles.dayCellText,
                    !isCurrentMonth && styles.outsideMonth,
                    isSelected && styles.selectedDayCellText,
                    isCurrentMonth && !isSelected && (isDark ? styles.darkText : styles.lightText)
                  ]}>
                    {format(d, 'd')}
                  </Text>
                  {isRealToday && (
                    <View style={[styles.todayDot, isSelected && { backgroundColor: '#FFF' }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            testID="btn-jump-to-today"
            accessibilityLabel="Jump to Today"
            accessibilityRole="button"
            onPress={() => {
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
              setIsMonthCalendarOpen(false);
            }}
            style={styles.todayBtn}
          >
            <Text style={styles.todayBtnText}>Jump to Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
  },
  lightDialog: {
    backgroundColor: '#FFFFFF',
  },
  darkDialog: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedCell: {
    backgroundColor: '#2563EB',
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDayCellText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  outsideMonth: {
    color: '#CBD5E1',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    position: 'absolute',
    bottom: 4,
  },
  todayBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
  },
  todayBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
