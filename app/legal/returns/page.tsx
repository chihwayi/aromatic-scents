import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Returns & Refunds Policy | Aromatic Scents' }

const sections: LegalSection[] = [
  {
    heading: '1. Wrong, Damaged or Defective Products',
    blocks: [
      { type: 'p', text: 'Please contact us as soon as reasonably possible if you receive:' },
      { type: 'ul', items: ['The wrong product;', 'A product that is damaged;', 'A product that is defective; or', 'A product that does not correspond with your order.'] },
      { type: 'p', text: 'Please provide your order number, a description of the problem and, where possible, photographs of the product and packaging.' },
      { type: 'p', text: 'We will assess the issue and advise you of the appropriate next steps.' },
      { type: 'p', text: 'Where a replacement, repair, refund or other remedy is required under applicable law, Aromatic Scents will provide the applicable remedy.' },
    ],
  },
  {
    heading: '2. Products Damaged During Delivery',
    blocks: [
      { type: 'p', text: 'If your parcel arrives visibly damaged, please take photographs of the parcel and its contents before disposing of any packaging.' },
      { type: 'p', text: 'Contact Aromatic Scents promptly so that we can investigate the matter with the relevant courier.' },
      { type: 'p', text: 'Depending on the circumstances, we may request additional information or photographs to assist with a courier claim.' },
    ],
  },
  {
    heading: '3. Change of Mind',
    blocks: [
      { type: 'p', text: 'Perfumes, roll-ons, lotions, tissue oils, home diffusers and other fragranced or personal-use products are hygiene-sensitive items.' },
      { type: 'p', text: 'A customer who simply changes their mind or decides that they do not like a particular fragrance after opening or using the product may not automatically be entitled to a return or refund, subject to applicable South African consumer law.' },
      { type: 'p', text: 'Where a product is eligible for a change-of-mind return under applicable law, the product may need to remain unused, unopened and in its original condition.' },
    ],
  },
  {
    heading: '4. Fragrance Preference',
    blocks: [
      { type: 'p', text: 'We understand that fragrance is personal and that a scent may smell different on different people.' },
      { type: 'p', text: 'A product cannot generally be returned solely because:' },
      { type: 'ul', items: [
        'The customer does not like the fragrance;',
        'The fragrance smells different on their skin than expected;',
        'The customer expected a different scent profile; or',
        'The customer decides they prefer another fragrance after opening or using the product,',
      ] },
      { type: 'p', text: 'subject to any rights available under applicable law.' },
      { type: 'p', text: 'We encourage customers to review the fragrance description and available notes before placing an order.' },
    ],
  },
  {
    heading: '5. Opened or Used Products',
    blocks: [
      { type: 'p', text: 'For hygiene and product-safety reasons, we may not accept the return of products that have been opened or used where the return is not otherwise required by law.' },
      { type: 'p', text: "This does not affect a customer's statutory rights relating to defective, unsafe, incorrect or otherwise non-compliant goods." },
    ],
  },
  {
    heading: '6. Return Authorisation',
    blocks: [
      { type: 'p', text: 'Please contact Aromatic Scents before sending any product back.' },
      { type: 'p', text: 'Customers should not send returns to a courier address or collection point without first receiving return instructions from us.' },
      { type: 'p', text: 'We will provide the appropriate return procedure based on the circumstances of the order.' },
    ],
  },
  {
    heading: '7. Refunds',
    blocks: [
      { type: 'p', text: 'Where a refund is approved or legally required, the refund will generally be processed using the applicable payment method or another appropriate method agreed with the customer.' },
      { type: 'p', text: 'The time taken for the funds to reflect may depend on the payment provider or financial institution.' },
      { type: 'p', text: "Where the original payment was processed through Bob Pay, the refund process may be subject to the payment provider's processing time." },
    ],
  },
  {
    heading: '8. Delivery Costs on Returns',
    blocks: [
      { type: 'p', text: 'Where a return, replacement or refund is required because Aromatic Scents supplied an incorrect, defective or damaged product, the applicable delivery or return costs will be handled in accordance with applicable law and the circumstances of the order.' },
      { type: 'p', text: 'Where a customer requests a return for another reason and the return is permitted, the customer may be responsible for applicable return delivery costs.' },
    ],
  },
  {
    heading: '9. Exchanges',
    blocks: [
      { type: 'p', text: 'Where appropriate and subject to stock availability, Aromatic Scents may offer an exchange for an alternative product.' },
      { type: 'p', text: 'An exchange is not guaranteed where a product is unavailable.' },
      { type: 'p', text: 'Where the law requires a particular remedy, the applicable statutory remedy will take precedence.' },
    ],
  },
  {
    heading: '10. Sale Items and Promotional Products',
    blocks: [
      { type: 'p', text: 'Products purchased during promotions or special offers remain subject to this Returns & Refunds Policy and applicable consumer law.' },
      { type: 'p', text: 'Free gifts supplied as part of a promotion may need to be returned where the entire qualifying order is cancelled or returned, where applicable.' },
    ],
  },
  {
    heading: '11. Contact Us',
    blocks: [
      { type: 'p', text: 'For returns, refunds or product-related concerns, please contact:' },
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd' },
      { type: 'ul', items: ['info@aromaticscents.co.za', '084 961 5725'] },
      { type: 'p', text: 'Please include your order number when contacting us about an order.' },
    ],
  },
]

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Returns & Refunds Policy"
      lastUpdated="September 2026"
      intro="At Aromatic Scents, we want you to be happy with your purchase. This Returns & Refunds Policy explains how we handle returns, exchanges, replacements and refunds for purchases made through our website. Nothing in this policy is intended to remove or limit any rights that consumers have under applicable South African consumer-protection legislation."
      sections={sections}
    />
  )
}
