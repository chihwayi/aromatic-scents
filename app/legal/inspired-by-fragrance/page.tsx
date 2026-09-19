import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Inspired-By Fragrance Disclaimer | Aromatic Scents' }

const sections: LegalSection[] = [
  {
    heading: 'Inspired-By Fragrance',
    blocks: [
      { type: 'p', text: 'Aromatic Scents fragrances are independently produced fragrances inspired by the scent profiles and characteristics of selected well-known perfumes.' },
      { type: 'p', text: 'They are not original designer fragrances and are not manufactured, endorsed, sponsored or affiliated with the owners of the referenced designer brands.' },
      { type: 'p', text: 'Any fragrance or brand references are provided solely to help customers understand the fragrance inspiration and scent profile.' },
    ],
  },
]

export default function InspiredByFragrancePage() {
  return (
    <LegalPage
      title="Inspired-By Fragrance Disclaimer"
      lastUpdated="September 2026"
      sections={sections}
    />
  )
}
