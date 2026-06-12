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
  title: 'Frequently asked questions',
  description:
    'Everything you ask about Vigor Fructus dehydrated fruit — shelf life, storage, ingredients, delivery in Belgrade and across Serbia, wholesale and use in cocktails.',
  alternates: {
    canonical: '/en/faq',
    languages: buildLanguageAlternates('/faq'),
  },
  openGraph: {
    type: 'website',
    title: 'FAQ | Vigor Fructus',
    description:
      'Answers to the most common questions about Vigor Fructus dehydrated fruit.',
    url: `${SITE_URL}/en/faq`,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Vigor Fructus',
    description: 'Answers to the most common questions about Vigor Fructus dehydrated fruit.',
  },
}

export default function FaqPageEn() {
  const t = getTranslator('en')

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/en/faq#faq`,
    inLanguage: 'en',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}/en/faq` },
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
