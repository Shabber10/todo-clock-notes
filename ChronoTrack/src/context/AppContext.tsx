import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TaskOccurrence, Category, Goal, Habit, AppSettings } from '../types';
import * as db from '../database/db';
import { checkTaskAlarms, markAlarmTriggered, TaskAlarm } from '../services/alarmService';

interface AppContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  occurrences: TaskOccurrence[];
  categories: Category[];
  goals: Goal[];
  habits: Habit[];
  settings: AppSettings;
  activeTab: 'today' | 'track' | 'goals' | 'habits' | 'profile';
  setActiveTab: (tab: 'today' | 'track' | 'goals' | 'habits' | 'profile') => void;
  toggleTheme: () => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  selectedOccurrenceForProgress: TaskOccurrence | null;
  setSelectedOccurrenceForProgress: (occ: TaskOccurrence | null) => void;
  isMonthCalendarOpen: boolean;
  setIsMonthCalendarOpen: (open: boolean) => void;
  refreshData: () => void;
  toggleHabit: (id: string) => void;
  currentTimeMinutes: number;
  activeAlarm: TaskAlarm | null;
  triggerAlarm: (alarm: TaskAlarm | null) => void;
  dismissAlarm: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [occurrences, setOccurrences] = useState<TaskOccurrence[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<TaskAlarm | null>(null);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    timeFormat: '12h',
    userName: 'User',
    userEmail: '',
    defaultReminderMins: 15
  });
  const [activeTab, setActiveTab] = useState<'today' | 'track' | 'goals' | 'habits' | 'profile'>('today');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [selectedOccurrenceForProgress, setSelectedOccurrenceForProgress] = useState<TaskOccurrence | null>(null);
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState<boolean>(false);

  // Background alarm ticker comparing mobile real clock with scheduled tasks
  useEffect(() => {
    const checkNow = () => {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      setCurrentTimeMinutes(prev => (prev !== currentMin ? currentMin : prev));

      const triggered = checkTaskAlarms(occurrences);
      if (triggered && !activeAlarm) {
        setActiveAlarm(triggered);
      }
    };

    checkNow();
    const interval = setInterval(checkNow, 3000);
    return () => clearInterval(interval);
  }, [occurrences, activeAlarm]);

  const triggerAlarm = (alarm: TaskAlarm | null) => {
    setActiveAlarm(alarm);
  };

  const dismissAlarm = () => {
    if (activeAlarm) {
      markAlarmTriggered(activeAlarm.id);
      setActiveAlarm(null);
    }
  };


  const refreshData = () => {
    try {
      db.initDatabase();
      const cats = db.getCategoriesFromDb();
      setCategories(cats);

      const occs = db.getOccurrencesFromDb(selectedDate);
      setOccurrences(occs);

      const g = db.getGoalsFromDb();
      setGoals(g);

      const h = db.getHabitsFromDb();
      setHabits(h);

      const s = db.getSettingsFromDb();
      setSettings(s);
    } catch (err) {
      console.error('Error refreshing SQLite data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedDate]);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    db.updateSettingInDb('theme', nextTheme);
    setSettings(prev => ({ ...prev, theme: nextTheme }));
  };

  const toggleHabit = (id: string) => {
    db.toggleHabitInDb(id);
    setHabits(db.getHabitsFromDb());
  };

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        occurrences,
        categories,
        goals,
        habits,
        settings,
        activeTab,
        setActiveTab,
        toggleTheme,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        selectedOccurrenceForProgress,
        setSelectedOccurrenceForProgress,
        isMonthCalendarOpen,
        setIsMonthCalendarOpen,
        refreshData,
        toggleHabit,
        currentTimeMinutes,
        activeAlarm,
        triggerAlarm,
        dismissAlarm
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
