import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

/** Lenis drives the scroll; GSAP's ticker drives Lenis so ScrollTrigger stays in sync. */
export function startSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  document.addEventListener('click', onAnchorClick)
  return lenis
}

/** Route any plain in-page anchor (href="#…") through Lenis for a smooth glide. */
function onAnchorClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
  const hash = a?.getAttribute('href')
  if (!hash || hash === '#' || !document.querySelector(hash)) return
  e.preventDefault()
  lenis?.scrollTo(hash, { offset: -10 })
  history.replaceState(null, '', hash)
}

function raf(time: number) {
  lenis?.raf(time * 1000)
}

export function stopSmoothScroll() {
  gsap.ticker.remove(raf)
  document.removeEventListener('click', onAnchorClick)
  lenis?.destroy()
  lenis = null
}

export function scrollToTarget(target: string | number, reduced = false) {
  if (lenis && !reduced) {
    lenis.scrollTo(target, { offset: typeof target === 'string' ? -10 : 0 })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
  else document.querySelector(target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}

export const lockScroll = (locked: boolean) => {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
