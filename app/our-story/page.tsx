import type { Metadata } from 'next'
import ContentPage, { ContentSection } from '@/components/ContentPage'

export const metadata: Metadata = { title: 'Our Story | Aromatic Scents' }

const sections: ContentSection[] = [
  {
    blocks: [
      { type: 'p', text: 'Aromatic Scents began with a simple idea: beautiful fragrances should be accessible without compromising the experience.' },
      { type: 'p', text: 'What started as a passion for fragrance has grown into a business serving customers and entrepreneurs across South Africa and Zimbabwe.' },
      { type: 'p', text: 'As our journey developed, so did our collection. Today, Aromatic Scents offers a growing range of perfumes, body products and home fragrances designed to bring beautiful scents into everyday life.' },
      { type: 'p', text: 'But our journey is about more than products. We also wanted to create opportunities for entrepreneurs who dream of building something of their own.' },
      { type: 'p', text: 'Through our reseller program, we provide access to quality-inspired fragrance products at reseller-friendly prices, allowing individuals to start small, build their customer base and grow at their own pace.' },
      { type: 'p', text: 'Our journey continues, guided by the values that have always mattered to us:' },
      { type: 'quote', text: 'Quality. Affordability. Reliability. Opportunity.' },
      { type: 'p', text: 'Thank you for being part of our story.' },
      { type: 'quote', text: 'Aromatic Scents — Soothe. Uplift. Inspire.' },
    ],
  },
]

export default function OurStoryPage() {
  return (
    <ContentPage
      label="Our Story"
      title="From a Passion for Fragrance to a Growing Brand"
      sections={sections}
      bannerIndex={1}
      bannerCaption="Soothe. Uplift. Inspire."
    />
  )
}
