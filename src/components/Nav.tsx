import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, Search, X } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { lockScroll, scrollToTarget } from '../lib/smoothScroll'
import { useMotionPrefs } from '../lib/motion'
import { emit, OPEN_PALETTE } from '../lib/events'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const { reduced } = useMotionPrefs()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    navLinks.forEach((l) => {
      const el = document.querySelector(l.href)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    lockScroll(open)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // Wait for the menu to release the scroll lock before scrolling.
    requestAnimationFrame(() => scrollToTarget(href, reduced))
    history.replaceState(null, '', href)
  }

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={`flex items-center justify-between rounded-full pl-5 pr-2 transition-all duration-500 ${
              scrolled ? 'glass h-14 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]' : 'h-14 border border-transparent'
            }`}
          >
            <a href="#top" onClick={go('#top')} className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight" aria-label="Satyam Shukla — back to top">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-ember-500 text-sm font-bold text-ink-950">S</span>
              <span className="hidden sm:inline">Satyam Shukla</span>
            </a>
            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={go(l.href)}
                    aria-current={active === l.href ? 'true' : undefined}
                    className={`relative rounded-full px-4 py-2 text-sm transition-colors ${active === l.href ? 'text-white' : 'text-mist-400 hover:text-white'}`}
                  >
                    {active === l.href && (
                      <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                    )}
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => emit(OPEN_PALETTE)}
                aria-label="Open command palette"
                className="flex h-10 items-center gap-2 rounded-full bg-white/[0.06] px-3 text-sm text-mist-400 transition hover:bg-white/10 hover:text-white"
              >
                <Search size={15} />
                <kbd className="hidden font-mono text-[11px] xl:inline">⌘K</kbd>
              </button>
              <a
                href="#contact"
                onClick={go('#contact')}
                className="hidden h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-ink-950 transition hover:bg-ember-400 sm:inline-flex"
              >
                Hire me <ArrowUpRight size={15} />
              </a>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] lg:hidden"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: 'circle(0% at 92% 6%)' }}
            animate={{ clipPath: 'circle(150% at 92% 6%)' }}
            exit={{ clipPath: 'circle(0% at 92% 6%)' }}
            transition={{ duration: reduced ? 0 : 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-ink-900 px-6 pb-10 pt-28 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.7 }}>
                  <a href={l.href} onClick={go(l.href)} className="flex items-baseline gap-4 py-2 font-display text-[2.6rem] font-semibold leading-none tracking-tight">
                    <span className="font-mono text-xs text-ember-500">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto space-y-2 text-sm text-mist-400">
              <a className="block text-mist-100" href={`mailto:${profile.email}`}>{profile.email}</a>
              <a className="block" href={profile.phoneHref}>{profile.phone}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
