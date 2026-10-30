import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

/**
 * Short intro that counts while fonts load, then wipes away. Capped so it never
 * holds the page hostage; skipped entirely for reduced-motion users.
 */
export function Loader() {
  const { reduced, setReady } = useMotionPrefs()
  const [gone, setGone] = useState(reduced)
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reduced) {
      setReady(true)
      return
    }
    const counter = { v: 0 }
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
    const tl = gsap.timeline({ paused: true })
    tl.to(counter, {
      v: 100,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
      },
    })
      .to('.loader-bar', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to('.loader-word', { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.04 }, '+=0.1')
      .add(() => setReady(true), '-=0.15')
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.2')
      .add(() => setGone(true))
    fonts.then(() => tl.play())
    return () => {
      tl.kill()
    }
  }, [reduced, setReady])

  if (gone) return null
  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-ink-950 p-6 sm:p-10"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="flex justify-between font-mono text-xs uppercase tracking-[0.25em] text-mist-500">
        <span className="overflow-hidden"><span className="loader-word inline-block">Portfolio</span></span>
        <span className="overflow-hidden"><span className="loader-word inline-block">© {new Date().getFullYear()}</span></span>
      </div>
      <div>
        <div className="overflow-hidden">
          <p className="loader-word font-display text-[clamp(3rem,13vw,11rem)] font-semibold leading-[0.9] tracking-tightest">
            Satyam<span className="text-ember-500">.</span>
          </p>
        </div>
        <div className="mt-6 flex items-end justify-between gap-6">
          <div className="h-px flex-1 bg-white/10">
            <div className="loader-bar h-px origin-left scale-x-0 bg-ember-500" />
          </div>
          <span className="overflow-hidden font-mono text-sm text-mist-300">
            <span ref={count} className="loader-word inline-block tabular-nums">000</span>
          </span>
        </div>
      </div>
    </div>
  )
}
