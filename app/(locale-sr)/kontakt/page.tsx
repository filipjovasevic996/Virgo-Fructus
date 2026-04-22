import type { Metadata } from 'next'
import ContactPageClient from '@/components/contact-page-client'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktirajte Vigor Fructus za porudzbine, B2B saradnju i pitanja o premium dehidriranom vocu.',
  alternates: {
    canonical: '/kontakt',
    languages: {
      'sr-RS': `${SITE_URL}/kontakt`,
      'en-US': `${SITE_URL}/en/kontakt`,
      'x-default': `${SITE_URL}/kontakt`,
    },
  },
  openGraph: {
    type: 'website',
    title: 'Kontakt | Vigor Fructus',
    description: 'Kontakt forma i informacije za saradnju sa Vigor Fructus timom.',
    url: `${SITE_URL}/kontakt`,
    images: [{ url: `${SITE_URL}/kontakt/opengraph-image`, width: 1200, height: 630, alt: 'Kontakt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kontakt | Vigor Fructus',
    description: 'Kontakt forma i informacije za saradnju sa Vigor Fructus timom.',
    images: [`${SITE_URL}/kontakt/opengraph-image`],
  },
}

export default function ContactPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Kontakt', item: `${SITE_URL}/kontakt` },
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
