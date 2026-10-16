import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { format, subDays, addDays } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/database.json');

function ensureDataDir() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getInitialSeedData() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');
  const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return {
    user: {
      id: 'usr_1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      timezone: 'UTC+05:30',
      preferences: {
        theme: 'light',
        timeFormat: '12h',
        firstDayOfWeek: 'monday',
        defaultReminderMins: 15,
        defaultTaskDurationMins: 60
      }
    },
    categories: [
      { id: 'cat_1', name: 'Study & Learning', color: '#2563EB', icon: 'BookOpen' },
      { id: 'cat_2', name: 'Fitness & Health', color: '#10B981', icon: 'Activity' },
      { id: 'cat_3', name: 'Work & Projects', color: '#8B5CF6', icon: 'Briefcase' },
      { id: 'cat_4', name: 'Personal', color: '#F59E0B', icon: 'User' },
      { id: 'cat_5', name: 'Habits', color: '#EC4899', icon: 'Repeat' }
    ],
    tasks: [
      {
        id: 'tsk_1',
        title: 'Morning Run',
        description: 'Morning cardio around the park trail',
        categoryId: 'cat_2',
        priority: 'high',
        measurementType: 'quantity',
        measurementConfig: { target: 5, unit: 'km' },
        scheduledStart: '07:00',
        scheduledEnd: '08:00',
        recurrence: 'daily'
      },
      {
        id: 'tsk_2',
        title: 'Study Python',
        description: 'Asyncio, generators and algorithms',
        categoryId: 'cat_1',
        priority: 'medium',
        measurementType: 'duration',
        measurementConfig: { plannedMinutes: 60 },
        scheduledStart: '09:00',
        scheduledEnd: '10:00',
        recurrence: 'daily'
      },
      {
        id: 'tsk_3',
        title: 'Read a Book',
        description: 'Atomic Habits by James Clear',
        categoryId: 'cat_4',
        priority: 'low',
        measurementType: 'quantity',
        measurementConfig: { target: 20, unit: 'pages' },
        scheduledStart: '11:00',
        scheduledEnd: '11:30',
        recurrence: 'daily'
      },
      {
        id: 'tsk_4',
        title: 'Project Development',
        description: 'Milestones for ChronoTrack application',
        categoryId: 'cat_3',
        priority: 'urgent',
        measurementType: 'checklist',
        measurementConfig: {
          subtasks: [
            { id: 'sub_1', title: 'Design System & Tokens', weight: 1, completed: true },
            { id: 'sub_2', title: 'Top Calendar & Timeline', weight: 1, completed: true },
            { id: 'sub_3', title: 'Analytics & Recharts', weight: 1, completed: false },
            { id: 'sub_4', title: 'Mobile Simulator & Testing', weight: 1, completed: false }
          ]
        },
        scheduledStart: '14:00',
        scheduledEnd: '15:00',
        recurrence: 'weekdays'
      },
      {
        id: 'tsk_5',
        title: 'Gym Workout',
        description: 'Push day - bench, shoulders, triceps',
        categoryId: 'cat_2',
        priority: 'medium',
        measurementType: 'duration',
        measurementConfig: { plannedMinutes: 45 },
        scheduledStart: '17:00',
        scheduledEnd: '17:45',
        recurrence: 'selected'
      },
      {
        id: 'tsk_6',
        title: 'Meditation',
        description: 'Mindfulness breathing and body scan',
        categoryId: 'cat_5',
        priority: 'low',
        measurementType: 'duration',
        measurementConfig: { plannedMinutes: 15 },
        scheduledStart: '20:00',
        scheduledEnd: '20:15',
        recurrence: 'daily'
      },
      {
        id: 'tsk_7',
        title: 'Journal & Daily Review',
        description: 'Reflect on wins and challenges',
        categoryId: 'cat_4',
        priority: 'low',
        measurementType: 'binary',
        measurementConfig: {},
        scheduledStart: '21:00',
        scheduledEnd: '21:30',
        recurrence: 'daily'
      },
      {
        id: 'tsk_8',
        title: 'Sleep Routine',
        description: 'Wind down, no screens 30 mins prior',
        categoryId: 'cat_2',
        priority: 'medium',
        measurementType: 'duration',
        measurementConfig: { plannedMinutes: 480 },
        scheduledStart: '22:00',
        scheduledEnd: '06:00',
        recurrence: 'daily'
      }
    ],
    occurrences: [
      // Today's occurrences
      {
        id: 'occ_today_1',
        taskId: 'tsk_1',
        scheduledDate: today,
        scheduledStart: '07:00',
        scheduledEnd: '08:00',
        status: 'completed',
        progressPercentage: 100,
        actualData: { actual: 5 },
        actualDisplay: '5 / 5 km (100%)',
        completedAt: `${today}T08:00:00Z`
      },
      {
        id: 'occ_today_2',
        taskId: 'tsk_2',
        scheduledDate: today,
        scheduledStart: '09:00',
        scheduledEnd: '10:00',
        status: 'in_progress',
        progressPercentage: 75,
        actualData: { actualMinutes: 45 },
        actualDisplay: '45 / 60 mins (75%)',
        completedAt: null
      },
      {
        id: 'occ_today_3',
        taskId: 'tsk_3',
        scheduledDate: today,
        scheduledStart: '11:00',
        scheduledEnd: '11:30',
        status: 'upcoming',
        progressPercentage: 0,
        actualData: { actual: 0 },
        actualDisplay: '0 / 20 pages (0%)',
        completedAt: null
      },
      {
        id: 'occ_today_4',
        taskId: 'tsk_4',
        scheduledDate: today,
        scheduledStart: '14:00',
        scheduledEnd: '15:00',
        status: 'in_progress',
        progressPercentage: 50,
        actualData: {
          subtasks: [
            { id: 'sub_1', title: 'Design System & Tokens', weight: 1, completed: true },
            { id: 'sub_2', title: 'Top Calendar & Timeline', weight: 1, completed: true },
            { id: 'sub_3', title: 'Analytics & Recharts', weight: 1, completed: false },
            { id: 'sub_4', title: 'Mobile Simulator & Testing', weight: 1, completed: false }
          ]
        },
        actualDisplay: '2 / 4 milestones (50%)',
        completedAt: null
      },
      {
        id: 'occ_today_5',
        taskId: 'tsk_5',
        scheduledDate: today,
        scheduledStart: '17:00',
        scheduledEnd: '17:45',
        status: 'upcoming',
        progressPercentage: 0,
        actualData: { actualMinutes: 0 },
        actualDisplay: '0 / 45 mins (0%)',
        completedAt: null
      },
      {
        id: 'occ_today_6',
        taskId: 'tsk_6',
        scheduledDate: today,
        scheduledStart: '20:00',
        scheduledEnd: '20:15',
        status: 'upcoming',
        progressPercentage: 0,
        actualData: { actualMinutes: 0 },
        actualDisplay: '0 / 15 mins (0%)',
        completedAt: null
      },
      {
        id: 'occ_today_7',
        taskId: 'tsk_7',
        scheduledDate: today,
        scheduledStart: '21:00',
        scheduledEnd: '21:30',
        status: 'upcoming',
        progressPercentage: 0,
        actualData: { completed: false },
        actualDisplay: 'Pending',
        completedAt: null
      },
      {
        id: 'occ_today_8',
        taskId: 'tsk_8',
        scheduledDate: today,
        scheduledStart: '22:00',
        scheduledEnd: '06:00',
        status: 'upcoming',
        progressPercentage: 0,
        actualData: { actualMinutes: 0 },
        actualDisplay: '0 / 8 hrs (0%)',
        completedAt: null
      },

      // Yesterday's occurrences (for analytics & past day review)
      {
        id: 'occ_yest_1',
        taskId: 'tsk_1',
        scheduledDate: yesterday,
        scheduledStart: '07:00',
        scheduledEnd: '08:00',
        status: 'completed',
        progressPercentage: 100,
        actualData: { actual: 5.2 },
        actualDisplay: '5.2 / 5 km',
        completedAt: `${yesterday}T07:55:00Z`
      },
      {
        id: 'occ_yest_2',
        taskId: 'tsk_2',
        scheduledDate: yesterday,
        scheduledStart: '09:00',
        scheduledEnd: '10:00',
        status: 'completed',
        progressPercentage: 100,
        actualData: { actualMinutes: 60 },
        actualDisplay: '60 / 60 mins',
        completedAt: `${yesterday}T10:00:00Z`
      },
      {
        id: 'occ_yest_3',
        taskId: 'tsk_3',
        scheduledDate: yesterday,
        scheduledStart: '11:00',
        scheduledEnd: '11:30',
        status: 'completed',
        progressPercentage: 100,
        actualData: { actual: 20 },
        actualDisplay: '20 / 20 pages',
        completedAt: `${yesterday}T11:25:00Z`
      },
      {
        id: 'occ_yest_4',
        taskId: 'tsk_4',
        scheduledDate: yesterday,
        scheduledStart: '14:00',
        scheduledEnd: '15:00',
        status: 'partially_completed',
        progressPercentage: 75,
        actualData: {},
        actualDisplay: '3 / 4 milestones',
        completedAt: null
      },
      {
        id: 'occ_yest_5',
        taskId: 'tsk_5',
        scheduledDate: yesterday,
        scheduledStart: '17:00',
        scheduledEnd: '17:45',
        status: 'completed',
        progressPercentage: 100,
        actualData: { actualMinutes: 45 },
        actualDisplay: '45 / 45 mins',
        completedAt: `${yesterday}T17:45:00Z`
      },
      {
        id: 'occ_yest_6',
        taskId: 'tsk_6',
        scheduledDate: yesterday,
        scheduledStart: '20:00',
        scheduledEnd: '20:15',
        status: 'completed',
        progressPercentage: 100,
        actualData: { actualMinutes: 15 },
        actualDisplay: '15 / 15 mins',
        completedAt: `${yesterday}T20:15:00Z`
      }
    ],
    goals: [
      {
        id: 'goal_1',
        title: 'Become a Better Python Developer',
        description: 'Complete Python mastery courses and advanced project implementations',
        category: 'Study & Learning',
        period: 'yearly',
        targetValue: 120,
        currentValue: 42,
        unit: 'study hours',
        startDate: '2026-01-01',
        deadline: '2026-12-31',
        status: 'active',
        linkedTaskIds: ['tsk_2', 'tsk_4']
      },
      {
        id: 'goal_2',
        title: 'Run 100 km',
        description: 'Endurance training and aerobic foundation for half-marathon',
        category: 'Fitness & Health',
        period: 'monthly',
        targetValue: 100,
        currentValue: 60,
        unit: 'km',
        startDate: format(new Date(), 'yyyy-MM-01'),
        deadline: format(new Date(), 'yyyy-MM-28'),
        status: 'active',
        linkedTaskIds: ['tsk_1']
      },
      {
        id: 'goal_3',
        title: 'Read 12 Books',
        description: 'Personal development, philosophy, design and systems thinking',
        category: 'Personal',
        period: 'yearly',
        targetValue: 12,
        currentValue: 3,
        unit: 'books',
        startDate: '2026-01-01',
        deadline: '2026-12-31',
        status: 'active',
        linkedTaskIds: ['tsk_3']
      },
      {
        id: 'goal_4',
        title: 'Build Portfolio Project',
        description: 'Ship complete production-grade application with real database & responsive UI',
        category: 'Work & Projects',
        period: 'monthly',
        targetValue: 1,
        currentValue: 0.5,
        unit: 'project',
        startDate: format(new Date(), 'yyyy-MM-01'),
        deadline: format(new Date(), 'yyyy-MM-30'),
        status: 'active',
        linkedTaskIds: ['tsk_4']
      }
    ],
    habits: [
      {
        id: 'hab_1',
        title: 'Read Daily',
        category: 'Personal',
        frequency: 'Daily',
        target: '20 min',
        streakCount: 12,
        bestStreak: 24,
        completedToday: true
      },
      {
        id: 'hab_2',
        title: 'Exercise',
        category: 'Fitness & Health',
        frequency: '4 days/week',
        target: '30 min',
        streakCount: 8,
        bestStreak: 16,
        completedToday: true
      },
      {
        id: 'hab_3',
        title: 'Meditate',
        category: 'Habits',
        frequency: 'Daily',
        target: '15 min',
        streakCount: 5,
        bestStreak: 14,
        completedToday: false
      },
      {
        id: 'hab_4',
        title: 'Drink Water',
        category: 'Fitness & Health',
        frequency: 'Daily',
        target: '2 L',
        streakCount: 10,
        bestStreak: 30,
        completedToday: true
      }
    ],
    timerSessions: [],
    progressHistory: []
  };
}

let dbCache = null;

export function loadDatabase() {
  if (dbCache) return dbCache;

  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialData = getInitialSeedData();
    saveDatabase(initialData);
    dbCache = initialData;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    dbCache = JSON.parse(raw);
    return dbCache;
  } catch (err) {
    console.error('Error reading database, restoring seed data:', err);
    const initialData = getInitialSeedData();
    saveDatabase(initialData);
    dbCache = initialData;
    return initialData;
  }
}

export function saveDatabase(data) {
  ensureDataDir();
  dbCache = data;
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, DB_FILE);
}
