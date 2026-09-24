import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'link'; text: string; href: string }

export interface ContentSection {
  heading?: string
  blocks: ContentBlock[]
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-sm sm:text-base leading-relaxed mb-5" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul className="mb-6 space-y-3">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="text-sm sm:text-base leading-relaxed pl-5 relative"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="absolute left-0" style={{ color: 'var(--gold)' }}>–</span>
              {item}
            </li>
          ))}
        </ul>
      )
    case 'h2':
      return (
        <h3
          className="font-display text-xl sm:text-2xl mt-2 mb-4"
          style={{ color: 'var(--text)', fontWeight: 500 }}
        >
          {block.text}
        </h3>
      )
    case 'quote':
      return (
        <p
          className="font-display text-lg sm:text-xl italic my-8 text-center"
          style={{ color: 'var(--gold)', fontWeight: 400 }}
        >
          {block.text}
        </p>
      )
    case 'link':
      return (
        <div className="my-8 text-center">
          <Link href={block.href} className="btn-outline-gold inline-block">
            <span>{block.text}</span>
          </Link>
        </div>
      )
  }
}

export default function ContentPage({
  label,
  title,
  subtitle,
  sections,
}: {
  label: string
  title: string
  subtitle?: string
  sections: ContentSection[]
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs mb-10"
          style={{ color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Aromatic Scents
        </Link>

        <p className="section-label mb-3" style={{ color: 'var(--gold)' }}>
          {label}
        </p>
        <h1
          className="font-display text-3xl sm:text-5xl mb-4"
          style={{ color: 'var(--text)', fontWeight: 400, lineHeight: 1.15 }}
        >
          {title}
        </h1>
        <div className="gold-line-left mb-8" style={{ width: '3rem' }} />

        {subtitle && (
          <p
            className="font-display text-lg sm:text-xl mb-10 italic"
            style={{ color: 'var(--text-muted)', fontWeight: 400 }}
          >
            {subtitle}
          </p>
        )}

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <>
                  <h2
                    className="font-display text-2xl sm:text-3xl mb-5"
                    style={{ color: 'var(--text)', fontWeight: 500 }}
                  >
                    {section.heading}
                  </h2>
                  <div className="gold-line-left mb-6" style={{ width: '2rem' }} />
                </>
              )}
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </div>
          ))}
        </div>

        <div
          className="mt-16 pt-8 text-xs text-center"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)' }}
        >
          Aromatic Scents — Soothe, Uplift &amp; Inspire
        </div>
      </div>
    </div>
  )
}
