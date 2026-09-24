import type { Metadata } from 'next'
import ContentPage, { ContentSection } from '@/components/ContentPage'

export const metadata: Metadata = { title: 'About Us | Aromatic Scents' }

const sections: ContentSection[] = [
  {
    blocks: [
      { type: 'p', text: 'Welcome to Aromatic Scents, a fragrance and lifestyle brand created for people who love beautiful scents, quality products and accessible prices.' },
      { type: 'p', text: 'Our collection includes perfumes, roll-ons, lotions, tissue oils, car diffusers and home fragrances, giving you fragrance options for yourself, your body and your space.' },
      { type: 'p', text: 'We believe fragrance is more than a finishing touch. It can express your personality, create an atmosphere and turn everyday moments into something special.' },
      { type: 'p', text: 'Our aim is simple:' },
      { type: 'quote', text: 'To soothe, uplift and inspire through fragrance.' },
      { type: 'p', text: "Whether you're looking for your next signature scent, a thoughtful gift or products for your own fragrance business, Aromatic Scents is here to make the experience enjoyable, accessible and reliable." },
      { type: 'quote', text: 'Aromatic Scents — fragrance for every mood, moment and journey.' },
    ],
  },
]

export default function AboutUsPage() {
  return (
    <ContentPage
      label="About Us"
      title="Fragrance That Fits Your World"
      sections={sections}
      bannerIndex={0}
      bannerCaption="Fragrance for every mood, moment and journey"
    />
  )
}
