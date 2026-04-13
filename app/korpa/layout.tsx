import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Korpa',
  description: 'Pregledajte vašu korpu i završite porudžbinu. Besplatna dostava u Beogradu za narudžbine preko 2000 RSD.',
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
