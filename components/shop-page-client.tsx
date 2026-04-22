'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { ProductCard } from '@/components/product-card'
import { useI18n } from '@/lib/i18n'
import type { Product } from '@/lib/products'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-md overflow-hidden border border-border-light/60 bg-cream/30">
      <div className="aspect-[4/3] bg-border-light/30 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-[18px] bg-border-light/40 rounded-sm w-3/4" />
        <div className="h-3.5 bg-border-light/30 rounded-sm w-2/5" />
        <div className="flex gap-2 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[26px] w-12 rounded border border-border-light/40 bg-border-light/20" />
          ))}
        </div>
        <div className="h-5 bg-border-light/40 rounded-sm w-1/3 pt-1" />
        <div className="h-[38px] rounded border border-border-light/40 bg-border-light/20 mt-1" />
      </div>
    </div>
  )
}

export function ShopPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t, locale } = useI18n()
  const [mounted, setMounted] = useState(false)
  const isDefaultLocale = locale === 'sr'

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useSWR<{ products: Product[] }>(
    mounted ? `/api/products?locale=${locale}` : null,
    fetcher,
    {
      fallbackData: isDefaultLocale ? { products: initialProducts } : undefined,
      revalidateOnMount: !isDefaultLocale,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 120000,
    },
  )
  const products = data?.products ?? []
  const showSkeleton = !mounted || isLoading

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
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="font-sans text-base sm:text-lg text-text-nav">
              {t('shop.noProducts')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
