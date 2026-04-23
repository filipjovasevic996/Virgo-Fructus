import type { Metadata } from 'next'
import { ReturnsComplaintsContent } from '@/components/legal/returns-complaints-content'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Povrat robe i reklamacije',
  description: 'Informacije o pravu na odustanak, povratu robe i reklamacijama.',
  alternates: {
    canonical: '/povrat-robe-i-reklamacije',
    languages: {
      'sr-RS': `${SITE_URL}/povrat-robe-i-reklamacije`,
      'en-US': `${SITE_URL}/en/povrat-robe-i-reklamacije`,
      'x-default': `${SITE_URL}/povrat-robe-i-reklamacije`,
    },
  },
}

export default function PovratRobeIReklamacijePage() {
  return <ReturnsComplaintsContent />
}
