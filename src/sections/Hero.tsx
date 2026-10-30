import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Download, MessageSquare } from 'lucide-react'
import { heroKeywords, profile } from '../data/profile'
import { Button } from '../components/Button'
import { SplitText } from '../components/SplitText'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'
import { supportsWebGL } from '../lib/device'
import { scrollToTarget } from '../lib/smoothScroll'

const HeroScene = lazy(() => import('../three/HeroScene'))

function RotatingKeyword() {
  const [i, setI] = useState(0)
  const { reduced } = useMotionPrefs()
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setI((v) => (v + 1) % heroKeywords.length), 2000)
    return () => clearInterval(id)
  }, [reduced])
  return (
    <span className="relative inline-flex h-[1.3em] min-w-[7.5em] overflow-hidden align-bottom text-ember-400" aria-hidden>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={heroKeywords[i]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0"
        >
          {heroKeywords[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const { reduced, tier, touch, ready } = useMotionPrefs()
  const [webgl] = useState(supportsWebGL)
  const [visible, setVisible] = useState(true)
  const [mountScene, setMountScene] = useState(false)
  const quality = tier === 'high' && !touch ? 'high' : 'low'

  // Defer the WebGL bundle until after first paint so it never blocks the initial render.
  useEffect(() => {
    if (!webgl) return
    const id = window.setTimeout(() => setMountScene(true), 120)
    return () => clearTimeout(id)
  }, [webgl])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    if (section.current) io.observe(section.current)
    return () => io.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (reduced || !section.current) return
    const ctx = gsap.context(() => {
      gsap.to(progress, {
        current: 1,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(content.current, {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: '30% top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-layer-back', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true } })
    }, section)
    return () => ctx.revert()
  }, [reduced])

  const enter = (d: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 24 }, animate: ready ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay: d, ease: [0.16, 1, 0.3, 1] as const } }

  return (
    <section ref={section} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-labelledby="hero-title">
      {/* Background depth layers */}
      <div className="hero-layer-back pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -right-[20%] top-0 h-[70vmax] w-[70vmax] bg-[radial-gradient(closest-side,rgba(109,108,247,0.16),transparent)]" />
        <div className="absolute -left-[20%] bottom-[-30%] h-[60vmax] w-[60vmax] bg-[radial-gradient(closest-side,rgba(255,122,26,0.12),transparent)]" />
      </div>

      {/* 3D */}
      <div className="absolute inset-0 max-md:top-[30%] md:left-[35%]" aria-hidden>
        {webgl && mountScene && !reduced ? (
          <Suspense fallback={null}>
            <motion.div className="h-full w-full max-md:opacity-40" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.6 }}>
              <HeroScene progress={progress} quality={quality} active={visible} />
            </motion.div>
          </Suspense>
        ) : (
          <div className="absolute right-[8%] top-1/2 h-[42vmin] w-[42vmin] -translate-y-1/2 rounded-full border border-ember-500/30 bg-[radial-gradient(circle_at_35%_35%,rgba(255,122,26,0.45),rgba(109,108,247,0.18)_55%,transparent_70%)] max-md:opacity-50" />
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" aria-hidden />

      <div ref={content} className="container-x relative z-10 flex flex-1 flex-col justify-center pb-28 pt-32 sm:pt-36">
        <motion.div {...enter(0.1)} className="flex flex-wrap items-center gap-3">
          <span className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-3 pr-4 text-xs text-mist-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {profile.availability}
          </span>
        </motion.div>

        <motion.p {...enter(0.2)} className="mt-7 font-mono text-[11px] uppercase tracking-[0.2em] text-mist-400 sm:text-xs">
          {profile.roles.join('  ·  ')}
        </motion.p>

        <SplitText
          as="h1"
          trigger="mount"
          delay={0.1}
          stagger={0.08}
          text={profile.name}
          className="mt-4 font-display text-[clamp(3.4rem,11vw,9.5rem)] font-semibold leading-[0.86] tracking-tightest"
        />
        <span id="hero-title" className="sr-only">{profile.name} — {profile.roles.join(', ')}</span>

        <SplitText
          as="p"
          trigger="mount"
          delay={0.35}
          stagger={0.03}
          text="Building *scalable* digital experiences from *backend* to *cloud.*"
          className="mt-6 max-w-[20ch] font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-medium leading-[1.08] tracking-tight text-mist-100 sm:max-w-[24ch]"
        />

        <motion.p {...enter(0.55)} className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist-400 sm:text-base">
          {profile.intro}
        </motion.p>

        <motion.p {...enter(0.6)} className="mt-4 font-mono text-sm text-mist-300">
          <span className="text-mist-500">currently_shipping:</span> <RotatingKeyword />
        </motion.p>

        <motion.div {...enter(0.7)} className="mt-9 flex flex-wrap items-center gap-3">
          <Button
            href="#work"
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget('#work', reduced)
            }}
            icon={<ArrowDown size={16} />}
          >
            Explore My Work
          </Button>
          <Button href={profile.resume} download variant="ghost" icon={<Download size={16} />}>
            Download Resume
          </Button>
          <Button
            href="#contact"
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget('#contact', reduced)
            }}
            icon={<MessageSquare size={15} />}
          >
            Let’s Build Something
          </Button>
        </motion.div>
      </div>

      <motion.div {...enter(0.9)} className="container-x relative z-10 flex items-end justify-between pb-8 text-xs text-mist-500">
        <div className="flex items-center gap-6">
          <div>
            <p className="font-display text-xl font-semibold text-mist-100 sm:text-2xl">~{profile.experienceYears} yrs</p>
            <p>Laravel & full-stack</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div>
            <p className="font-display text-xl font-semibold text-mist-100 sm:text-2xl">Backend → Cloud</p>
            <p>End-to-end delivery</p>
          </div>
        </div>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#about', reduced)
          }}
          className="hidden items-center gap-2 font-mono uppercase tracking-[0.2em] hover:text-mist-100 sm:flex"
        >
          Scroll <ArrowUpRight size={14} className="rotate-90" />
        </a>
      </motion.div>
    </section>
  )
}
