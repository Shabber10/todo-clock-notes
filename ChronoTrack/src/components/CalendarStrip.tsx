import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';

export const CalendarStrip: React.FC = () => {
  const { selectedDate, setSelectedDate, settings } = useApp();
  const currentDate = parseISO(selectedDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const isDark = settings.theme === 'dark';

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setSelectedDate(format(subDays(currentDate, 7), 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    setSelectedDate(format(addDays(currentDate, 7), 'yyyy-MM-dd'));
  };

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      <TouchableOpacity 
        testID="btn-prev-week"
        accessibilityLabel="Previous Week"
        accessibilityRole="button"
        onPress={handlePrevWeek} 
        style={styles.arrowButton}
      >
        <Ionicons name="chevron-back" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
      </TouchableOpacity>

      <View style={styles.daysRow}>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          const isRealToday = isSameDay(day, new Date());

          return (
            <TouchableOpacity
              key={dateStr}
              testID={`btn-day-${dateStr}`}
              accessibilityLabel={`Day ${format(day, 'EEEE MMMM do')}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedDate(dateStr)}
              style={[
                styles.dayCard,
                isSelected && styles.selectedDayCard,
                !isSelected && (isDark ? styles.darkDayCard : styles.lightDayCard)
              ]}
            >
              <Text style={[
                styles.dayName,
                isSelected ? styles.selectedText : (isDark ? styles.darkSubText : styles.lightSubText)
              ]}>
                {format(day, 'EEE')}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected ? styles.selectedNumber : (isDark ? styles.darkNumber : styles.lightNumber)
              ]}>
                {format(day, 'd')}
              </Text>
              <View style={styles.dotContainer}>
                {isRealToday ? (
                  <View style={[styles.dot, isSelected ? styles.whiteDot : styles.blueDot]} />
                ) : (
                  <View style={[styles.dot, isSelected ? styles.lightBlueDot : styles.greenDot]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        testID="btn-next-week"
        accessibilityLabel="Next Week"
        accessibilityRole="button"
        onPress={handleNextWeek} 
        style={styles.arrowButton}
      >
        <Ionicons name="chevron-forward" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#F1F5F9',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  arrowButton: {
    padding: 6,
  },
  daysRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 64,
    borderRadius: 16,
    paddingVertical: 4,
  },
  selectedDayCard: {
    backgroundColor: '#2563EB',
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lightDayCard: {
    backgroundColor: 'transparent',
  },
  darkDayCard: {
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  selectedText: {
    color: '#DBEAFE',
  },
  selectedNumber: {
    color: '#FFFFFF',
  },
  lightNumber: {
    color: '#0F172A',
  },
  darkNumber: {
    color: '#F8FAFC',
  },
  lightSubText: {
    color: '#94A3B8',
  },
  darkSubText: {
    color: '#64748B',
  },
  dotContainer: {
    height: 6,
    justifyContent: 'center',
    marginTop: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  blueDot: {
    backgroundColor: '#2563EB',
  },
  whiteDot: {
    backgroundColor: '#FFFFFF',
  },
  lightBlueDot: {
    backgroundColor: '#BFDBFE',
  },
  greenDot: {
    backgroundColor: '#10B981',
  },
});
