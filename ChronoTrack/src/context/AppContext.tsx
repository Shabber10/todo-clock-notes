import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TaskOccurrence, Category, Goal, Habit, AppSettings } from '../types';
import * as db from '../database/db';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [occurrences, setOccurrences] = useState<TaskOccurrence[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    timeFormat: '12h',
    userName: 'Alex Johnson',
    userEmail: 'alex@example.com',
    defaultReminderMins: 15
  });
  const [activeTab, setActiveTab] = useState<'today' | 'track' | 'goals' | 'habits' | 'profile'>('today');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [selectedOccurrenceForProgress, setSelectedOccurrenceForProgress] = useState<TaskOccurrence | null>(null);
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState<boolean>(false);

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
        toggleHabit
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
