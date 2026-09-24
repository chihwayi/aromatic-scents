import type { Metadata } from 'next'
import ContentPage, { ContentSection } from '@/components/ContentPage'

export const metadata: Metadata = { title: 'Reseller Program | Aromatic Scents' }

const sections: ContentSection[] = [
  {
    blocks: [
      { type: 'p', text: 'Want to turn your love for fragrance into a business?' },
      { type: 'p', text: 'The Aromatic Scents Reseller Program gives entrepreneurs access to quality-inspired fragrances, body products and home fragrances at reseller-friendly prices.' },
      { type: 'p', text: "Whether you're starting from home, selling to friends and family or building a growing customer base, you can start small and grow at your own pace." },
    ],
  },
  {
    heading: 'Why Resell Aromatic Scents?',
    blocks: [
      { type: 'ul', items: [
        'Reseller-friendly pricing — purchase products at prices that allow you to create your own retail pricing.',
        'Start from R500 — our minimum order makes it easier to get started without a large initial investment.',
        'No joining fee — there is no membership or joining fee. Simply purchase the products you want to resell.',
        'A growing product range — choose from perfumes, roll-ons, lotions, tissue oils, car diffusers and home fragrances.',
        'White-label options — selected products can be supplied without branding or with your own labels, giving you the opportunity to build your own brand.',
        'Reseller support — access product information, updates, specials and support as you build your business.',
      ] },
    ],
  },
  {
    heading: 'How It Works',
    blocks: [
      { type: 'quote', text: 'Choose → Order → Sell → Grow' },
      { type: 'p', text: 'Select your products, place your order, sell to your customers and reinvest as your business grows.' },
      { type: 'p', text: "You don't need a physical shop or a large investment to begin. Start where you are, build your customer base and grow at your own pace." },
      { type: 'quote', text: 'Your business. Your customers. Your journey.' },
      { type: 'p', text: 'For more information or to enquire about becoming a reseller, simply tap the WhatsApp button on our website and speak to our team.' },
      { type: 'quote', text: 'Aromatic Scents — creating fragrance and opportunity.' },
    ],
  },
]

export default function ResellerProgramPage() {
  return (
    <ContentPage
      label="Reseller Program"
      title="Build Your Own Fragrance Business"
      sections={sections}
      bannerIndex={2}
      bannerCaption="Choose → Order → Sell → Grow"
    />
  )
}
