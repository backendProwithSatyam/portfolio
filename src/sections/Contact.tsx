import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowUpRight, Check, Copy, Download, Linkedin, Loader2, Mail, Phone, Send } from 'lucide-react'
import { profile } from '../data/profile'
import { SplitText } from '../components/SplitText'
import { Reveal } from '../components/Reveal'
import { TiltCard } from '../components/TiltCard'

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Fields = { name: string; email: string; subject: string; message: string }
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'mailto' } | { kind: 'error'; message: string }

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (f.message.trim().length < 20) e.message = 'Tell me a little more — at least 20 characters.'
  if (f.message.length > 3000) e.message = 'Please keep it under 3000 characters.'
  return e
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-mist-300">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-error`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-300">
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-[15px] text-mist-100 placeholder:text-mist-500 transition focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-ember-500/60'

function ContactForm() {
  const [f, setF] = useState<Fields>({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({})
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [honey, setHoney] = useState('')

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...f, [k]: e.target.value }
    setF(next)
    if (touched) setErrors(validate(next))
  }

  const mailtoHref = () =>
    `mailto:${profile.email}?subject=${encodeURIComponent(f.subject.trim() || `Project enquiry from ${f.name.trim()}`)}&body=${encodeURIComponent(`${f.message.trim()}\n\n— ${f.name.trim()} (${f.email.trim()})`)}`

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const errs = validate(f)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`cf-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    if (honey) return // bot

    if (!ACCESS_KEY) {
      // No delivery service configured: hand off to the visitor's email client instead of pretending to send.
      window.location.href = mailtoHref()
      setStatus({ kind: 'mailto' })
      return
    }

    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: f.subject.trim() || `Portfolio enquiry from ${f.name.trim()}`,
          from_name: 'Portfolio contact form',
          name: f.name.trim(),
          email: f.email.trim(),
          replyto: f.email.trim(),
          message: f.message.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setStatus({ kind: 'sent' })
        setF({ name: '', email: '', subject: '', message: '' })
        setTouched(false)
      } else {
        setStatus({ kind: 'error', message: data.message || `The server responded with ${res.status}.` })
      }
    } catch {
      setStatus({ kind: 'error', message: 'Network error — your message was not sent.' })
    }
  }

  const ring = (k: keyof Fields) => (errors[k] ? 'border-red-400/60' : 'border-white/10')

  return (
    <form onSubmit={submit} noValidate className="glass rounded-[28px] p-5 sm:p-8" aria-describedby="cf-status">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="cf-name" label="Your name" error={errors.name}>
          <input id="cf-name" name="name" autoComplete="name" value={f.name} onChange={set('name')} className={`${inputCls} ${ring('name')}`} placeholder="Jane Doe" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-error' : undefined} />
        </Field>
        <Field id="cf-email" label="Email" error={errors.email}>
          <input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set('email')} className={`${inputCls} ${ring('email')}`} placeholder="jane@company.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-error' : undefined} />
        </Field>
      </div>
      <div className="mt-5">
        <Field id="cf-subject" label="Subject (optional)">
          <input id="cf-subject" name="subject" value={f.subject} onChange={set('subject')} className={`${inputCls} border-white/10`} placeholder="Laravel CRM, API work, a full-time role…" />
        </Field>
      </div>
      <div className="mt-5">
        <Field id="cf-message" label="Message" error={errors.message}>
          <textarea id="cf-message" name="message" rows={5} value={f.message} onChange={set('message')} className={`${inputCls} ${ring('message')} resize-y`} placeholder="What are you building, and how can I help?" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-error' : undefined} />
        </Field>
      </div>
      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          data-cursor="hover"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ember-500 px-7 text-sm font-medium text-ink-950 transition hover:bg-ember-400 disabled:opacity-60"
        >
          {status.kind === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          {status.kind === 'sending' ? 'Sending…' : ACCESS_KEY ? 'Send message' : 'Send via email app'}
        </button>
        <p className="text-xs text-mist-500">{ACCESS_KEY ? 'Delivered straight to my inbox.' : 'Opens your email app with everything filled in.'}</p>
      </div>

      <div id="cf-status" role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          {status.kind === 'sent' && (
            <motion.p key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <Check size={16} /> Thanks — your message was delivered. I’ll reply to your email soon.
            </motion.p>
          )}
          {status.kind === 'mailto' && (
            <motion.p key="mt" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist-300">
              Your email app should now be open with the message ready — just press send. Nothing opened?{' '}
              <a className="text-ember-400 underline underline-offset-4" href={mailtoHref()}>Try again</a> or write to <a className="text-ember-400 underline underline-offset-4" href={`mailto:${profile.email}`}>{profile.email}</a>.
            </motion.p>
          )}
          {status.kind === 'error' && (
            <motion.p key="err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {status.message} You can also email me directly at{' '}
              <a className="underline underline-offset-4" href={mailtoHref()}>{profile.email}</a>.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(profile.email)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {
          window.location.href = `mailto:${profile.email}`
        }
      }}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-mist-400 transition hover:text-white"
      aria-label={copied ? 'Email copied' : 'Copy email address'}
    >
      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
    </button>
  )
}

export function Contact() {
  const channels = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}`, extra: <CopyEmail /> },
    { icon: Linkedin, label: 'LinkedIn', value: profile.linkedinLabel, href: profile.linkedin, external: true },
    { icon: Phone, label: 'Phone', value: profile.phone, href: profile.phoneHref },
    { icon: Download, label: 'Resume', value: 'Download PDF', href: profile.resume, download: true },
  ]

  return (
    <section id="contact" className="relative overflow-hidden py-28 sm:py-40" aria-labelledby="contact-title">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_50%_100%,rgba(255,122,26,0.16),transparent)]" aria-hidden />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow">Contact</p>
        </Reveal>
        <span id="contact-title" className="sr-only">Contact Satyam Shukla</span>
        <SplitText
          as="h2"
          text="Let’s build *something* that works."
          className="mt-5 max-w-5xl text-[clamp(2.75rem,8.5vw,8rem)] font-semibold leading-[0.92] tracking-tightest"
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg text-mist-400">
            Hiring for a Laravel or full-stack role, or need a CRM, API or deployment sorted? I usually reply within a day or two.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            {channels.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06}>
                <TiltCard max={5} className="rounded-2xl">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04]">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ember-500/15 text-ember-400">
                      <c.icon size={19} />
                    </span>
                    <a
                      href={c.href}
                      {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      {...(c.download ? { download: true } : {})}
                      className="group min-w-0 flex-1"
                    >
                      <span className="block text-xs text-mist-500">{c.label}</span>
                      <span className="flex items-center gap-1 truncate text-[15px] font-medium group-hover:text-ember-300">
                        <span className="truncate">{c.value}</span>
                        <ArrowUpRight size={14} className="shrink-0 opacity-0 transition group-hover:opacity-100" />
                      </span>
                    </a>
                    {c.extra}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1} className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
