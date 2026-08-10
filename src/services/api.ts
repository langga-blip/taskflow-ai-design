import { Task, UserProfile, WeeklyReview, AiProvider } from '../types';

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/rates');
    if (!res.ok) throw new Error('Failed to fetch rates');
    const data = await res.json();
    return data.rates || {};
  } catch (err) {
    console.warn('Using default fallback exchange rates', err);
    return {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.78,
      NGN: 1540.0,
      JPY: 155.2,
      CAD: 1.38,
      AUD: 1.52,
      INR: 83.5,
      AED: 3.67,
      SAR: 3.75,
      BRL: 5.65,
      CHF: 0.89,
      ZAR: 18.2,
      KES: 129.5,
      CNY: 7.24,
      MXN: 19.8,
      SGD: 1.34,
      KRW: 1380.0,
      TRY: 34.2,
      EGP: 48.6,
      GHS: 15.8,
    };
  }
}

export async function generateDailyPlanApi(
  profile: UserProfile,
  provider: AiProvider = 'GEMINI'
): Promise<Partial<Task>[]> {
  try {
    const res = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: profile.businessName,
        industry: profile.industry,
        goals: [profile.goal1, profile.goal2, profile.goal3].filter(Boolean),
        provider,
      }),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.plan)) {
      return data.plan;
    }
  } catch (err) {
    console.warn('API plan error, fallback used', err);
  }

  // Fallback if API unavailable
  return [
    {
      title: `Audit ${profile.businessName} Sales Funnel & Lead Conversion`,
      description: 'Analyze drop-offs in current prospect pipeline and close active leads.',
      category: 'SALES',
      priority: 'HIGH',
      revenueImpact: 'HIGH',
      estimatedMinutes: 45,
    },
    {
      title: 'Launch Cold Email Outreach to 25 Decision Makers',
      description: `Target high-intent potential clients in ${profile.industry}.`,
      category: 'MARKETING',
      priority: 'HIGH',
      revenueImpact: 'HIGH',
      estimatedMinutes: 60,
    },
    {
      title: 'Streamline Client Onboarding & Contract Collection',
      description: 'Deliver instant welcome package and intake questionnaire to active accounts.',
      category: 'OPERATIONS',
      priority: 'MEDIUM',
      revenueImpact: 'MEDIUM',
      estimatedMinutes: 30,
    },
  ];
}

export async function askAssistantApi(
  prompt: string,
  profile: UserProfile,
  usdToTargetRate: number = 1.0,
  provider: AiProvider = 'GEMINI'
): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        profile,
        usdToTargetRate,
        provider,
      }),
    });
    const data = await res.json();
    if (data.success && data.response) {
      return data.response;
    }
  } catch (err) {
    console.warn('API assistant error, fallback used', err);
  }

  return `As your 24/7 AI Business Strategist for **${profile.businessName}**:\n\n1. **Focus on High-Ticket Revenue**: Priority should be closing pending proposals and reaching out to warm past clients.\n2. **Systematize Onboarding**: Create a 1-click welcome document for new clients to reduce churn.\n3. **Recommendation**: Leverage our pre-built Marketing & Sales Workflow Templates in TaskFlow AI to scale outreach today.`;
}

export async function generateWeeklyReviewApi(
  profile: UserProfile,
  completedTasks: string[],
  revenue: number,
  currencySymbol: string = '$',
  provider: AiProvider = 'GEMINI'
): Promise<Partial<WeeklyReview>> {
  try {
    const res = await fetch('/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: profile.businessName,
        completedTasks,
        revenueGenerated: revenue,
        currencySymbol,
        provider,
      }),
    });
    const data = await res.json();
    if (data.success && data.review) {
      return data.review;
    }
  } catch (err) {
    console.warn('API review error, fallback used', err);
  }

  return {
    winsSummary: `Successfully completed ${completedTasks.length} high-value milestones and generated ${currencySymbol}${revenue.toLocaleString()} this week.`,
    bottlenecksSummary: 'Manual lead outreach and sales follow-up scheduling consumed excess time.',
    improvementsSummary: 'Automate cold email sequence and standard client onboarding workflow.',
    nextWeekPriorities: '1. Launch automated 4-step cold email workflow.\n2. Follow up on open high-ticket proposals.\n3. Audit recurring expenses.',
  };
}
