import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Terms & Conditions | Aromatic Scents' }

const sections: LegalSection[] = [
  {
    heading: '1. About Aromatic Scents',
    blocks: [
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd is a registered business supplying fragrances and related body, home and lifestyle products.' },
      { type: 'p', text: 'Our online store is primarily intended for retail customers. We also supply resellers and wholesale customers through a separate ordering process.' },
    ],
  },
  {
    heading: '2. Inspired-By Fragrances',
    blocks: [
      { type: 'p', text: 'Aromatic Scents offers independently produced fragrances that may be inspired by the scent profiles, fragrance families or characteristics of well-known perfumes.' },
      { type: 'p', text: 'Unless specifically stated otherwise:' },
      { type: 'ul', items: [
        'Aromatic Scents products are not original designer fragrances.',
        'Our products are not manufactured, distributed or endorsed by the owners of the designer brands referenced for comparison or inspiration purposes.',
        'Aromatic Scents is not affiliated with, sponsored by or connected to those designer brands.',
        'References to designer fragrances are provided to help customers understand the fragrance inspiration or scent profile.',
      ] },
      { type: 'p', text: 'Our products, branding, packaging and marketing materials are independently presented under the Aromatic Scents brand.' },
    ],
  },
  {
    heading: '3. Product Information',
    blocks: [
      { type: 'p', text: 'We make reasonable efforts to ensure that product descriptions, fragrance notes, photographs, sizes and other information on the website are accurate and current.' },
      { type: 'p', text: 'However:' },
      { type: 'ul', items: [
        'Fragrance perception varies from person to person.',
        'Product colours may appear slightly different depending on lighting, photography and individual screen settings.',
        'Packaging, bottles, labels and presentation may change from time to time.',
        'Fragrance notes and descriptions are provided as a guide and do not guarantee an identical scent experience to any referenced fragrance.',
      ] },
    ],
  },
  {
    heading: '4. Prices',
    blocks: [
      { type: 'p', text: 'All website prices are displayed in South African Rand (ZAR) unless otherwise stated.' },
      { type: 'p', text: 'Prices may change without prior notice.' },
      { type: 'p', text: 'The price applicable to an order will generally be the price displayed at the time the order is placed, subject to stock availability and the correction of genuine pricing or website errors.' },
      { type: 'p', text: 'Promotional prices and special offers may be subject to additional terms, minimum quantities or expiry dates.' },
    ],
  },
  {
    heading: '5. Placing an Order',
    blocks: [
      { type: 'p', text: 'Customers may place orders through the purchasing facilities available on the website.' },
      { type: 'p', text: 'An order is subject to acceptance by Aromatic Scents and successful payment where payment is required at checkout.' },
      { type: 'p', text: 'We reserve the right to decline or cancel an order where:' },
      { type: 'ul', items: [
        'Stock is unavailable;',
        'A genuine pricing or product-information error has occurred;',
        'The order cannot reasonably be fulfilled; or',
        'Other legitimate circumstances require cancellation.',
      ] },
      { type: 'p', text: 'If an order is cancelled because an item is unavailable or because of a genuine website error, any payment received for the affected item will be dealt with in accordance with applicable law.' },
    ],
  },
  {
    heading: '6. Online Payment',
    blocks: [
      { type: 'p', text: 'Payments made through the Aromatic Scents website are processed through Bob Pay, our online payment service provider.' },
      { type: 'p', text: 'Customers should follow the payment instructions provided during checkout.' },
      { type: 'p', text: 'An order will normally only be processed once payment has been successfully authorised and confirmed.' },
      { type: 'p', text: 'A payment authorisation does not necessarily mean that an order has been dispatched. Customers will receive appropriate confirmation regarding the processing and dispatch of their order.' },
    ],
  },
  {
    heading: '7. Stock Availability',
    blocks: [
      { type: 'p', text: 'All products are subject to availability.' },
      { type: 'p', text: 'Although we make reasonable efforts to maintain accurate stock information, an item may occasionally become unavailable before the website has been updated.' },
      { type: 'p', text: 'If this occurs, we will contact the customer and, where appropriate, discuss an alternative product, cancellation or refund in accordance with applicable law.' },
    ],
  },
  {
    heading: '8. Delivery Options',
    blocks: [
      { type: 'p', text: 'Aromatic Scents uses selected third-party courier and delivery providers.' },
      { type: 'p', text: "Depending on the customer's location and the options available at checkout, delivery may be provided through:" },
      { type: 'ul', items: ['PUDO Locker', 'Courier Guy', 'Internet Express', 'MTE Express'] },
      { type: 'p', text: 'Available delivery options and applicable delivery charges will be displayed during checkout or communicated to the customer before the order is finalised.' },
      { type: 'p', text: 'The delivery provider used may depend on the destination, parcel requirements and service availability.' },
    ],
  },
  {
    heading: '9. Delivery Times',
    blocks: [
      { type: 'p', text: 'Delivery times provided by Aromatic Scents or a third-party courier are estimates and may be affected by:' },
      { type: 'ul', items: [
        'Courier operational delays;',
        'Public holidays and weekends;',
        'Incorrect or incomplete delivery information;',
        'Remote or outlying destinations;',
        'Weather conditions;',
        'Unforeseen events; or',
        'Other circumstances outside the reasonable control of Aromatic Scents.',
      ] },
      { type: 'p', text: 'Aromatic Scents will make reasonable efforts to assist customers with delivery-related queries and courier follow-ups.' },
    ],
  },
  {
    heading: '10. Delivery Address',
    blocks: [
      { type: 'p', text: 'Customers are responsible for providing accurate and complete delivery information, including their name, telephone number and delivery address.' },
      { type: 'p', text: 'Aromatic Scents cannot be held responsible for delays, failed deliveries or additional delivery charges resulting from incorrect or incomplete information supplied by the customer.' },
      { type: 'p', text: 'Where additional charges arise because incorrect information was supplied by the customer, the customer may be responsible for those charges.' },
    ],
  },
  {
    heading: '11. PUDO Locker Deliveries',
    blocks: [
      { type: 'p', text: 'Where PUDO Locker delivery is selected, the customer is responsible for collecting the parcel within the applicable collection period communicated by PUDO.' },
      { type: 'p', text: 'Customers should ensure that the contact details supplied at checkout are correct so that they can receive relevant collection notifications.' },
      { type: 'p', text: 'Failure to collect a parcel within the applicable collection period may result in the parcel being returned or additional delivery charges being incurred.' },
    ],
  },
  {
    heading: '12. Door-to-Door Delivery',
    blocks: [
      { type: 'p', text: "Where door-to-door delivery is selected, customers should provide an address where someone can reasonably receive the parcel during the courier's delivery period." },
      { type: 'p', text: 'Customers may be contacted by the courier regarding delivery.' },
      { type: 'p', text: "Additional delivery attempts, address changes or redelivery may result in additional charges depending on the circumstances and the courier's applicable terms." },
    ],
  },
  {
    heading: '13. Damaged or Incorrect Orders',
    blocks: [
      { type: 'p', text: 'Customers should inspect their order upon receipt.' },
      { type: 'p', text: 'If you receive:' },
      { type: 'ul', items: ['The wrong product;', 'A damaged product;', 'A defective product; or', 'A product that does not correspond with your order,'] },
      { type: 'p', text: 'please contact Aromatic Scents as soon as reasonably possible.' },
      { type: 'p', text: 'We may request your order number, photographs of the product and packaging, and other relevant information to assist with resolving the matter or submitting a courier claim.' },
    ],
  },
  {
    heading: '14. Returns, Refunds and Exchanges',
    blocks: [
      { type: 'p', text: 'Nothing in these Terms & Conditions is intended to exclude or limit any consumer rights available under applicable South African law.' },
      { type: 'p', text: 'Where a product is defective, damaged, incorrect or otherwise qualifies for a remedy under applicable law, Aromatic Scents will provide the appropriate remedy.' },
      { type: 'p', text: "Because perfumes, body products and other fragranced products are hygiene-sensitive items, opened or used products may not be eligible for return simply because a customer changes their mind or does not prefer the fragrance, subject to the customer's rights under applicable law." },
      { type: 'p', text: 'Customers should contact us before sending any product back so that we can provide the appropriate return instructions.' },
    ],
  },
  {
    heading: '15. Fragrance Allergies and Sensitivities',
    blocks: [
      { type: 'p', text: 'Customers are responsible for reviewing available product and ingredient information before using our products.' },
      { type: 'p', text: 'If you have known allergies or sensitivities to fragrances or cosmetic ingredients, please exercise appropriate caution.' },
      { type: 'p', text: 'Products should only be used for their intended purpose and according to any applicable instructions.' },
      { type: 'p', text: 'Discontinue use if irritation or an adverse reaction occurs and seek appropriate medical advice where necessary.' },
      { type: 'p', text: 'Aromatic Scents does not guarantee that every product will be suitable for every individual.' },
    ],
  },
  {
    heading: '16. Wholesale and Reseller Orders',
    blocks: [
      { type: 'p', text: 'Aromatic Scents also supplies resellers and wholesale customers.' },
      { type: 'p', text: 'Wholesale/reseller pricing, minimum order quantities, promotions and ordering conditions may differ from the retail prices displayed on this website.' },
      { type: 'p', text: 'Resellers should contact Aromatic Scents directly for current wholesale pricing, stock availability and ordering information.' },
      { type: 'p', text: 'Retail website prices should not be regarded as wholesale or reseller pricing.' },
    ],
  },
  {
    heading: '17. Promotions and Special Offers',
    blocks: [
      { type: 'p', text: 'Promotions, discounts and free gifts may be subject to specific terms and conditions.' },
      { type: 'p', text: 'Unless otherwise stated:' },
      { type: 'ul', items: [
        'Promotions are available while stocks last.',
        'Promotional offers may have specified start and end dates.',
        'Promotions may not be combined with other offers.',
        'Free gifts are subject to availability.',
        'Aromatic Scents may substitute a free gift with another item of similar value if the advertised gift is unavailable.',
      ] },
      { type: 'p', text: 'Specific promotional terms displayed with an offer will apply where they differ from these general Terms & Conditions.' },
    ],
  },
  {
    heading: '18. Website Use',
    blocks: [
      { type: 'p', text: 'Customers agree to use the website lawfully and responsibly.' },
      { type: 'p', text: 'Customers may not:' },
      { type: 'ul', items: [
        'Attempt to gain unauthorised access to the website;',
        "Interfere with the website's operation;",
        'Use the website for fraudulent or unlawful purposes;',
        'Introduce malicious software or harmful material; or',
        'Copy or commercially exploit website content without permission.',
      ] },
    ],
  },
  {
    heading: '19. Intellectual Property',
    blocks: [
      { type: 'p', text: 'All original content appearing on the Aromatic Scents website, including our:' },
      { type: 'ul', items: [
        'Logo and branding;',
        'Product photographs;',
        'Graphics;',
        'Product descriptions;',
        'Marketing material;',
        'Written content; and',
        'Website design',
      ] },
      { type: 'p', text: 'belongs to Aromatic Scents (Pvt) Ltd or is used with appropriate permission.' },
      { type: 'p', text: 'Such material may not be copied, reproduced, modified, distributed or commercially exploited without prior written permission, except where permitted by law.' },
    ],
  },
  {
    heading: '20. Third-Party Service Providers',
    blocks: [
      { type: 'p', text: 'Our website and order fulfilment process may rely on third-party service providers, including payment processors and courier companies.' },
      { type: 'p', text: 'These may include Bob Pay, PUDO, Courier Guy, Internet Express and MTE Express.' },
      { type: 'p', text: 'Third-party services are subject to their own applicable terms and operating procedures.' },
      { type: 'p', text: 'Aromatic Scents will make reasonable efforts to assist customers when an issue involving a third-party service affects an order.' },
    ],
  },
  {
    heading: '21. Personal Information',
    blocks: [
      { type: 'p', text: 'Aromatic Scents may collect and process personal information necessary to:' },
      { type: 'ul', items: [
        'Process orders;',
        'Process payments;',
        'Arrange deliveries;',
        'Communicate with customers;',
        'Provide customer support;',
        'Improve our services; and',
        'Operate and maintain our website.',
      ] },
      { type: 'p', text: 'Personal information will be handled in accordance with applicable South African data-protection legislation and our Privacy Policy.' },
      { type: 'p', text: 'Please refer to our Privacy Policy for more information about how we collect, use, store and protect personal information.' },
    ],
  },
  {
    heading: '22. Website Availability',
    blocks: [
      { type: 'p', text: 'We make reasonable efforts to keep the website available and functioning correctly.' },
      { type: 'p', text: 'However, we do not guarantee that the website will always be available, uninterrupted or completely free from errors.' },
      { type: 'p', text: 'Temporary interruptions may occur due to maintenance, technical problems, hosting issues, internet disruptions or circumstances beyond our reasonable control.' },
    ],
  },
  {
    heading: '23. Limitation of Liability',
    blocks: [
      { type: 'p', text: 'To the extent permitted by applicable law, Aromatic Scents will not be responsible for losses arising from circumstances beyond our reasonable control.' },
      { type: 'p', text: 'Nothing in these Terms & Conditions is intended to exclude, restrict or limit any liability or consumer right that cannot lawfully be excluded, restricted or limited under South African law.' },
    ],
  },
  {
    heading: '24. Changes to These Terms',
    blocks: [
      { type: 'p', text: 'Aromatic Scents may update these Terms & Conditions from time to time.' },
      { type: 'p', text: 'The latest version will be published on this website together with the date on which it was last updated.' },
      { type: 'p', text: 'Customers are encouraged to review these Terms & Conditions periodically.' },
    ],
  },
  {
    heading: '25. Governing Law',
    blocks: [
      { type: 'p', text: 'These Terms & Conditions are governed by the laws of the Republic of South Africa.' },
      { type: 'p', text: 'Any dispute relating to these Terms & Conditions will be dealt with in accordance with applicable South African law and the rights and remedies available to consumers.' },
    ],
  },
  {
    heading: '26. Contact Details',
    blocks: [
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd' },
      { type: 'ul', items: [
        'Email: info@aromaticscents.co.za',
        'WhatsApp / Telephone: 084 961 5725',
        'Website: www.aromaticscents.co.za',
      ] },
      { type: 'p', text: 'For questions relating to products, orders, payments, delivery, returns or these Terms & Conditions, please contact us using the details above.' },
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="September 2026"
      intro="Welcome to the Aromatic Scents website. These Terms & Conditions govern your use of our website and the purchase of products through our online store. By accessing or using our website, placing an order or purchasing products from us, you acknowledge that you have read and understood these Terms & Conditions and agree to be bound by them."
      sections={sections}
    />
  )
}
