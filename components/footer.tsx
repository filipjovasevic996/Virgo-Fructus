'use client'

import Link from 'next/link'
import { Instagram, Mail, Phone } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'

const footerLinkDefs = [
  { href: '/prodavnica', key: 'nav.shop' },
  { href: '/nasa-prica', key: 'nav.ourStory' },
  { href: '/kontakt', key: 'nav.contact' },
  { href: '/korpa', key: 'nav.cart' },
] as const

const legalLinks = [
  { href: '/uslovi-kupovine', key: 'legal.terms.title' },
  { href: '/povrat-robe-i-reklamacije', key: 'legal.returns.title' },
  { href: '/politika-privatnosti', key: 'legal.privacy.title' },
] as const

export function Footer() {
  const { t } = useI18n()
  const { withLocale } = useLocalizedPath()
  const instagramUrl = 'https://www.instagram.com/dehidriranovoce_beograd'

  return (
    <footer className="mt-auto border-t border-border-card/30 bg-bg-dark">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 sm:py-12 lg:grid-cols-4 lg:gap-10 lg:items-center lg:justify-items-center">
          <div className="text-center sm:justify-self-center sm:text-center">
            <Link
              href={withLocale('/')}
              className="font-serif text-xl font-bold tracking-[0.06em] text-cream transition-colors hover:text-lime"
            >
              VIGOR FRUCTUS
            </Link>
            <p className="mx-auto mt-4 max-w-sm font-sans text-sm leading-relaxed text-text-body-light/75 sm:mx-0">
              {t('footer.description')}
            </p>
          </div>

          <div className="text-center sm:justify-self-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terra">
              {t('footer.usefulLinks')}
            </p>
            <nav className="mt-4 flex flex-col items-center gap-y-2 sm:items-start">
              {footerLinkDefs.map((link) => (
                <Link
                  key={link.href}
                  href={withLocale(link.href)}
                  className="w-fit font-sans text-sm text-text-body-light/75 transition-colors hover:text-lime"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-center sm:justify-self-center sm:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terra">{t('legal.label')}</p>
            <nav className="mt-4 flex flex-col items-center gap-y-2 sm:items-start">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={withLocale(link.href)}
                  className="w-fit font-sans text-sm text-text-body-light/75 transition-colors hover:text-lime"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-center sm:justify-self-center sm:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terra">Kontakt</p>
            <div className="mt-4 grid justify-items-center gap-3 sm:justify-items-end">
              <a
                href="mailto:vigorfructus@gmail.com"
                className="inline-flex w-fit items-center gap-2 font-sans text-sm text-text-body-light/75 transition-colors hover:text-lime"
              >
                <Mail className="h-4 w-4 shrink-0" />
                vigorfructus@gmail.com
              </a>
              <a
                href="tel:+381693023828"
                className="inline-flex w-fit items-center gap-2 font-sans text-sm text-text-body-light/75 transition-colors hover:text-lime"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +381 69 302 3828
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-fit items-center gap-2 font-sans text-sm text-text-body-light/75 transition-colors hover:text-lime"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border-card/30 py-5 sm:py-6">
          <p className="text-center font-sans text-xs text-text-body-light/40">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
