'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { Sun, Leaf, Droplets, CheckCircle, Truck } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { HERO_VIDEO_URL } from '@/app/constants/constants'
import { SpeedInsights } from '@vercel/speed-insights/next'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load products')
  return res.json()
}

export function HomePageClient({ initialBestSellers }: { initialBestSellers: Product[] }) {
  const { t, locale } = useI18n()
  const [mounted, setMounted] = useState(false)
  const swrKey = `/api/products?bestSellers=true&locale=${locale}`
  const isDefaultLocale = locale === 'sr'
  const { data } = useSWR<{ products: Product[] }>(swrKey, fetcher, {
    fallbackData: isDefaultLocale ? { products: initialBestSellers } : undefined,
    revalidateOnMount: !isDefaultLocale,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 120000,
  })
  const bestSellers = data?.products ?? []

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center overflow-hidden">
        {mounted ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-bg-hero" />
        )}
        <div className="absolute inset-0 bg-bg-hero/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="relative z-10 mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28 text-center">
          <span className="inline-block font-sans text-[12px] sm:text-[14px] font-semibold uppercase tracking-[0.2em] text-lime">
            {t('home.tagline')}
          </span>
          <h1 className="mt-4 sm:mt-5 font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[60px] text-white leading-tight drop-shadow-lg">
            {t('home.headline')}
          </h1>
          <p className="mt-3 sm:mt-4 font-sans font-normal text-sm sm:text-[16px] md:text-[18px] text-white/70 leading-relaxed max-w-2xl mx-auto">
            {t('home.description')}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-lime text-xs sm:text-sm font-medium border border-white/10">
              <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('home.badge1')}
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-lime text-xs sm:text-sm font-medium border border-white/10">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('home.badge2')}
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-lime text-xs sm:text-sm font-medium border border-white/10">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('home.badge3')}
            </span>
          </div>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Link href="/prodavnica" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 bg-lime text-bg-dark font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors shadow-lg">{t('home.orderNow')}</Link>
            <Link href="/nasa-prica" className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 bg-transparent text-white font-sans text-[12px] font-semibold uppercase tracking-[0.08em] border-[1.5px] border-white/40 rounded hover:border-white hover:bg-white/10 transition-colors">{t('home.ourStoryLink')}</Link>
          </div>
        </div>
      </section>

      <section className="bg-bg-page py-4 md:py-6 lg:py-8">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">{t('home.bestSellers')}</span>
              <h2 className="mt-3 sm:mt-4 font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">{t('home.bestSellersSubtitle')}</h2>
            </div>
            <Link href="/prodavnica" className="inline-flex w-fit items-center px-6 py-3 bg-bg-hero text-cream font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-bg-dark transition-colors md:self-end">{t('home.viewAllProducts')}</Link>
          </div>
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 md:pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-page py-4 sm:pt-6 lg:pt-8 pb-12">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">{t('home.aboutUs')}</span>
              <h2 className="mt-3 sm:mt-4 font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">{t('home.aboutSubtitle')}</h2>
              <div className="mt-4 sm:mt-6 space-y-4 font-sans text-sm sm:text-base text-text-nav leading-relaxed">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum cras venenatis euismod.</p>
                <p>Nullam quis risus eget urna mollis ornare vel eu leo. Donec id elit non mi porta gravida at eget metus.</p>
                <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Curabitur blandit tempus porttitor.</p>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[400px] h-[300px] bg-cream rounded-lg flex items-center justify-center">
                <span className="text-8xl">🌿</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-hero py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-cream">{t('home.whyUs')}</h2>
          <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-bg-dark"><Sun className="w-7 h-7 sm:w-8 sm:h-8 text-lime" /></div>
              <h3 className="mt-4 font-serif font-semibold text-lg sm:text-xl text-cream">{t('home.natural')}</h3>
              <p className="mt-2 font-sans text-xs sm:text-sm text-text-body-light leading-relaxed max-w-xs">{t('home.naturalDesc')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-bg-dark"><Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-lime" /></div>
              <h3 className="mt-4 font-serif font-semibold text-lg sm:text-xl text-cream">{t('home.sustainable')}</h3>
              <p className="mt-2 font-sans text-xs sm:text-sm text-text-body-light leading-relaxed max-w-xs">{t('home.sustainableDesc')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-bg-dark"><Droplets className="w-7 h-7 sm:w-8 sm:h-8 text-lime" /></div>
              <h3 className="mt-4 font-serif font-semibold text-lg sm:text-xl text-cream">{t('home.premium')}</h3>
              <p className="mt-2 font-sans text-xs sm:text-sm text-text-body-light leading-relaxed max-w-xs">{t('home.premiumDesc')}</p>
            </div>
          </div>
          <Link href="/prodavnica" className="mt-8 inline-flex items-center px-7 py-3.5 bg-bg-page text-bg-dark font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors">{t('home.orderNow')}</Link>
        </div>
      </section>
      <SpeedInsights />
    </>
  )
}
