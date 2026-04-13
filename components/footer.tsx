'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const footerLinkDefs = [
  { href: '/prodavnica', key: 'nav.shop' },
  { href: '/nasa-prica', key: 'nav.ourStory' },
  { href: '/kontakt', key: 'nav.contact' },
  { href: '/korpa', key: 'nav.cart' },
] as const

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-bg-dark py-8 sm:py-12 mt-auto">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 sm:gap-8">
          <div className="max-w-xs">
            <Link
              href="/"
              className="font-serif font-bold text-lg sm:text-xl md:text-[22px] text-text-body-light tracking-[0.06em]"
            >
              VIGOR FRUCTUS
            </Link>
            <p className="mt-4 font-sans text-sm text-text-body-light/50 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinkDefs.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs text-text-body-light/50 hover:text-text-body-light transition-colors"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="text-right">
            <p className="font-sans text-sm text-text-body-light/50">
              info@vigorfructus.rs
            </p>
            <p className="font-sans text-sm text-text-body-light/50 mt-1">
              +381 11 123 4567
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-5 sm:pt-6 border-t border-border-card/30">
          <p className="font-sans text-xs text-text-body-light/30 text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
