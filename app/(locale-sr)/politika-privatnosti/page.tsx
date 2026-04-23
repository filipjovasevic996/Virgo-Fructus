import type { Metadata } from 'next'
import { PrivacyPolicyContent } from '@/components/legal/privacy-policy-content'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: 'Način prikupljanja, korišćenja i čuvanja podataka o ličnosti.',
  alternates: {
    canonical: '/politika-privatnosti',
    languages: {
      'sr-RS': `${SITE_URL}/politika-privatnosti`,
      'en-US': `${SITE_URL}/en/politika-privatnosti`,
      'x-default': `${SITE_URL}/politika-privatnosti`,
    },
  },
}

export default function PolitikaPrivatnostiPage() {
  return <PrivacyPolicyContent />
}
