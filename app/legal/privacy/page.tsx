import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Privacy Policy | Aromatic Scents' }

const sections: LegalSection[] = [
  {
    heading: '1. Who We Are',
    blocks: [
      { type: 'p', text: 'The responsible party for the personal information described in this Privacy Policy is:' },
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd' },
      { type: 'ul', items: [
        'Email: info@aromaticscents.co.za',
        'Telephone / WhatsApp: 084 961 5725',
        'Website: www.aromaticscents.co.za',
      ] },
      { type: 'p', text: 'For privacy-related questions or requests, please contact us using the details above.' },
    ],
  },
  {
    heading: '2. What Personal Information We Collect',
    blocks: [
      { type: 'p', text: 'Depending on how you interact with us, we may collect information such as:' },
      { type: 'ul', items: [
        'Full name;',
        'Telephone or mobile number;',
        'Email address;',
        'Billing and delivery address;',
        'Order details;',
        'Products purchased;',
        'Payment and transaction information;',
        'Communication between you and Aromatic Scents;',
        'Information provided when you contact us through WhatsApp, email or other communication channels; and',
        'Technical information relating to your use of our website, where applicable.',
      ] },
      { type: 'p', text: 'We aim to collect only information that is reasonably necessary for the relevant purpose.' },
    ],
  },
  {
    heading: '3. How We Collect Your Information',
    blocks: [
      { type: 'p', text: 'We may collect personal information when you:' },
      { type: 'ul', items: [
        'Create or use an account on our website;',
        'Place an order;',
        'Complete the checkout process;',
        'Contact us by email, telephone or WhatsApp;',
        'Subscribe to marketing communications;',
        'Request information about our products;',
        'Participate in promotions or competitions; or',
        'Browse or interact with our website, where applicable.',
      ] },
      { type: 'p', text: 'Where personal information is collected directly from you, we will provide appropriate information about the collection and intended use as required by applicable law.' },
    ],
  },
  {
    heading: '4. Why We Use Your Personal Information',
    blocks: [
      { type: 'p', text: 'We may process your personal information for purposes including:' },
      { type: 'h3', text: 'Processing orders' },
      { type: 'p', text: 'To receive, process and fulfil your order.' },
      { type: 'h3', text: 'Payments' },
      { type: 'p', text: 'To facilitate and verify payments made through our website. Online payments are processed through Bob Pay. Payment processing may involve the handling of information by Bob Pay and other relevant payment-service providers.' },
      { type: 'h3', text: 'Delivery' },
      { type: 'p', text: 'To arrange and track delivery of your order through the delivery service selected for your order. This may include:' },
      { type: 'ul', items: ['PUDO;', 'Courier Guy;', 'Internet Express; and', 'MTE Express.'] },
      { type: 'p', text: 'The information shared with a delivery provider will generally include the information reasonably necessary to complete the delivery, such as your name, telephone number and delivery address.' },
      { type: 'h3', text: 'Customer service' },
      { type: 'p', text: 'To respond to questions, complaints, order enquiries and other customer-service requests.' },
      { type: 'h3', text: 'Business administration' },
      { type: 'p', text: 'To maintain appropriate records, manage our business, process transactions and comply with applicable legal obligations.' },
      { type: 'h3', text: 'Marketing' },
      { type: 'p', text: 'Where permitted by applicable law, we may use your contact information to send information about Aromatic Scents products, promotions, specials and other marketing communications. You may request to stop receiving marketing communications at any time.' },
    ],
  },
  {
    heading: '5. Payment Information',
    blocks: [
      { type: 'p', text: 'Payments made through the Aromatic Scents website are processed through Bob Pay.' },
      { type: 'p', text: 'Aromatic Scents does not require customers to send full payment-card details to us through WhatsApp, email or other informal communication channels.' },
      { type: 'p', text: 'Customers should never send their full card number, CVV or online banking password to Aromatic Scents through WhatsApp or email.' },
      { type: 'p', text: 'Payment providers may process personal information according to their own privacy policies and applicable laws.' },
    ],
  },
  {
    heading: '6. Sharing Personal Information',
    blocks: [
      { type: 'p', text: "We do not sell customers' personal information." },
      { type: 'p', text: 'We may share relevant personal information with trusted third parties where reasonably necessary to provide our services, including:' },
      { type: 'ul', items: [
        'Payment service providers;',
        'Courier and delivery companies;',
        'Website and hosting service providers;',
        'Technology or service providers assisting us with business operations; and',
        'Professional advisers or authorities where disclosure is required or permitted by law.',
      ] },
      { type: 'p', text: 'Third parties will only receive information reasonably necessary for the relevant purpose, subject to applicable legal requirements.' },
    ],
  },
  {
    heading: '7. Courier and Delivery Information',
    blocks: [
      { type: 'p', text: 'When you select delivery, we may provide your relevant personal information to the delivery provider responsible for delivering your order. Depending on your selected delivery option, this may include:' },
      { type: 'h3', text: 'PUDO' },
      { type: 'p', text: 'For locker deliveries, information necessary to identify and notify you regarding your parcel may be processed.' },
      { type: 'h3', text: 'Courier Guy, Internet Express or MTE Express' },
      { type: 'p', text: 'For door-to-door deliveries, the courier may receive your name, telephone number and delivery address so that the parcel can be delivered.' },
      { type: 'p', text: 'Once information has been provided to a third-party service provider, that provider may process the information in accordance with its own applicable privacy policies and legal obligations.' },
    ],
  },
  {
    heading: '8. WhatsApp Communication',
    blocks: [
      { type: 'p', text: 'Aromatic Scents may communicate with customers through WhatsApp for purposes such as:' },
      { type: 'ul', items: [
        'Order confirmations;',
        'Delivery updates;',
        'Customer-service enquiries;',
        'Product enquiries;',
        'Payment or collection communication;',
        'Reseller communication; and',
        'Promotional communication where permitted.',
      ] },
      { type: 'p', text: 'WhatsApp is a third-party communication platform and its own terms and privacy policies may apply to information processed through the platform.' },
      { type: 'p', text: 'Customers should avoid sending unnecessary sensitive personal information through WhatsApp.' },
    ],
  },
  {
    heading: '9. Marketing Communications',
    blocks: [
      { type: 'p', text: 'We may communicate with customers about:' },
      { type: 'ul', items: [
        'New products;',
        'Fragrance launches;',
        'Special offers;',
        'Promotions;',
        'Website updates;',
        'Reseller opportunities; and',
        'Other Aromatic Scents news.',
      ] },
      { type: 'p', text: 'Where consent is required by law, we will obtain the appropriate consent before sending direct marketing.' },
      { type: 'p', text: 'Customers may unsubscribe from marketing communications at any time by contacting us or using the unsubscribe option provided in the relevant communication.' },
    ],
  },
  {
    heading: '10. Website Cookies and Technologies',
    blocks: [
      { type: 'p', text: 'Our website may use cookies or similar technologies to help the website function properly and, where applicable, to understand how visitors use the website.' },
      { type: 'p', text: 'Cookies may be used for purposes such as:' },
      { type: 'ul', items: [
        'Maintaining website functionality;',
        'Remembering certain preferences;',
        'Improving website performance;',
        'Understanding website usage; and',
        'Supporting relevant website or marketing functionality.',
      ] },
      { type: 'p', text: 'Where required, appropriate consent will be requested for non-essential cookies.' },
      { type: 'p', text: 'Customers can also manage cookie settings through their browser, although disabling certain cookies may affect website functionality.' },
    ],
  },
  {
    heading: '11. Data Security',
    blocks: [
      { type: 'p', text: 'Aromatic Scents takes reasonable technical and organisational measures to protect personal information against:' },
      { type: 'ul', items: ['Loss;', 'Unauthorised access;', 'Unauthorised disclosure;', 'Unauthorised alteration;', 'Destruction; and', 'Other unlawful processing.'] },
      { type: 'p', text: 'However, no electronic system or method of transmitting information over the internet can be guaranteed to be completely secure.' },
      { type: 'p', text: 'POPIA requires responsible parties to take appropriate safeguards to protect personal information.' },
    ],
  },
  {
    heading: '12. How Long We Keep Personal Information',
    blocks: [
      { type: 'p', text: 'We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, to provide our services, maintain appropriate business records, resolve disputes, comply with legal obligations or protect our legitimate business interests.' },
      { type: 'p', text: 'Where information is no longer required, we will take reasonable steps to securely delete, destroy or anonymise it where appropriate.' },
    ],
  },
  {
    heading: '13. Your Privacy Rights',
    blocks: [
      { type: 'p', text: 'Subject to applicable law, you may have the right to:' },
      { type: 'ul', items: [
        'Ask whether we hold personal information about you;',
        'Request access to your personal information;',
        'Request correction of inaccurate or incomplete information;',
        'Request deletion of information where legally appropriate;',
        'Object to certain processing of your personal information;',
        'Withdraw consent where processing is based on consent;',
        'Object to direct marketing; and',
        'Lodge a complaint concerning the processing of your personal information.',
      ] },
      { type: 'p', text: 'POPIA provides data subjects with rights concerning access, correction, objection and other aspects of the processing of personal information.' },
    ],
  },
  {
    heading: '14. How to Make a Privacy Request',
    blocks: [
      { type: 'p', text: 'To exercise a privacy right or ask a question about how your information is handled, contact us:' },
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd' },
      { type: 'ul', items: ['info@aromaticscents.co.za', '084 961 5725'] },
      { type: 'p', text: 'Please provide sufficient information for us to identify you and understand your request.' },
      { type: 'p', text: 'We may need to verify your identity before providing access to or making changes to personal information.' },
    ],
  },
  {
    heading: '15. Complaints',
    blocks: [
      { type: 'p', text: 'If you believe that your personal information has been processed unlawfully or that your privacy rights have been infringed, we encourage you to contact Aromatic Scents first so that we can investigate and attempt to resolve the matter.' },
      { type: 'p', text: 'You also have the right, where applicable, to lodge a complaint with the Information Regulator (South Africa).' },
      { type: 'p', text: 'The Information Regulator is the independent authority responsible for monitoring and enforcing compliance with POPIA and PAIA.' },
      { type: 'p', text: 'Information Regulator (South Africa)' },
      { type: 'ul', items: ['enquiries@inforegulator.org.za', '010 023 5200', 'inforegulator.org.za'] },
      { type: 'p', text: 'The Regulator also provides online services for POPIA complaints and security-compromise notifications.' },
    ],
  },
  {
    heading: "16. Children's Personal Information",
    blocks: [
      { type: 'p', text: 'Our website is not intended to knowingly collect personal information from children where such collection is prohibited by applicable law.' },
      { type: 'p', text: "Where the processing of a child's personal information is subject to specific legal requirements, Aromatic Scents will comply with those requirements." },
    ],
  },
  {
    heading: '17. Third-Party Websites',
    blocks: [
      { type: 'p', text: 'Our website may contain links to third-party websites or services.' },
      { type: 'p', text: 'Aromatic Scents is not responsible for the privacy practices, content or security of third-party websites.' },
      { type: 'p', text: 'Customers should review the privacy policies of third-party websites before providing personal information.' },
    ],
  },
  {
    heading: '18. Changes to This Privacy Policy',
    blocks: [
      { type: 'p', text: 'We may update this Privacy Policy from time to time to reflect changes in our business, website, services or applicable legal requirements.' },
      { type: 'p', text: 'The latest version will be published on our website together with the date on which it was last updated.' },
      { type: 'p', text: 'We encourage customers to review this Privacy Policy periodically.' },
    ],
  },
  {
    heading: '19. Contact Us',
    blocks: [
      { type: 'p', text: 'For any questions, concerns or requests relating to privacy or personal information, please contact:' },
      { type: 'p', text: 'Aromatic Scents (Pvt) Ltd' },
      { type: 'ul', items: ['info@aromaticscents.co.za', '084 961 5725', 'www.aromaticscents.co.za'] },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="September 2026"
      intro="Aromatic Scents (Pvt) Ltd respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and protect personal information when you visit our website, place an order, contact us or otherwise interact with Aromatic Scents. This Privacy Policy is intended to operate in accordance with applicable South African data-protection laws, including the Protection of Personal Information Act 4 of 2013 (POPIA)."
      sections={sections}
    />
  )
}
