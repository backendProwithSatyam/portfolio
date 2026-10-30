import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cloud, Code2, Database, Smartphone, Wrench } from 'lucide-react'
import { levelInfo, skillGroups, tools, type Level, type SkillGroup } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { TiltCard } from '../components/TiltCard'
import { useMotionPrefs } from '../lib/motion'

const icons: Record<string, typeof Database> = { backend: Database, frontend: Code2, cloud: Cloud, mobile: Smartphone }

const accent: Record<SkillGroup['accent'], { text: string; bg: string; border: string; hex: string }> = {
  ember: { text: 'text-ember-400', bg: 'bg-ember-500', border: 'border-ember-500/40', hex: '#ff7a1a' },
  volt: { text: 'text-volt-400', bg: 'bg-volt-500', border: 'border-volt-500/40', hex: '#8b8cff' },
  aqua: { text: 'text-aqua-400', bg: 'bg-aqua-400', border: 'border-aqua-400/40', hex: '#5cc8ff' },
  mist: { text: 'text-mist-300', bg: 'bg-mist-300', border: 'border-white/30', hex: '#c9c9d4' },
}

const faceGlyphs: Record<string, string[]> = {
  backend: ['Laravel', 'PHP', 'MySQL', 'REST'],
  frontend: ['React', 'Blade', 'JS', 'Next.js'],
  cloud: ['AWS', 'Nginx', 'Linux', 'SSL'],
  mobile: ['Flutter', 'Dart', 'API', 'Auth'],
}

function LevelDots({ level, color }: { level: Level; color: string }) {
  const n = levelInfo[level].dots
  return (
    <span className="flex gap-1" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-1.5 w-4 rounded-full" style={{ background: i < n ? color : 'rgba(255,255,255,0.1)' }} />
      ))}
    </span>
  )
}

/**
 * A cube whose four side faces are the skill categories. Rotates to the selected
 * tab, and can be dragged — releasing snaps to the nearest face and selects it.
 */
function SkillCube({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const { reduced } = useMotionPrefs()
  const [drag, setDrag] = useState(0)
  const [turns, setTurns] = useState(0)
  const start = useRef<number | null>(null)
  const angle = -(index + turns * 4) * 90 + drag

  const end = () => {
    if (start.current === null) return
    const steps = Math.round(-drag / 90)
    const raw = index + steps
    setTurns((t) => t + Math.floor(raw / 4))
    onSelect(((raw % 4) + 4) % 4)
    setDrag(0)
    start.current = null
  }

  return (
    <div
      className="relative mx-auto aspect-square w-[min(68vw,260px)] touch-pan-y select-none [perspective:900px]"
      data-cursor-label="Drag"
      onPointerDown={(e) => {
        start.current = e.clientX
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => start.current !== null && setDrag((e.clientX - start.current) * 0.6)}
      onPointerUp={end}
      onPointerCancel={end}
      aria-hidden
    >
      <div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{
          transform: `translateZ(calc(min(68vw,260px) / -2)) rotateX(-14deg) rotateY(${angle}deg)`,
          transition: start.current !== null || reduced ? 'none' : 'transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {skillGroups.map((g, i) => {
          const a = accent[g.accent]
          const Icon = icons[g.id]
          return (
            <div
              key={g.id}
              className={`absolute inset-0 flex flex-col justify-between rounded-[28px] border ${a.border} bg-ink-850/90 p-5 [backface-visibility:hidden]`}
              style={{
                transform: `rotateY(${i * 90}deg) translateZ(calc(min(68vw,260px) / 2))`,
                boxShadow: `inset 0 0 60px -20px ${a.hex}66, 0 0 80px -30px ${a.hex}`,
              }}
            >
              <div className="flex items-center justify-between">
                <Icon className={a.text} size={26} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist-500">0{i + 1}/04</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {faceGlyphs[g.id].map((t) => (
                  <span key={t} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-center font-mono text-[11px] text-mist-300">
                    {t}
                  </span>
                ))}
              </div>
              <p className="font-display text-2xl font-semibold tracking-tight">{g.title}</p>
            </div>
          )
        })}
        {/* top & bottom caps */}
        {[90, -90].map((x) => (
          <div
            key={x}
            className="grid-bg absolute inset-0 rounded-[28px] border border-white/10 bg-ink-900"
            style={{ transform: `rotateX(${x}deg) translateZ(calc(min(68vw,260px) / 2))` }}
          />
        ))}
      </div>
    </div>
  )
}

