import type { Metadata } from 'next'
import { TermsOfPurchaseContent } from '@/components/legal/terms-of-purchase-content'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Terms of purchase',
  description:
    'General terms of use for the Vigor Fructus website and online purchases. (Serbian version is authoritative.)',
  alternates: {
    canonical: '/en/uslovi-kupovine',
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
