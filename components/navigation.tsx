'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from './cart-context'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from './language-switcher'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import { stripLocalePath } from '@/lib/i18n/routing'

const navLinkDefs = [
  { href: '/', key: 'nav.home' },
  { href: '/prodavnica', key: 'nav.shop' },
  { href: '/blog', key: 'nav.blog' },
  { href: '/nasa-prica', key: 'nav.ourStory' },
  { href: '/kontakt', key: 'nav.contact' },
] as const

export function Navigation() {
  const pathname = usePathname()
  const { withLocale } = useLocalizedPath()
  const { totalItems } = useCart()
  const { t } = useI18n()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [prevCount, setPrevCount] = useState(totalItems)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    if (totalItems > prevCount) {
      setBounce(true)
      const timer = setTimeout(() => setBounce(false), 300)
      return () => clearTimeout(timer)
    }
    setPrevCount(totalItems)
  }, [totalItems, prevCount])

  return (
    <header className="sticky top-0 z-50 bg-bg-page border-b border-border-light">
      <nav className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={withLocale('/')}
            className="flex items-center gap-2 md:gap-3 min-w-0 shrink-0 -my-1"
          >
            <Image
              src="/logo.png"
              alt="Vigor Fructus"
              width={200}
              height={200}
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0"
              priority
            />
            <span className="font-serif font-bold text-base sm:text-lg md:text-[22px] text-bg-dark tracking-[0.06em] truncate">
              VIGOR FRUCTUS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinkDefs.map((link) => (
              <Link
                key={link.href}
                href={withLocale(link.href)}
                className={cn(
                  'font-sans text-sm text-text-nav transition-colors hover:text-text-nav-hover',
                  stripLocalePath(pathname ?? '/') === link.href && 'font-medium text-text-nav-hover'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <LanguageSwitcher />
            <Link
              href={withLocale('/korpa')}
              className="relative p-2 text-text-nav hover:text-text-nav-hover transition-colors"
              aria-label={`${t('nav.cart')} (${totalItems})`}
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-5 md:w-5" />
              {totalItems > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-terra text-[11px] font-semibold text-bg-page',
                    bounce && 'animate-badge-bounce'
                  )}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-text-nav"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border-light py-4">
            {navLinkDefs.map((link) => (
              <Link
                key={link.href}
                href={withLocale(link.href)}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block py-3 px-4 font-sans text-base text-text-nav transition-colors hover:text-text-nav-hover hover:bg-cream/30',
                  stripLocalePath(pathname ?? '/') === link.href && 'font-medium text-text-nav-hover'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
