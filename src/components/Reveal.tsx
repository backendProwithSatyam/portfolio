import { motion, type HTMLMotionProps } from 'framer-motion'
import { useMotionPrefs } from '../lib/motion'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number }

/** Fade-and-rise on first view. Framer Motion handles component-level entrances. */
export function Reveal({ delay = 0, y = 28, children, ...rest }: Props) {
  const { reduced } = useMotionPrefs()
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
