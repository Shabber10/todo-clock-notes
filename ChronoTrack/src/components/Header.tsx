import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { format, parseISO, subDays, addDays } from 'date-fns';
import { Palette } from '../theme/colors';

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
      {/* Top Specular Edge Line */}
      <View style={[styles.specularLine, isDark ? styles.darkSpecular : styles.lightSpecular]} />

      {/* Brand Logo & Name */}
      <View style={styles.brandRow}>
        <View style={[styles.logoCircle, isDark ? styles.darkLogoGlow : styles.lightLogoGlow]}>
          <Ionicons name="time" size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.brandText, isDark ? styles.darkText : styles.lightText]}>
          Consis<Text style={{ color: Palette.neon.cyan }}>Track</Text>
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
          <Ionicons name="calendar-outline" size={14} color={isDark ? Palette.neon.cyan : "#2563EB"} style={{ marginLeft: 4 }} />
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
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? Math.max((StatusBar.currentHeight || 0) + 6, 42) : 10,
    paddingBottom: 10,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1E3A8A',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkLogoGlow: {
    shadowColor: Palette.neon.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  lightLogoGlow: {
    backgroundColor: '#2563EB',
    borderColor: '#93C5FD',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  lightPill: {
    backgroundColor: Palette.clay.light.bg,
    borderColor: '#E2E8F0',
  },
  darkPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    padding: 5,
    borderRadius: 8,
  },
  themeToggleBtn: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 4,
  },
  lightThemeBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  darkThemeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  lightText: {
    color: '#0F172A',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
