import type { Metadata } from 'next'
import { ReturnsComplaintsContent } from '@/components/legal/returns-complaints-content'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Povrat robe i reklamacije',
  description: 'Informacije o pravu na odustanak, povratu robe i reklamacijama.',
  alternates: {
    canonical: '/povrat-robe-i-reklamacije',
    languages: buildLanguageAlternates('/povrat-robe-i-reklamacije'),
  },
}

export default function PovratRobeIReklamacijePage() {
  return <ReturnsComplaintsContent />
}
