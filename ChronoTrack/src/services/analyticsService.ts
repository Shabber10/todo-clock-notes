import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  eachDayOfInterval, 
  eachMonthOfInterval 
} from 'date-fns';
import { getOccurrencesFromDb, getCategoriesFromDb, getOccurrencesInRangeFromDb, getAppInstallDate } from '../database/db';
import { DailyAnalytics, WeeklyAnalytics, PeriodAnalytics, TrendPoint } from '../types';

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

export function calculatePeriodAnalytics(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  refDateStr: string
): PeriodAnalytics {
  const baseDate = parseISO(refDateStr);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const installDateStr = getAppInstallDate();

  let startDateStr = refDateStr;
  let endDateStr = refDateStr;
  let periodTitle = 'Daily Completion Trend';
  let trend: TrendPoint[] = [];

  if (period === 'daily') {
    periodTitle = 'Daily Completion Trend';
    startDateStr = refDateStr;
    endDateStr = refDateStr;

    const occurrences = getOccurrencesFromDb(refDateStr);
    const slots = [
      { label: '6am', startHour: 6, endHour: 9 },
      { label: '9am', startHour: 9, endHour: 12 },
      { label: '12pm', startHour: 12, endHour: 15 },
      { label: '3pm', startHour: 15, endHour: 18 },
      { label: '6pm', startHour: 18, endHour: 21 },
      { label: '9pm', startHour: 21, endHour: 24 }
    ];

    const isRefToday = refDateStr === todayStr;
    const isDayFuture = refDateStr > todayStr;
    const isDayBeforeStart = refDateStr < installDateStr;
    const currentHour = new Date().getHours();

    let lastKnownRate = 0;
    let hasHadAnyTask = false;

    trend = slots.map(s => {
      const isFuture = isDayFuture || (isRefToday && s.startHour > currentHour);
      const isBeforeStart = isDayBeforeStart;

      if (isFuture) {
        return {
          day: s.label,
          completed: 0,
          total: 0,
          rate: 0,
          isGrowing: true,
          status: 'future' as const,
          isFuture: true,
          isBeforeStart: false
        };
      }

      if (isBeforeStart) {
        return {
          day: s.label,
          completed: 0,
          total: 0,
          rate: 0,
          isGrowing: true,
          status: 'before_start' as const,
          isFuture: false,
          isBeforeStart: true
        };
      }

      const slotOccs = occurrences.filter(occ => {
        if (!occ.scheduledStart) return false;
        const hour = parseInt(occ.scheduledStart.split(':')[0], 10);
        return hour >= s.startHour && hour < s.endHour;
      });

      const slotTotal = slotOccs.length;
      const slotCompleted = slotOccs.filter(o => o.status === 'completed').length;

      let rate = 0;
      let status: 'active' | 'before_start' | 'future' = 'active';

      if (slotTotal > 0) {
        hasHadAnyTask = true;
        rate = Math.round((slotCompleted / slotTotal) * 100);
        lastKnownRate = rate;
      } else if (hasHadAnyTask) {
        // Carry forward completion rate for time intervals with no tasks so it doesn't falsely plunge to 0
        rate = lastKnownRate;
      } else {
        // Before the user had any task scheduled on this day
        status = 'before_start';
        rate = 0;
      }

      return {
        day: s.label,
        completed: slotCompleted,
        total: slotTotal,
        rate,
        isGrowing: true,
        status,
        isFuture: false,
        isBeforeStart: status === 'before_start'
      };
    });
  } else if (period === 'weekly') {
    periodTitle = 'Weekly Completion Trend';
    const start = startOfWeek(baseDate, { weekStartsOn: 1 });
    const end = endOfWeek(baseDate, { weekStartsOn: 1 });
    startDateStr = format(start, 'yyyy-MM-dd');
    endDateStr = format(end, 'yyyy-MM-dd');

    const days = eachDayOfInterval({ start, end });
    trend = days.map(d => {
      const dStr = format(d, 'yyyy-MM-dd');
      const isFuture = dStr > todayStr;
      const isBeforeStart = dStr < installDateStr;
      const status: 'active' | 'before_start' | 'future' = isFuture 
        ? 'future' 
        : (isBeforeStart ? 'before_start' : 'active');

      if (isFuture || isBeforeStart) {
        return {
          day: format(d, 'EEE'),
          date: dStr,
          completed: 0,
          total: 0,
          rate: 0,
          isGrowing: true,
          status,
          isFuture,
          isBeforeStart
        };
      }

      const stats = calculateDailyAnalytics(dStr);
      return {
        day: format(d, 'EEE'),
        date: dStr,
        completed: stats.completed,
        total: stats.totalDue,
        rate: stats.completionRate,
        isGrowing: true,
        status: 'active',
        isFuture: false,
        isBeforeStart: false
      };
    });
  } else if (period === 'monthly') {
    periodTitle = 'Monthly Completion Trend';
    const start = startOfMonth(baseDate);
    const end = endOfMonth(baseDate);
    startDateStr = format(start, 'yyyy-MM-dd');
    endDateStr = format(end, 'yyyy-MM-dd');

    const daysInMonth = eachDayOfInterval({ start, end });
    const weekBuckets: { label: string; days: Date[] }[] = [
      { label: 'W1', days: [] },
      { label: 'W2', days: [] },
      { label: 'W3', days: [] },
      { label: 'W4', days: [] }
    ];
    if (daysInMonth.length > 28) {
      weekBuckets.push({ label: 'W5', days: [] });
    }

    daysInMonth.forEach(d => {
      const dayNum = d.getDate();
      if (dayNum <= 7) weekBuckets[0].days.push(d);
      else if (dayNum <= 14) weekBuckets[1].days.push(d);
      else if (dayNum <= 21) weekBuckets[2].days.push(d);
      else if (dayNum <= 28) weekBuckets[3].days.push(d);
      else if (weekBuckets[4]) weekBuckets[4].days.push(d);
    });

    trend = weekBuckets.map(b => {
      const bucketStartStr = format(b.days[0], 'yyyy-MM-dd');
      const bucketEndStr = format(b.days[b.days.length - 1], 'yyyy-MM-dd');
      const isFuture = bucketStartStr > todayStr;
      const isBeforeStart = bucketEndStr < installDateStr;
      const status: 'active' | 'before_start' | 'future' = isFuture 
        ? 'future' 
        : (isBeforeStart ? 'before_start' : 'active');

      if (isFuture || isBeforeStart) {
        return {
          day: b.label,
          completed: 0,
          total: 0,
          rate: 0,
          isGrowing: true,
          status,
          isFuture,
          isBeforeStart
        };
      }

      let bCompleted = 0;
      let bTotal = 0;
      b.days.forEach(d => {
        const dStr = format(d, 'yyyy-MM-dd');
        if (dStr >= installDateStr && dStr <= todayStr) {
          const stats = calculateDailyAnalytics(dStr);
          bCompleted += stats.completed;
          bTotal += stats.totalDue;
        }
      });
      const rate = bTotal > 0 ? Math.round((bCompleted / bTotal) * 100) : 0;
      return {
        day: b.label,
        completed: bCompleted,
        total: bTotal,
        rate,
        isGrowing: true,
        status: 'active',
        isFuture: false,
        isBeforeStart: false
      };
    });
  } else {
    // yearly
    periodTitle = 'Yearly Completion Trend';
    const start = startOfYear(baseDate);
    const end = endOfYear(baseDate);
    startDateStr = format(start, 'yyyy-MM-dd');
    endDateStr = format(end, 'yyyy-MM-dd');

    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const installMonthStr = installDateStr.slice(0, 7);

    const months = eachMonthOfInterval({ start, end });
    trend = months.map(m => {
      const mStr = format(m, 'yyyy-MM');
      const isFuture = mStr > currentMonthStr;
      const isBeforeStart = mStr < installMonthStr;
      const status: 'active' | 'before_start' | 'future' = isFuture 
        ? 'future' 
        : (isBeforeStart ? 'before_start' : 'active');

      if (isFuture || isBeforeStart) {
        return {
          day: format(m, 'MMM'),
          completed: 0,
          total: 0,
          rate: 0,
          isGrowing: true,
          status,
          isFuture,
          isBeforeStart
        };
      }

      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const mDays = eachDayOfInterval({ start: mStart, end: mEnd });
      let mCompleted = 0;
      let mTotal = 0;
      mDays.forEach(d => {
        const dStr = format(d, 'yyyy-MM-dd');
        if (dStr >= installDateStr && dStr <= todayStr) {
          const stats = calculateDailyAnalytics(dStr);
          mCompleted += stats.completed;
          mTotal += stats.totalDue;
        }
      });
      const rate = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
      return {
        day: format(m, 'MMM'),
        completed: mCompleted,
        total: mTotal,
        rate,
        isGrowing: true,
        status: 'active',
        isFuture: false,
        isBeforeStart: false
      };
    });
  }

  const activePoints = trend.filter(p => !p.isFuture && !p.isBeforeStart);

  // Calculate isGrowing for each point compared to previous active point
  for (let i = 0; i < trend.length; i++) {
    if (trend[i].isFuture || trend[i].isBeforeStart) {
      trend[i].isGrowing = true;
      continue;
    }
    const actIdx = activePoints.findIndex(p => p.day === trend[i].day);
    if (actIdx <= 0) {
      trend[i].isGrowing = trend[i].rate > 0;
    } else {
      trend[i].isGrowing = trend[i].rate >= activePoints[actIdx - 1].rate;
    }
  }

  // Aggregate occurrences in range for the 4 summary cards & categories
  const rangeOccurrences = getOccurrencesInRangeFromDb(startDateStr, endDateStr);
  const totalDue = rangeOccurrences.length;
  const completed = rangeOccurrences.filter(o => o.status === 'completed').length;
  const inProgress = rangeOccurrences.filter(o => o.status === 'in_progress').length;
  const upcoming = rangeOccurrences.filter(o => o.status === 'upcoming').length;
  const missed = rangeOccurrences.filter(o => o.status === 'missed').length;
  const completionRate = totalDue > 0 ? Math.round((completed / totalDue) * 100) : 0;

  let plannedMinutes = 0;
  let actualMinutes = 0;
  let progressSum = 0;

  const categories = getCategoriesFromDb();
  const categoryMap = new Map<string, { count: number; color: string; focusMinutes: number }>();
  categories.forEach(c => {
    categoryMap.set(c.name, { count: 0, color: c.color, focusMinutes: 0 });
  });

  rangeOccurrences.forEach(occ => {
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
  
  // Average rate: calculated over active intervals only
  const averageRate = activePoints.length > 0 
    ? Math.round(activePoints.reduce((sum, p) => sum + p.rate, 0) / activePoints.length) 
    : (completionRate || 0);

  const categoryDistribution = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    color: data.color,
    percentage: totalDue > 0 ? Math.round((data.count / totalDue) * 100) : 0,
    focusMinutes: data.focusMinutes
  }));

  // Determine overall growth direction and percentage from active points
  let growthDirection: 'up' | 'down' | 'flat' = 'flat';
  let growthPercentage = 0;

  if (activePoints.length >= 2) {
    const firstRate = activePoints[0].rate;
    const lastRate = activePoints[activePoints.length - 1].rate;
    if (lastRate > firstRate) {
      growthDirection = 'up';
      growthPercentage = lastRate - firstRate;
    } else if (lastRate < firstRate) {
      growthDirection = 'down';
      growthPercentage = firstRate - lastRate;
    } else {
      growthDirection = 'flat';
      growthPercentage = 0;
    }
  } else if (activePoints.length === 1) {
    growthDirection = activePoints[0].rate > 0 ? 'up' : 'flat';
    growthPercentage = 0;
  }


  return {
    period,
    periodTitle,
    totalDue,
    completed,
    inProgress,
    upcoming,
    missed,
    completionRate,
    targetAchievement: targetAchievement || completionRate,
    plannedFocusDisplay: `${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m`,
    actualFocusDisplay: `${Math.floor(actualMinutes / 60)}h ${actualMinutes % 60}m`,
    averageRate,
    trend,
    categoryDistribution,
    growthDirection,
    growthPercentage
  };
}
