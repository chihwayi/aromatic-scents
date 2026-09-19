import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'PAIA Manual | Aromatic Scents' }

const sections: LegalSection[] = [
  {
    heading: 'PAIA Manual',
    blocks: [
      { type: 'p', text: 'Our manual in terms of section 51 of the Promotion of Access to Information Act 2 of 2000 (PAIA) is currently being finalised.' },
      { type: 'p', text: 'In the meantime, requests for access to information held by Aromatic Scents (Pvt) Ltd can be directed to:' },
      { type: 'ul', items: ['Email: info@aromaticscents.co.za', 'WhatsApp / Telephone: 084 961 5725'] },
    ],
  },
]

export default function PaiaManualPage() {
  return (
    <LegalPage
      title="PAIA Manual"
      lastUpdated="September 2026"
      sections={sections}
    />
  )
}
