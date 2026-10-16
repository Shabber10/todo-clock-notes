import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, settings, setIsAddTaskModalOpen } = useApp();
  const isDark = settings.theme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
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
          color={activeTab === 'today' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8')}
        />
        <Text style={[
          styles.navText,
          { color: activeTab === 'today' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8') }
        ]}>
          Today
        </Text>
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
          color={activeTab === 'track' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8')}
        />
        <Text style={[
          styles.navText,
          { color: activeTab === 'track' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8') }
        ]}>
          Track
        </Text>
      </TouchableOpacity>

      {/* 3. Center ADD Action Button */}
      <View style={styles.centerButtonWrapper}>
        <TouchableOpacity
          testID="btn-tab-add"
          accessibilityLabel="Add Task Button"
          accessibilityRole="button"
          activeOpacity={0.85}
          hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
          onPress={() => setIsAddTaskModalOpen(true)}
          style={styles.centerButton}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
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
          color={activeTab === 'goals' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8')}
        />
        <Text style={[
          styles.navText,
          { color: activeTab === 'goals' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8') }
        ]}>
          Goals
        </Text>
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
          color={activeTab === 'profile' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8')}
        />
        <Text style={[
          styles.navText,
          { color: activeTab === 'profile' ? '#2563EB' : (isDark ? '#64748B' : '#94A3B8') }
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    borderTopWidth: 1,
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F1F5F9',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
