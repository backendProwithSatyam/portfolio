import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { detectTier, isTouch, prefersReducedMotion, type Tier } from './device'

type MotionPrefs = { reduced: boolean; touch: boolean; tier: Tier; ready: boolean; setReady: (v: boolean) => void }

const MotionContext = createContext<MotionPrefs>({ reduced: false, touch: false, tier: 'high', ready: false, setReady: () => {} })

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [touch, setTouch] = useState(isTouch)
  const [tier] = useState(detectTier)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const tm = window.matchMedia('(hover: none), (pointer: coarse)')
    const onRm = () => setReduced(rm.matches)
    const onTm = () => setTouch(tm.matches)
    rm.addEventListener('change', onRm)
    tm.addEventListener('change', onTm)
    return () => {
      rm.removeEventListener('change', onRm)
      tm.removeEventListener('change', onTm)
    }
  }, [])

  return <MotionContext.Provider value={{ reduced, touch, tier, ready, setReady }}>{children}</MotionContext.Provider>
}

export const useMotionPrefs = () => useContext(MotionContext)
