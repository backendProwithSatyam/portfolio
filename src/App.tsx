import { useEffect } from 'react'
import { MotionProvider, useMotionPrefs } from './lib/motion'
import { startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll'
import { ScrollTrigger } from './lib/gsap'
import { Loader } from './components/Loader'
import { Cursor } from './components/Cursor'
import { Nav } from './components/Nav'
import { CommandPalette } from './components/CommandPalette'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { About } from './sections/About'
import { Skills } from './sections/Skills'
import { Projects } from './sections/Projects'
import { Architecture } from './sections/Architecture'
import { Workflow } from './sections/Workflow'
import { Terminal } from './sections/Terminal'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'

function Experience() {
  const { reduced, ready } = useMotionPrefs()

  useEffect(() => {
    if (reduced) return
    startSmoothScroll()
    return stopSmoothScroll
  }, [reduced])

  // Recalculate pinned sections once fonts and the loader have settled.
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => ScrollTrigger.refresh(), 100)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => clearTimeout(id)
  }, [ready])

  return (
    <div className="grain">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <Loader />
      <Cursor />
      <Nav />
      <CommandPalette />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Projects />
        <Architecture />
        <Workflow />
        <Terminal />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <MotionProvider>
      <Experience />
    </MotionProvider>
  )
}
