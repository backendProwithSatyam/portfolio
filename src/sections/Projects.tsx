import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Check, Play } from 'lucide-react'
import { projects, profile, type Project } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { ProjectPreview } from '../components/ProjectPreview'
import { TiltCard } from '../components/TiltCard'
import { Magnetic } from '../components/Magnetic'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'
import { OPEN_CRM_DEMO } from '../lib/events'

const CrmDemo = lazy(() => import('../demos/CrmDemo').then((m) => ({ default: m.CrmDemo })))

function ProjectCard({ p, onDemo }: { p: Project; onDemo: () => void }) {
  return (
    <TiltCard max={4} className="project-card h-full rounded-[28px]">
      <article className="glass flex h-full flex-col gap-6 rounded-[28px] p-5 sm:p-7 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-ember-400">{p.index} / 0{projects.length}</span>
            <span className="chip text-[11px]">{p.status}</span>
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-mist-500">{p.category}</p>
          <h3 className="mt-2 text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.02] tracking-tight">{p.title}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-mist-400">{p.summary}</p>
          <ul className="mt-5 space-y-2">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-mist-300">
                <Check size={15} className="mt-0.5 shrink-0 text-ember-400" />
                {f}
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies">
            {p.stack.map((s) => (
              <li key={s} className="chip text-[11px]">{s}</li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            {p.demo && (
              <Magnetic>
                <button
                  onClick={onDemo}
                  data-cursor-label="Open"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-ember-500 px-5 text-sm font-medium text-ink-950 transition hover:bg-ember-400"
                >
                  <Play size={14} fill="currentColor" /> Launch live demo
                </button>
              </Magnetic>
            )}
            {p.links?.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/15 px-5 text-sm hover:border-ember-500/60">
                {l.label} <ArrowUpRight size={14} />
              </a>
            ))}
            {!p.demo && !p.links?.length && (
              <a
                href={`mailto:${profile.email}?subject=${encodeURIComponent(`Walkthrough request: ${p.title}`)}`}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/15 px-5 text-sm text-mist-300 transition hover:border-ember-500/60 hover:text-white"
              >
                Request a walkthrough <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
        <div className="h-[260px] sm:h-[340px] lg:h-auto">
          <ProjectPreview project={p} />
        </div>
      </article>
    </TiltCard>
  )
}

/**
 * Desktop: the section pins and the cards travel horizontally as you scroll.
 * Mobile / reduced motion: a natural vertical stack.
 */
export function Projects() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [demo, setDemo] = useState(false)
  const { reduced } = useMotionPrefs()

  useEffect(() => {
    const open = () => setDemo(true)
    window.addEventListener(OPEN_CRM_DEMO, open)
    return () => window.removeEventListener(OPEN_CRM_DEMO, open)
  }, [])

  useLayoutEffect(() => {
    if (reduced || !section.current || !track.current) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (min-height: 640px)', () => {
      const t = track.current!
      const distance = () => t.scrollWidth - window.innerWidth
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.projects-pin',
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      gsap.to('.projects-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.projects-pin', start: 'top top', end: () => `+=${distance()}`, scrub: true } })
      gsap.utils.toArray<HTMLElement>('.project-slide').forEach((slide) => {
        gsap.fromTo(
          slide,
          { opacity: 0.3 },
          { opacity: 1, ease: 'none', scrollTrigger: { trigger: slide, containerAnimation: tween, start: 'left 95%', end: 'left 35%', scrub: true } },
        )
      })
    })
    mm.add('(max-width: 1023px), (max-height: 639px)', () => {
      gsap.utils.toArray<HTMLElement>('.project-slide').forEach((slide) => {
        gsap.fromTo(slide, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: slide, start: 'top 85%', once: true } })
      })
    })
    return () => mm.revert()
  }, [reduced])

  return (
    <section ref={section} id="work" className="relative py-28 sm:pt-40 lg:pb-0" aria-label="Featured projects">
      <div className="container-x">
        <SectionHeading
          eyebrow="Featured work"
          title="Real systems, built for *real* teams."
          intro="Most of my work is private company software, so instead of screenshots you get illustrative previews — and for the CRM, a working demo you can click through."
        />
      </div>

      <div className="projects-pin relative mt-14 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <div ref={track} className="flex flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:gap-8 lg:px-[max(3rem,calc((100vw-1320px)/2+3rem))] lg:will-change-transform">
          {projects.map((p) => (
            <div key={p.id} className="project-slide w-full shrink-0 lg:h-[min(76svh,660px)] lg:w-[min(80vw,1080px)]">
              <ProjectCard p={p} onDemo={() => setDemo(true)} />
            </div>
          ))}
          <div className="project-slide hidden w-[34vw] shrink-0 flex-col justify-center lg:flex">
            <p className="font-display text-5xl font-semibold leading-[0.95] tracking-tightest">
              Have a workflow<br />that needs a <span className="text-gradient">system?</span>
            </p>
            <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-ember-400 hover:text-ember-300">
              Let’s talk <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-8 hidden lg:block">
          <div className="container-x">
            <div className="h-px bg-white/10">
              <div className="projects-progress h-px origin-left scale-x-0 bg-ember-500" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {demo && (
          <Suspense fallback={null}>
            <CrmDemo onClose={() => setDemo(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </section>
  )
}
