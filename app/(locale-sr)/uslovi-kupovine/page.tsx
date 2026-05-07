import type { Metadata } from 'next'
import { TermsOfPurchaseContent } from '@/components/legal/terms-of-purchase-content'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Uslovi kupovine',
  description: 'Opšti uslovi korišćenja sajta i online kupovine za Vigor Fructus.',
  alternates: {
    canonical: '/uslovi-kupovine',
    languages: buildLanguageAlternates('/uslovi-kupovine'),
  },
}

export default function UsloviKupovinePage() {
  return <TermsOfPurchaseContent />
}
