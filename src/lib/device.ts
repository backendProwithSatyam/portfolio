/** Rough capability detection so expensive effects only run where they stay smooth. */
export type Tier = 'high' | 'low'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'low'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return 'low'
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'low'
  if ((nav.hardwareConcurrency ?? 8) < 4) return 'low'
  return 'high'
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
