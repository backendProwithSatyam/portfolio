import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, ChevronLeft, ChevronRight, Lock, MessageSquare, Plus, RotateCcw, ShieldCheck, User, X } from 'lucide-react'
import { lockScroll } from '../lib/smoothScroll'

/*
 * A self-contained, client-side model of the CRM workflow: roles & permissions,
 * stages, assignment, comments, activity history and a stage report.
 * All data is fictional sample data and lives only in memory.
 */

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] as const
type Stage = (typeof STAGES)[number]
type Role = 'admin' | 'agent'
type Activity = { at: string; by: string; text: string }
type Lead = { id: number; name: string; source: string; course: string; stage: Stage; owner: string; comments: Activity[]; history: Activity[] }

const AGENTS = ['Aarav (you)', 'Meera', 'Kabir']
const ME = AGENTS[0]
const stageColor: Record<Stage, string> = { New: '#8b8cff', Contacted: '#5cc8ff', Qualified: '#ffb57a', Proposal: '#ff7a1a', Won: '#34d399', Lost: '#71717a' }

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

function seed(): Lead[] {
  const rows: [string, string, string, Stage, string][] = [
    ['Riya Verma', 'Website form', 'Data Analytics', 'New', ME],
    ['Arjun Mehta', 'Facebook Ads', 'Full-Stack Web', 'New', 'Meera'],
    ['Sneha Iyer', 'Webhook · Landing page', 'Data Science', 'Contacted', ME],
    ['Vikram Rao', 'Referral', 'Cloud Computing', 'Qualified', 'Kabir'],
    ['Pooja Nair', 'Google Ads', 'Data Analytics', 'Proposal', ME],
    ['Rahul Das', 'Website form', 'Full-Stack Web', 'Won', 'Meera'],
    ['Ananya Gupta', 'Walk-in', 'Data Science', 'Lost', 'Kabir'],
    ['Karan Singh', 'Webhook · Landing page', 'Cloud Computing', 'Contacted', 'Meera'],
  ]
  return rows.map(([name, source, course, stage, owner], i) => ({
    id: i + 1,
    name,
    source,
    course,
    stage,
    owner,
    comments: i === 2 ? [{ at: '10:12', by: ME, text: 'Asked for weekend batch timings.' }] : [],
    history: [{ at: '09:00', by: 'System', text: `Lead captured via ${source} · assigned to ${owner}` }],
  }))
}

