import type { Metadata } from 'next'
import { PrivacyPolicyContent } from '@/components/legal/privacy-policy-content'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: 'Način prikupljanja, korišćenja i čuvanja podataka o ličnosti.',
  alternates: {
    canonical: '/politika-privatnosti',
    languages: buildLanguageAlternates('/politika-privatnosti'),
  },
}

export default function PolitikaPrivatnostiPage() {
  return <PrivacyPolicyContent />
}
