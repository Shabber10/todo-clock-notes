import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Bell, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, parseISO, subDays, addDays } from 'date-fns';

export const Header: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    theme, 
    toggleTheme, 
    user, 
    setIsCalendarModalOpen,
    isSimulator,
    setIsSimulator 
  } = useApp();

  const currentDateObj = parseISO(selectedDate);
  const formattedMonthYear = format(currentDateObj, 'MMMM yyyy');
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  const handlePrevDay = () => {
    setSelectedDate(format(subDays(currentDateObj, 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(currentDateObj, 1), 'yyyy-MM-dd'));
  };

  const handleGoToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              ChronoTrack
            </span>
          </div>
        </div>

        {/* Calendar Quick Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <span>{formattedMonthYear}</span>
            <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {!isToday && (
            <button
              onClick={handleGoToday}
              className="ml-1 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            >
              Today
            </button>
          )}
        </div>

        {/* Right Tools */}
        <div className="flex items-center space-x-2">
          {/* Mobile Simulator Toggle */}
          <button
            onClick={() => setIsSimulator(!isSimulator)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              isSimulator
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
            title="Toggle Mobile Simulator frame to test phone touch layout"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden lg:inline">{isSimulator ? 'Exit Simulator' : 'Mobile Simulator'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* User profile avatar */}
          <div className="flex items-center space-x-2 pl-1">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/20"
            />
            <span className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-200">
              {user?.name || 'Alex Johnson'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
