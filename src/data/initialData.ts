import { CurrencyOption, Task, UserProfile, WorkflowTemplate, AppNotification } from '../types';

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (د.إ)' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal (﷼)' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (R$)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (¥)' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso ($)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won (₩)' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira (₺)' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound (E£)' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)' },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  userName: '',
  userEmail: '',
  phoneNumber: '',
  businessName: '',
  industry: 'Marketing Agency & Consulting',
  goal1: 'Reach $10,000 Monthly Recurring Revenue',
  goal2: 'Automate Client Onboarding & Reporting',
  goal3: 'Launch Cold Email Outreach Campaign',
  currentMonthlyRevenue: 0,
  monthlyRevenueGoal: 10000.0,
  currencyCode: 'USD',
  currencySymbol: '$',
  language: 'English',
  country: 'United States',
  timezoneId: 'America/New_York',
  themeMode: 'Dark',
  gender: 'Prefer not to say',
  isSubscribed: false,
  subscriptionDuration: undefined,
  subscriptionExpiryDate: 'Free Plan',
  subscriptionTimestampMs: 0,
  subscriptionExpiryMs: 0,
  isOnboarded: false,
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Pitch High-Ticket Retainer to Apex Client',
    description: 'Deliver custom ROI proposal presentation for $5,000/mo package.',
    category: 'SALES',
    priority: 'URGENT',
    revenueImpact: 'HIGH',
    dueDate: 'Today',
    isCompleted: false,
    isAiGenerated: true,
    estimatedMinutes: 45,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 2,
    title: 'Launch 4-Step Cold Email Automation Campaign',
    description: 'Set up 50 targeted decision-maker prospects in outreach platform.',
    category: 'MARKETING',
    priority: 'HIGH',
    revenueImpact: 'HIGH',
    dueDate: 'Today',
    isCompleted: false,
    isAiGenerated: true,
    estimatedMinutes: 60,
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 3,
    title: 'Review Weekly Financial P&L & Collect Unpaid Invoices',
    description: 'Send gentle invoice reminders for 2 pending client retainer payments.',
    category: 'FINANCE',
    priority: 'HIGH',
    revenueImpact: 'HIGH',
    dueDate: 'Today',
    isCompleted: true,
    isAiGenerated: false,
    estimatedMinutes: 30,
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 4,
    title: 'Deliver Monthly Client Performance Analytics Deck',
    description: 'Compile core ROI metrics and conversion growth graphs for executive team.',
    category: 'CLIENT_MANAGEMENT',
    priority: 'MEDIUM',
    revenueImpact: 'MEDIUM',
    dueDate: 'Tomorrow',
    isCompleted: false,
    isAiGenerated: false,
    estimatedMinutes: 40,
    createdAt: Date.now() - 3600000 * 30,
  },
  {
    id: 5,
    title: 'Batch 30 Days of Authority LinkedIn Posts',
    description: 'Outline 5 high-converting case studies and educational carousels.',
    category: 'CONTENT',
    priority: 'MEDIUM',
    revenueImpact: 'MEDIUM',
    dueDate: 'This Week',
    isCompleted: true,
    isAiGenerated: false,
    estimatedMinutes: 90,
    createdAt: Date.now() - 3600000 * 48,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'Welcome to TaskFlow AI!',
    message: 'Your Task Flow workspace is synced and ready. Tap to explore Daily AI Planner.',
    timestamp: 'Just now',
    category: 'SYSTEM',
    isRead: false,
    actionRoute: 'planner',
  },
  {
    id: 'notif_2',
    title: 'New High-Ticket Lead Inquiry',
    message: 'Acme Corp submitted a project proposal review request via your workspace portal.',
    timestamp: '15m ago',
    category: 'CLIENTS',
    isRead: false,
    actionRoute: 'tasks',
  },
  {
    id: 'notif_3',
    title: 'Revenue Milestone Reached',
    message: 'Monthly revenue target progress is up +18% this week. Keep momentum going!',
    timestamp: '2h ago',
    category: 'PAYMENTS',
    isRead: false,
    actionRoute: 'revenue',
  },
  {
    id: 'notif_4',
    title: 'AI Daily Strategy Generated',
    message: 'Gemini 3.5 Flash prepared 3 high-impact priorities for your business today.',
    timestamp: '5h ago',
    category: 'AI',
    isRead: true,
    actionRoute: 'planner',
  },
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // MARKETING
  {
    id: 'mkt_01',
    title: 'High-Converting Cold Email Campaign',
    description: '4-step automated cold outreach sequence with personalized follow-ups.',
    category: 'MARKETING',
    estimatedImpact: 'HIGH',
    tasks: [
      'Identify target account list of 50 Decision Makers',
      'Draft high-converting problem-agitate-solve email template',
      'Set up automated 3-day and 7-day follow-up triggers',
      'Track email open rates and A/B test subject lines'
    ]
  },
  {
    id: 'mkt_02',
    title: 'Lead Magnet Lead Generation Funnel',
    description: 'Capture high-intent business leads with a free guide and email drip.',
    category: 'MARKETING',
    estimatedImpact: 'HIGH',
    tasks: [
      'Design 1-page PDF actionable guide/checklist',
      'Build high-converting opt-in landing page',
      'Configure automated welcome email with download link',
      'Launch retargeting ad campaign on LinkedIn & Meta'
    ]
  },
  {
    id: 'mkt_03',
    title: 'SEO Organic Traffic Booster',
    description: 'Optimize core website pages to rank for high-intent buyer keywords.',
    category: 'MARKETING',
    estimatedImpact: 'MEDIUM',
    tasks: [
      'Perform keyword research for top 10 buyer intent terms',
      'Optimize meta tags, H1 headers, and image alt texts',
      'Publish 2 authoritative long-form blog articles weekly',
      'Build 5 high-quality backlinks from niche directories'
    ]
  },
  {
    id: 'mkt_04',
    title: 'Product Launch Buzz Generator',
    description: '30-day pre-launch campaign to build waitlist and launch day excitement.',
    category: 'MARKETING',
    estimatedImpact: 'HIGH',
    tasks: [
      'Create VIP waitlist landing page with referral countdown',
      'Draft 5 teaser posts for social media channels',
      'Reach out to 10 niche micro-influencers for affiliate review',
      'Host live launch demo webinar with exclusive early-bird bonus'
    ]
  },
  {
    id: 'mkt_05',
    title: 'Google Search Ads Quick-Start',
    description: 'Target active buyers searching for your exact software or services.',
    category: 'MARKETING',
    estimatedImpact: 'HIGH',
    tasks: [
      'Set up Google Ads campaign targeting exact match keywords',
      'Write 3 compelling ad copies featuring ROI guarantees',
      'Configure conversion tracking pixel for lead submissions',
      'Set negative keyword list to prevent wasted ad spend'
    ]
  },
  // SALES
  {
    id: 'sls_01',
    title: 'High-Ticket Sales Call & Pitch Framework',
    description: 'Structured discovery and closing playbook for high-value contracts.',
    category: 'SALES',
    estimatedImpact: 'HIGH',
    tasks: [
      'Conduct 15-minute qualification call using BANT criteria',
      'Deliver customized 30-minute ROI proposal deck',
      'Address top 3 pricing and timeline objections',
      'Send digital agreement contract via e-signature'
    ]
  },
  {
    id: 'sls_02',
    title: 'Inbound Demo Request Fast-Track',
    description: 'Respond to inbound website leads within 5 minutes to boost win rate.',
    category: 'SALES',
    estimatedImpact: 'HIGH',
    tasks: [
      'Set up instant SMS and Slack alerts for inbound demo forms',
      'Call or send personalized video message within 5 minutes',
      'Book discovery demo directly on calendar link',
      'Send automated prep email with case study attachment'
    ]
  },
  {
    id: 'sls_03',
    title: 'Stale Pipeline Revival Blitz',
    description: 'Re-engage cold proposals and inactive prospects from past 90 days.',
    category: 'SALES',
    estimatedImpact: 'HIGH',
    tasks: [
      'Filter CRM leads with status "Proposal Sent - No Response"',
      'Send 9-word re-engagement email ("Are you still looking for X?")',
      'Offer new flexible payment option or bonus audit',
      'Schedule call with re-activated prospects'
    ]
  },
  {
    id: 'sls_04',
    title: 'Client Upsell & Cross-Sell Blueprint',
    description: 'Expand revenue from current accounts with premium tier upgrades.',
    category: 'SALES',
    estimatedImpact: 'HIGH',
    tasks: [
      'Identify top 20% active accounts achieving great results',
      'Schedule quarterly business performance review',
      'Present growth expansion package or tier upgrade',
      'Execute contract addendum and issue updated invoice'
    ]
  },
  // FINANCE
  {
    id: 'fin_01',
    title: 'Weekly Cash Flow & Runway Audit',
    description: 'Maintain zero financial surprises with real-time cash tracking.',
    category: 'FINANCE',
    estimatedImpact: 'HIGH',
    tasks: [
      'Reconcile all incoming payments and bank accounts',
      'Review outstanding unpaid invoices and send automated reminders',
      'Categorize operating expenses and audit subscription costs',
      'Update 12-week cash flow forecast model'
    ]
  },
  {
    id: 'fin_02',
    title: 'Automated Accounts Receivable Recovery',
    description: 'Systematic process to eliminate overdue payments and boost liquidity.',
    category: 'FINANCE',
    estimatedImpact: 'HIGH',
    tasks: [
      'Send gentle invoice reminder 3 days before due date',
      'Send formal overdue notice on Day 1 past due',
      'Follow up with direct phone call or SMS on Day 7 past due',
      'Apply late payment fee or pause active service on Day 14'
    ]
  },
  {
    id: 'fin_03',
    title: 'Profit Margin Optimization Review',
    description: 'Identify cost leaks and increase gross profit percentage by 5-10%.',
    category: 'FINANCE',
    estimatedImpact: 'HIGH',
    tasks: [
      'Calculate gross margin per product/service offering',
      'Negotiate pricing with top 3 software vendors or suppliers',
      'Eliminate redundant SaaS tools and unused user seats',
      'Adjust client pricing structure to maintain minimum 65% margin'
    ]
  },
  // CLIENT MANAGEMENT
  {
    id: 'cli_01',
    title: 'Seamless Client Onboarding Experience',
    description: 'Delight new clients from Minute 1 with instant onboarding assets.',
    category: 'CLIENT_MANAGEMENT',
    estimatedImpact: 'HIGH',
    tasks: [
      'Send welcome package email with portal login credentials',
      'Deliver digital intake questionnaire to gather project assets',
      'Schedule 30-minute kickoff Zoom meeting',
      'Set up dedicated Slack/Teams communication channel'
    ]
  },
  {
    id: 'cli_02',
    title: 'VIP Client Satisfaction & Churn Prevention',
    description: 'Proactive check-ins to lock in satisfaction and prevent churn.',
    category: 'CLIENT_MANAGEMENT',
    estimatedImpact: 'HIGH',
    tasks: [
      'Send automated NPS survey on Day 30 post-onboarding',
      'Schedule quarterly executive strategy check-in',
      'Identify at-risk accounts with low portal usage',
      'Deliver surprise value gift or free bonus report'
    ]
  },
  // OPERATIONS
  {
    id: 'ops_01',
    title: 'Standard Operating Procedure (SOP) Factory',
    description: 'Systematize daily team tasks so the business runs without you.',
    category: 'OPERATIONS',
    estimatedImpact: 'HIGH',
    tasks: [
      'Record screen video walking through a routine weekly task',
      'Transcribe video into step-by-step written SOP guide',
      'Attach checklist templates and link required software tools',
      'Publish SOP in company documentation library'
    ]
  },
  {
    id: 'ops_02',
    title: 'Virtual Assistant / Delegated Task Hand-off',
    description: 'Offload low-value repetitive tasks to free up founder time.',
    category: 'OPERATIONS',
    estimatedImpact: 'HIGH',
    tasks: [
      'List 5 repetitive tasks consuming over 3 hours weekly',
      'Draft clear execution instructions and video walkthrough',
      'Assign tasks to Virtual Assistant with deadline expectation',
      'Review completed work and provide constructive feedback'
    ]
  },
  // CONTENT
  {
    id: 'cnt_01',
    title: 'Viral Social Media Content Engine',
    description: 'Batch 30 days of high-engaging social media posts in 2 hours.',
    category: 'CONTENT',
    estimatedImpact: 'HIGH',
    tasks: [
      'Research top 5 trending topics in your industry',
      'Outline 10 educational post hooks and takeaways',
      'Write post copy and design high-contrast carousel graphics',
      'Schedule posts using social media management tool'
    ]
  },
  {
    id: 'cnt_02',
    title: 'Weekly Thought Leadership Newsletter',
    description: 'Nurture your audience and drive consistent weekly sales calls.',
    category: 'CONTENT',
    estimatedImpact: 'HIGH',
    tasks: [
      'Draft insightful story sharing recent business win or lesson',
      'Include 3 curated industry resource links',
      'Add clear call-to-action (CTA) to book a consultation call',
      'Send newsletter to subscribers every Tuesday morning'
    ]
  }
];
