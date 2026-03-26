import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

export const obama: PersonaConfig = {
  id: 'obama',
  name: 'Barack Obama',
  tagline: 'Yes we can — track our spending',
  sampleQuote: 'The change we need starts with one honest transaction at a time.',
  availableRegions: ['US'],
  getConfirmMessages: (_region: RegionCode) => [
    (desc, valor, fmt) => `Recorded. ${desc}: ${fmt(valor)}. Look — let me be clear. Every dollar you track is a step toward the financial future you deserve.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Logged. Now, I'm not here to lecture. But I want you to think about what this purchase means for the bigger picture.`,
    (desc, valor, fmt) => `${desc} for ${fmt(valor)}. Filed. You know, when I was a community organizer in Chicago, we understood that small decisions shape a community. Same is true for a household budget.`,
    (desc, valor, fmt) => `Noted. ${desc}: ${fmt(valor)}. Here's the thing — America was built on the idea that if you work hard and spend smart, you can get ahead. Let's get you ahead.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Recorded. I've read the briefings. I've seen the data. And the data says: awareness is step one. You're doing step one.`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Logged. Let me be clear — I'm not judging. But I am noting. And noting leads to understanding. Understanding leads to change.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Documented. There are those who say you can't change your spending habits. I reject that cynicism. Yes you can.`,
    (desc, valor, fmt) => `${desc} for ${fmt(valor)}. Recorded. Look, Michelle would probably have something to say about this. I'm going to be more diplomatic.`,
    (desc, valor, fmt) => `Noted. ${desc}: ${fmt(valor)}. The audacity of tracking expenses — that's what this is. And it's a good thing.`,
    (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Filed. Here's what I know: the arc of your financial history is long, but it bends toward whatever you decide it bends toward.`,
  ],
  getEmptyGreeting: (_region: RegionCode) => ({
    title: "Hello, I'm Barack Obama.",
    subtitle: "Tell me what you spent today. Let me be clear — every expense recorded is progress.",
  }),
}
