'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from './cart-context'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from './language-switcher'

const navLinkDefs = [
  { href: '/', key: 'nav.home' },
  { href: '/prodavnica', key: 'nav.shop' },
  { href: '/nasa-prica', key: 'nav.ourStory' },
  { href: '/kontakt', key: 'nav.contact' },
] as const

export function Navigation() {
  const pathname = usePathname()
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
            href="/"
            className="font-serif font-bold text-lg sm:text-xl md:text-[22px] text-bg-dark tracking-[0.06em]"
          >
            VIGOR FRUCTUS
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinkDefs.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-sans text-sm text-text-nav transition-colors hover:text-text-nav-hover',
                  pathname === link.href && 'font-medium text-text-nav-hover'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/korpa"
              className="relative p-2 text-text-nav hover:text-text-nav-hover transition-colors"
              aria-label={`${t('nav.cart')} (${totalItems})`}
            >
              <ShoppingCart className="h-5 w-5" />
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
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block py-3 px-4 font-sans text-base text-text-nav transition-colors hover:text-text-nav-hover hover:bg-cream/30',
                  pathname === link.href && 'font-medium text-text-nav-hover'
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
