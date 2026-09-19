import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Delivery Policy | Aromatic Scents' }

const sections: LegalSection[] = [
  {
    heading: '1. Delivery Options',
    blocks: [
      { type: 'p', text: "Depending on the customer's location and service availability, Aromatic Scents may offer:" },
      { type: 'ul', items: ['PUDO Locker-to-Locker', 'Courier Guy Door-to-Door', 'Internet Express', 'MTE Express'] },
      { type: 'p', text: 'The delivery option available for a particular order may depend on the destination, parcel size, service coverage and other operational considerations.' },
    ],
  },
  {
    heading: '2. Delivery Fees',
    blocks: [
      { type: 'p', text: 'Applicable delivery fees will be displayed at checkout or communicated to the customer before the order is finalised.' },
      { type: 'p', text: 'Delivery charges may vary depending on the destination and delivery service selected.' },
      { type: 'p', text: 'Additional charges may apply to certain remote or outlying areas where the selected courier applies additional fees.' },
    ],
  },
  {
    heading: '3. Order Processing',
    blocks: [
      { type: 'p', text: 'Orders will generally be processed after successful payment has been received and confirmed.' },
      { type: 'p', text: 'Processing times may vary depending on product availability, order volume, weekends, public holidays and other operational circumstances.' },
      { type: 'p', text: 'Customers will receive relevant order or dispatch information where applicable.' },
    ],
  },
  {
    heading: '4. Delivery Timeframes',
    blocks: [
      { type: 'p', text: 'Delivery timeframes provided by Aromatic Scents are estimates and are not guaranteed delivery dates.' },
      { type: 'p', text: 'Delivery may be affected by:' },
      { type: 'ul', items: [
        'Courier operational delays;',
        'Public holidays;',
        'Weekends;',
        'Weather;',
        'Incorrect or incomplete delivery information;',
        'Remote or outlying destinations;',
        'High-volume periods; or',
        'Circumstances outside our reasonable control.',
      ] },
      { type: 'p', text: 'We will make reasonable efforts to assist customers if a delivery is delayed.' },
    ],
  },
  {
    heading: '5. Tracking',
    blocks: [
      { type: 'p', text: 'Where tracking is available, customers may receive tracking information or delivery updates from the applicable courier or from Aromatic Scents.' },
      { type: 'p', text: 'Customers should ensure that their telephone number and email address are correct when placing an order so that relevant delivery communications can reach them.' },
    ],
  },
  {
    heading: '6. PUDO Locker Delivery',
    blocks: [
      { type: 'p', text: 'When PUDO Locker delivery is selected, the parcel will be sent to the applicable PUDO Locker selected or allocated for the order.' },
      { type: 'p', text: 'Customers are responsible for collecting the parcel within the collection period specified by PUDO.' },
      { type: 'p', text: 'Customers should monitor their collection notifications and ensure that the contact details provided during checkout are correct.' },
      { type: 'p', text: 'If a parcel is not collected within the applicable collection period, it may be returned or additional delivery charges may apply.' },
    ],
  },
  {
    heading: '7. Door-to-Door Delivery',
    blocks: [
      { type: 'p', text: 'For door-to-door delivery, customers must provide a complete and accurate delivery address.' },
      { type: 'p', text: "Customers should ensure that someone is reasonably available to receive the parcel during the courier's delivery period." },
      { type: 'p', text: 'Where a delivery attempt is unsuccessful, the courier may make another attempt or contact the customer depending on its procedures.' },
      { type: 'p', text: 'Additional delivery attempts, address changes or redelivery may result in additional charges where applicable.' },
    ],
  },
  {
    heading: '8. Incorrect Delivery Information',
    blocks: [
      { type: 'p', text: 'Aromatic Scents is not responsible for delays or failed deliveries caused by information incorrectly supplied by the customer.' },
      { type: 'p', text: 'This may include:' },
      { type: 'ul', items: ['Incorrect address;', 'Missing unit or house number;', 'Incorrect telephone number;', 'Incorrect postal code; or', 'Other incomplete delivery information.'] },
      { type: 'p', text: 'Where additional charges arise because of incorrect information supplied by the customer, the customer may be responsible for those charges.' },
    ],
  },
  {
    heading: '9. Damaged Parcels',
    blocks: [
      { type: 'p', text: 'Customers should inspect their parcel when it arrives.' },
      { type: 'p', text: 'If the parcel appears damaged, customers should take photographs of the packaging and contents where possible and contact Aromatic Scents promptly.' },
      { type: 'p', text: 'We may require photographs and other information to assist with investigating the matter or submitting a courier claim.' },
    ],
  },
  {
    heading: '10. Lost or Delayed Parcels',
    blocks: [
      { type: 'p', text: 'If a parcel appears to be lost or significantly delayed, customers should contact Aromatic Scents.' },
      { type: 'p', text: 'We will make reasonable efforts to assist with tracking the parcel and communicating with the relevant courier.' },
      { type: 'p', text: 'Where a remedy is required under applicable consumer law, Aromatic Scents will provide the appropriate remedy.' },
    ],
  },
  {
    heading: '11. Third-Party Couriers',
    blocks: [
      { type: 'p', text: 'Aromatic Scents works with third-party delivery providers, including:' },
      { type: 'ul', items: ['PUDO;', 'Courier Guy;', 'Internet Express; and', 'MTE Express.'] },
      { type: 'p', text: "Once an order has been handed to the relevant delivery provider, delivery is subject to the provider's operational procedures." },
      { type: 'p', text: 'Aromatic Scents will nevertheless make reasonable efforts to assist customers with delivery-related queries.' },
    ],
  },
  {
    heading: '12. Collection',
    blocks: [
      { type: 'p', text: 'Where a collection option is offered, customers will be notified when their order is ready for collection.' },
      { type: 'p', text: 'Customers must collect their order within the collection period communicated by Aromatic Scents.' },
      { type: 'p', text: 'Uncollected orders may be returned to stock or otherwise handled in accordance with our applicable order terms.' },
    ],
  },
  {
    heading: '13. International Orders',
    blocks: [
      { type: 'p', text: 'Unless specifically agreed with Aromatic Scents, our website delivery service is intended for deliveries within the applicable service areas in South Africa.' },
      { type: 'p', text: 'Customers requiring delivery outside the standard delivery area should contact Aromatic Scents before placing an order.' },
    ],
  },
  {
    heading: '14. Contact Us',
    blocks: [
      { type: 'p', text: 'For delivery enquiries, please contact:' },
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd' },
      { type: 'ul', items: ['info@aromaticscents.co.za', '084 961 5725'] },
      { type: 'p', text: 'Please provide your order number when contacting us about an existing order.' },
    ],
  },
]

export default function DeliveryPage() {
  return (
    <LegalPage
      title="Delivery Policy"
      lastUpdated="September 2026"
      intro="Aromatic Scents delivers orders using selected third-party courier and delivery providers. This policy explains our available delivery options and what customers can expect after placing an order."
      sections={sections}
    />
  )
}
