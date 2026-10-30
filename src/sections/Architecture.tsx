import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Cog, Database, Globe, HardDrive, Layers, Play, Send, Server, Smartphone, Zap } from 'lucide-react'
import { expertise } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { TiltCard } from '../components/TiltCard'
import { useMotionPrefs } from '../lib/motion'

type NodeId = 'client' | 'mobile' | 'nginx' | 'middleware' | 'controller' | 'service' | 'mysql' | 's3' | 'queue' | 'external'

const nodes: Record<NodeId, { label: string; sub: string; icon: typeof Globe }> = {
  client: { label: 'Web client', sub: 'Blade · React', icon: Globe },
  mobile: { label: 'Mobile app', sub: 'Flutter', icon: Smartphone },
  nginx: { label: 'Nginx + SSL', sub: 'Ubuntu · AWS EC2', icon: Server },
  middleware: { label: 'Middleware', sub: 'Auth · RBAC · throttle', icon: Layers },
  controller: { label: 'Controller', sub: 'Form Request validation', icon: Cog },
  service: { label: 'Service + Eloquent', sub: 'Business logic', icon: Zap },
  mysql: { label: 'MySQL', sub: 'Indexed schema', icon: Database },
  s3: { label: 'Storage', sub: 'AWS S3', icon: HardDrive },
  queue: { label: 'Queue workers', sub: 'Jobs · scheduler', icon: Send },
  external: { label: 'Third-party APIs', sub: 'Webhooks · mail · SMS', icon: Cloud },
}

const columns: { title: string; ids: NodeId[] }[] = [
  { title: 'Clients', ids: ['client', 'mobile'] },
  { title: 'Edge', ids: ['nginx'] },
  { title: 'Laravel', ids: ['middleware', 'controller', 'service'] },
  { title: 'Data', ids: ['mysql', 's3'] },
  { title: 'Async', ids: ['queue', 'external'] },
]

type Scenario = { id: string; label: string; steps: { node: NodeId; log: string }[] }

const scenarios: Scenario[] = [
  {
    id: 'lead',
    label: 'Create a lead',
    steps: [
      { node: 'client', log: 'POST /api/leads  {name, phone, course}' },
      { node: 'nginx', log: 'TLS terminated → php-fpm' },
      { node: 'middleware', log: 'auth ✓  can:create,Lead ✓' },
      { node: 'controller', log: 'StoreLeadRequest validated' },
      { node: 'service', log: 'LeadService::create() → round-robin owner' },
      { node: 'mysql', log: 'INSERT INTO leads … ; INSERT INTO lead_activities …' },
      { node: 'queue', log: 'dispatch(NotifyAssignedAgent)' },
      { node: 'client', log: '← 201 Created  { data: LeadResource }' },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile login',
    steps: [
      { node: 'mobile', log: 'POST /api/login  {email, password}' },
      { node: 'nginx', log: 'Rate-limited route → Laravel' },
      { node: 'middleware', log: 'throttle:login ✓' },
      { node: 'controller', log: 'LoginRequest validated' },
      { node: 'service', log: 'Hash::check() → issue API token' },
      { node: 'mysql', log: 'INSERT INTO personal_access_tokens …' },
      { node: 'mobile', log: '← 200 OK  { token, user } stored securely' },
    ],
  },
  {
    id: 'webhook',
    label: 'Incoming webhook',
    steps: [
      { node: 'external', log: 'POST /webhooks/leads  (ad platform)' },
      { node: 'nginx', log: 'Forward to Laravel' },
      { node: 'middleware', log: 'Verify signature ✓' },
      { node: 'controller', log: 'Acknowledge fast → 200' },
      { node: 'queue', log: 'ProcessWebhookLead queued' },
      { node: 'service', log: 'De-duplicate by phone, map fields' },
      { node: 'mysql', log: 'UPSERT leads; log activity' },
      { node: 's3', log: 'Store raw payload for audit' },
    ],
  },
]

function ArchNode({ id, active, visited }: { id: NodeId; active: boolean; visited: boolean }) {
  const n = nodes[id]
  const Icon = n.icon
  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-500 ${
        active
          ? 'scale-[1.03] border-ember-500/80 bg-ember-500/10 shadow-[0_0_40px_-8px_rgba(255,122,26,0.7)]'
          : visited
            ? 'border-ember-500/25 bg-white/[0.03]'
            : 'border-white/[0.08] bg-white/[0.02]'
      }`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${active ? 'bg-ember-500 text-ink-950' : 'bg-white/[0.06] text-mist-300'}`}>
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight">{n.label}</span>
        <span className="block truncate text-[11px] text-mist-500">{n.sub}</span>
      </span>
      {active && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-ember-400" />}
    </div>
  )
}

