import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { workflow } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

/**
 * Desktop: the section pins and scrolling advances through the seven steps.
 * Mobile / reduced motion: a vertical list that reveals step by step.
 */
const PIN_QUERY = '(min-width: 1024px) and (min-height: 640px)'

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export function Workflow() {
  const pin = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const { reduced } = useMotionPrefs()
  const pinned = useMedia(PIN_QUERY) && !reduced

  useLayoutEffect(() => {
    if (!pinned || !pin.current) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: pin.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * 3.2}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => setActive(Math.min(workflow.length - 1, Math.floor(self.progress * workflow.length))),
          },
        })
        .fromTo('.wf-arc', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' })
    }, pin)
    return () => ctx.revert()
  }, [pinned])

  const step = workflow[active]

  return (
    <section id="process" className="relative" aria-label="Development workflow">
      <div className="container-x pt-28 sm:pt-40">
        <SectionHeading
          eyebrow="How I work"
          title="From requirement to *running* product."
          intro="Seven steps I follow on every feature — whether it’s a new CRM module or a landing page with a lead form."
        />
      </div>

      {pinned ? (
        <div ref={pin} className="flex h-[100svh] items-center">
          <div className="container-x grid grid-cols-12 items-center gap-10">
            <div className="relative col-span-6 flex aspect-square max-h-[70svh] items-center justify-center">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <circle className="wf-arc" cx="100" cy="100" r="92" fill="none" stroke="url(#wf-grad)" strokeWidth="2" strokeLinecap="round" pathLength={1} strokeDasharray="1" />
                <defs>
                  <linearGradient id="wf-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ff7a1a" />
                    <stop offset="1" stopColor="#8b8cff" />
                  </linearGradient>
                </defs>
                {workflow.map((_, i) => {
                  const a = (i / workflow.length) * Math.PI * 2
                  return <circle key={i} cx={100 + Math.cos(a) * 92} cy={100 + Math.sin(a) * 92} r={i <= active ? 3.2 : 2.2} fill={i <= active ? '#ff7a1a' : '#2a2a38'} style={{ transition: 'all .4s' }} />
                })}
              </svg>
              <div className="text-center">
                <p className="font-mono text-sm text-ember-400">{String(active + 1).padStart(2, '0')} / 0{workflow.length}</p>
                <div className="relative h-[clamp(4rem,8vw,7.5rem)] overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={step.step}
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-[clamp(3.5rem,7vw,6.5rem)] font-semibold leading-none tracking-tightest"
                    >
                      {step.step}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <ol className="col-span-6 space-y-1">
              {workflow.map((w, i) => (
                <li
                  key={w.step}
                  className={`rounded-2xl border px-6 py-4 transition-all duration-500 ${i === active ? 'border-ember-500/40 bg-white/[0.04]' : 'border-transparent opacity-40'}`}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-ember-400">0{i + 1}</span>
                    <h3 className="text-xl font-semibold tracking-tight">{w.step}</h3>
                  </div>
                  <div className={`grid transition-all duration-500 ${i === active ? 'mt-2 grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <p className="overflow-hidden pl-9 text-mist-400">{w.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div ref={pin} className="container-x pb-10 pt-14">
          <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-gradient-to-b before:from-ember-500 before:to-volt-500">
            {workflow.map((w, i) => (
              <li key={w.step}>
                <Reveal delay={0.05} className="relative flex gap-5">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-ink-850 font-mono text-sm text-ember-400">0{i + 1}</span>
                  <div className="glass flex-1 rounded-2xl p-5">
                    <h3 className="text-xl font-semibold tracking-tight">{w.step}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-mist-400">{w.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
