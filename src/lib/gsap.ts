import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// Mobile browsers resize the viewport when the address bar shows/hides; re-measuring
// every trigger on that is a common cause of scroll stutter and freezes.
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger }
