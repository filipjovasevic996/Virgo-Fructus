import type { Metadata } from 'next'
import { PrivacyPolicyContent } from '@/components/legal/privacy-policy-content'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How we collect, use and store personal data. (Serbian version is authoritative.)',
  alternates: {
    canonical: '/en/politika-privatnosti',
    languages: buildLanguageAlternates('/politika-privatnosti'),
  },
}

export default function PolitikaPrivatnostiPage() {
  return <PrivacyPolicyContent />
}
