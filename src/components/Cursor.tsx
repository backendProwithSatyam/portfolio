import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

type Mode = 'idle' | 'hover' | 'label' | 'field'

/**
 * Dot + trailing ring. Grows over interactive elements and shows a label for [data-cursor-label].
 * Desktop only. Position uses quickTo setters; style tweens run only when the hover mode changes,
 * so moving the mouse never piles up animations.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const { touch, reduced } = useMotionPrefs()
  const enabled = !touch && !reduced

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return
    const d = dot.current
    const r = ring.current
    document.documentElement.classList.add('has-cursor')
    const xd = gsap.quickTo(d, 'x', { duration: 0.08 })
    const yd = gsap.quickTo(d, 'y', { duration: 0.08 })
    const xr = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' })
    const yr = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' })
    let mode: Mode | null = null
    let text = ''
    let shown = false

    const setMode = (next: Mode, nextText: string) => {
      if (next === mode && nextText === text) return
      mode = next
      text = nextText
      if (label.current) label.current.textContent = nextText
      gsap.to(r, {
        scale: next === 'label' ? 2.6 : next === 'hover' ? 1.7 : 1,
        opacity: next === 'field' ? 0 : 1,
        backgroundColor: next === 'label' ? 'rgba(255,122,26,0.95)' : 'rgba(255,122,26,0)',
        duration: 0.3,
        overwrite: 'auto',
      })
      gsap.to(d, { opacity: next === 'idle' ? 1 : 0, duration: 0.2, overwrite: 'auto' })
    }

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true
        gsap.set([d, r], { x: e.clientX, y: e.clientY, opacity: 1 })
      }
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY)
    }
    // Hover mode only needs re-evaluating when the element under the pointer changes.
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, input, textarea, select, [data-cursor], [data-cursor-label]')
      if (!t) return setMode('idle', '')
      if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return setMode('field', '')
      const l = t.dataset.cursorLabel
      setMode(l ? 'label' : 'hover', l ?? '')
    }
    const leave = () => {
      shown = false
      gsap.to([d, r], { opacity: 0, duration: 0.2, overwrite: 'auto' })
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1 h-2 w-2 rounded-full bg-ember-500 opacity-0" />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[99] -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-ember-500/60 opacity-0"
      >
        <span ref={label} className="font-mono text-[5px] font-semibold uppercase tracking-widest text-ink-950" />
      </div>
    </>
  )
}
