import { useLayoutEffect, useRef } from 'react'
import { Briefcase } from 'lucide-react'
import { about, experience, profile } from '../data/profile'
import { Reveal } from '../components/Reveal'
import { TiltCard } from '../components/TiltCard'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

/** Words brighten one by one as the paragraph scrolls through the viewport. */
function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { reduced } = useMotionPrefs()
  useLayoutEffect(() => {
    if (reduced || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current!.querySelectorAll('span'), { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: true } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])
  return (
    <p ref={ref} className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i}>{w} </span>
      ))}
    </p>
  )
}

function CodeCard() {
  const line = (n: number, content: React.ReactNode) => (
    <div className="flex gap-4">
      <span className="w-5 select-none text-right text-mist-500/60">{n}</span>
      <span className="whitespace-pre">{content}</span>
    </div>
  )
  const k = (s: string) => <span className="text-volt-400">{s}</span>
  const str = (s: string) => <span className="text-ember-300">{s}</span>
  const fn = (s: string) => <span className="text-aqua-400">{s}</span>
  return (
    <TiltCard className="rounded-3xl">
      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-mist-500">app/Developers/Satyam.php</span>
        </div>
        <pre className="no-scrollbar overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-mist-300 sm:text-[13px]">
          <code>
            {line(1, <>{k('class')} {fn('Satyam')} {k('extends')} {fn('Developer')}</>)}
            {line(2, '{')}
            {line(3, <>    {k('public')} $role = {str("'Full-Stack · Laravel'")};</>)}
            {line(4, <>    {k('public')} $company = {str(`'${profile.company}'`)};</>)}
            {line(5, <>    {k('public')} $experience = {str(`'~${profile.experienceYears} years'`)};</>)}
            {line(6, '')}
            {line(7, <>    {k('public function')} {fn('stack')}(): {k('array')}</>)}
            {line(8, '    {')}
            {line(9, <>        {k('return')} [</>)}
            {line(10, <>            {str("'core'")}   =&gt; [{str("'PHP'")}, {str("'Laravel'")}, {str("'MySQL'")}],</>)}
            {line(11, <>            {str("'ship'")}   =&gt; [{str("'Linux'")}, {str("'Nginx'")}, {str("'AWS'")}],</>)}
            {line(12, <>            {str("'grow'")}   =&gt; [{str("'React'")}, {str("'Next.js'")}, {str("'Flutter'")}],</>)}
            {line(13, '        ];')}
            {line(14, '    }')}
            {line(15, '}')}
          </code>
        </pre>
      </div>
    </TiltCard>
  )
}

function Timeline() {
  const ref = useRef<HTMLOListElement>(null)
  const { reduced } = useMotionPrefs()
  useLayoutEffect(() => {
    if (reduced || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.tl-progress', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 70%', end: 'bottom 60%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.tl-item').forEach((el) => {
        gsap.fromTo(el, { opacity: 0.25, x: 20 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' } })
        gsap.fromTo(el.querySelector('.tl-dot'), { scale: 0.4, backgroundColor: '#2a2a38' }, { scale: 1, backgroundColor: '#ff7a1a', scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' } })
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <ol ref={ref} className="relative ml-2 space-y-12 border-l border-white/10 pl-8 sm:pl-12">
      <span className="tl-progress absolute -left-px top-0 h-full w-px origin-top bg-gradient-to-b from-ember-500 via-ember-500 to-volt-500" aria-hidden />
      {experience.tracks.map((t, i) => (
        <li key={t.title} className="tl-item relative">
          <span className="tl-dot absolute -left-[39px] top-1.5 h-3.5 w-3.5 rounded-full bg-ember-500 ring-4 ring-ink-950 sm:-left-[55px]" aria-hidden />
          <p className="font-mono text-xs text-mist-500">0{i + 1}</p>
          <h4 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{t.title}</h4>
          <p className="mt-2 max-w-xl leading-relaxed text-mist-400">{t.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {t.tags.map((tag) => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function About() {
  return (
    <section id="about" className="relative py-28 sm:py-40" aria-labelledby="about-title">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="eyebrow">About me</p>
                <h2 id="about-title" className="mt-5 text-[clamp(2.25rem,5vw,4.25rem)] font-semibold leading-[0.98] tracking-tightest">
                  Backend-first.<br />
                  <span className="text-mist-500">Product-minded.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.15} className="mt-10">
                <CodeCard />
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ScrubText text={about.lead} className="font-display text-[clamp(1.5rem,2.8vw,2.4rem)] font-medium leading-[1.2] tracking-tight" />
            <div className="mt-10 space-y-5 text-base leading-relaxed text-mist-400 sm:text-lg">
              {about.paragraphs.map((p) => (
                <Reveal key={p}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {about.principles.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <TiltCard className="h-full rounded-2xl">
                    <div className="glass h-full rounded-2xl p-5">
                      <p className="font-mono text-xs text-ember-400">0{i + 1}</p>
                      <h3 className="mt-3 text-lg font-semibold leading-tight tracking-tight">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-mist-400">{p.body}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            {/* Experience */}
            <div className="mt-24">
              <Reveal>
                <p className="eyebrow">Experience</p>
                <div className="glass mt-6 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember-500/15 text-ember-400">
                      <Briefcase size={22} />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{experience.role}</h3>
                      <p className="text-mist-400">{experience.company}</p>
                    </div>
                  </div>
                  <span className="chip self-start border-ember-500/30 text-ember-300 sm:self-auto">{experience.duration}</span>
                </div>
                <p className="mt-6 text-mist-400">{experience.summary} What the role covers:</p>
              </Reveal>
              <div className="mt-10">
                <Timeline />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