export function Skills() {
  const [active, setActive] = useState(0)
  const group = skillGroups[active]
  const a = accent[group.accent]
  const { reduced } = useMotionPrefs()

  return (
    <section id="skills" className="relative overflow-hidden py-28 sm:py-40" aria-labelledby="skills-heading">
      <div className="pointer-events-none absolute left-1/2 top-40 h-[50vmax] w-[50vmax] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(109,108,247,0.09),transparent)]" aria-hidden />
      <div className="container-x relative">
        <span id="skills-heading" className="sr-only">Technical skills</span>
        <SectionHeading
          eyebrow="Technical skills"
          title="A *Laravel* core, with reach across the stack."
          intro="Proficiency is shown honestly: Laravel and the PHP/MySQL backend are where I’m strongest; React, AWS, Next.js and Flutter sit where they really are today."
        />

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:sticky lg:top-28 lg:col-span-4">
            <Reveal>
              <SkillCube index={active} onSelect={setActive} />
              <p className="mt-6 text-center text-xs text-mist-500">Drag the cube or pick a category</p>
            </Reveal>
            <Reveal delay={0.1} className="glass mt-8 rounded-2xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist-500">Proficiency key</p>
              <ul className="mt-4 space-y-2.5">
                {(Object.keys(levelInfo) as Level[]).map((l) => (
                  <li key={l} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-3">
                      <LevelDots level={l} color="#ff7a1a" />
                      <span className="font-medium">{levelInfo[l].label}</span>
                    </span>
                    <span className="text-right text-xs text-mist-500">{levelInfo[l].note}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <div role="tablist" aria-label="Skill categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              {skillGroups.map((g, i) => {
                const Icon = icons[g.id]
                const on = i === active
                return (
                  <button
                    key={g.id}
                    role="tab"
                    id={`tab-${g.id}`}
                    aria-selected={on}
                    aria-controls={`panel-${g.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + skillGroups.length) % skillGroups.length
                        setActive(next)
                        document.getElementById(`tab-${skillGroups[next].id}`)?.focus()
                      }
                    }}
                    className={`relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                      on ? 'border-transparent text-ink-950' : 'border-white/10 text-mist-300 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {on && <motion.span layoutId="skill-tab" className={`absolute inset-0 -z-0 rounded-full ${accent[g.accent].bg}`} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                    <Icon size={16} className="relative" />
                    <span className="relative font-medium">{g.title}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={group.id}
                id={`panel-${group.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${group.id}`}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">{group.title}</h3>
                  <span className={`font-mono text-xs uppercase tracking-[0.2em] ${a.text}`}>{group.kicker}</span>
                </div>
                <p className="mt-3 max-w-xl text-mist-400">{group.description}</p>

                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {group.items.map((s, i) => (
                    <motion.li
                      key={s.name}
                      className="h-full"
                      initial={reduced ? false : { opacity: 0, y: 14, rotateX: -20 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <TiltCard max={6} className="h-full rounded-2xl">
                        <div className="flex h-full items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
                          <span className="text-[15px] font-medium leading-snug">{s.name}</span>
                          <span className="flex shrink-0 items-center gap-3">
                            <span className="hidden text-xs text-mist-500 sm:inline">{levelInfo[s.level].label}</span>
                            <LevelDots level={s.level} color={a.hex} />
                            <span className="sr-only">Proficiency: {levelInfo[s.level].label}</span>
                          </span>
                        </div>
                      </TiltCard>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <Reveal className="mt-14">
              <div className="flex items-center gap-3">
                <Wrench size={16} className="text-ember-400" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-mist-400">Tools I use daily</h3>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {tools.map((t) => (
                  <li key={t} className="chip px-4 py-1.5 text-sm transition-colors hover:border-ember-500/50 hover:text-white">
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
