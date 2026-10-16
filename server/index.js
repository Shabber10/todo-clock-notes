import express from 'express';
import cors from 'cors';
import { format } from 'date-fns';
import { loadDatabase, saveDatabase, getInitialSeedData } from './db.js';
import { calculateProgress } from './measurementEngine.js';
import { calculateDailyAnalytics, calculateWeeklyAnalytics } from './analyticsEngine.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Auth / Profile
app.get('/api/auth/me', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, user: db.user });
});

app.patch('/api/settings', (req, res) => {
  const db = loadDatabase();
  db.user = { ...db.user, ...req.body };
  saveDatabase(db);
  res.json({ success: true, user: db.user });
});

// Categories
app.get('/api/categories', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, categories: db.categories });
});

// Tasks & Occurrences
app.get('/api/tasks', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, tasks: db.tasks });
});

app.get('/api/occurrences', (req, res) => {
  const db = loadDatabase();
  const date = req.query.date || format(new Date(), 'yyyy-MM-dd');
  
  const tasksById = new Map(db.tasks.map(t => [t.id, t]));
  const categoriesById = new Map(db.categories.map(c => [c.id, c]));

  let occurrences = db.occurrences.filter(o => o.scheduledDate === date);

  // If no occurrences exist for this date yet (e.g. browsing future or past date without tasks),
  // check recurring tasks and generate template occurrences
  if (occurrences.length === 0) {
    const recurringTasks = db.tasks.filter(t => t.recurrence === 'daily');
    recurringTasks.forEach(t => {
      const newOcc = {
        id: `occ_${date}_${t.id}`,
        taskId: t.id,
        scheduledDate: date,
        scheduledStart: t.scheduledStart,
        scheduledEnd: t.scheduledEnd,
        status: 'upcoming',
        progressPercentage: 0,
        actualData: {},
        actualDisplay: '0% completed',
        completedAt: null
      };
      db.occurrences.push(newOcc);
    });
    saveDatabase(db);
    occurrences = db.occurrences.filter(o => o.scheduledDate === date);
  }

  // Sort chronologically by start time
  const enriched = occurrences.map(occ => {
    const task = tasksById.get(occ.taskId) || {};
    const category = categoriesById.get(task.categoryId) || {};
    return {
      ...occ,
      task: {
        ...task,
        category
      }
    };
  }).sort((a, b) => (a.scheduledStart || '').localeCompare(b.scheduledStart || ''));

  res.json({ success: true, occurrences: enriched, date });
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const db = loadDatabase();
  const {
    title,
    description,
    categoryId,
    priority = 'medium',
    scheduledDate = format(new Date(), 'yyyy-MM-dd'),
    scheduledStart = '09:00',
    scheduledEnd = '10:00',
    measurementType = 'binary',
    measurementConfig = {},
    recurrence = 'one_time'
  } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Task title is required' });
  }

  const taskId = `tsk_${Date.now()}`;
  const newTask = {
    id: taskId,
    title,
    description: description || '',
    categoryId: categoryId || db.categories[0].id,
    priority,
    measurementType,
    measurementConfig,
    scheduledStart,
    scheduledEnd,
    recurrence,
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);

  // Create occurrence
  const occurrenceId = `occ_${scheduledDate}_${taskId}`;
  const newOccurrence = {
    id: occurrenceId,
    taskId,
    scheduledDate,
    scheduledStart,
    scheduledEnd,
    status: 'upcoming',
    progressPercentage: 0,
    actualData: {},
    actualDisplay: 'Not started',
    completedAt: null
  };

  db.occurrences.push(newOccurrence);
  saveDatabase(db);

  res.json({ success: true, task: newTask, occurrence: newOccurrence });
});

