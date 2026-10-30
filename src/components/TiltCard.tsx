import { useRef, type HTMLAttributes } from 'react'
import { useMotionPrefs } from '../lib/motion'

type Props = HTMLAttributes<HTMLDivElement> & { max?: number }

/** 3D tilt toward the pointer + glow-border position. Static on touch / reduced motion. */
export function TiltCard({ max = 8, className = '', style, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const { reduced, touch } = useMotionPrefs()

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
      if (!reduced && !touch) el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(frame.current)
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`glow-card transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}
