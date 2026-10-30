import { useEffect, useRef, useState, type ReactNode } from 'react'
import { about, experience, levelInfo, profile, projects, skillGroups, tools } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { scrollToTarget } from '../lib/smoothScroll'
import { emit, OPEN_CRM_DEMO } from '../lib/events'
import { useMotionPrefs } from '../lib/motion'

type Line = { id: number; kind: 'in' | 'out'; body: ReactNode }

const Accent = ({ children }: { children: ReactNode }) => <span className="text-ember-400">{children}</span>
const Dim = ({ children }: { children: ReactNode }) => <span className="text-mist-500">{children}</span>

const COMMANDS: Record<string, string> = {
  help: 'list available commands',
  whoami: 'a short introduction',
  experience: 'where I work and what I own',
  skills: 'stack with honest proficiency levels',
  projects: 'featured work',
  demo: 'open the live CRM demo',
  contact: 'ways to reach me',
  resume: 'download my resume (PDF)',
  hire: 'the fastest route to a conversation',
  clear: 'clear the screen',
}

const SUGGESTIONS = ['help', 'whoami', 'skills', 'projects', 'demo', 'hire']

/** An interactive shell: a quick way to explore the portfolio for people who like typing. */
export function Terminal() {
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const nextId = useRef(0)
  const screen = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const { reduced } = useMotionPrefs()

  const print = (kind: Line['kind'], body: ReactNode) => setLines((ls) => [...ls, { id: nextId.current++, kind, body }])

  useEffect(() => {
    print('out', (
      <>
        Welcome to <Accent>satyam.sh</Accent> — type <Accent>help</Accent> or tap a command below.
      </>
    ))
  }, [])

  useEffect(() => {
    const el = screen.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return
    setHistory((h) => [...h, cmd])
    setCursor(-1)
    if (cmd === 'clear') return setLines([])
    print('in', cmd)

    switch (cmd) {
      case 'help':
        return print('out', (
          <div className="grid gap-x-6 sm:grid-cols-[110px_1fr]">
            {Object.entries(COMMANDS).map(([k, v]) => (
              <div key={k} className="contents">
                <Accent>{k}</Accent>
                <Dim>{v}</Dim>
              </div>
            ))}
          </div>
        ))
      case 'whoami':
      case 'about':
        return print('out', (
          <>
            <p><Accent>{profile.name}</Accent> — {profile.roles.join(' · ')}</p>
            <p className="mt-1 text-mist-400">{about.lead}</p>
          </>
        ))
      case 'experience':
        return print('out', (
          <>
            <p>{experience.role} @ <Accent>{experience.company}</Accent> <Dim>({experience.duration})</Dim></p>
            <ul className="mt-1">
              {experience.tracks.map((t) => <li key={t.title}><Dim>▸</Dim> {t.title}</li>)}
            </ul>
          </>
        ))
      case 'skills':
      case 'stack':
        return print('out', (
          <div className="space-y-1.5">
            {skillGroups.map((g) => (
              <p key={g.id}>
                <Accent>{g.title.padEnd(15, ' ')}</Accent>
                {g.items.slice(0, 6).map((i) => `${i.name} [${levelInfo[i.level].label}]`).join(', ')}
                {g.items.length > 6 && <Dim> +{g.items.length - 6} more</Dim>}
              </p>
            ))}
            <p><Accent>{'Tools'.padEnd(15, ' ')}</Accent>{tools.join(', ')}</p>
          </div>
        ))
      case 'projects':
      case 'ls':
        return print('out', (
          <ul>
            {projects.map((p) => (
              <li key={p.id}><Dim>{p.index}</Dim> <Accent>{p.title}</Accent> <Dim>— {p.status}</Dim></li>
            ))}
            <li className="mt-1 text-mist-400">Tip: run <Accent>demo</Accent> to try the CRM.</li>
          </ul>
        ))
      case 'demo':
        emit(OPEN_CRM_DEMO)
        return print('out', 'Opening the LeadFlow CRM demo…')
      case 'contact':
        return print('out', (
          <ul>
            <li>email    <a className="text-ember-400 underline-offset-4 hover:underline" href={`mailto:${profile.email}`}>{profile.email}</a></li>
            <li>phone    <a className="text-ember-400 underline-offset-4 hover:underline" href={profile.phoneHref}>{profile.phone}</a></li>
            <li>linkedin <a className="text-ember-400 underline-offset-4 hover:underline" href={profile.linkedin} target="_blank" rel="noreferrer">{profile.linkedinLabel}</a></li>
          </ul>
        ))
      case 'resume': {
        const a = document.createElement('a')
        a.href = profile.resume
        a.download = ''
        a.click()
        return print('out', 'Downloading Satyam-Shukla-Resume.pdf…')
      }
      case 'hire':
      case 'sudo hire satyam':
        setTimeout(() => scrollToTarget('#contact', reduced), 500)
        return print('out', <span className="text-emerald-400">✓ Great choice. Taking you to the contact form…</span>)
      case 'sudo':
        return print('out', <>Nice try. Did you mean <Accent>sudo hire satyam</Accent>?</>)
      case 'php artisan serve':
        return print('out', <>Server running on <Accent>[http://satyam.dev]</Accent>. Press Ctrl+C to… actually, just keep scrolling.</>)
      default:
        return print('out', <>command not found: {cmd}. Type <Accent>help</Accent>.</>)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const i = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1)
      setCursor(i)
      setInput(history[i])
    } else if (e.key === 'ArrowDown' && cursor !== -1) {
      e.preventDefault()
      const i = cursor + 1
      if (i >= history.length) {
        setCursor(-1)
        setInput('')
      } else {
        setCursor(i)
        setInput(history[i])
      }
    } else if (e.key === 'Tab' && input) {
      const match = Object.keys(COMMANDS).find((c) => c.startsWith(input.toLowerCase()))
      if (match) {
        e.preventDefault()
        setInput(match)
      }
    }
  }

  return (
    <section id="terminal" className="relative py-28 sm:py-36" aria-label="Interactive terminal">
      <div className="container-x">
        <SectionHeading
          eyebrow="Try it yourself"
          title="Prefer the *command* line?"
          intro="Explore my skills, projects and contact details from a working shell. Tab completes, ↑ / ↓ recall history."
        />
        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#07070a] shadow-[0_40px_120px_-40px_rgba(255,122,26,0.35)]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-mist-500">visitor@satyam.sh — zsh</span>
            </div>
            <div
              ref={screen}
              onClick={() => field.current?.focus({ preventScroll: true })}
              data-lenis-prevent
              className="no-scrollbar h-[360px] overflow-y-auto p-5 font-mono text-[13px] leading-6 text-mist-300 sm:h-[420px] sm:text-sm"
              role="log"
              aria-live="polite"
            >
              {lines.map((l) => (
                <div key={l.id} className={l.kind === 'in' ? 'mt-3 text-mist-100' : 'whitespace-pre-wrap'}>
                  {l.kind === 'in' ? <><span className="text-emerald-400">➜</span> <span className="text-aqua-400">~</span> {l.body}</> : l.body}
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-emerald-400">➜</span>
                <span className="text-aqua-400">~</span>
                <label htmlFor="term-input" className="sr-only">Terminal command</label>
                <input
                  id="term-input"
                  ref={field}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  placeholder="type a command…"
                  className="min-w-0 flex-1 bg-transparent text-mist-100 caret-ember-500 placeholder:text-mist-500/60 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-5 py-3">
              {SUGGESTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => run(c)}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-mist-400 transition hover:border-ember-500/50 hover:text-ember-300"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
