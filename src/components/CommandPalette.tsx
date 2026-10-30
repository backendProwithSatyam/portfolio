import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Copy, CornerDownLeft, Download, Hash, Linkedin, Mail, Phone, Play, Search, Terminal } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { lockScroll, scrollToTarget } from '../lib/smoothScroll'
import { emit, OPEN_CRM_DEMO, OPEN_PALETTE } from '../lib/events'
import { useMotionPrefs } from '../lib/motion'

type Action = { id: string; label: string; hint: string; group: string; icon: typeof Hash; run: () => void }

/** ⌘K / Ctrl+K quick actions: jump to sections, copy contact details, open the demo. */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const { reduced } = useMotionPrefs()

  const actions = useMemo<Action[]>(() => {
    const go = (href: string) => () => scrollToTarget(href, reduced)
    return [
      ...navLinks.map((l) => ({ id: l.href, label: l.label, hint: 'Jump to section', group: 'Navigate', icon: Hash, run: go(l.href) })),
      { id: 'terminal', label: 'Terminal', hint: 'Jump to section', group: 'Navigate', icon: Terminal, run: go('#terminal') },
      { id: 'demo', label: 'Launch CRM live demo', hint: 'Interactive', group: 'Actions', icon: Play, run: () => emit(OPEN_CRM_DEMO) },
      {
        id: 'resume', label: 'Download resume', hint: 'PDF', group: 'Actions', icon: Download,
        run: () => { const a = document.createElement('a'); a.href = profile.resume; a.download = ''; a.click() },
      },
      {
        id: 'copy', label: 'Copy email address', hint: profile.email, group: 'Contact', icon: Copy,
        run: () => { navigator.clipboard?.writeText(profile.email).then(() => setCopied(true)).catch(() => {}) },
      },
      { id: 'mail', label: 'Send an email', hint: profile.email, group: 'Contact', icon: Mail, run: () => { window.location.href = `mailto:${profile.email}` } },
      { id: 'call', label: 'Call', hint: profile.phone, group: 'Contact', icon: Phone, run: () => { window.location.href = profile.phoneHref } },
      { id: 'li', label: 'Open LinkedIn', hint: 'New tab', group: 'Contact', icon: Linkedin, run: () => window.open(profile.linkedin, '_blank', 'noopener') },
    ]
  }, [reduced])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? actions.filter((a) => `${a.label} ${a.hint} ${a.group}`.toLowerCase().includes(q)) : actions
  }, [actions, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_PALETTE, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_PALETTE, onOpen)
    }
  }, [])

  useEffect(() => {
    lockScroll(open)
    if (open) {
      setQuery('')
      setIndex(0)
      setCopied(false)
      requestAnimationFrame(() => input.current?.focus())
    }
  }, [open])

  useEffect(() => setIndex(0), [query])

  useEffect(() => {
    list.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [index])

  const choose = (a: Action | undefined) => {
    if (!a) return
    a.run()
    // Keep the palette open briefly so "copied" feedback is visible.
    if (a.id === 'copy') setTimeout(() => setOpen(false), 700)
    else setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(results.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[index]) }
  }

  let lastGroup = ''
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] flex items-start justify-center bg-black/70 px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            data-lenis-prevent
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.9)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search size={17} className="text-mist-500" />
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections and actions…"
                aria-label="Search commands"
                aria-controls="palette-list"
                aria-activedescendant={results[index] ? `pal-${results[index].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[15px] text-mist-100 placeholder:text-mist-500 focus:outline-none"
              />
              <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-mist-500">ESC</kbd>
            </div>
            <ul ref={list} id="palette-list" role="listbox" className="no-scrollbar max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-mist-500">No matches for “{query}”</li>}
              {results.map((a, i) => {
                const header = a.group !== lastGroup ? a.group : null
                lastGroup = a.group
                return (
                  <li key={a.id} role="presentation">
                    {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-500">{header}</p>}
                    <button
                      id={`pal-${a.id}`}
                      role="option"
                      aria-selected={i === index}
                      data-index={i}
                      tabIndex={-1}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => choose(a)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${i === index ? 'bg-white/[0.07] text-white' : 'text-mist-300'}`}
                    >
                      <a.icon size={16} className={i === index ? 'text-ember-400' : 'text-mist-500'} />
                      <span className="flex-1">{a.id === 'copy' && copied ? 'Copied to clipboard ✓' : a.label}</span>
                      <span className="hidden truncate text-xs text-mist-500 sm:block">{a.hint}</span>
                      {i === index ? <CornerDownLeft size={14} className="text-mist-500" /> : <ArrowRight size={14} className="opacity-0" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
