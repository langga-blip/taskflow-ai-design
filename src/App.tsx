import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderBar } from './components/HeaderBar';
import { CustomBottomNavBar } from './components/CustomBottomNavBar';
import { NotificationCenterSheet } from './components/NotificationCenterSheet';
import { VoiceCommandSheet } from './components/VoiceCommandSheet';
import { QuickNavPopupMenu } from './components/QuickNavPopupMenu';
import { FloatingAssistantOverlay } from './components/FloatingAssistantOverlay';

import { SplashScreen } from './screens/SplashScreen';
import { LandingScreen } from './screens/LandingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { TaskManagerScreen } from './screens/TaskManagerScreen';
import { AiDailyPlannerScreen } from './screens/AiDailyPlannerScreen';
import { RevenueDashboardScreen } from './screens/RevenueDashboardScreen';
import { WorkflowTemplatesScreen } from './screens/WorkflowTemplatesScreen';
import { WeeklyReviewScreen } from './screens/WeeklyReviewScreen';
import { AiAssistantScreen } from './screens/AiAssistantScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';

const MainAppContent: React.FC = () => {
  const { currentScreen, userProfile } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLight]);

  const isFullscreenView = ['splash', 'landing', 'auth', 'onboarding'].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'landing':
        return <LandingScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'tasks':
        return <TaskManagerScreen />;
      case 'planner':
        return <AiDailyPlannerScreen />;
      case 'revenue':
        return <RevenueDashboardScreen />;
      case 'workflows':
        return <WorkflowTemplatesScreen />;
      case 'review':
        return <WeeklyReviewScreen />;
      case 'assistant':
        return <AiAssistantScreen />;
      case 'profile':
        return <ProfileSettingsScreen />;
      case 'subscription':
        return <SubscriptionScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div
      className={`min-h-screen font-sans selection:bg-[#7C3AED] selection:text-white transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-900'
          : 'bg-[#0A0C14] text-slate-100'
      }`}
    >
      {/* Header Bar */}
      {!isFullscreenView && <HeaderBar />}

      {/* Screen Body */}
      <main className={!isFullscreenView ? 'p-4 sm:p-6' : ''}>
        {renderScreen()}
      </main>

      {/* Floating Elements & Sheets */}
      {!isFullscreenView && (
        <>
          <CustomBottomNavBar />
          <FloatingAssistantOverlay />
          <NotificationCenterSheet />
          <VoiceCommandSheet />
          <QuickNavPopupMenu />
        </>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
