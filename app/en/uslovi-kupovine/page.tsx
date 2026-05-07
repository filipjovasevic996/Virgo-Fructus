import type { Metadata } from 'next'
import { TermsOfPurchaseContent } from '@/components/legal/terms-of-purchase-content'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Terms of purchase',
  description:
    'General terms of use for the Vigor Fructus website and online purchases. (Serbian version is authoritative.)',
  alternates: {
    canonical: '/en/uslovi-kupovine',
    languages: buildLanguageAlternates('/uslovi-kupovine'),
  },
}

export default function UsloviKupovinePage() {
  return <TermsOfPurchaseContent />
}
