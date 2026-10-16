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
  return {
    user: {
      id: 'usr_1',
      name: 'User',
      email: '',
      avatar: '',
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
    tasks: [],
    occurrences: [],
    goals: [],
    habits: [],
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
