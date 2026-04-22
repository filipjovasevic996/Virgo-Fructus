'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import useSWR from 'swr'
import { ProductCard } from '@/components/product-card'
import { useI18n } from '@/lib/i18n'
import type { Product } from '@/lib/products'
import { ArrowUpDown, Search, X } from 'lucide-react'
import { parseWeightToGrams } from '@/lib/parse-weight-grams'
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

export function ShopPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t, locale } = useI18n()
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
    mounted ? `/api/products?locale=${locale}` : null,
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

  const filteredProducts = useMemo(() => {
    const q = normalizeText(searchQuery)
    if (!q) return products
    return products.filter((product) => {
      const primaryName = normalizeText(product.name)
      const secondaryName = normalizeText(secondaryNameById.get(product.id) ?? '')
      return primaryName.includes(q) || secondaryName.includes(q)
    })
  }, [products, searchQuery, secondaryNameById])

  const getSortPriceBy50g = (product: Product) => {
    const row50g = product.prices.find((entry) => parseWeightToGrams(entry.weight) === 50)
    if (!row50g) return Number.POSITIVE_INFINITY
    return row50g.salePrice && row50g.salePrice > 0 ? row50g.salePrice : row50g.price
  }

  const visibleProducts = useMemo(() => {
    if (sortBy === 'popular') return filteredProducts

    return [...filteredProducts].sort((a, b) => {
      const priceA = getSortPriceBy50g(a)
      const priceB = getSortPriceBy50g(b)
      if (priceA === priceB) return a.name.localeCompare(b.name, locale)
      return sortBy === 'priceAsc' ? priceA - priceB : priceB - priceA
    })
  }, [filteredProducts, sortBy, locale])

  const showLoading = !mounted || isLoading

  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
            {t('shop.title')}
          </span>
          <h1 className="mt-2 font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">
            {t('shop.heading')}
          </h1>
          <div className="mt-4 sm:mt-5 flex items-center justify-end gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as 'popular' | 'priceAsc' | 'priceDesc')}
            >
              <SelectTrigger className="h-10 w-[180px] border-border-light/70 bg-cream/80 text-text-nav shadow-none focus:border-text-nav-hover focus:ring-2 focus:ring-lime/30">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-text-nav/65" />
                  <SelectValue placeholder={t('shop.sortPopular')} />
                </div>
              </SelectTrigger>
              <SelectContent className="border-border-light/70 bg-cream text-text-nav">
                <SelectItem value="popular">{t('shop.sortPopular')}</SelectItem>
                <SelectItem value="priceAsc">{t('shop.sortPriceAsc')}</SelectItem>
                <SelectItem value="priceDesc">{t('shop.sortPriceDesc')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchExpanded((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-light/70 bg-cream/70 text-text-nav/70 transition-colors hover:text-text-nav hover:border-border-light"
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

        {showLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-3 text-text-nav">
              <Spinner className="size-6 text-lime" />
              <p className="font-sans text-sm sm:text-base">{t('shop.loadingProducts')}</p>
            </div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="font-sans text-base sm:text-lg text-text-nav">
              {t('shop.noProducts')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
