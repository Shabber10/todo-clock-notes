import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { getOccurrencesFromDb, getCategoriesFromDb } from '../database/db';
import { DailyAnalytics, WeeklyAnalytics } from '../types';

export function calculateDailyAnalytics(dateStr: string): DailyAnalytics {
  const occurrences = getOccurrencesFromDb(dateStr);
  const categories = getCategoriesFromDb();

  const totalDue = occurrences.length;
  const completed = occurrences.filter(o => o.status === 'completed').length;
  const inProgress = occurrences.filter(o => o.status === 'in_progress').length;
  const upcoming = occurrences.filter(o => o.status === 'upcoming').length;
  const missed = occurrences.filter(o => o.status === 'missed').length;

  const completionRate = totalDue > 0 ? Math.round((completed / totalDue) * 100) : 0;

  let plannedMinutes = 0;
  let actualMinutes = 0;

  const categoryMap = new Map<string, { count: number; color: string; focusMinutes: number }>();
  categories.forEach(c => {
    categoryMap.set(c.name, { count: 0, color: c.color, focusMinutes: 0 });
  });

  let progressSum = 0;

  occurrences.forEach(occ => {
    const catName = occ.task.category?.name || 'Other';
    const entry = categoryMap.get(catName) || { count: 0, color: '#64748B', focusMinutes: 0 };
    entry.count += 1;

    let dur = 60;
    if (occ.task.measurementType === 'duration' && occ.task.measurementConfig?.plannedMinutes) {
      dur = Number(occ.task.measurementConfig.plannedMinutes);
    } else if (occ.scheduledStart && occ.scheduledEnd) {
      const [sh, sm] = occ.scheduledStart.split(':').map(Number);
      const [eh, em] = occ.scheduledEnd.split(':').map(Number);
      dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 60;
    }
    plannedMinutes += dur;

    let actualDur = 0;
    if (occ.task.measurementType === 'duration' && occ.actualData?.actualMinutes) {
      actualDur = Number(occ.actualData.actualMinutes);
    } else if (occ.status === 'completed') {
      actualDur = dur;
    } else if (occ.status === 'in_progress') {
      actualDur = Math.round(dur * (occ.progressPercentage / 100));
    }

    actualMinutes += actualDur;
    entry.focusMinutes += actualDur;
    categoryMap.set(catName, entry);

    progressSum += occ.progressPercentage;
  });

  const targetAchievement = totalDue > 0 ? Math.round(progressSum / totalDue) : 0;

  const categoryDistribution = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    color: data.color,
    percentage: totalDue > 0 ? Math.round((data.count / totalDue) * 100) : 0,
    focusMinutes: data.focusMinutes
  }));

  return {
    date: dateStr,
    totalDue,
    completed,
    inProgress,
    upcoming,
    missed,
    completionRate,
    targetAchievement: targetAchievement || completionRate,
    plannedFocusDisplay: `${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m`,
    actualFocusDisplay: `${Math.floor(actualMinutes / 60)}h ${actualMinutes % 60}m`,
    categoryDistribution
  };
}

export function calculateWeeklyAnalytics(refDateStr: string): WeeklyAnalytics {
  const baseDate = parseISO(refDateStr);
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const end = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const trend = days.map(d => {
    const dStr = format(d, 'yyyy-MM-dd');
    const dayName = format(d, 'EEE');
    const stats = calculateDailyAnalytics(dStr);
    return {
      day: dayName,
      date: dStr,
      completed: stats.completed,
      total: stats.totalDue,
      rate: stats.completionRate
    };
  });

  const totalCompleted = trend.reduce((sum, item) => sum + item.completed, 0);
  const totalDue = trend.reduce((sum, item) => sum + item.total, 0);
  const averageRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0;

  return {
    totalCompleted,
    totalDue,
    averageRate,
    trend
  };
}
