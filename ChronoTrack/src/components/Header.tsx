import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { format, parseISO, subDays, addDays } from 'date-fns';

export const Header: React.FC = () => {
  const { selectedDate, setSelectedDate, settings, setIsMonthCalendarOpen } = useApp();
  const dateObj = parseISO(selectedDate);
  const formattedMonthYear = format(dateObj, 'MMMM yyyy');
  const isDark = settings.theme === 'dark';

  const handlePrevDay = () => {
    setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'));
  };

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      {/* Brand Logo & Name */}
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}>
          <Ionicons name="time" size={20} color="#FFFFFF" />
        </View>
        <Text style={[styles.brandText, isDark ? styles.darkText : styles.lightText]}>
          ChronoTrack
        </Text>
      </View>

      {/* Month & Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity 
          testID="btn-header-prev-day"
          accessibilityLabel="Previous Day"
          accessibilityRole="button"
          onPress={handlePrevDay} 
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity 
          testID="btn-header-month-picker"
          accessibilityLabel="Select Month Calendar"
          accessibilityRole="button"
          onPress={() => setIsMonthCalendarOpen(true)}
          style={[styles.monthButton, isDark ? styles.darkPill : styles.lightPill]}
        >
          <Text style={[styles.monthText, isDark ? styles.darkText : styles.lightText]}>
            {formattedMonthYear}
          </Text>
          <Ionicons name="calendar-outline" size={14} color="#2563EB" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TouchableOpacity 
          testID="btn-header-next-day"
          accessibilityLabel="Next Day"
          accessibilityRole="button"
          onPress={handleNextDay} 
          style={styles.iconButton}
        >
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? Math.max((StatusBar.currentHeight || 0) + 6, 42) : 10,
    paddingBottom: 8,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lightPill: {
    backgroundColor: '#F8FAFC',
  },
  darkPill: {
    backgroundColor: '#1E293B',
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    padding: 5,
    borderRadius: 8,
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
