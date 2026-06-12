import type { Metadata } from 'next'
import ContactPageClient from '@/components/contact-page-client'
import { buildLanguageAlternates } from '@/lib/hreflang'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktirajte Vigor Fructus za porudžbine, veleprodaju i B2B saradnju putem emaila, telefona ili kontakt forme. Odgovaramo u roku od 24h.',
  alternates: {
    canonical: '/kontakt',
    languages: buildLanguageAlternates('/kontakt'),
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
