import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktirajte Vigor Fructus – telefon, email i radno vreme. Pitanja o porudžbinama, veleprodaja i B2B saradnja.',
  alternates: { canonical: '/kontakt' },
  openGraph: {
    title: 'Kontakt | Vigor Fructus',
    description: 'Javite nam se – rado odgovaramo na sva vaša pitanja.',
    url: '/kontakt',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
