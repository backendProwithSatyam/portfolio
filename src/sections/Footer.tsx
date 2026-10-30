import { useEffect, useRef } from 'react'
import { ArrowUp, Linkedin, Mail, Phone } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { Magnetic } from '../components/Magnetic'
import { scrollToTarget } from '../lib/smoothScroll'
import { useMotionPrefs } from '../lib/motion'

/** Back-to-top button whose ring fills with page scroll progress. */
function BackToTop() {
  const ring = useRef<SVGCircleElement>(null)
  const { reduced } = useMotionPrefs()
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      ring.current?.setAttribute('stroke-dashoffset', String(1 - (max > 0 ? window.scrollY / max : 0)))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <Magnetic strength={0.45}>
      <button onClick={() => scrollToTarget(0, reduced)} className="group relative grid h-16 w-16 place-items-center rounded-full" aria-label="Back to top">
        <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <circle ref={ring} cx="32" cy="32" r="30" fill="none" stroke="#ff7a1a" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        </svg>
        <ArrowUp size={18} className="transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </Magnetic>
  )
}

export function Footer() {
  const { reduced } = useMotionPrefs()
  return (
    <footer className="relative border-t border-white/[0.06] pt-16">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-semibold tracking-tight">{profile.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">{profile.roles.join(' · ')}. Building with Laravel, from backend to cloud.</p>
            <div className="mt-6 flex gap-2">
              {[
                { href: profile.linkedin, icon: Linkedin, label: 'LinkedIn', ext: true },
                { href: `mailto:${profile.email}`, icon: Mail, label: 'Email' },
                { href: profile.phoneHref, icon: Phone, label: 'Phone' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  {...(s.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-mist-300 transition hover:border-ember-500/60 hover:text-ember-300"
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTarget(l.href, reduced)
                }}
                className="text-mist-400 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <a href={profile.resume} download className="text-mist-400 transition hover:text-white">Resume</a>
          </nav>
          <div className="self-start md:self-end">
            <BackToTop />
          </div>
        </div>

        {/* SVG text scales to the container's exact width, so the name never clips at any screen size. */}
        <svg viewBox="0 0 1000 175" className="mt-16 block h-auto w-full select-none" aria-hidden>
          <defs>
            <linearGradient id="footer-name" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="1" stopColor="rgba(255,122,26,0.04)" />
            </linearGradient>
          </defs>
          <text
            x="500"
            y="132"
            textAnchor="middle"
            textLength="990"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#footer-name)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="font-display"
            style={{ fontSize: 158, fontWeight: 600, letterSpacing: '-0.04em' }}
          >
            Satyam Shukla
          </text>
        </svg>
        <div className="flex flex-col justify-between gap-2 border-t border-white/[0.06] py-6 text-xs text-mist-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <p>Built with React, TypeScript, Three.js, GSAP & Framer Motion.</p>
        </div>
      </div>
    </footer>
  )
}
