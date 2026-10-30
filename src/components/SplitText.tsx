import { createElement, useLayoutEffect, useRef, type ElementType } from 'react'
import { gsap } from '../lib/gsap'
import { useMotionPrefs } from '../lib/motion'

type Props = {
  text: string
  as?: ElementType
  className?: string
  /** 'scroll' reveals when scrolled into view; 'mount' reveals once the loader is done. */
  trigger?: 'scroll' | 'mount'
  delay?: number
  stagger?: number
  /** Words wrapped in these markers render highlighted: "Building *scalable* things". */
  highlightClass?: string
}

/** Word-by-word masked reveal. Text stays real, selectable and readable by screen readers. */
export function SplitText({ text, as = 'h2', className, trigger = 'scroll', delay = 0, stagger = 0.045, highlightClass = 'text-gradient' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { reduced, ready } = useMotionPrefs()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    if (trigger === 'mount' && !ready) {
      gsap.set(el.querySelectorAll('.split-inner'), { yPercent: 115 })
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.split-inner'),
        { yPercent: 115, rotate: 4 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.05,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: trigger === 'scroll' ? { trigger: el, start: 'top 88%', once: true } : undefined,
        },
      )
    }, el)
    return () => ctx.revert()
  }, [reduced, ready, trigger, delay, stagger])

  const words = text.split(' ')
  return createElement(
    as,
    { ref, className, 'aria-label': text.replace(/\*/g, '') },
    words.map((raw, i) => {
      const hl = raw.startsWith('*') && raw.endsWith('*')
      const word = hl ? raw.slice(1, -1) : raw
      return (
        <span key={i} aria-hidden="true" className="split-line align-top">
          <span className={`split-inner ${hl ? highlightClass : ''}`}>{word}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      )
    }),
  )
}
