import React from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { Clock, CheckCircle2, Target, ListTodo } from 'lucide-react';

export const DailySummary: React.FC = () => {
  const { selectedDate, occurrences, user } = useApp();
  const dateObj = parseISO(selectedDate);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  const total = occurrences.length;
  const completed = occurrences.filter(o => o.status === 'completed').length;
  const inProgress = occurrences.filter(o => o.status === 'in_progress').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Compute focus times
  let plannedMinutes = 0;
  let actualMinutes = 0;

  occurrences.forEach(occ => {
    let dur = 60;
    if (occ.task?.measurementType === 'duration' && occ.task.measurementConfig?.plannedMinutes) {
      dur = Number(occ.task.measurementConfig.plannedMinutes);
    } else if (occ.scheduledStart && occ.scheduledEnd) {
      const [sh, sm] = occ.scheduledStart.split(':').map(Number);
      const [eh, em] = occ.scheduledEnd.split(':').map(Number);
      dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 60;
    }
    plannedMinutes += dur;

    if (occ.task?.measurementType === 'duration' && occ.actualData?.actualMinutes) {
      actualMinutes += Number(occ.actualData.actualMinutes);
    } else if (occ.status === 'completed') {
      actualMinutes += dur;
    } else if (occ.status === 'in_progress') {
      actualMinutes += Math.round(dur * (occ.progressPercentage / 100));
    }
  });

  const plannedHoursDisplay = `${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m`;
  const actualHoursDisplay = `${Math.floor(actualMinutes / 60)}h ${actualMinutes % 60}m`;

  // Stroke dash calculation for circular progress ring
  const strokeDashoffset = 100 - completionRate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Good morning, {user?.name?.split(' ')[0] || 'Alex'}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here's your plan for {formattedDate}
          </p>
        </div>
      </div>

      {/* Progress Cards Banner */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-blue-100/60 dark:border-slate-700/60 rounded-2xl">
        {/* Radial Progress Ring */}
        <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-slate-700"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 dark:text-emerald-400 transition-all duration-700 ease-out"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              {completed} of {total} tasks completed
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              {inProgress} in progress
            </span>
          </div>

          {/* Horizontal Progress Bar */}
          <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* 4 Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="flex items-center space-x-2 text-xs">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-medium">Planned</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{plannedHoursDisplay}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <Target className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-medium">Actual Focus</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{actualHoursDisplay}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-medium">Completed</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{completed}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <ListTodo className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-medium">Total Due</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
