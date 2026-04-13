import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prodavnica – Dehidrirano Voće',
  description:
    'Pogledajte našu ponudu premium dehidriranog voća. Citrus, jagodičasto i egzotično voće za koktele i užinu. Dostava širom Srbije.',
  alternates: { canonical: '/prodavnica' },
  openGraph: {
    title: 'Prodavnica | Vigor Fructus',
    description: 'Premium dehidrirano voće – citrus, jagodičasto, egzotično. Poručite online.',
    url: '/prodavnica',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
