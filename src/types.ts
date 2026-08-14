export type TaskCategory = 
  | 'MARKETING'
  | 'SALES'
  | 'FINANCE'
  | 'CLIENT_MANAGEMENT'
  | 'OPERATIONS'
  | 'CONTENT'
  | 'GENERAL';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RevenueImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  revenueImpact: RevenueImpact;
  dueDate: string;
  isCompleted: boolean;
  isAiGenerated: boolean;
  estimatedMinutes: number;
  createdAt: number;
}

export interface UserProfile {
  userName: string;
  userEmail: string;
  phoneNumber: string;
  businessName: string;
  industry: string;
  goal1: string;
  goal2: string;
  goal3: string;
  currentMonthlyRevenue: number;
  monthlyRevenueGoal: number;
  currencyCode: string;
  currencySymbol: string;
  language: string;
  country: string;
  timezoneId: string;
  themeMode: 'Dark' | 'Light';
  gender: string;
  isSubscribed: boolean;
  subscriptionExpiryDate: string;
  subscriptionTimestampMs: number;
  subscriptionExpiryMs?: number;
  subscriptionDuration?: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR';
  isOnboarded: boolean;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  estimatedImpact: RevenueImpact;
  tasks: string[];
  isAdded?: boolean;
}

export interface WeeklyReview {
  id: number;
  weekTitle: string;
  dateRange: string;
  totalTasksCompleted: number;
  revenueGenerated: number;
  productivityScore: number;
  winsSummary: string;
  bottlenecksSummary: string;
  improvementsSummary: string;
  nextWeekPriorities: string;
  createdAt: number;
}

export type NotificationCategory = 'SYSTEM' | 'CLIENTS' | 'PAYMENTS' | 'AI' | 'EMAIL';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  isRead: boolean;
  actionRoute?: string;
  emailSubject?: string;
  recipientEmail?: string;
  senderName?: string;
  senderEmail?: string;
}

export type AiProvider = 'GEMINI' | 'OPENAI' | 'DEEPSEEK';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export type ScreenRoute = 
  | 'splash'
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'tasks'
  | 'planner'
  | 'revenue'
  | 'workflows'
  | 'review'
  | 'assistant'
  | 'profile'
  | 'subscription';
