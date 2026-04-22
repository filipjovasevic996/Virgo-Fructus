import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/components/cart-context'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vigor Fructus | Premium Dehidrirano Voće',
    template: '%s | Vigor Fructus',
  },
  description:
    'Premium dehidrirano voće iz Beograda za koktele, dekoraciju pića i zdravu užinu. Sušenje voća na niskim temperaturama — 100% prirodno, bez aditiva. Besplatna dostava u Srbiji za narudžbine preko 2000 RSD.',
  keywords: [
    'dehidrirano voće',
    'sušeno voće',
    'sušenje voća',
    'voće za koktele',
    'dehidrirano voće Beograd',
    'sušeno voće Srbija',
    'kokteli garnish',
    'dekoracija pića',
    'zdravi snack',
    'prirodno voće',
    'vigor fructus',
    'vigor',
    'fructus',
    'Beograd dostava voće',
  ],
  authors: [{ name: 'Vigor Fructus' }],
  creator: 'Vigor Fructus',
  publisher: 'Vigor Fructus',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: 'Vigor Fructus',
    title: 'Vigor Fructus | Premium Dehidrirano Voće Beograd',
    description:
      'Premium dehidrirano voće iz Beograda — sušeno, prirodno, bez aditiva. Za koktele, dekoraciju pića i zdrave užine. Dostava širom Srbije.',
    images: [
      {
        url: '/logo.png',
        alt: 'Vigor Fructus – Premium dehidrirano voće Beograd',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vigor Fructus | Premium Dehidrirano Voće Beograd',
    description:
      'Dehidrirano voće iz Beograda za koktele i zdravu užinu. 100% prirodno, bez aditiva. Dostava širom Srbije.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png', sizes: 'any' }],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${SITE_URL}/#organization`,
  name: 'Vigor Fructus',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
  },
  image: `${SITE_URL}/logo.png`,
  description:
    'Premium dehidrirano voće iz Beograda za koktele, dekoraciju pića i zdravu užinu. Sušenje na niskim temperaturama — bez aditiva i konzervansa.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Beograd',
    addressRegion: 'RS-00',
    addressCountry: 'RS',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+381693023828',
    email: 'vigorfructus@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['Serbian', 'English'],
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '14:00',
    },
  ],
  areaServed: {
    '@type': 'City',
    name: 'Beograd',
  },
  priceRange: '$$',
  currenciesAccepted: 'RSD',
  sameAs: ['https://www.instagram.com/dehidriranovoce_beograd'],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Vigor Fructus',
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  description: 'Premium dehidrirano voće iz Beograda — sušeno, prirodno, bez aditiva.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sr" className={`${cormorant.variable} ${jost.variable} bg-bg-page`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
