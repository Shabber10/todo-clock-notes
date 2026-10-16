import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { format, subDays, addDays } from 'date-fns';
import { Category, Task, TaskOccurrence, Goal, Habit, AppSettings } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

// Seed data definitions matching user screenshots
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Study & Learning', color: '#2563EB', icon: 'book' },
  { id: 'cat_2', name: 'Fitness & Health', color: '#10B981', icon: 'heart' },
  { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'briefcase' },
  { id: 'cat_4', name: 'Personal', color: '#F59E0B', icon: 'user' },
  { id: 'cat_5', name: 'Habits', color: '#EC4899', icon: 'repeat' }
];

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('chronotrack.db');
  }
  return db;
}

export function initDatabase() {
  const database = getDatabase();

  // Create tables
  database.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      categoryId TEXT NOT NULL,
      priority TEXT NOT NULL,
      measurementType TEXT NOT NULL,
      measurementConfig TEXT NOT NULL,
      scheduledStart TEXT NOT NULL,
      scheduledEnd TEXT NOT NULL,
      recurrence TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS occurrences (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      scheduledDate TEXT NOT NULL,
      scheduledStart TEXT NOT NULL,
      scheduledEnd TEXT NOT NULL,
      status TEXT NOT NULL,
      progressPercentage INTEGER NOT NULL,
      actualData TEXT NOT NULL,
      actualDisplay TEXT NOT NULL,
      completedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      period TEXT NOT NULL,
      targetValue REAL NOT NULL,
      currentValue REAL NOT NULL,
      unit TEXT NOT NULL,
      startDate TEXT NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL,
      linkedTaskIds TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      frequency TEXT NOT NULL,
      target TEXT NOT NULL,
      streakCount INTEGER NOT NULL,
      bestStreak INTEGER NOT NULL,
      completedToday INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Ensure default categories exist for task categorization
  const catCount = database.getFirstSync<{ count: number }>('SELECT count(*) as count FROM categories;');
  if (!catCount || catCount.count === 0) {
    seedInitialDatabase(database);
  }

  // Ensure any previously seeded demo data is purged so the app starts completely fresh
  const cleanedCheck = database.getFirstSync<{ count: number }>(
    "SELECT count(*) as count FROM app_settings WHERE key = 'dummy_data_purged';"
  );
  if (!cleanedCheck || cleanedCheck.count === 0) {
    clearAllData(database);
    database.runSync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('dummy_data_purged', 'true');"
    );
  }

  // Ensure default profile info is neutral
  database.runSync("UPDATE app_settings SET value = 'User' WHERE key = 'userName' AND value = 'Alex Johnson';");
  database.runSync("UPDATE app_settings SET value = '' WHERE key = 'userEmail' AND value = 'alex@example.com';");

  // Ensure install_date is recorded starting from today
  const installCheck = database.getFirstSync<{ count: number }>(
    "SELECT count(*) as count FROM app_settings WHERE key = 'install_date';"
  );
  if (!installCheck || installCheck.count === 0) {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    database.runSync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('install_date', ?);",
      [todayStr]
    );
  }
}

export function clearAllData(database: SQLite.SQLiteDatabase = getDatabase()) {
  database.execSync(`
    DELETE FROM tasks;
    DELETE FROM occurrences;
    DELETE FROM goals;
    DELETE FROM habits;
  `);
}

export function seedInitialDatabase(database: SQLite.SQLiteDatabase) {
  // Insert default categories for task planning
  for (const c of DEFAULT_CATEGORIES) {
    database.runSync(
      'INSERT OR REPLACE INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?);',
      [c.id, c.name, c.color, c.icon]
    );
  }

  // Default clean App Settings
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', ['theme', 'light']);
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', ['userName', 'User']);
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', ['userEmail', '']);
}

// Database query helpers
export function getCategoriesFromDb(): Category[] {
  const database = getDatabase();
  return database.getAllSync<Category>('SELECT * FROM categories ORDER BY name ASC;');
}

export function getOccurrencesFromDb(dateStr: string): TaskOccurrence[] {
  const database = getDatabase();
  const rawOccurrences = database.getAllSync<any>(
    'SELECT * FROM occurrences WHERE scheduledDate = ? ORDER BY scheduledStart ASC;',
    [dateStr]
  );

  const categories = getCategoriesFromDb();
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const tasks = database.getAllSync<any>('SELECT * FROM tasks;');
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  return rawOccurrences.map(row => {
    const rawTask = taskMap.get(row.taskId) || {};
    const cat = categoryMap.get(rawTask.categoryId) || DEFAULT_CATEGORIES[0];

    const task: Task = {
      id: rawTask.id,
      title: rawTask.title,
      description: rawTask.description,
      categoryId: rawTask.categoryId,
      priority: rawTask.priority,
      measurementType: rawTask.measurementType,
      measurementConfig: JSON.parse(rawTask.measurementConfig || '{}'),
      scheduledStart: rawTask.scheduledStart,
      scheduledEnd: rawTask.scheduledEnd,
      recurrence: rawTask.recurrence,
      category: cat
    };

    return {
      id: row.id,
      taskId: row.taskId,
      scheduledDate: row.scheduledDate,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      status: row.status,
      progressPercentage: row.progressPercentage,
      actualData: JSON.parse(row.actualData || '{}'),
      actualDisplay: row.actualDisplay,
      completedAt: row.completedAt,
      task
    };
  });
}