// Update occurrence progress (The Core Measurement System)
app.post('/api/occurrences/:id/progress', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const { actualData = {}, note } = req.body;

  const occIndex = db.occurrences.findIndex(o => o.id === id);
  if (occIndex === -1) {
    return res.status(404).json({ success: false, error: 'Occurrence not found' });
  }

  const occ = db.occurrences[occIndex];
  const task = db.tasks.find(t => t.id === occ.taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  // Calculate using measurement engine
  const result = calculateProgress(task.measurementType, task.measurementConfig, actualData);

  occ.actualData = actualData;
  occ.progressPercentage = result.progressPercentage;
  occ.actualDisplay = result.normalizedDisplay;

  if (result.isCompleted) {
    occ.status = 'completed';
    occ.completedAt = new Date().toISOString();
  } else if (result.progressPercentage > 0) {
    occ.status = 'in_progress';
    occ.completedAt = null;
  } else {
    occ.status = 'upcoming';
    occ.completedAt = null;
  }

  // Record in progress history
  db.progressHistory.push({
    id: `ph_${Date.now()}`,
    occurrenceId: id,
    progressPercentage: result.progressPercentage,
    actualData,
    note: note || '',
    recordedAt: new Date().toISOString()
  });

  saveDatabase(db);

  res.json({
    success: true,
    occurrence: occ,
    measurementResult: result
  });
});

// Occurrence status quick update (e.g. mark completed or toggle)
app.patch('/api/occurrences/:id', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const occIndex = db.occurrences.findIndex(o => o.id === id);
  if (occIndex === -1) {
    return res.status(404).json({ success: false, error: 'Occurrence not found' });
  }

  db.occurrences[occIndex] = {
    ...db.occurrences[occIndex],
    ...req.body
  };

  saveDatabase(db);
  res.json({ success: true, occurrence: db.occurrences[occIndex] });
});

// Goals
app.get('/api/goals', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, goals: db.goals });
});

app.post('/api/goals', (req, res) => {
  const db = loadDatabase();
  const newGoal = {
    id: `goal_${Date.now()}`,
    title: req.body.title,
    description: req.body.description || '',
    category: req.body.category || 'General',
    period: req.body.period || 'monthly',
    targetValue: parseFloat(req.body.targetValue) || 10,
    currentValue: 0,
    unit: req.body.unit || 'units',
    startDate: req.body.startDate || format(new Date(), 'yyyy-MM-01'),
    deadline: req.body.deadline || format(new Date(), 'yyyy-MM-28'),
    status: 'active',
    linkedTaskIds: req.body.linkedTaskIds || []
  };

  db.goals.push(newGoal);
  saveDatabase(db);
  res.json({ success: true, goal: newGoal });
});

// Habits
app.get('/api/habits', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, habits: db.habits });
});

app.post('/api/habits/:id/toggle', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const habit = db.habits.find(h => h.id === id);
  if (!habit) {
    return res.status(404).json({ success: false, error: 'Habit not found' });
  }

  habit.completedToday = !habit.completedToday;
  if (habit.completedToday) {
    habit.streakCount += 1;
    if (habit.streakCount > habit.bestStreak) {
      habit.bestStreak = habit.streakCount;
    }
  } else {
    habit.streakCount = Math.max(0, habit.streakCount - 1);
  }

  saveDatabase(db);
  res.json({ success: true, habit });
});

// Analytics
app.get('/api/analytics/daily', (req, res) => {
  const db = loadDatabase();
  const date = req.query.date || format(new Date(), 'yyyy-MM-dd');
  const analytics = calculateDailyAnalytics(db, date);
  res.json({ success: true, analytics });
});

app.get('/api/analytics/weekly', (req, res) => {
  const db = loadDatabase();
  const date = req.query.date || format(new Date(), 'yyyy-MM-dd');
  const analytics = calculateWeeklyAnalytics(db, date);
  res.json({ success: true, analytics });
});

// Reset / Seed
app.post('/api/seed/reset', (req, res) => {
  const seed = getInitialSeedData();
  saveDatabase(seed);
  res.json({ success: true, message: 'Database reset to initial demo state' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ChronoTrack Backend API running on http://0.0.0.0:${PORT}`);
});
