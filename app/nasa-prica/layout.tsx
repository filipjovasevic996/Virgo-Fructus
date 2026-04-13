import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Naša Priča',
  description:
    'Saznajte kako je nastao Vigor Fructus – od srca prirode do vaše čaše. Ručno selektovano voće, pažljivo dehidrirano, ekološki pakovano.',
  alternates: { canonical: '/nasa-prica' },
  openGraph: {
    title: 'Naša Priča | Vigor Fructus',
    description: 'Od voćnjaka do vaše čaše – upoznajte priču iza Vigor Fructus brenda.',
    url: '/nasa-prica',
  },
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
