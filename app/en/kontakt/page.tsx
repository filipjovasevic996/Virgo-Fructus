import type { Metadata } from 'next'
import ContactPageClient from '@/components/contact-page-client'
import { buildLanguageAlternates } from '@/lib/hreflang'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Vigor Fructus for orders, wholesale and B2B partnerships. Email, phone and contact form. We reply within 24 hours.',
  alternates: {
    canonical: '/en/kontakt',
    languages: buildLanguageAlternates('/kontakt'),
  },
  openGraph: {
    type: 'website',
    title: 'Contact | Vigor Fructus',
    description: 'Contact form and details to reach the Vigor Fructus team.',
    url: `${SITE_URL}/en/kontakt`,
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/kontakt/opengraph-image`, width: 1200, height: 630, alt: 'Contact' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Vigor Fructus',
    description: 'Contact form and details to reach the Vigor Fructus team.',
    images: [`${SITE_URL}/kontakt/opengraph-image`],
  },
}

export default function ContactPageEn() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/en/kontakt` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactPageClient />
    </>
  )
}
