import type { Metadata } from 'next'
import AboutPageClient from '@/components/about-page-client'
import { buildLanguageAlternates } from '@/lib/hreflang'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Naša priča',
  description:
    'Vigor Fructus — mali beogradski brend dehidriranog voća. Jelena i Danilo, sa skoro dve decenije iskustva u ugostiteljstvu, sporo suše voće na niskim temperaturama za premium koktele i zdravu užinu.',
  alternates: {
    canonical: '/nasa-prica',
    languages: buildLanguageAlternates('/nasa-prica'),
  },
  openGraph: {
    type: 'website',
    title: 'Naša priča | Vigor Fructus',
    description:
      'Mali beogradski brend dehidriranog voća koji su osnovali Jelena i Danilo. Sporo sušenje voća na niskim temperaturama za premium koktele i zdravu užinu.',
    url: `${SITE_URL}/nasa-prica`,
    images: [{ url: `${SITE_URL}/nasa-prica/opengraph-image`, width: 1200, height: 630, alt: 'Naša priča — Vigor Fructus' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naša priča | Vigor Fructus',
    description:
      'Kako su Jelena i Danilo pokrenuli Vigor Fructus i zašto sporo sušenje na niskim temperaturama daje voće savršeno za koktele i zdravu užinu.',
    images: [`${SITE_URL}/nasa-prica/opengraph-image`],
  },
}

export default function AboutPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Naša priča', item: `${SITE_URL}/nasa-prica` },
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
