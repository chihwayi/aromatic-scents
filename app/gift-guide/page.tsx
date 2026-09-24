import type { Metadata } from 'next'
import ContentPage, { ContentSection } from '@/components/ContentPage'

export const metadata: Metadata = { title: 'Gift Guide | Aromatic Scents' }

const sections: ContentSection[] = [
  {
    blocks: [
      { type: 'p', text: 'Looking for a gift that feels personal, beautiful and memorable?' },
      { type: 'p', text: 'Aromatic Scents makes it easy to find something special for the people who matter to you. From personal fragrances to beautifully scented home products, our collection offers something for different personalities, occasions and budgets.' },
    ],
  },
  {
    heading: '🎁 For Her',
    blocks: [
      { type: 'p', text: 'Explore feminine fragrances, roll-ons, lotions and body products for the woman who loves to smell beautiful and feel confident.' },
    ],
  },
  {
    heading: '🎁 For Him',
    blocks: [
      { type: 'p', text: 'Discover masculine fragrances and fresh, bold and sophisticated scents for the man who enjoys making an impression.' },
    ],
  },
  {
    heading: '🏡 For the Home',
    blocks: [
      { type: 'p', text: 'Our home fragrances and car diffusers are perfect for creating a welcoming, beautifully scented environment.' },
    ],
  },
  {
    heading: '💕 For Someone Special',
    blocks: [
      { type: 'p', text: 'Choose a fragrance inspired by their personality, favourite scent family or the memories you share.' },
    ],
  },
  {
    heading: '🎉 For Every Occasion',
    blocks: [],
  },
  {
    heading: 'Not Sure What to Choose?',
    blocks: [
      { type: 'p', text: "Think about the person you're buying for — do they love sweet, fresh, floral, fruity, warm or woody scents?" },
      { type: 'p', text: 'Our Fragrance Guide can help you narrow it down.' },
      { type: 'link', text: 'View the Fragrance Guide', href: '/fragrance-guide' },
      { type: 'quote', text: 'A thoughtful fragrance can say more than words.' },
    ],
  },
]

export default function GiftGuidePage() {
  return (
    <ContentPage
      label="Gift Guide"
      title="Give the Gift of Fragrance"
      sections={sections}
      bannerIndex={4}
      bannerCaption="A thoughtful fragrance can say more than words"
    />
  )
}
