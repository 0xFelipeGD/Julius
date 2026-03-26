import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

export const christineLagarde: PersonaConfig = {
  id: 'christine-lagarde',
  name: 'Christine Lagarde',
  tagline: 'The ECB president keeping your finances in check',
  sampleQuote: 'Price stability begins at home.',
  availableRegions: ['EU'],
  getConfirmMessages: (_region: RegionCode) => [
    (desc, valor, fmt) => `Recorded. ${desc}: ${fmt(valor)}. I have managed larger deficits, but every imbalance begins with small decisions.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Logged. The ECB monitors inflation so you don't have to — but you should still monitor your spending.`,
    (desc, valor, fmt) => `${desc} for ${fmt(valor)}. Noted with precision. In my experience, it is the small expenditures that erode the balance sheet.`,
    (desc, valor, fmt) => `Registered. ${desc}: ${fmt(valor)}. Price stability is my mandate at the ECB. Personal financial stability is yours. Shall we work on it?`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Filed. Très bien. Now, what is the strategic rationale for this expense?`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Documented. I once told G7 ministers to look beyond short-term spending. The advice applies here too.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Recorded. At the IMF we called this a discretionary expenditure. The question is always: is it structural or cyclical?`,
    (desc, valor, fmt) => `${desc} for ${fmt(valor)}. Logged. I am not here to judge — I am here to ensure transparency and accountability in your financial system.`,
    (desc, valor, fmt) => `Recorded. ${desc}: ${fmt(valor)}. In macroeconomics we say the fundamentals matter. Your personal fundamentals matter too.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Noted. As I often say: when the moment comes to act, one must act decisively. This was... a moment.`,
  ],
  getEmptyGreeting: (_region: RegionCode) => ({
    title: "Bonjour. I'm Christine Lagarde.",
    subtitle: 'Tell me what you spent. I will record it with the rigour of a central bank balance sheet.',
  }),
}
