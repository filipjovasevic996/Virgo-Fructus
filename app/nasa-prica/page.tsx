import type { Metadata } from 'next'
import AboutPageClient from '@/components/about-page-client'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Naša priča',
  description:
    'Upoznajte kako je nastao Vigor Fructus i naš proces dehidracije voca za premium koktele i zdravu uzinu.',
  alternates: { canonical: '/nasa-prica' },
  openGraph: {
    type: 'website',
    title: 'Naša priča | Vigor Fructus',
    description:
      'Upoznajte kako je nastao Vigor Fructus i nasu filozofiju premium dehidriranog voca.',
    url: `${SITE_URL}/nasa-prica`,
    images: [{ url: `${SITE_URL}/nasa-prica/opengraph-image`, width: 1200, height: 630, alt: 'Nasa prica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naša priča | Vigor Fructus',
    description: 'Kako je nastao Vigor Fructus i po cemu je nas proces jedinstven.',
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
