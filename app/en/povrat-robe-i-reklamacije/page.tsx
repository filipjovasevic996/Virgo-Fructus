import type { Metadata } from 'next'
import { ReturnsComplaintsContent } from '@/components/legal/returns-complaints-content'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Returns and complaints',
  description:
    'Information on withdrawal rights, returns and complaints. (Serbian version is authoritative.)',
  alternates: {
    canonical: '/en/povrat-robe-i-reklamacije',
    languages: buildLanguageAlternates('/povrat-robe-i-reklamacije'),
  },
}

export default function PovratRobeIReklamacijePage() {
  return <ReturnsComplaintsContent />
}
