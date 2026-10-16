import { TaskOccurrence, Category, Goal, Habit, DailyAnalytics, WeeklyAnalytics, UserProfile } from '../types';

const BASE_URL = '/api';

export async function fetchMe(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/auth/me`);
  const data = await res.json();
  return data.user;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  const data = await res.json();
  return data.categories;
}

export async function fetchOccurrences(date: string): Promise<TaskOccurrence[]> {
  const res = await fetch(`${BASE_URL}/occurrences?date=${date}`);
  const data = await res.json();
  return data.occurrences;
}

export async function createTask(payload: any): Promise<{ task: any; occurrence: TaskOccurrence }> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function recordProgress(occurrenceId: string, actualData: any, note?: string) {
  const res = await fetch(`${BASE_URL}/occurrences/${occurrenceId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actualData, note })
  });
  return await res.json();
}

export async function updateOccurrenceStatus(occurrenceId: string, status: string) {
  const res = await fetch(`${BASE_URL}/occurrences/${occurrenceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

export async function fetchGoals(): Promise<Goal[]> {
  const res = await fetch(`${BASE_URL}/goals`);
  const data = await res.json();
  return data.goals;
}

export async function createGoal(payload: any): Promise<Goal> {
  const res = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.goal;
}

export async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch(`${BASE_URL}/habits`);
  const data = await res.json();
  return data.habits;
}

export async function toggleHabit(habitId: string): Promise<Habit> {
  const res = await fetch(`${BASE_URL}/habits/${habitId}/toggle`, {
    method: 'POST'
  });
  const data = await res.json();
  return data.habit;
}

export async function fetchDailyAnalytics(date: string): Promise<DailyAnalytics> {
  const res = await fetch(`${BASE_URL}/analytics/daily?date=${date}`);
  const data = await res.json();
  return data.analytics;
}

export async function fetchWeeklyAnalytics(date: string): Promise<WeeklyAnalytics> {
  const res = await fetch(`${BASE_URL}/analytics/weekly?date=${date}`);
  const data = await res.json();
  return data.analytics;
}

export async function updateSettings(settings: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  return data.user;
}

export async function resetDemoData() {
  const res = await fetch(`${BASE_URL}/seed/reset`, { method: 'POST' });
  return await res.json();
}
