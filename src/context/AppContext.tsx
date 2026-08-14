import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Task,
  UserProfile,
  WorkflowTemplate,
  WeeklyReview,
  AppNotification,
  AiProvider,
  ScreenRoute,
  TaskCategory,
  TaskPriority,
  RevenueImpact,
} from '../types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  WORKFLOW_TEMPLATES,
  CURRENCY_OPTIONS,
} from '../data/initialData';
import {
  fetchExchangeRates,
  generateDailyPlanApi,
  askAssistantApi,
  generateWeeklyReviewApi,
  sendTaskEmailNotificationApi,
  sendDeadlineAlertApi,
} from '../services/api';

interface AppContextType {
  currentScreen: ScreenRoute;
  setCurrentScreen: (screen: ScreenRoute) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  tasks: Task[];
  saveTask: (task: Partial<Task>) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  workflowTemplates: WorkflowTemplate[];
  addWorkflowTemplateToDashboard: (template: WorkflowTemplate) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  triggerNotification: (title: string, message: string, category?: AppNotification['category'], actionRoute?: ScreenRoute) => void;
  weeklyReviews: WeeklyReview[];
  addWeeklyReview: (review: WeeklyReview) => void;
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  exchangeRates: Record<string, number>;
  refreshExchangeRates: () => Promise<void>;
  isNotificationSheetOpen: boolean;
  setIsNotificationSheetOpen: (open: boolean) => void;
  isVoiceSheetOpen: boolean;
  setIsVoiceSheetOpen: (open: boolean) => void;
  isQuickNavOpen: boolean;
  setIsQuickNavOpen: (open: boolean) => void;
  activateSubscription: () => void;
  logout: () => void;
  switchCurrency: (newCode: string) => void;
  formatRevenue: (amount: number, includeDecimals?: boolean) => string;
  getTimeOfDayGreeting: () => string;
  generateDailyPlan: () => Promise<Task[]>;
  askAssistant: (prompt: string, imageData?: string) => Promise<string>;
  generateWeeklyReview: (completedTasks: string[], revenue: number) => Promise<Partial<WeeklyReview>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved user profile or fallback
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tf_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USER_PROFILE;
  });

  // Screen route state
  const [currentScreen, setCurrentScreen] = useState<ScreenRoute>(() => {
    return userProfile.isOnboarded ? 'dashboard' : 'landing';
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TASKS;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('tf_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Workflow templates state
  const [workflowTemplates] = useState<WorkflowTemplate[]>(WORKFLOW_TEMPLATES);

  // Weekly reviews state
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => {
    const saved = localStorage.getItem('tf_weekly_reviews');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 1,
        weekTitle: 'Week 1 Executive Performance Review',
        dateRange: 'Mon - Sun, Aug 2026',
        totalTasksCompleted: 12,
        revenueGenerated: 3450.0,
        productivityScore: 92,
        winsSummary: 'Closed $3,450 recurring agency retainer & launched 50-lead email outreach workflow.',
        bottlenecksSummary: 'Contract review & manual onboarding follow-ups took 3 hours.',
        improvementsSummary: 'Automate welcome email sequence & use 1-click contract e-signatures.',
        nextWeekPriorities: '1. Scale cold outreach to 100 prospects.\n2. Upsell active client to Pro Tier.\n3. Conduct weekly P&L audit.',
        createdAt: Date.now() - 86400000 * 3,
      },
    ];
  });

  // AI Provider state
  const [aiProvider, setAiProvider] = useState<AiProvider>('GEMINI');

  // Exchange rates state
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1.0 });

  // UI overlays state
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const [isVoiceSheetOpen, setIsVoiceSheetOpen] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('tf_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tf_weekly_reviews', JSON.stringify(weeklyReviews));
  }, [weeklyReviews]);

  // Fetch exchange rates on start
  useEffect(() => {
    refreshExchangeRates();
  }, []);

  const refreshExchangeRates = async () => {
    const rates = await fetchExchangeRates();
    setExchangeRates(rates);
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfileState((prev) => ({ ...prev, ...updated }));
  };

  const saveTask = (task: Partial<Task>) => {
    const regEmail = userProfile.userEmail || 'mummom692@gmail.com';

    if (task.id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? ({ ...t, ...task } as Task) : t))
      );

      // Check if updating task deadline to 'Today' or approaching
      if (task.dueDate === 'Today' || task.priority === 'URGENT') {
        const taskTitle = task.title || 'Task';
        sendDeadlineAlertApi(regEmail, taskTitle, task.dueDate || 'Today');
        triggerNotification(
          `⏰ Registered Email Alert Sent (${regEmail})`,
          `Deadline approaching for "${taskTitle}". An email notification was dispatched to your registered email address.`,
          'EMAIL',
          'tasks'
        );
      }
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: task.title || 'Untitled Task',
        description: task.description || '',
        category: task.category || 'GENERAL',
        priority: task.priority || 'MEDIUM',
        revenueImpact: task.revenueImpact || 'MEDIUM',
        dueDate: task.dueDate || 'Today',
        isCompleted: task.isCompleted || false,
        isAiGenerated: task.isAiGenerated || false,
        estimatedMinutes: task.estimatedMinutes || 30,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);

      // Trigger real-time task creation email to registered email address
      sendTaskEmailNotificationApi(
        regEmail,
        newTask.title,
        newTask.description,
        newTask.dueDate,
        newTask.priority,
        newTask.revenueImpact
      );

      // Notify the user in the app with real-time AI Email alert
      triggerNotification(
        `📧 Registered Email Sent (${regEmail})`,
        `A real-time email notification was dispatched to your registered address (${regEmail}) for task: "${newTask.title}".`,
        'EMAIL',
        'tasks'
      );

      // If deadline is today, also send approaching deadline email notification
      if (newTask.dueDate === 'Today' || newTask.priority === 'URGENT') {
        sendDeadlineAlertApi(regEmail, newTask.title, newTask.dueDate);
      }
    }
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addWorkflowTemplateToDashboard = (template: WorkflowTemplate) => {
    const newTasks: Task[] = template.tasks.map((taskTitle, idx) => ({
      id: Date.now() + idx,
      title: taskTitle,
      description: `Workflow Template: ${template.title}`,
      category: template.category,
      priority: template.estimatedImpact === 'HIGH' ? 'HIGH' : 'MEDIUM',
      revenueImpact: template.estimatedImpact,
      dueDate: 'Today',
      isCompleted: false,
      isAiGenerated: true,
      estimatedMinutes: 30,
      createdAt: Date.now(),
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    triggerNotification(
      'Workflow Activated! 🚀',
      `Added ${template.tasks.length} steps from "${template.title}" to your active Task Manager.`,
      'AI',
      'tasks'
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const triggerNotification = (
    title: string,
    message: string,
    category: AppNotification['category'] = 'SYSTEM',
    actionRoute?: ScreenRoute
  ) => {
    const notif: AppNotification = {
      id: 'notif_' + Date.now(),
      title,
      message,
      timestamp: 'Just now',
      category,
      isRead: false,
      actionRoute,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const addWeeklyReview = (review: WeeklyReview) => {
    setWeeklyReviews((prev) => [review, ...prev]);
  };

  const activateSubscription = () => {
    updateUserProfile({
      isSubscribed: true,
      isOnboarded: true,
      subscriptionTimestampMs: Date.now(),
      subscriptionExpiryDate: 'Annual Pro Access',
    });
    triggerNotification(
      'TaskFlow AI Pro Activated! 👑',
      'Welcome to TaskFlow AI Pro Annual Pass! All AI Autopilot & Currency tools unlocked.',
      'PAYMENTS',
      'dashboard'
    );
  };

  const logout = () => {
    updateUserProfile({
      isOnboarded: false,
      isSubscribed: false,
      userEmail: '',
    });
    setCurrentScreen('landing');
  };

  const switchCurrency = (newCode: string) => {
    const oldCode = userProfile.currencyCode || 'USD';
    if (oldCode === newCode) return;

    const oldRate = exchangeRates[oldCode.toUpperCase()] || 1.0;
    const newRate = exchangeRates[newCode.toUpperCase()] || 1.0;

    // Convert revenue numbers
    const currentUsd = oldRate > 0 ? userProfile.currentMonthlyRevenue / oldRate : userProfile.currentMonthlyRevenue;
    const goalUsd = oldRate > 0 ? userProfile.monthlyRevenueGoal / oldRate : userProfile.monthlyRevenueGoal;

    const newOption = CURRENCY_OPTIONS.find((c) => c.code === newCode) || CURRENCY_OPTIONS[0];

    updateUserProfile({
      currencyCode: newOption.code,
      currencySymbol: newOption.symbol,
      currentMonthlyRevenue: currentUsd * newRate,
      monthlyRevenueGoal: goalUsd * newRate,
    });
  };

  const formatRevenue = (amount: number, includeDecimals = true): string => {
    const option = CURRENCY_OPTIONS.find((c) => c.code === userProfile.currencyCode) || CURRENCY_OPTIONS[0];
    const formatted = includeDecimals
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(amount).toLocaleString();

    if (['AED', 'SAR'].includes(userProfile.currencyCode.toUpperCase())) {
      return `${option.symbol} ${formatted}`;
    }
    return `${option.symbol}${formatted}`;
  };

  const getTimeOfDayGreeting = (): string => {
    const hour = new Date().getHours();
    const name = userProfile.userName || userProfile.businessName || 'User';

    if (hour >= 5 && hour < 12) return `Good morning 🌅, ${name} 👋`;
    if (hour >= 12 && hour < 17) return `Good afternoon ☀️, ${name} 👋`;
    if (hour >= 17 && hour < 22) return `Good evening 🌆, ${name} 👋`;
    return `Good night 🌙, ${name} 👋`;
  };

  const generateDailyPlan = async (): Promise<Task[]> => {
    const rawPlan = await generateDailyPlanApi(userProfile, aiProvider);
    const generatedTasks: Task[] = rawPlan.map((p, idx) => ({
      id: Date.now() + idx,
      title: p.title || 'AI Strategy Task',
      description: p.description || '',
      category: (p.category as TaskCategory) || 'GENERAL',
      priority: (p.priority as TaskPriority) || 'HIGH',
      revenueImpact: (p.revenueImpact as RevenueImpact) || 'HIGH',
      dueDate: 'Today',
      isCompleted: false,
      isAiGenerated: true,
      estimatedMinutes: p.estimatedMinutes || 30,
      createdAt: Date.now(),
    }));
    return generatedTasks;
  };

  const askAssistant = async (prompt: string, imageData?: string): Promise<string> => {
    const rate = exchangeRates[userProfile.currencyCode.toUpperCase()] || 1.0;
    return await askAssistantApi(prompt, userProfile, rate, aiProvider, imageData);
  };

  const generateWeeklyReview = async (
    completedTasks: string[],
    revenue: number
  ): Promise<Partial<WeeklyReview>> => {
    return await generateWeeklyReviewApi(
      userProfile,
      completedTasks,
      revenue,
      userProfile.currencySymbol,
      aiProvider
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        userProfile,
        updateUserProfile,
        tasks,
        saveTask,
        toggleTask,
        deleteTask,
        workflowTemplates,
        addWorkflowTemplateToDashboard,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        triggerNotification,
        weeklyReviews,
        addWeeklyReview,
        aiProvider,
        setAiProvider,
        exchangeRates,
        refreshExchangeRates,
        isNotificationSheetOpen,
        setIsNotificationSheetOpen,
        isVoiceSheetOpen,
        setIsVoiceSheetOpen,
        isQuickNavOpen,
        setIsQuickNavOpen,
        activateSubscription,
        logout,
        switchCurrency,
        formatRevenue,
        getTimeOfDayGreeting,
        generateDailyPlan,
        askAssistant,
        generateWeeklyReview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
