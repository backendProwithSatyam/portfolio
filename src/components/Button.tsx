import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Magnetic } from './Magnetic'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'primary' | 'ghost' | 'outline'; icon?: ReactNode }

const styles = {
  primary: 'bg-ember-500 text-ink-950 hover:bg-ember-400 shadow-[0_10px_40px_-10px_rgba(255,122,26,0.7)]',
  ghost: 'glass text-mist-100 hover:bg-white/10',
  outline: 'border border-white/15 text-mist-100 hover:border-ember-500/70 hover:text-white',
}

export function Button({ variant = 'primary', icon, children, className = '', ...rest }: Props) {
  return (
    <Magnetic>
      <a
        data-cursor="hover"
        className={`group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full px-6 text-sm font-medium tracking-tight transition-colors duration-300 ${styles[variant]} ${className}`}
        {...rest}
      >
        <span className="relative">{children}</span>
        {icon && <span className="relative transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">{icon}</span>}
      </a>
    </Magnetic>
  )
}
