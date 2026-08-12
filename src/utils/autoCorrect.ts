/**
 * TaskFlow AI Auto-Correct Utility
 * Corrects common typos, misspellings, contractions, and formatting errors in user inputs
 * before sending them to the AI Assistant backend.
 */

export const AUTO_CORRECT_DICTIONARY: Record<string, string> = {
  // Contractions & Informal Shortcuts
  im: "I'm",
  cant: "can't",
  dont: "don't",
  isnt: "isn't",
  wont: "won't",
  didnt: "didn't",
  couldnt: "couldn't",
  wouldnt: "wouldn't",
  shouldnt: "shouldn't",
  havent: "haven't",
  hasnt: "hasn't",
  youre: "you're",
  theyre: "they're",
  weve: "we've",
  ill: "I'll",
  youll: "you'll",
  whats: "what's",
  hows: "how's",
  pls: 'please',
  plx: 'please',
  plz: 'please',
  hw: 'how',
  ur: 'your',
  r: 'are',
  u: 'you',
  thx: 'thanks',
  ty: 'thank you',
  bcz: 'because',
  bc: 'because',
  alot: 'a lot',
  asap: 'ASAP',

  // Common Typos & Spelling Mistakes
  teh: 'the',
  taht: 'that',
  thier: 'their',
  theor: 'their',
  therefor: 'therefore',
  recieve: 'receive',
  receiv: 'receive',
  recep: 'receipt',
  calender: 'calendar',
  seperate: 'separate',
  recomend: 'recommend',
  recomended: 'recommended',
  recomendation: 'recommendation',
  sucess: 'success',
  succesful: 'successful',
  sucessfully: 'successfully',
  bussiness: 'business',
  busines: 'business',
  bisness: 'business',
  proposall: 'proposal',
  propsal: 'proposal',
  porposal: 'proposal',
  impliment: 'implement',
  implimentation: 'implementation',
  agnecy: 'agency',
  agencys: 'agencies',
  revenuee: 'revenue',
  revenu: 'revenue',
  sechedule: 'schedule',
  skedule: 'schedule',
  tomorow: 'tomorrow',
  tommorrow: 'tomorrow',
  clientt: 'client',
  clien: 'client',
  helpp: 'help',
  shoud: 'should',
  sholud: 'should',
  woudl: 'would',
  feauture: 'feature',
  fature: 'feature',
  optmize: 'optimize',
  opimization: 'optimization',
  analys: 'analysis',
  analysist: 'analysis',
  stratgy: 'strategy',
  marcketing: 'marketing',
  marketting: 'marketing',
  automat: 'automate',
  automations: 'automations',
  workfow: 'workflow',
  workflo: 'workflow',
  taks: 'tasks',
  tsak: 'task',
  asistant: 'assistant',
  asistantt: 'assistant',
  misspelt: 'misspelled',
  mispelled: 'misspelled',
  mispell: 'misspell',
  writting: 'writing',
  truely: 'truly',
  devoloper: 'developer',
  definatly: 'definitely',
  neccessary: 'necessary',
  unforseen: 'unforeseen',
  informaion: 'information',
  financials: 'financials',
  subcription: 'subscription',
  subcribe: 'subscribe',
  subcribed: 'subscribed',
  subscribtion: 'subscription',

  // Industry Acronyms & Standardizations
  mrr: 'MRR',
  arr: 'ARR',
  ai: 'AI',
  usd: 'USD',
  ngn: 'NGN',
  crm: 'CRM',
  roi: 'ROI',
  kpi: 'KPI',
  seo: 'SEO',
  api: 'API',
};

/**
 * Auto-corrects input text by replacing misspelled words and standardizing capitalization.
 */
export function autoCorrectText(input: string): string {
  if (!input || !input.trim()) return input;
  let text = input;

  Object.entries(AUTO_CORRECT_DICTIONARY).forEach(([bad, good]) => {
    const regex = new RegExp(`\\b${bad}\\b`, 'gi');
    text = text.replace(regex, (match) => {
      // Preserve ALL CAPS if input was all caps
      if (match === match.toUpperCase() && match.length > 1) {
        return good.toUpperCase();
      }
      // Preserve initial Capitalization
      if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return good.charAt(0).toUpperCase() + good.slice(1);
      }
      return good;
    });
  });

  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  // Capitalize first letter of sentence
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}
