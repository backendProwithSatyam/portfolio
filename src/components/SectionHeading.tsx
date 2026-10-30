import { SplitText } from './SplitText'
import { Reveal } from './Reveal'

export function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <SplitText
        as="h2"
        text={title}
        className="mt-5 text-[clamp(2.25rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-tightest"
      />
      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist-400 sm:text-lg">{intro}</p>
        </Reveal>
      )}
    </div>
  )
}
