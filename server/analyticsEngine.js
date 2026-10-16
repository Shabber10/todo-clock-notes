import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

export function calculateDailyAnalytics(db, targetDate) {
  const occurrences = db.occurrences.filter(o => o.scheduledDate === targetDate);
  const tasksById = new Map(db.tasks.map(t => [t.id, t]));
  const categoriesById = new Map(db.categories.map(c => [c.id, c]));

  const totalDue = occurrences.length;
  const completed = occurrences.filter(o => o.status === 'completed').length;
  const inProgress = occurrences.filter(o => o.status === 'in_progress').length;
  const upcoming = occurrences.filter(o => o.status === 'upcoming').length;
  const missed = occurrences.filter(o => o.status === 'missed').length;

  const completionRate = totalDue > 0 ? Math.round((completed / totalDue) * 100) : 0;

  let plannedFocusMinutes = 0;
  let actualFocusMinutes = 0;

  // Category distribution
  const categoryCounts = {};
  const categoryFocusTime = {};

  db.categories.forEach(c => {
    categoryCounts[c.name] = 0;
    categoryFocusTime[c.name] = 0;
  });

  occurrences.forEach(occ => {
    const task = tasksById.get(occ.taskId);
    if (!task) return;

    const catName = categoriesById.get(task.categoryId)?.name || 'Other';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

    // Planned duration
    let dur = 60;
    if (task.measurementType === 'duration' && task.measurementConfig?.plannedMinutes) {
      dur = parseFloat(task.measurementConfig.plannedMinutes);
    } else if (occ.scheduledStart && occ.scheduledEnd) {
      const [sh, sm] = occ.scheduledStart.split(':').map(Number);
      const [eh, em] = occ.scheduledEnd.split(':').map(Number);
      dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 60;
    }
    plannedFocusMinutes += dur;

    // Actual duration
    let actualDur = 0;
    if (task.measurementType === 'duration' && occ.actualData?.actualMinutes) {
      actualDur = parseFloat(occ.actualData.actualMinutes);
    } else if (occ.status === 'completed') {
      actualDur = dur;
    } else if (occ.status === 'in_progress') {
      actualDur = Math.round(dur * (occ.progressPercentage / 100));
    }
    actualFocusMinutes += actualDur;
    categoryFocusTime[catName] = (categoryFocusTime[catName] || 0) + actualDur;
  });

  // Calculate target achievement across measurable targets
  let targetSum = 0;
  let measurableCount = 0;
  occurrences.forEach(occ => {
    if (occ.progressPercentage !== undefined) {
      targetSum += occ.progressPercentage;
      measurableCount++;
    }
  });
  const targetAchievement = measurableCount > 0 ? Math.round(targetSum / measurableCount) : 0;

  return {
    date: targetDate,
    totalDue,
    completed,
    inProgress,
    upcoming,
    missed,
    completionRate,
    targetAchievement: targetAchievement || completionRate,
    planAdherence: completionRate,
    plannedFocusHours: (plannedFocusMinutes / 60).toFixed(1),
    actualFocusHours: (actualFocusMinutes / 60).toFixed(1),
    plannedFocusDisplay: `${Math.floor(plannedFocusMinutes / 60)}h ${plannedFocusMinutes % 60}m`,
    actualFocusDisplay: `${Math.floor(actualFocusMinutes / 60)}h ${actualFocusMinutes % 60}m`,
    categoryDistribution: Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalDue > 0 ? Math.round((count / totalDue) * 100) : 0,
      focusMinutes: categoryFocusTime[name] || 0
    }))
  };
}

export function calculateWeeklyAnalytics(db, refDate) {
  const baseDate = parseISO(refDate);
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const end = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const dailyTrend = days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayName = format(d, 'EEE');
    const stats = calculateDailyAnalytics(db, dateStr);
    return {
      date: dateStr,
      day: dayName,
      completed: stats.completed,
      total: stats.totalDue,
      rate: stats.completionRate,
      focusMinutes: Math.round(parseFloat(stats.actualFocusHours) * 60)
    };
  });

  const totalCompleted = dailyTrend.reduce((acc, curr) => acc + curr.completed, 0);
  const totalDue = dailyTrend.reduce((acc, curr) => acc + curr.total, 0);
  const avgRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0;

  return {
    period: 'weekly',
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    totalCompleted,
    totalDue,
    averageCompletionRate: avgRate,
    trend: dailyTrend
  };
}
