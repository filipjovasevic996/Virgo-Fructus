'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ProductCard } from '@/components/product-card'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import type { Product } from '@/lib/products'
import {
  PRODUCT_CATEGORIES,
  categoryPath,
  getProductCategory,
  type ProductCategory,
} from '@/lib/categories'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
}

/**
 * Broj proizvoda po stranici = tačno puni redovi grida za dati ekran.
 * Kartice su visoke (dugi opisi), pa držimo malo redova po stranici:
 * lg 4 kolone × 2 reda, sm 2 kolone × 3 reda, telefon 1 kolona × 4.
 * SSR/prvi render koristi desktop vrednost (8 kartica u HTML-u za crawlere).
 */
const PAGE_SIZE_DESKTOP = 8
const PAGE_SIZE_TABLET = 6
const PAGE_SIZE_MOBILE = 4

function usePageSize() {
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP)

  useEffect(() => {
    const lg = window.matchMedia('(min-width: 1024px)')
    const sm = window.matchMedia('(min-width: 640px)')
    const update = () =>
      setPageSize(lg.matches ? PAGE_SIZE_DESKTOP : sm.matches ? PAGE_SIZE_TABLET : PAGE_SIZE_MOBILE)
    update()
    lg.addEventListener('change', update)
    sm.addEventListener('change', update)
    return () => {
      lg.removeEventListener('change', update)
      sm.removeEventListener('change', update)
    }
  }, [])

  return pageSize
}

/** 1 … 4 5 6 … 10 — uvek prva, poslednja i susedi trenutne stranice. */
function pageNumbers(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push('gap')
    result.push(page)
  })
  return result
}

/**
 * Stavke sortiranja u bojama sajta: hover/fokus kao aktivni chip kategorije
 * (tamnozelena + krem), kvačica u zelenoj umesto podrazumevane svetle boje.
 */
const SORT_ITEM_CLASS = cn(
  'cursor-pointer text-text-nav focus:bg-bg-dark focus:text-cream data-[state=checked]:font-medium',
  "[&_svg:not([class*='text-'])]:text-text-nav-hover focus:[&_svg:not([class*='text-'])]:text-cream",
)

interface ShopPageClientProps {
  initialProducts: Product[]
  /** Postavljeno na stranici kategorije (`/prodavnica/<slug>`). */
  activeCategory?: ProductCategory
}

