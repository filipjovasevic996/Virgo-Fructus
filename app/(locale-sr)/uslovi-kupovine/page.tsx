import type { Metadata } from 'next'
import { TermsOfPurchaseContent } from '@/components/legal/terms-of-purchase-content'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Uslovi kupovine',
  description: 'Opšti uslovi korišćenja sajta i online kupovine za Vigor Fructus.',
  alternates: {
    canonical: '/uslovi-kupovine',
    languages: {
      'sr-RS': `${SITE_URL}/uslovi-kupovine`,
      'en-US': `${SITE_URL}/en/uslovi-kupovine`,
      'x-default': `${SITE_URL}/uslovi-kupovine`,
    },
  },
}

export default function UsloviKupovinePage() {
  return <TermsOfPurchaseContent />
}
