import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Palette } from '../theme/colors';
import { ClayButton } from './ClayButton';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, settings, setIsAddTaskModalOpen } = useApp();
  const isDark = settings.theme === 'dark';

  const activeColor = isDark ? Palette.neon.cyan : '#2563EB';
  const inactiveColor = isDark ? '#64748B' : '#94A3B8';

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      {/* Top Specular Edge Line */}
      <View style={[styles.specularLine, isDark ? styles.darkSpecular : styles.lightSpecular]} />

      {/* 1. Today Tab */}
      <TouchableOpacity
        testID="btn-tab-today"
        accessibilityLabel="Today Tab"
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'today' }}
        onPress={() => setActiveTab('today')}
        style={styles.navItem}
      >
        <Ionicons
          name={activeTab === 'today' ? 'calendar' : 'calendar-outline'}
          size={22}
          color={activeTab === 'today' ? activeColor : inactiveColor}
        />
        <Text style={[styles.navText, { color: activeTab === 'today' ? activeColor : inactiveColor }]}>
          Today
        </Text>
        {activeTab === 'today' && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
      </TouchableOpacity>

      {/* 2. Track Tab */}
      <TouchableOpacity
        testID="btn-tab-track"
        accessibilityLabel="Track Tab"
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'track' }}
        onPress={() => setActiveTab('track')}
        style={styles.navItem}
      >
        <Ionicons
          name={activeTab === 'track' ? 'bar-chart' : 'bar-chart-outline'}
          size={22}
          color={activeTab === 'track' ? activeColor : inactiveColor}
        />
        <Text style={[styles.navText, { color: activeTab === 'track' ? activeColor : inactiveColor }]}>
          Track
        </Text>
        {activeTab === 'track' && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
      </TouchableOpacity>

      {/* 3. Center ADD Action Button (Tactile Clay Ball with Neon Glow) */}
      <View style={styles.centerButtonWrapper}>
        <ClayButton
          testID="btn-tab-add"
          accessibilityLabel="Add Task Button"
          onPress={() => setIsAddTaskModalOpen(true)}
          isDark={isDark}
          variant="accent"
          borderRadius={28}
          glowColor={Palette.neon.cyanGlow}
          style={styles.centerClayBtn}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </ClayButton>
      </View>

      {/* 4. Goals Tab */}
      <TouchableOpacity
        testID="btn-tab-goals"
        accessibilityLabel="Goals Tab"
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'goals' }}
        onPress={() => setActiveTab('goals')}
        style={styles.navItem}
      >
        <Ionicons
          name={activeTab === 'goals' ? 'disc' : 'disc-outline'}
          size={22}
          color={activeTab === 'goals' ? activeColor : inactiveColor}
        />
        <Text style={[styles.navText, { color: activeTab === 'goals' ? activeColor : inactiveColor }]}>
          Goals
        </Text>
        {activeTab === 'goals' && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
      </TouchableOpacity>

      {/* 5. Profile Tab */}
      <TouchableOpacity
        testID="btn-tab-profile"
        accessibilityLabel="Profile Tab"
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'profile' }}
        onPress={() => setActiveTab('profile')}
        style={styles.navItem}
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profile' ? activeColor : inactiveColor}
        />
        <Text style={[styles.navText, { color: activeTab === 'profile' ? activeColor : inactiveColor }]}>
          Profile
        </Text>
        {activeTab === 'profile' && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    borderTopWidth: 1.5,
    position: 'relative',
  },
  lightContainer: {
    backgroundColor: Palette.glass.lightElevated,
    borderTopColor: Palette.glass.lightBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  darkContainer: {
    backgroundColor: Palette.glass.darkElevated,
    borderTopColor: Palette.glass.darkBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
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
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerClayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
