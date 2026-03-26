import type { RegionCode } from '@/lib/types'
import type { PersonaConfig } from './types'
import { julius } from './personas/julius'
import { donaHerminia } from './personas/dona-herminia'
import { seuMadruga } from './personas/seu-madruga'
import { fernando } from './personas/fernando'
import { christineLagarde } from './personas/christine-lagarde'
import { trump } from './personas/trump'
import { obama } from './personas/obama'

export type { PersonaConfig }

const PERSONAS_REGISTRY: PersonaConfig[] = [
  julius,
  donaHerminia,
  seuMadruga,
  fernando,
  christineLagarde,
  trump,
  obama,
]

export const PERSONAS: Record<string, PersonaConfig> = Object.fromEntries(
  PERSONAS_REGISTRY.map((p) => [p.id, p])
)

export function getPersona(id: string | null | undefined): PersonaConfig {
  if (!id) return julius
  return PERSONAS[id] ?? julius
}

export function getPersonasForRegion(region: RegionCode): PersonaConfig[] {
  return PERSONAS_REGISTRY.filter((p) =>
    p.availableRegions === 'all' || p.availableRegions.includes(region)
  )
}

/**
 * Returns the image path for a persona.
 * All personas use /personas/<id>.svg (placeholder) — replace with /personas/<id>.png when real photos are ready,
 * and update the extension below.
 */
export function getPersonaImage(id: string): string {
  if (id === 'julius') return '/personas/julius.png'
  return `/personas/${id}.jpg`
}

export { julius }
