import type { Metadata } from 'next'
import AboutPageClient from '@/components/about-page-client'
import { buildLanguageAlternates } from '@/lib/hreflang'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Our story',
  description:
    'Vigor Fructus — a small Belgrade dehydrated fruit brand founded by Jelena and Danilo, with nearly two decades of hospitality experience. Slow low-temperature drying for premium cocktails and healthy snacking.',
  alternates: {
    canonical: '/en/nasa-prica',
    languages: buildLanguageAlternates('/nasa-prica'),
  },
  openGraph: {
    type: 'website',
    title: 'Our story | Vigor Fructus',
    description:
      'A small Belgrade dehydrated fruit brand founded by Jelena and Danilo. Slow low-temperature drying for premium cocktails and healthy snacking.',
    url: `${SITE_URL}/en/nasa-prica`,
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/nasa-prica/opengraph-image`, width: 1200, height: 630, alt: 'Our story — Vigor Fructus' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our story | Vigor Fructus',
    description:
      'How Jelena and Danilo started Vigor Fructus and why slow low-temperature drying makes fruit perfect for cocktails and healthy snacking.',
    images: [`${SITE_URL}/nasa-prica/opengraph-image`],
  },
}

export default function AboutPageEn() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Our story', item: `${SITE_URL}/en/nasa-prica` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutPageClient />
    </>
  )
}
