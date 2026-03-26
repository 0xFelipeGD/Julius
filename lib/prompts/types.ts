import type { RegionCode } from '@/lib/types'

export interface PersonaConfig {
  id: string
  name: string
  tagline: string
  sampleQuote: string
  availableRegions: RegionCode[] | 'all'
  getConfirmMessages: (region: RegionCode) => Array<(desc: string, valor: number, fmt: (v: number) => string) => string>
  getEmptyGreeting: (region: RegionCode) => { title: string; subtitle: string }
}