export function ShopPageClient({ initialProducts, activeCategory }: ShopPageClientProps) {
  const { t, locale } = useI18n()
  const { withLocale } = useLocalizedPath()
  const activeCategoryDef = getProductCategory(activeCategory)
  const pageSize = usePageSize()
  const [currentPage, setCurrentPage] = useState(1)
  const gridTopRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc'>('popular')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const otherLocale = locale === 'sr' ? 'en' : 'sr'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isSearchExpanded) {
      searchInputRef.current?.focus()
    }
  }, [isSearchExpanded])

  const { data, isLoading } = useSWR<{ products: Product[] }>(
    `/api/products?locale=${locale}`,
    fetcher,
    {
      fallbackData: { products: initialProducts },
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 120000,
    },
  )
  const products = data?.products ?? []
  const { data: otherLocaleData } = useSWR<{ products: Product[] }>(
    mounted ? `/api/products?locale=${otherLocale}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 120000,
    },
  )

  const normalizeText = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  const secondaryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of otherLocaleData?.products ?? []) {
      map.set(p.id, p.name)
    }
    return map
  }, [otherLocaleData])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    return counts
  }, [products])

  // Kategorije bez aktivnih proizvoda (npr. novogodišnja van sezone) se ne
  // prikazuju, osim ako je korisnik baš na toj stranici.
  const visibleCategories = PRODUCT_CATEGORIES.filter(
    (c) => (categoryCounts.get(c.slug) ?? 0) > 0 || c.slug === activeCategory,
  )

  const filteredProducts = useMemo(() => {
    const q = normalizeText(searchQuery)
    const inCategory = activeCategory
      ? products.filter((product) => product.category === activeCategory)
      : products
    if (!q) return inCategory
    return inCategory.filter((product) => {
      const primaryName = normalizeText(product.name)
      const secondaryName = normalizeText(secondaryNameById.get(product.id) ?? '')
      return primaryName.includes(q) || secondaryName.includes(q)
    })
  }, [products, searchQuery, secondaryNameById, activeCategory])

  const getSortMinAvailablePrice = (product: Product) => {
    const validPrices = product.prices
      .map((entry) =>
        typeof entry.salePrice === 'number' && entry.salePrice > 0
          ? entry.salePrice
          : entry.price,
      )
      .filter((price) => typeof price === 'number' && price > 0)

    if (validPrices.length === 0) return Number.POSITIVE_INFINITY
    return Math.min(...validPrices)
  }

  const visibleProducts = useMemo(() => {
    if (sortBy === 'popular') return filteredProducts

    return [...filteredProducts].sort((a, b) => {
      const priceA = getSortMinAvailablePrice(a)
      const priceB = getSortMinAvailablePrice(b)
      if (priceA === priceB) return a.name.localeCompare(b.name, locale)
      return sortBy === 'priceAsc' ? priceA - priceB : priceB - priceA
    })
  }, [filteredProducts, sortBy, locale])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const pageProducts = visibleProducts.slice(pageStart, pageStart + pageSize)

  // Nova pretraga ili sortiranje → nazad na prvu stranicu.
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  const goToPage = (page: number) => {
    setCurrentPage(page)
    const top = gridTopRef.current
    if (top) {
      const y = top.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    }
  }

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 font-sans text-sm transition-colors whitespace-nowrap',
      active
        ? 'border-bg-dark bg-bg-dark text-cream'
        : 'border-border-light/70 bg-cream/70 text-text-nav hover:border-text-nav-hover hover:text-bg-dark',
    )

  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          {/* <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
            {t('shop.title')}
          </span> */}
          <h1 className="mt-2 font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">
            {activeCategoryDef ? activeCategoryDef.heading[locale] : t('shop.heading')}
          </h1>
          {activeCategoryDef && (
            <p className="mt-3 max-w-3xl font-sans text-sm sm:text-base text-text-nav">
              {activeCategoryDef.description[locale]}
            </p>
          )}

          <div className="mt-5 sm:mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Prave <a> veze ka stranicama kategorija — crawleri ih prate. */}
          <nav aria-label={t('shop.categoriesLabel')} className="-mx-5 sm:mx-0">
            <ul className="flex gap-2 overflow-x-auto px-5 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <li>
                <Link
                  href={withLocale('/prodavnica')}
                  className={chipClass(!activeCategory)}
                  aria-current={!activeCategory ? 'page' : undefined}
                >
                  {t('shop.allProducts')}
                  <span className="text-xs opacity-60">{products.length}</span>
                </Link>
              </li>
              {visibleCategories.map((category) => {
                const isActive = category.slug === activeCategory
                return (
                  <li key={category.slug}>
                    <Link
                      href={withLocale(categoryPath(category.slug))}
                      className={chipClass(isActive)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {category.label[locale]}
                      <span className="text-xs opacity-60">
                        {categoryCounts.get(category.slug) ?? 0}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as 'popular' | 'priceAsc' | 'priceDesc')}
            >
              <SelectTrigger className="h-10 w-auto min-w-[180px] cursor-pointer border-border-light/70 bg-cream/70 font-sans text-sm text-text-nav shadow-none transition-colors hover:border-text-nav-hover hover:text-bg-dark focus:border-text-nav-hover focus-visible:ring-2 focus-visible:ring-lime/30 data-[state=open]:border-bg-dark [&_svg:not([class*='text-'])]:text-text-nav/65 [&>svg]:opacity-100">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-text-nav/65" />
                  <SelectValue placeholder={t('shop.sortPopular')} />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border-light/70 bg-cream font-sans text-text-nav shadow-lg shadow-bg-dark/10">
                <SelectItem value="popular" className={SORT_ITEM_CLASS}>{t('shop.sortPopular')}</SelectItem>
                <SelectItem value="priceAsc" className={SORT_ITEM_CLASS}>{t('shop.sortPriceAsc')}</SelectItem>
                <SelectItem value="priceDesc" className={SORT_ITEM_CLASS}>{t('shop.sortPriceDesc')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchExpanded((prev) => !prev)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border-light/70 bg-cream/70 text-text-nav/70 transition-colors hover:border-text-nav-hover hover:text-bg-dark"
                aria-label={isSearchExpanded ? 'Close search' : 'Open search'}
                aria-expanded={isSearchExpanded}
              >
                <Search className="h-4 w-4" />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isSearchExpanded ? 'w-[min(70vw,24rem)] opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery.trim()) setIsSearchExpanded(false)
                    }}
                    placeholder={t('shop.searchPlaceholder') || 'Pretraži proizvode...'}
                    className="w-full rounded-md border border-border-light/70 bg-cream px-4 py-2.5 font-sans text-sm text-bg-dark placeholder:text-text-nav/55 outline-none transition-colors focus:border-text-nav-hover focus:ring-2 focus:ring-lime/30"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        searchInputRef.current?.focus()
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-nav/55 hover:text-text-nav transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div ref={gridTopRef} />

        {/*
         * Only show the spinner when SWR is loading AND we don't yet have any
         * products to render. With `fallbackData: { products: initialProducts }`
         * SWR returns `isLoading: false` on first render, so SSR HTML always
         * contains the full grid — never the spinner. This guard keeps the
         * SSR contract intact even if SWR's future behaviour changes.
         */}
        {isLoading && products.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-3 text-text-nav">
              <Spinner className="size-6 text-lime" />
              <p className="font-sans text-sm sm:text-base">{t('shop.loadingProducts')}</p>
            </div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="font-sans text-base sm:text-lg text-text-nav">
              {searchQuery.trim() ? t('shop.noSearchResults') : t('shop.noProducts')}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-14 sm:mt-16 pt-8 sm:pt-10 md:pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-8 gap-y-6 sm:gap-y-8 lg:gap-y-26">
              {pageProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  featuredImageLift
                  imagePriority={safePage === 1 && index < 4}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label={t('shop.paginationLabel')}
                className="mt-12 sm:mt-16 flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    aria-label={t('shop.pagePrev')}
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border-light/70 bg-cream/70 text-text-nav transition-colors hover:border-text-nav-hover hover:text-bg-dark disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers(safePage, totalPages).map((page, i) =>
                    page === 'gap' ? (
                      <span key={`gap-${i}`} className="px-1 text-text-nav/60">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        aria-label={t('shop.pageN', { page })}
                        aria-current={page === safePage ? 'page' : undefined}
                        className={cn(
                          'inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border px-3 font-sans text-sm transition-colors',
                          page === safePage
                            ? 'border-bg-dark bg-bg-dark text-cream'
                            : 'border-border-light/70 bg-cream/70 text-text-nav hover:border-text-nav-hover hover:text-bg-dark',
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    aria-label={t('shop.pageNext')}
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border-light/70 bg-cream/70 text-text-nav transition-colors hover:border-text-nav-hover hover:text-bg-dark disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="font-sans text-xs text-text-nav/70">
                  {t('shop.showing', {
                    from: pageStart + 1,
                    to: pageStart + pageProducts.length,
                    total: visibleProducts.length,
                  })}
                </p>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