function FlowDiagram() {
  const [scenario, setScenario] = useState(scenarios[0])
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const timer = useRef<number>()
  const auto = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPrefs()

  const run = (s = scenario) => {
    window.clearInterval(timer.current)
    setScenario(s)
    setRunning(true)
    setStep(0)
    let i = 0
    timer.current = window.setInterval(() => {
      i++
      if (i >= s.steps.length) {
        window.clearInterval(timer.current)
        setRunning(false)
        return
      }
      setStep(i)
    }, reduced ? 350 : 900)
  }

  // Play the first scenario once when the diagram comes into view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !auto.current) {
        auto.current = true
        run(scenarios[0])
      }
    }, { threshold: 0.4 })
    if (root.current) io.observe(root.current)
    return () => {
      io.disconnect()
      window.clearInterval(timer.current)
    }
  }, [])

  const activeNode = step >= 0 ? scenario.steps[step].node : null
  const visited = new Set(scenario.steps.slice(0, step + 1).map((s) => s.node))

  return (
    <div ref={root} className="glass overflow-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] p-4 sm:px-6">
        <span className="mr-auto font-mono text-xs uppercase tracking-[0.2em] text-mist-400">Request lifecycle</span>
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => run(s)}
            aria-pressed={scenario.id === s.id}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition ${scenario.id === s.id ? 'border-ember-500/60 bg-ember-500/10 text-ember-300' : 'border-white/10 text-mist-400 hover:text-white'}`}
          >
            {s.label}
          </button>
        ))}
        <button onClick={() => run()} disabled={running} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink-950 disabled:opacity-50">
          <Play size={12} fill="currentColor" /> {running ? 'Running…' : 'Replay'}
        </button>
      </div>

      <div className="grid gap-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-5 md:gap-3">
          {columns.map((c, ci) => (
            <div key={c.title} className="relative">
              <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-500">{c.title}</p>
              <div className="flex flex-col gap-2.5">
                {c.ids.map((id) => (
                  <ArchNode key={id} id={id} active={activeNode === id} visited={visited.has(id)} />
                ))}
              </div>
              {ci < columns.length - 1 && (
                <span className="flow-line pointer-events-none absolute -right-3 top-1/2 hidden h-px w-3 md:block" aria-hidden />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[236px] rounded-2xl border border-white/[0.07] bg-black/40 p-4 font-mono text-[11.5px] leading-5" aria-live="polite">
          <p className="mb-3 text-mist-500">$ tail -f storage/logs/request.log</p>
          <ol className="space-y-1.5">
            {scenario.steps.slice(0, step + 1).map((s, i) => (
              <motion.li key={`${scenario.id}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                <span className="text-ember-400">{String(i + 1).padStart(2, '0')}</span>
                <span className="hidden shrink-0 text-mist-500 sm:inline">[{nodes[s.node].label}]</span>
                <span className="text-mist-300">{s.log}</span>
              </motion.li>
            ))}
          </ol>
          {!running && step > 0 && <p className="mt-3 text-emerald-400">✓ request complete</p>}
        </div>
      </div>
    </div>
  )
}

export function Architecture() {
  return (
    <section id="architecture" className="relative py-28 sm:py-40" aria-label="Architecture and development expertise">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[40vmax] w-[40vmax] bg-[radial-gradient(closest-side,rgba(255,122,26,0.08),transparent)]" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Architecture & expertise"
          title="How the pieces fit, *end-to-end.*"
          intro="A request’s journey through the kind of system I build: client, Nginx on a Linux server, Laravel’s middleware and services, MySQL, and queued work for anything slow. Pick a scenario to trace it."
        />
        <Reveal className="mt-14">
          <FlowDiagram />
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((e, i) => (
            <Reveal key={e.title} delay={(i % 3) * 0.08}>
              <TiltCard className="h-full rounded-2xl">
                <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <span className="font-mono text-xs text-ember-400">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{e.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">{e.body}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
