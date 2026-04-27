import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Korpa',
  description: 'Pregledajte vašu korpu i završite porudžbinu. Besplatna dostava za narudžbine preko 2500 RSD.',
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
