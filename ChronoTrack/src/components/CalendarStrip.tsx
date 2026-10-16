import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Palette } from '../theme/colors';

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
      {/* Top Specular Edge Line */}
      <View style={[styles.specularLine, isDark ? styles.darkSpecular : styles.lightSpecular]} />

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
                isSelected ? (isDark ? styles.darkSelectedDayCard : styles.lightSelectedDayCard) : (isDark ? styles.darkDayCard : styles.lightDayCard)
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
                  <View style={[styles.dot, isSelected ? styles.whiteDot : (isDark ? styles.cyanDot : styles.blueDot)]} />
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
    borderBottomWidth: 1.5,
    position: 'relative',
  },
  lightContainer: {
    backgroundColor: Palette.glass.light,
    borderBottomColor: Palette.glass.lightBorder,
  },
  darkContainer: {
    backgroundColor: Palette.glass.dark,
    borderBottomColor: Palette.glass.darkBorder,
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
    width: 44,
    height: 66,
    borderRadius: 18,
    paddingVertical: 5,
  },
  lightSelectedDayCard: {
    backgroundColor: '#2563EB',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  darkSelectedDayCard: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    elevation: 6,
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  lightDayCard: {
    backgroundColor: 'transparent',
  },
  darkDayCard: {
    backgroundColor: 'transparent',
  },
  cyanDot: {
    backgroundColor: Palette.neon.cyan,
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