export function getOccurrencesInRangeFromDb(startDateStr: string, endDateStr: string): TaskOccurrence[] {
  const database = getDatabase();
  const rawOccurrences = database.getAllSync<any>(
    'SELECT * FROM occurrences WHERE scheduledDate >= ? AND scheduledDate <= ? ORDER BY scheduledDate ASC, scheduledStart ASC;',
    [startDateStr, endDateStr]
  );

  const categories = getCategoriesFromDb();
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const tasks = database.getAllSync<any>('SELECT * FROM tasks;');
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  return rawOccurrences.map(row => {
    const rawTask = taskMap.get(row.taskId) || {};
    const cat = categoryMap.get(rawTask.categoryId) || DEFAULT_CATEGORIES[0];

    const task: Task = {
      id: rawTask.id,
      title: rawTask.title,
      description: rawTask.description,
      categoryId: rawTask.categoryId,
      priority: rawTask.priority,
      measurementType: rawTask.measurementType,
      measurementConfig: JSON.parse(rawTask.measurementConfig || '{}'),
      scheduledStart: rawTask.scheduledStart,
      scheduledEnd: rawTask.scheduledEnd,
      recurrence: rawTask.recurrence,
      category: cat
    };

    return {
      id: row.id,
      taskId: row.taskId,
      scheduledDate: row.scheduledDate,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      status: row.status,
      progressPercentage: row.progressPercentage,
      actualData: JSON.parse(row.actualData || '{}'),
      actualDisplay: row.actualDisplay,
      completedAt: row.completedAt,
      task
    };
  });
}

export function saveOccurrenceProgressInDb(
  occurrenceId: string,
  progressPercentage: number,
  actualData: any,
  actualDisplay: string,
  status: string
) {
  const database = getDatabase();
  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  database.runSync(
    `UPDATE occurrences 
     SET progressPercentage = ?, actualData = ?, actualDisplay = ?, status = ?, completedAt = ?
     WHERE id = ?;`,
    [progressPercentage, JSON.stringify(actualData), actualDisplay, status, completedAt, occurrenceId]
  );
}

