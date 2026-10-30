import { useRef, type ReactNode } from 'react'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

/** Pulls its child toward the pointer while hovered; springs back on leave. */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { reduced, touch } = useMotionPrefs()
  const off = reduced || touch

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      onPointerMove={(e) => {
        if (off || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        gsap.to(ref.current, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.4,
          ease: 'power3.out',
        })
      }}
      onPointerLeave={() => {
        if (off || !ref.current) return
        gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      }}
    >
      {children}
    </span>
  )
}
