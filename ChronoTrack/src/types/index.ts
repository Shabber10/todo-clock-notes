export type MeasurementType = 
  | 'quantity' 
  | 'duration' 
  | 'percentage' 
  | 'checklist' 
  | 'rating' 
  | 'binary';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 
  | 'upcoming' 
  | 'in_progress' 
  | 'completed' 
  | 'partially_completed' 
  | 'missed' 
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Subtask {
  id: string;
  title: string;
  weight?: number;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: TaskPriority;
  measurementType: MeasurementType;
  measurementConfig: {
    target?: number;
    unit?: string;
    plannedMinutes?: number;
    subtasks?: Subtask[];
    maxRating?: number;
  };
  scheduledStart: string;
  scheduledEnd: string;
  recurrence?: 'one_time' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
  category?: Category;
}

export interface TaskOccurrence {
  id: string;
  taskId: string;
  scheduledDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: TaskStatus;
  progressPercentage: number;
  actualData: {
    actual?: number;
    actualMinutes?: number;
    percentage?: number;
    subtasks?: Subtask[];
    rating?: number;
    completed?: boolean;
    markCompleted?: boolean;
  };
  actualDisplay: string;
  completedAt?: string | null;
  task: Task;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  deadline: string;
  status: 'active' | 'completed' | 'archived';
  linkedTaskIds?: string[];
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: string;
  target: string;
  streakCount: number;
  bestStreak: number;
  completedToday: boolean;
}

export interface DailyAnalytics {
  date: string;
  totalDue: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  missed: number;
  completionRate: number;
  targetAchievement: number;
  plannedFocusDisplay: string;
  actualFocusDisplay: string;
  categoryDistribution: {
    name: string;
    count: number;
    color: string;
    percentage: number;
    focusMinutes: number;
  }[];
}

export interface TrendPoint {
  day: string;
  date?: string;
  completed: number;
  total: number;
  rate: number;
  isGrowing: boolean;
  status: 'active' | 'before_start' | 'future';
  isFuture: boolean;
  isBeforeStart: boolean;
}


export interface PeriodAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodTitle: string;
  totalDue: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  missed: number;
  completionRate: number;
  targetAchievement: number;
  plannedFocusDisplay: string;
  actualFocusDisplay: string;
  averageRate: number;
  trend: TrendPoint[];
  categoryDistribution: {
    name: string;
    count: number;
    color: string;
    percentage: number;
    focusMinutes: number;
  }[];
  growthDirection: 'up' | 'down' | 'flat';
  growthPercentage: number;
}

export interface WeeklyAnalytics {
  totalCompleted: number;
  totalDue: number;
  averageRate: number;
  trend: {
    day: string;
    date: string;
    completed: number;
    total: number;
    rate: number;
  }[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  timeFormat: '12h' | '24h';
  userName: string;
  userEmail: string;
  defaultReminderMins: number;
}