export function CrmDemo({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<Role>('admin')
  const [leads, setLeads] = useState<Lead[]>(seed)
  const [selected, setSelected] = useState<number | null>(null)
  const [view, setView] = useState<'board' | 'report'>('board')
  const [dragId, setDragId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const user = role === 'admin' ? 'Admin' : ME

  useEffect(() => {
    lockScroll(true)
    const prev = document.activeElement as HTMLElement | null
    dialog.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [onClose])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(id)
  }, [toast])

  // Agents only see their own leads — the same scoping a policy/query scope enforces server-side.
  const visible = useMemo(() => (role === 'admin' ? leads : leads.filter((l) => l.owner === ME)), [leads, role])
  const current = leads.find((l) => l.id === selected && visible.includes(l)) ?? null

  const update = (id: number, fn: (l: Lead) => Lead) => setLeads((ls) => ls.map((l) => (l.id === id ? fn(l) : l)))
  const log = (l: Lead, text: string): Lead => ({ ...l, history: [{ at: now(), by: user, text }, ...l.history] })

  const moveTo = (id: number, stage: Stage) => {
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.stage === stage) return
    if (role === 'agent' && lead.owner !== ME) return setToast('403 · You can only update leads assigned to you')
    update(id, (l) => log({ ...l, stage }, `Stage changed ${l.stage} → ${stage}`))
  }
  const step = (l: Lead, dir: 1 | -1) => {
    const i = STAGES.indexOf(l.stage) + dir
    if (i >= 0 && i < STAGES.length) moveTo(l.id, STAGES[i])
  }

  const addLead = () => {
    const id = Math.max(0, ...leads.map((l) => l.id)) + 1
    const names = ['Isha Kapoor', 'Dev Malhotra', 'Neha Joshi', 'Aditya Kumar', 'Tara Bose']
    const owner = AGENTS[id % AGENTS.length]
    const name = names[id % names.length]
    setLeads((ls) => [
      { id, name, source: 'Webhook · Landing page', course: 'Data Analytics', stage: 'New', owner, comments: [], history: [{ at: now(), by: 'System', text: `Lead captured via webhook · auto-assigned to ${owner} (round-robin)` }] },
      ...ls,
    ])
    setToast(`POST /api/leads → 201 · ${name} assigned to ${owner}`)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Interactive CRM demo"
        data-lenis-prevent
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-[94svh] w-full max-w-7xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 outline-none sm:h-[88vh] sm:rounded-3xl"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-6">
          <div className="mr-auto">
            <p className="font-display text-lg font-semibold tracking-tight">LeadFlow CRM <span className="ml-1 rounded-md bg-ember-500/15 px-1.5 py-0.5 font-mono text-[10px] text-ember-300">LIVE DEMO</span></p>
            <p className="text-xs text-mist-500">Runs in your browser with fictional sample data — a model of the Laravel CRM workflow.</p>
          </div>
          <div className="flex rounded-full border border-white/10 p-1 text-xs" role="group" aria-label="Sign in as">
            {(['admin', 'agent'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${role === r ? 'bg-white text-ink-950' : 'text-mist-400 hover:text-white'}`}
              >
                {r === 'admin' ? <ShieldCheck size={13} /> : <User size={13} />}
                {r === 'admin' ? 'Admin' : 'Sales agent'}
              </button>
            ))}
          </div>
          <div className="flex rounded-full border border-white/10 p-1 text-xs">
            <button onClick={() => setView('board')} aria-pressed={view === 'board'} className={`rounded-full px-3 py-1.5 ${view === 'board' ? 'bg-white/10 text-white' : 'text-mist-400'}`}>Pipeline</button>
            <button onClick={() => setView('report')} aria-pressed={view === 'report'} className={`flex items-center gap-1 rounded-full px-3 py-1.5 ${view === 'report' ? 'bg-white/10 text-white' : 'text-mist-400'}`}>
              <BarChart3 size={13} /> Report
            </button>
          </div>
          <button onClick={() => { setLeads(seed()); setSelected(null) }} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist-400 hover:text-white" aria-label="Reset demo data">
            <RotateCcw size={15} />
          </button>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close demo">
            <X size={17} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-white/[0.05] bg-white/[0.015] px-4 py-2 text-xs text-mist-400 sm:px-6">
          {role === 'admin' ? (
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Admin: sees all {leads.length} leads, can reassign.</span>
          ) : (
            <span className="flex items-center gap-1.5"><Lock size={13} className="text-ember-400" /> Agent scope: only leads assigned to {ME} ({visible.length}). Reassignment disabled.</span>
          )}
          <button onClick={addLead} className="ml-auto flex items-center gap-1 rounded-full bg-ember-500 px-3 py-1.5 font-medium text-ink-950 hover:bg-ember-400">
            <Plus size={13} /> Simulate webhook lead
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {view === 'board' ? (
            <div className="no-scrollbar flex min-h-0 flex-1 gap-3 overflow-x-auto p-4 sm:p-5">
              {STAGES.map((stage) => {
                const items = visible.filter((l) => l.stage === stage)
                return (
                  <section
                    key={stage}
                    aria-label={`${stage} stage`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dragId !== null && moveTo(dragId, stage)}
                    className="flex w-60 shrink-0 flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <header className="flex items-center justify-between px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <span className="h-2 w-2 rounded-full" style={{ background: stageColor[stage] }} /> {stage}
                      </span>
                      <span className="font-mono text-xs text-mist-500">{items.length}</span>
                    </header>
                    <ul className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                      {items.map((l) => (
                        <motion.li layout key={l.id} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}>
                          <div
                            draggable
                            onDragStart={() => setDragId(l.id)}
                            onDragEnd={() => setDragId(null)}
                            className={`group rounded-xl border bg-ink-800 p-3 transition ${selected === l.id ? 'border-ember-500/60' : 'border-white/[0.07] hover:border-white/20'}`}
                          >
                            <button onClick={() => setSelected(l.id)} className="block w-full text-left">
                              <span className="block text-sm font-medium">{l.name}</span>
                              <span className="mt-0.5 block text-xs text-mist-500">{l.course}</span>
                              <span className="mt-2 flex items-center justify-between text-[11px] text-mist-400">
                                <span>{l.owner}</span>
                                {l.comments.length > 0 && <span className="flex items-center gap-1"><MessageSquare size={11} /> {l.comments.length}</span>}
                              </span>
                            </button>
                            <div className="mt-2 flex justify-between border-t border-white/[0.06] pt-2">
                              <button onClick={() => step(l, -1)} disabled={stage === 'New'} className="rounded-md p-1 text-mist-400 hover:bg-white/10 hover:text-white disabled:opacity-25" aria-label={`Move ${l.name} to previous stage`}><ChevronLeft size={14} /></button>
                              <button onClick={() => step(l, 1)} disabled={stage === 'Lost'} className="rounded-md p-1 text-mist-400 hover:bg-white/10 hover:text-white disabled:opacity-25" aria-label={`Move ${l.name} to next stage`}><ChevronRight size={14} /></button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                      {items.length === 0 && <li className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-mist-500">Drop leads here</li>}
                    </ul>
                  </section>
                )
              })}
            </div>
          ) : (
            <Report leads={visible} />
          )}

          {current && view === 'board' && (
            <LeadPanel
              key={current.id}
              lead={current}
              role={role}
              onClose={() => setSelected(null)}
              onStage={(s) => moveTo(current.id, s)}
              onAssign={(owner) => update(current.id, (l) => log({ ...l, owner }, `Reassigned ${l.owner} → ${owner}`))}
              onComment={(text) => update(current.id, (l) => log({ ...l, comments: [{ at: now(), by: user, text }, ...l.comments] }, 'Added a comment'))}
            />
          )}
        </div>

        {toast && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} role="status" className="max-w-full truncate rounded-full border border-white/10 bg-ink-700 px-4 py-2 font-mono text-xs text-mist-100 shadow-2xl">
              {toast}
            </motion.p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function LeadPanel({ lead, role, onClose, onStage, onAssign, onComment }: { lead: Lead; role: Role; onClose: () => void; onStage: (s: Stage) => void; onAssign: (o: string) => void; onComment: (t: string) => void }) {
  const [text, setText] = useState('')
  return (
    <aside className="absolute inset-x-0 bottom-0 z-10 flex max-h-[75%] flex-col border-t border-white/10 bg-ink-850 md:static md:max-h-none md:w-[340px] md:border-l md:border-t-0" aria-label={`Lead details: ${lead.name}`}>
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-4">
        <div>
          <p className="font-display text-lg font-semibold">{lead.name}</p>
          <p className="text-xs text-mist-500">{lead.course} · {lead.source}</p>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-mist-400 hover:bg-white/10" aria-label="Close lead details"><X size={15} /></button>
      </div>
      <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-mist-500">
            Stage
            <select value={lead.stage} onChange={(e) => onStage(e.target.value as Stage)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-2 py-1.5 text-sm text-mist-100">
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-mist-500">
            Assigned to {role === 'agent' && <Lock size={10} className="inline" />}
            <select disabled={role !== 'admin'} value={lead.owner} onChange={(e) => onAssign(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-2 py-1.5 text-sm text-mist-100 disabled:opacity-50">
              {AGENTS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) {
              onComment(text.trim())
              setText('')
            }
          }}
        >
          <label htmlFor="crm-comment" className="text-xs text-mist-500">Add comment</label>
          <div className="mt-1 flex gap-2">
            <input id="crm-comment" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Called, wants a demo class" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 text-sm placeholder:text-mist-500" />
            <button className="rounded-lg bg-white px-3 text-xs font-medium text-ink-950">Post</button>
          </div>
        </form>

        {lead.comments.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Comments</p>
            <ul className="mt-2 space-y-2">
              {lead.comments.map((c, i) => (
                <li key={i} className="rounded-lg bg-white/[0.04] p-2.5">
                  <p>{c.text}</p>
                  <p className="mt-1 text-[11px] text-mist-500">{c.by} · {c.at}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Activity history</p>
          <ol className="mt-2 space-y-2 border-l border-white/10 pl-3">
            {lead.history.map((h, i) => (
              <li key={i} className="text-xs">
                <p className="text-mist-300">{h.text}</p>
                <p className="text-mist-500">{h.by} · {h.at}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  )
}

function Report({ leads }: { leads: Lead[] }) {
  const max = Math.max(1, ...STAGES.map((s) => leads.filter((l) => l.stage === s).length))
  const won = leads.filter((l) => l.stage === 'Won').length
  const closed = won + leads.filter((l) => l.stage === 'Lost').length
  const byOwner = AGENTS.map((a) => ({ a, n: leads.filter((l) => l.owner === a).length })).filter((x) => x.n > 0)
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto p-5 sm:p-8">
      <p className="text-xs text-mist-500">Computed live from the {leads.length} sample leads visible to this role.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ['Leads in view', leads.length],
          ['Won', won],
          ['Win rate (closed)', closed ? `${Math.round((won / closed) * 100)}%` : '—'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-xs text-mist-500">{k}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-sm font-medium">Leads by stage</p>
          <ul className="mt-4 space-y-3">
            {STAGES.map((s) => {
              const n = leads.filter((l) => l.stage === s).length
              return (
                <li key={s} className="grid grid-cols-[80px_1fr_24px] items-center gap-3 text-xs">
                  <span className="text-mist-400">{s}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.span className="block h-full rounded-full" style={{ background: stageColor[s] }} initial={{ width: 0 }} animate={{ width: `${(n / max) * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
                  </span>
                  <span className="text-right font-mono">{n}</span>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-sm font-medium">Leads by owner</p>
          <ul className="mt-4 space-y-3">
            {byOwner.map(({ a, n }) => (
              <li key={a} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm">
                <span>{a}</span>
                <span className="font-mono text-mist-400">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
