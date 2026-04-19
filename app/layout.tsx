import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/components/cart-context'
import { I18nProvider } from '@/lib/i18n'
import { ConditionalNavigation } from '@/components/conditional-navigation'
import { ConditionalFooter } from '@/components/conditional-footer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vigorfructus.rs'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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
    'Premium dehidrirano voće za koktele, dekoraciju pića i zdravu užinu. 100% prirodno, bez aditiva. Besplatna dostava u Beogradu za narudžbine preko 2000 RSD.',
  keywords: [
    'dehidrirano voće',
    'sušeno voće',
    'kokteli',
    'dekoracija pića',
    'bar oprema',
    'zdravi snack',
    'prirodno voće',
    'vigor fructus',
    'premium voće Srbija',
    'sušeno voće Beograd',
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
    title: 'Vigor Fructus | Premium Dehidrirano Voće',
    description:
      'Premium dehidrirano voće za koktele, dekoraciju pića i zdravu užinu. Prirodno, sušeno, zdravo.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vigor Fructus – Premium dehidrirano voće',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vigor Fructus | Premium Dehidrirano Voće',
    description:
      'Premium dehidrirano voće za koktele i zdravu užinu. 100% prirodno, bez aditiva.',
    images: ['/og-image.png'],
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vigor Fructus',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    'Premium dehidrirano voće za koktele, dekoraciju pića i zdravu užinu.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Beograd',
    addressCountry: 'RS',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+381 69 302 3828',
    email: 'vigorfructus@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['Serbian', 'English'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sr" className={`${cormorant.variable} ${jost.variable} bg-bg-page`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <I18nProvider>
          <CartProvider>
            <ConditionalNavigation />
            <main>{children}</main>
            <ConditionalFooter />
          </CartProvider>
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
