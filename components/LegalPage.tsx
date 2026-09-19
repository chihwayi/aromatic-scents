import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }

export interface LegalSection {
  heading: string
  blocks: LegalBlock[]
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul className="mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="text-sm leading-relaxed pl-4 relative"
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
          className="font-display text-lg sm:text-xl mt-2 mb-3"
          style={{ color: 'var(--text)', fontWeight: 500 }}
        >
          {block.text}
        </h3>
      )
    case 'h3':
      return (
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {block.text}
        </h4>
      )
  }
}

export default function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string
  lastUpdated: string
  intro?: string
  sections: LegalSection[]
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs mb-10"
          style={{ color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Aromatic Scents
        </Link>

        <p className="section-label mb-3" style={{ color: 'var(--gold)' }}>
          Aromatic Scents (Pvt) Ltd
        </p>
        <h1
          className="font-display text-3xl sm:text-4xl mb-2"
          style={{ color: 'var(--text)', fontWeight: 500 }}
        >
          {title}
        </h1>
        <p className="text-xs mb-10" style={{ color: 'var(--text-faint)' }}>
          Last updated: {lastUpdated}
        </p>

        {intro && (
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
            {intro}
          </p>
        )}

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i}>
              <h2
                className="font-display text-xl sm:text-2xl mb-4"
                style={{ color: 'var(--text)', fontWeight: 500 }}
              >
                {section.heading}
              </h2>
              <div className="gold-line-left mb-5" style={{ width: '2rem' }} />
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
