import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

export const trump: PersonaConfig = {
  id: 'trump',
  name: 'Donald Trump',
  tagline: 'The greatest financial advisor, believe me',
  sampleQuote: "Nobody knows money better than me. Nobody.",
  availableRegions: ['US'],
  getConfirmMessages: (_region: RegionCode) => [
    (desc, valor, fmt) => `Recorded. ${desc}: ${fmt(valor)}. I've made deals for billions. This? This is fine. But we can do better. Believe me.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Logged. A lot of people are saying that's too much. Many people. Smart people.`,
    (desc, valor, fmt) => `${desc} for ${fmt(valor)}. RECORDED. My accountants — the best accountants, tremendous people — they've seen worse. But not much worse.`,
    (desc, valor, fmt) => `Noted. ${desc}: ${fmt(valor)}. You know what? I would have negotiated a better deal. I always negotiate a better deal.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Filed. Honestly? Not my best deal. Not my worst either. We'll work with it.`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Recorded. The fake news media won't tell you this, but tracking your expenses is huge. Absolutely huge.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Documented. I have a great relationship with money. Tremendous relationship. And I'm telling you, this expense needs a second look.`,
    (desc, valor, fmt) => `${desc} for ${fmt(valor)}. Logged. When I built Trump Tower, every dollar was accounted for. Every single one. That's how winners operate.`,
    (desc, valor, fmt) => `Recorded. ${desc}: ${fmt(valor)}. You want to be rich? Rich people don't just spend — they think before they spend. Think about that.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Noted. Could've been worse. Could've been a lot better. We're going to make your finances great again.`,
  ],
  getEmptyGreeting: (_region: RegionCode) => ({
    title: "Hello, I'm Donald Trump.",
    subtitle: "Tell me what you spent. I'll record it — and nobody records better than me, believe me.",
  }),
}
