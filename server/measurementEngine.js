/**
 * ConsisTrack Centralized Measurement Engine
 * Handles standardized calculations for all 6 task measurement types.
 */

export function calculateProgress(measurementType, config, actualData) {
  let progressPercentage = 0;
  let isCompleted = false;
  let normalizedDisplay = '';

  switch (measurementType) {
    case 'quantity': {
      const target = parseFloat(config.target) || 1;
      const actual = parseFloat(actualData.actual) || 0;
      const unit = config.unit || 'units';
      
      progressPercentage = Math.min(100, Math.max(0, Math.round((actual / target) * 100)));
      isCompleted = actual >= target;
      normalizedDisplay = `${actual} / ${target} ${unit}`;
      break;
    }

    case 'duration': {
      const plannedMins = parseFloat(config.plannedMinutes) || 60;
      const actualMins = parseFloat(actualData.actualMinutes) || 0;
      
      progressPercentage = Math.min(100, Math.max(0, Math.round((actualMins / plannedMins) * 100)));
      isCompleted = actualMins >= plannedMins;
      normalizedDisplay = `${actualMins} / ${plannedMins} mins`;
      break;
    }

    case 'percentage': {
      const pct = Math.min(100, Math.max(0, parseFloat(actualData.percentage) || 0));
      progressPercentage = Math.round(pct);
      isCompleted = progressPercentage >= 100;
      normalizedDisplay = `${progressPercentage}%`;
      break;
    }

    case 'checklist': {
      const subtasks = actualData.subtasks || config.subtasks || [];
      if (subtasks.length === 0) {
        progressPercentage = 0;
        isCompleted = false;
        normalizedDisplay = '0 / 0 items';
      } else {
        const totalWeight = subtasks.reduce((sum, s) => sum + (parseFloat(s.weight) || 1), 0);
        const completedWeight = subtasks
          .filter(s => s.completed)
          .reduce((sum, s) => sum + (parseFloat(s.weight) || 1), 0);
        
        progressPercentage = Math.min(100, Math.max(0, Math.round((completedWeight / totalWeight) * 100)));
        const completedCount = subtasks.filter(s => s.completed).length;
        isCompleted = completedCount === subtasks.length;
        normalizedDisplay = `${completedCount} / ${subtasks.length} milestones`;
      }
      break;
    }

    case 'rating': {
      const rating = parseFloat(actualData.rating) || 0;
      const maxRating = parseFloat(config.maxRating) || 5;
      progressPercentage = Math.min(100, Math.max(0, Math.round((rating / maxRating) * 100)));
      isCompleted = rating > 0 && actualData.markCompleted === true;
      normalizedDisplay = `${rating} / ${maxRating} stars`;
      break;
    }

    case 'binary':
    default: {
      const done = actualData.completed === true || actualData.completed === 'true';
      progressPercentage = done ? 100 : 0;
      isCompleted = done;
      normalizedDisplay = done ? 'Done' : 'Pending';
      break;
    }
  }

  return {
    progressPercentage,
    isCompleted,
    normalizedDisplay
  };
}
