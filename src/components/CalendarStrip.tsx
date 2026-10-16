import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';

export const CalendarStrip: React.FC = () => {
  const { selectedDate, setSelectedDate, setIsCalendarModalOpen } = useApp();
  const currentDate = parseISO(selectedDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setSelectedDate(format(subDays(currentDate, 7), 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    setSelectedDate(format(addDays(currentDate, 7), 'yyyy-MM-dd'));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Prev Week Button */}
        <button
          onClick={handlePrevWeek}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          title="Previous Week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 7 Days Row */}
        <div className="flex-1 flex items-center justify-around sm:justify-center sm:gap-4 overflow-x-auto no-scrollbar py-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const isRealToday = isSameDay(day, new Date());

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] py-2 px-1 rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`text-[11px] font-medium uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className={`text-base sm:text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Status Dot / Today indicator */}
                <div className="mt-1 flex items-center gap-1 h-1.5">
                  {isRealToday && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600 dark:bg-blue-400'}`} />
                  )}
                  {!isRealToday && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-200' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Week Button */}
        <button
          onClick={handleNextWeek}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          title="Next Week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Quick View Full Calendar Button on desktop */}
        <button
          onClick={() => setIsCalendarModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span>View Calendar</span>
        </button>
      </div>
    </div>
  );
};
