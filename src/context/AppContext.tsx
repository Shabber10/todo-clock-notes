import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TaskOccurrence, Category, UserProfile } from '../types';
import * as api from '../api/client';

interface AppContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  occurrences: TaskOccurrence[];
  categories: Category[];
  user: UserProfile | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: 'today' | 'track' | 'goals' | 'habits' | 'profile';
  setActiveTab: (tab: 'today' | 'track' | 'goals' | 'habits' | 'profile') => void;
  isSimulator: boolean;
  setIsSimulator: (val: boolean) => void;
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  selectedOccurrenceForProgress: TaskOccurrence | null;
  setSelectedOccurrenceForProgress: (occ: TaskOccurrence | null) => void;
  isCalendarModalOpen: boolean;
  setIsCalendarModalOpen: (open: boolean) => void;
  refreshOccurrences: () => Promise<void>;
  updateUserPreferences: (prefs: any) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [occurrences, setOccurrences] = useState<TaskOccurrence[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'today' | 'track' | 'goals' | 'habits' | 'profile'>('today');
  const [isSimulator, setIsSimulator] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [selectedOccurrenceForProgress, setSelectedOccurrenceForProgress] = useState<TaskOccurrence | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize theme and load user & categories
  useEffect(() => {
    async function init() {
      try {
        const [me, cats] = await Promise.all([api.fetchMe(), api.fetchCategories()]);
        setUser(me);
        setCategories(cats);
        if (me?.preferences?.theme) {
          const t = me.preferences.theme === 'dark' ? 'dark' : 'light';
          setTheme(t);
          applyThemeClass(t);
        }
      } catch (e) {
        console.error('Failed to init app', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const applyThemeClass = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyThemeClass(next);
    api.updateSettings({ preferences: { ...(user?.preferences || {}), theme: next } as any });
  };

  const refreshOccurrences = async () => {
    try {
      const data = await api.fetchOccurrences(selectedDate);
      setOccurrences(data || []);
    } catch (e) {
      console.error('Failed to refresh occurrences', e);
    }
  };

  useEffect(() => {
    refreshOccurrences();
  }, [selectedDate]);

  const updateUserPreferences = async (newPrefs: any) => {
    try {
      const updated = await api.updateSettings(newPrefs);
      setUser(updated);
    } catch (e) {
      console.error('Failed to update prefs', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        occurrences,
        categories,
        user,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        isSimulator,
        setIsSimulator,
        isAddTaskOpen,
        setIsAddTaskOpen,
        selectedOccurrenceForProgress,
        setSelectedOccurrenceForProgress,
        isCalendarModalOpen,
        setIsCalendarModalOpen,
        refreshOccurrences,
        updateUserPreferences,
        loading
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
