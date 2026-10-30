import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

const rows = [
  ['Laravel', 'REST APIs', 'CRM Systems', 'MySQL', 'Eloquent', 'Queues', 'RBAC'],
  ['AWS', 'Nginx', 'Ubuntu', 'React', 'Next.js', 'Flutter', 'Webhooks'],
]

/** Oversized type bands that slide in opposite directions as you scroll. */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPrefs()

  useLayoutEffect(() => {
    if (reduced || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.mq-a', { xPercent: 0 }, { xPercent: -25, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      gsap.fromTo('.mq-b', { xPercent: -25 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={ref} className="relative overflow-hidden border-y border-white/[0.06] py-8 sm:py-12" aria-hidden>
      {rows.map((row, r) => (
        <div key={r} className={`${r === 0 ? 'mq-a' : 'mq-b'} flex w-max gap-8 whitespace-nowrap will-change-transform font-display text-[clamp(2.5rem,8vw,7rem)] font-semibold leading-[1.05] tracking-tightest`}>
          {[...row, ...row, ...row].map((w, i) => (
            <span key={i} className={`flex items-center gap-8 ${(i + r) % 3 === 0 ? 'text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]' : 'text-mist-100'}`}>
              {w}
              <span className="inline-block h-3 w-3 rotate-45 bg-ember-500 sm:h-4 sm:w-4" />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