function addMinutesToTime(timeStr: string, mins: number): string {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  const total = h * 60 + m + mins;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const newH = Math.floor(wrapped / 60);
  const newM = wrapped % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function postponeOccurrenceInDb(occurrenceId: string, minutes: number) {
  const database = getDatabase();
  const occ = database.getFirstSync<any>('SELECT * FROM occurrences WHERE id = ?;', [occurrenceId]);
  if (!occ) return;

  const newStart = addMinutesToTime(occ.scheduledStart, minutes);
  const newEnd = addMinutesToTime(occ.scheduledEnd, minutes);

  database.runSync(
    'UPDATE occurrences SET scheduledStart = ?, scheduledEnd = ? WHERE id = ?;',
    [newStart, newEnd, occurrenceId]
  );
}

export function extendOccurrenceInDb(occurrenceId: string, minutes: number) {
  const database = getDatabase();
  const occ = database.getFirstSync<any>('SELECT * FROM occurrences WHERE id = ?;', [occurrenceId]);
  if (!occ) return;

  const newEnd = addMinutesToTime(occ.scheduledEnd, minutes);

  database.runSync(
    'UPDATE occurrences SET scheduledEnd = ? WHERE id = ?;',
    [newEnd, occurrenceId]
  );
}


export function insertNewTaskInDb(task: Task, scheduledDate: string, selectedDays: string[] = []) {
  const database = getDatabase();
  database.runSync(
    `INSERT INTO tasks (id, title, description, categoryId, priority, measurementType, measurementConfig, scheduledStart, scheduledEnd, recurrence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      task.id,
      task.title,
      task.description || '',
      task.categoryId,
      task.priority,
      task.measurementType,
      JSON.stringify(task.measurementConfig || {}),
      task.scheduledStart,
      task.scheduledEnd,
      task.recurrence || 'one_time'
    ]
  );

  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const datesToSchedule: string[] = [scheduledDate];

  if (task.recurrence && task.recurrence !== 'one_time') {
    const [y, m, d] = scheduledDate.split('-').map(Number);
    const baseDate = new Date(y, m - 1, d);
    for (let i = 1; i < 14; i++) {
      const nextD = new Date(baseDate);
      nextD.setDate(baseDate.getDate() + i);
      const nextDateStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`;
      const dayOfWeek = dayKeys[nextD.getDay()];

      if (task.recurrence === 'daily') {
        datesToSchedule.push(nextDateStr);
      } else if (task.recurrence === 'weekdays') {
        if (nextD.getDay() >= 1 && nextD.getDay() <= 5) {
          datesToSchedule.push(nextDateStr);
        }
      } else if (selectedDays.length > 0 && selectedDays.includes(dayOfWeek)) {
        datesToSchedule.push(nextDateStr);
      }
    }
  }

  for (const dateStr of datesToSchedule) {
    const occId = `occ_${dateStr}_${task.id}`;
    database.runSync(
      `INSERT OR REPLACE INTO occurrences (id, taskId, scheduledDate, scheduledStart, scheduledEnd, status, progressPercentage, actualData, actualDisplay, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        occId,
        task.id,
        dateStr,
        task.scheduledStart,
        task.scheduledEnd,
        'upcoming',
        0,
        JSON.stringify({}),
        '0% completed',
        null
      ]
    );
  }
}

export function deleteTaskFromDb(taskId: string) {
  const database = getDatabase();
  database.runSync('DELETE FROM occurrences WHERE taskId = ?;', [taskId]);
  database.runSync('DELETE FROM tasks WHERE id = ?;', [taskId]);
}

export function getGoalsFromDb(): Goal[] {
  const database = getDatabase();
  const raw = database.getAllSync<any>('SELECT * FROM goals ORDER BY deadline ASC;');
  return raw.map(g => ({
    ...g,
    linkedTaskIds: JSON.parse(g.linkedTaskIds || '[]')
  }));
}

export function getHabitsFromDb(): Habit[] {
  const database = getDatabase();
  const raw = database.getAllSync<any>('SELECT * FROM habits ORDER BY streakCount DESC;');
  return raw.map(h => ({
    ...h,
    completedToday: Boolean(h.completedToday)
  }));
}

export function toggleHabitInDb(id: string) {
  const database = getDatabase();
  const habit = database.getFirstSync<any>('SELECT * FROM habits WHERE id = ?;', [id]);
  if (!habit) return;

  const nextState = habit.completedToday ? 0 : 1;
  const newStreak = nextState === 1 ? habit.streakCount + 1 : Math.max(0, habit.streakCount - 1);
  const bestStreak = Math.max(habit.bestStreak, newStreak);

  database.runSync(
    'UPDATE habits SET completedToday = ?, streakCount = ?, bestStreak = ? WHERE id = ?;',
    [nextState, newStreak, bestStreak, id]
  );
}

export function getSettingsFromDb(): AppSettings {
  const database = getDatabase();
  const rows = database.getAllSync<{ key: string; value: string }>('SELECT * FROM app_settings;');
  const map = new Map(rows.map(r => [r.key, r.value]));

  return {
    theme: (map.get('theme') as 'light' | 'dark') || 'light',
    timeFormat: (map.get('timeFormat') as '12h' | '24h') || '12h',
    userName: map.get('userName') || 'User',
    userEmail: map.get('userEmail') || '',
    defaultReminderMins: parseInt(map.get('defaultReminderMins') || '15', 10),
    alarmEnabled: map.get('alarmEnabled') !== 'false',
    pauseAlarmMins: parseInt(map.get('pauseAlarmMins') || '10', 10),
    alarmSound: map.get('alarmSound') || 'Default (Gentle Chime)',
    alarmSoundUri: map.get('alarmSoundUri') || '',
    vibrateEnabled: map.get('vibrateEnabled') !== 'false',
    firstDayOfWeek: (map.get('firstDayOfWeek') as 'Monday' | 'Sunday') || 'Monday',
    defaultTaskDuration: parseInt(map.get('defaultTaskDuration') || '60', 10),
    preStartAlarmEnabled: map.get('preStartAlarmEnabled') !== 'false',
    startAlarmEnabled: map.get('startAlarmEnabled') !== 'false',
    wrapUpAlarmEnabled: map.get('wrapUpAlarmEnabled') !== 'false',
    hapticFeedback: map.get('hapticFeedback') !== 'false',
    completionSound: map.get('completionSound') !== 'false',
    autoRollForward: map.get('autoRollForward') === 'true',
  };
}

export function clearCompletedOccurrencesFromDb() {
  const database = getDatabase();
  database.runSync("DELETE FROM occurrences WHERE status = 'completed';");
}

export function updateSettingInDb(key: string, value: string) {
  const database = getDatabase();
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', [key, value]);
}

export function getAppInstallDate(): string {
  const database = getDatabase();
  const row = database.getFirstSync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = 'install_date';"
  );
  if (row?.value) {
    return row.value;
  }
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  database.runSync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('install_date', ?);",
    [todayStr]
  );
  return todayStr;
}
