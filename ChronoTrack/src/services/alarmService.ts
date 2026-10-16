import { format } from 'date-fns';
import { TaskOccurrence } from '../types';
import * as db from '../database/db';

export type AlarmStage = 'pre_start' | 'start' | 'pre_end';

export interface TaskAlarm {
  id: string;
  occurrence: TaskOccurrence;
  stage: AlarmStage;
  title: string;
  message: string;
  targetTime: string;
  nextTaskTitle?: string;
  nextTaskTime?: string;
}

// In-memory set to prevent duplicate triggers for the same alarm cycle
const triggeredAlarms = new Set<string>();

export function checkTaskAlarms(todayOccurrences: TaskOccurrence[]): TaskAlarm | null {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = format(now, 'yyyy-MM-dd');

  // Filter today's occurrences that are not already completed or missed
  const activeOccs = todayOccurrences
    .filter(o => o.scheduledDate === todayStr && o.status !== 'completed' && o.status !== 'missed')
    .sort((a, b) => {
      const [ah, am] = (a.scheduledStart || '00:00').split(':').map(Number);
      const [bh, bm] = (b.scheduledStart || '00:00').split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

  for (let i = 0; i < activeOccs.length; i++) {
    const occ = activeOccs[i];
    if (!occ.scheduledStart || !occ.scheduledEnd) continue;

    const [sh, sm] = occ.scheduledStart.split(':').map(Number);
    const [eh, em] = occ.scheduledEnd.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    // 1. Pre-Start Alarm: Exactly 5 minutes before scheduled start
    const preStartMins = startMins - 5;
    const preStartId = `${occ.id}_pre_start_${occ.scheduledStart}`;
    if (currentTotalMinutes === preStartMins && !triggeredAlarms.has(preStartId)) {
      return {
        id: preStartId,
        occurrence: occ,
        stage: 'pre_start',
        title: 'Task Starts in 5 Minutes!',
        message: `Next task "${occ.task.title}" is going to start in 5 mins (${occ.scheduledStart}).`,
        targetTime: occ.scheduledStart
      };
    }

    // 2. Start Alarm: At the exact scheduled start time
    const startId = `${occ.id}_start_${occ.scheduledStart}`;
    if (currentTotalMinutes === startMins && !triggeredAlarms.has(startId)) {
      return {
        id: startId,
        occurrence: occ,
        stage: 'start',
        title: 'Task Has Begun!',
        message: `It is time for "${occ.task.title}". Scheduled until ${occ.scheduledEnd}.`,
        targetTime: occ.scheduledStart
      };
    }

    // 3. Pre-End Alarm: 5 minutes before completion / end
    const preEndMins = endMins - 5;
    const preEndId = `${occ.id}_pre_end_${occ.scheduledEnd}`;
    if (currentTotalMinutes === preEndMins && !triggeredAlarms.has(preEndId)) {
      // Check if there is an upcoming next task
      const nextOcc = activeOccs[i + 1];
      let nextTitle: string | undefined;
      let nextTime: string | undefined;
      let message = `Last 5 mins for "${occ.task.title}"! Wrap up your tasks before ${occ.scheduledEnd}.`;

      if (nextOcc && nextOcc.scheduledStart) {
        const [nsh, nsm] = nextOcc.scheduledStart.split(':').map(Number);
        const nextStartMins = nsh * 60 + nsm;
        if (nextStartMins - endMins <= 5) {
          nextTitle = nextOcc.task.title;
          nextTime = nextOcc.scheduledStart;
          message = `Last 5 mins for "${occ.task.title}"! Next task "${nextTitle}" is within 5 mins (${nextTime}).`;
        }
      }

      return {
        id: preEndId,
        occurrence: occ,
        stage: 'pre_end',
        title: 'Last 5 Minutes!',
        message,
        targetTime: occ.scheduledEnd,
        nextTaskTitle: nextTitle,
        nextTaskTime: nextTime
      };
    }
  }

  return null;
}

export function markAlarmTriggered(alarmId: string) {
  triggeredAlarms.add(alarmId);
}

export function resetAlarmTrigger(alarmId: string) {
  triggeredAlarms.delete(alarmId);
}
