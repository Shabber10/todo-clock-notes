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

  // Check if categories exist, otherwise seed
  const catCount = database.getFirstSync<{ count: number }>('SELECT count(*) as count FROM categories;');
  if (!catCount || catCount.count === 0) {
    seedInitialDatabase(database);
  }
}

export function seedInitialDatabase(database: SQLite.SQLiteDatabase) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Insert default categories
  for (const c of DEFAULT_CATEGORIES) {
    database.runSync(
      'INSERT OR REPLACE INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?);',
      [c.id, c.name, c.color, c.icon]
    );
  }

  // Insert demo tasks
  const tasksToSeed = [
    {
      id: 'tsk_1',
      title: 'Morning Run',
      description: 'Morning run at city park',
      categoryId: 'cat_2',
      priority: 'high',
      measurementType: 'quantity',
      measurementConfig: JSON.stringify({ target: 5, unit: 'km' }),
      scheduledStart: '07:00',
      scheduledEnd: '08:00',
      recurrence: 'daily'
    },
    {
      id: 'tsk_2',
      title: 'Study Python',
      description: 'Asyncio, generators & system design',
      categoryId: 'cat_1',
      priority: 'medium',
      measurementType: 'duration',
      measurementConfig: JSON.stringify({ plannedMinutes: 60 }),
      scheduledStart: '09:00',
      scheduledEnd: '10:00',
      recurrence: 'daily'
    },
    {
      id: 'tsk_3',
      title: 'Read a Book',
      description: 'Atomic Habits - Chapter 4',
      categoryId: 'cat_4',
      priority: 'low',
      measurementType: 'quantity',
      measurementConfig: JSON.stringify({ target: 20, unit: 'pages' }),
      scheduledStart: '11:00',
      scheduledEnd: '11:30',
      recurrence: 'daily'
    },
    {
      id: 'tsk_4',
      title: 'Project Development',
      description: 'React Native & SQLite offline tracking',
      categoryId: 'cat_3',
      priority: 'urgent',
      measurementType: 'checklist',
      measurementConfig: JSON.stringify({
        subtasks: [
          { id: 'sub_1', title: 'Setup Expo & SQLite', weight: 1, completed: true },
          { id: 'sub_2', title: 'Top Calendar & Timeline UI', weight: 1, completed: true },
          { id: 'sub_3', title: 'Analytics & Recharts', weight: 1, completed: false },
          { id: 'sub_4', title: 'Mobile USB Verification', weight: 1, completed: false }
        ]
      }),
      scheduledStart: '14:00',
      scheduledEnd: '15:00',
      recurrence: 'weekdays'
    },
    {
      id: 'tsk_5',
      title: 'Gym Workout',
      description: 'Strength training',
      categoryId: 'cat_2',
      priority: 'medium',
      measurementType: 'duration',
      measurementConfig: JSON.stringify({ plannedMinutes: 45 }),
      scheduledStart: '17:00',
      scheduledEnd: '17:45',
      recurrence: 'daily'
    },
    {
      id: 'tsk_6',
      title: 'Meditation',
      description: 'Mindful breathing',
      categoryId: 'cat_5',
      priority: 'low',
      measurementType: 'duration',
      measurementConfig: JSON.stringify({ plannedMinutes: 15 }),
      scheduledStart: '20:00',
      scheduledEnd: '20:15',
      recurrence: 'daily'
    }
  ];

  for (const t of tasksToSeed) {
    database.runSync(
      `INSERT OR REPLACE INTO tasks 
        (id, title, description, categoryId, priority, measurementType, measurementConfig, scheduledStart, scheduledEnd, recurrence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [t.id, t.title, t.description, t.categoryId, t.priority, t.measurementType, t.measurementConfig, t.scheduledStart, t.scheduledEnd, t.recurrence]
    );
  }

  // Seed Today's Occurrences
  const occurrencesToSeed = [
    {
      id: `occ_${today}_tsk_1`,
      taskId: 'tsk_1',
      scheduledDate: today,
      scheduledStart: '07:00',
      scheduledEnd: '08:00',
      status: 'completed',
      progressPercentage: 100,
      actualData: JSON.stringify({ actual: 5 }),
      actualDisplay: '5 / 5 km (100%)',
      completedAt: `${today}T08:00:00Z`
    },
    {
      id: `occ_${today}_tsk_2`,
      taskId: 'tsk_2',
      scheduledDate: today,
      scheduledStart: '09:00',
      scheduledEnd: '10:00',
      status: 'in_progress',
      progressPercentage: 75,
      actualData: JSON.stringify({ actualMinutes: 45 }),
      actualDisplay: '45 / 60 mins (75%)',
      completedAt: null
    },
    {
      id: `occ_${today}_tsk_3`,
      taskId: 'tsk_3',
      scheduledDate: today,
      scheduledStart: '11:00',
      scheduledEnd: '11:30',
      status: 'upcoming',
      progressPercentage: 0,
      actualData: JSON.stringify({ actual: 0 }),
      actualDisplay: '0 / 20 pages (0%)',
      completedAt: null
    },
    {
      id: `occ_${today}_tsk_4`,
      taskId: 'tsk_4',
      scheduledDate: today,
      scheduledStart: '14:00',
      scheduledEnd: '15:00',
      status: 'in_progress',
      progressPercentage: 50,
      actualData: JSON.stringify({
        subtasks: [
          { id: 'sub_1', title: 'Setup Expo & SQLite', weight: 1, completed: true },
          { id: 'sub_2', title: 'Top Calendar & Timeline UI', weight: 1, completed: true },
          { id: 'sub_3', title: 'Analytics & Recharts', weight: 1, completed: false },
          { id: 'sub_4', title: 'Mobile USB Verification', weight: 1, completed: false }
        ]
      }),
      actualDisplay: '2 / 4 milestones (50%)',
      completedAt: null
    },
    {
      id: `occ_${today}_tsk_5`,
      taskId: 'tsk_5',
      scheduledDate: today,
      scheduledStart: '17:00',
      scheduledEnd: '17:45',
      status: 'upcoming',
      progressPercentage: 0,
      actualData: JSON.stringify({ actualMinutes: 0 }),
      actualDisplay: '0 / 45 mins (0%)',
      completedAt: null
    },
    {
      id: `occ_${today}_tsk_6`,
      taskId: 'tsk_6',
      scheduledDate: today,
      scheduledStart: '20:00',
      scheduledEnd: '20:15',
      status: 'upcoming',
      progressPercentage: 0,
      actualData: JSON.stringify({ actualMinutes: 0 }),
      actualDisplay: '0 / 15 mins (0%)',
      completedAt: null
    }
  ];

  for (const o of occurrencesToSeed) {
    database.runSync(
      `INSERT OR REPLACE INTO occurrences 
        (id, taskId, scheduledDate, scheduledStart, scheduledEnd, status, progressPercentage, actualData, actualDisplay, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [o.id, o.taskId, o.scheduledDate, o.scheduledStart, o.scheduledEnd, o.status, o.progressPercentage, o.actualData, o.actualDisplay, o.completedAt]
    );
  }

  // Seed Goals
  const goalsToSeed = [
    {
      id: 'goal_1',
      title: 'Become a Better Python Developer',
      description: 'Master advanced algorithms and architecture',
      category: 'Study & Learning',
      period: 'yearly',
      targetValue: 120,
      currentValue: 42,
      unit: 'hours',
      startDate: '2026-01-01',
      deadline: '2026-12-31',
      status: 'active',
      linkedTaskIds: JSON.stringify(['tsk_2', 'tsk_4'])
    },
    {
      id: 'goal_2',
      title: 'Run 100 km',
      description: 'Aerobic endurance foundation',
      category: 'Fitness & Health',
      period: 'monthly',
      targetValue: 100,
      currentValue: 60,
      unit: 'km',
      startDate: format(new Date(), 'yyyy-MM-01'),
      deadline: format(new Date(), 'yyyy-MM-28'),
      status: 'active',
      linkedTaskIds: JSON.stringify(['tsk_1'])
    },
    {
      id: 'goal_3',
      title: 'Read 12 Books',
      description: 'Personal development & deep reading',
      category: 'Personal',
      period: 'yearly',
      targetValue: 12,
      currentValue: 3,
      unit: 'books',
      startDate: '2026-01-01',
      deadline: '2026-12-31',
      status: 'active',
      linkedTaskIds: JSON.stringify(['tsk_3'])
    }
  ];

  for (const g of goalsToSeed) {
    database.runSync(
      `INSERT OR REPLACE INTO goals 
        (id, title, description, category, period, targetValue, currentValue, unit, startDate, deadline, status, linkedTaskIds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [g.id, g.title, g.description, g.category, g.period, g.targetValue, g.currentValue, g.unit, g.startDate, g.deadline, g.status, g.linkedTaskIds]
    );
  }

  // Seed Habits
  const habitsToSeed = [
    {
      id: 'hab_1',
      title: 'Read Daily',
      category: 'Personal',
      frequency: 'Daily',
      target: '20 min',
      streakCount: 12,
      bestStreak: 24,
      completedToday: 1
    },
    {
      id: 'hab_2',
      title: 'Exercise',
      category: 'Fitness & Health',
      frequency: '4 days/week',
      target: '30 min',
      streakCount: 8,
      bestStreak: 16,
      completedToday: 1
    },
    {
      id: 'hab_3',
      title: 'Meditate',
      category: 'Habits',
      frequency: 'Daily',
      target: '15 min',
      streakCount: 5,
      bestStreak: 14,
      completedToday: 0
    },
    {
      id: 'hab_4',
      title: 'Drink Water',
      category: 'Fitness & Health',
      frequency: 'Daily',
      target: '2 L',
      streakCount: 10,
      bestStreak: 30,
      completedToday: 1
    }
  ];

  for (const h of habitsToSeed) {
    database.runSync(
      `INSERT OR REPLACE INTO habits 
        (id, title, category, frequency, target, streakCount, bestStreak, completedToday)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [h.id, h.title, h.category, h.frequency, h.target, h.streakCount, h.bestStreak, h.completedToday]
    );
  }

  // Seed App Settings
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', ['theme', 'light']);
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', ['userName', 'Alex Johnson']);
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', ['userEmail', 'alex@example.com']);
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

export function insertNewTaskInDb(task: Task, scheduledDate: string) {
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

  const occId = `occ_${scheduledDate}_${task.id}`;
  database.runSync(
    `INSERT INTO occurrences (id, taskId, scheduledDate, scheduledStart, scheduledEnd, status, progressPercentage, actualData, actualDisplay, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      occId,
      task.id,
      scheduledDate,
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
    userName: map.get('userName') || 'Alex Johnson',
    userEmail: map.get('userEmail') || 'alex@example.com',
    defaultReminderMins: parseInt(map.get('defaultReminderMins') || '15', 10)
  };
}

export function updateSettingInDb(key: string, value: string) {
  const database = getDatabase();
  database.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', [key, value]);
}
