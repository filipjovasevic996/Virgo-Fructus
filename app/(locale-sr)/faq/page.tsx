import type { Metadata } from 'next'
import { FaqContent } from '@/components/faq-content'
import { buildLanguageAlternates } from '@/lib/hreflang'
import { getTranslator } from '@/lib/i18n/server'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

const FAQ_ITEM_KEYS = [
  'shelfLife',
  'additives',
  'storage',
  'useCases',
  'children',
  'ordering',
  'wholesale',
  'deliveryTime',
] as const

export const metadata: Metadata = {
  title: 'Česta pitanja',
  description:
    'Sve što vas zanima o dehidriranom voću Vigor Fructus — rok trajanja, čuvanje, sastav, dostava u Beogradu i širom Srbije, veleprodaja i upotreba u koktelima.',
  alternates: {
    canonical: '/faq',
    languages: buildLanguageAlternates('/faq'),
  },
  openGraph: {
    type: 'website',
    title: 'Česta pitanja | Vigor Fructus',
    description:
      'Odgovori na najčešća pitanja o dehidriranom voću Vigor Fructus.',
    url: `${SITE_URL}/faq`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Česta pitanja | Vigor Fructus',
    description: 'Odgovori na najčešća pitanja o dehidriranom voću Vigor Fructus.',
  },
}

export default function FaqPage() {
  const t = getTranslator('sr')

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faq`,
    inLanguage: 'sr',
    mainEntity: FAQ_ITEM_KEYS.map((key) => ({
      '@type': 'Question',
      name: t(`faq.items.${key}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.items.${key}.a`),
      },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Česta pitanja', item: `${SITE_URL}/faq` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FaqContent />
    </>
  )
}
