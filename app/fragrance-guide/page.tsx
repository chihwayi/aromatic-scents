import type { Metadata } from 'next'
import ContentPage, { ContentSection } from '@/components/ContentPage'

export const metadata: Metadata = { title: 'Fragrance Guide | Aromatic Scents' }

const sections: ContentSection[] = [
  {
    blocks: [
      { type: 'p', text: "Choosing a fragrance doesn't have to be complicated. The best place to start is by thinking about the types of scents you naturally enjoy." },
    ],
  },
  {
    heading: '🌸 Floral',
    blocks: [
      { type: 'p', text: 'Soft, feminine and elegant. Floral fragrances often feature notes such as rose, jasmine, peony and other flowers.' },
      { type: 'p', text: 'Perfect for: Romantic, elegant and feminine personalities.' },
    ],
  },
  {
    heading: '🍓 Fruity',
    blocks: [
      { type: 'p', text: 'Fresh, juicy and playful, with notes inspired by fruits such as berries, peach, apple and citrus.' },
      { type: 'p', text: 'Perfect for: Bright, energetic and youthful moods.' },
    ],
  },
  {
    heading: '🍬 Sweet',
    blocks: [
      { type: 'p', text: 'Warm, delicious and comforting, often featuring vanilla, caramel, chocolate, marshmallow or sweet fruits.' },
      { type: 'p', text: 'Perfect for: Those who love noticeable, addictive fragrances.' },
    ],
  },
  {
    heading: '🍃 Fresh',
    blocks: [
      { type: 'p', text: 'Clean, crisp and refreshing, often featuring citrus, aquatic or green notes.' },
      { type: 'p', text: 'Perfect for: Everyday wear, warm weather and people who prefer a clean scent.' },
    ],
  },
  {
    heading: '🌳 Woody',
    blocks: [
      { type: 'p', text: 'Warm, sophisticated and grounded, with notes such as sandalwood, cedarwood and earthy woods.' },
      { type: 'p', text: 'Perfect for: Those who prefer deeper and more refined fragrances.' },
    ],
  },
  {
    heading: '✨ Warm & Amber',
    blocks: [
      { type: 'p', text: 'Rich, sensual and enveloping, often combining amber, spices, vanilla, woods and resins.' },
      { type: 'p', text: 'Perfect for: Evenings, special occasions and those who enjoy a luxurious feel.' },
    ],
  },
  {
    heading: 'How to Choose Your Scent',
    blocks: [
      { type: 'p', text: 'Ask yourself:' },
      { type: 'ul', items: [
        'What do I normally enjoy? Sweet, fresh, floral, fruity or woody?',
        'When will I wear it? Every day, at work, on a date or for a special occasion?',
        'Do I want something subtle or noticeable? Your preferred intensity can help narrow your choices.',
      ] },
      { type: 'p', text: 'And remember — fragrance is personal.' },
      { type: 'quote', text: "There are no rules. If you love the way it smells on you, you've found a fragrance worth wearing. 🌸" },
    ],
  },
]

export default function FragranceGuidePage() {
  return (
    <ContentPage
      label="Fragrance Guide"
      title="Find a Fragrance That Feels Like You"
      sections={sections}
    />
  )
}
