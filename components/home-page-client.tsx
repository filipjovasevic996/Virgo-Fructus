'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import {  Leaf, CheckCircle, Truck, Martini, Apple, PartyPopper } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import { HERO_VIDEO_URL } from '@/app/constants/constants'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Spinner } from '@/components/ui/spinner'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load products')
  return res.json()
}

export function HomePageClient({ initialBestSellers }: { initialBestSellers: Product[] }) {
  const { t, locale } = useI18n()
  const { withLocale } = useLocalizedPath()
  const [mounted, setMounted] = useState(false)
  const swrKey = `/api/products?bestSellers=true&locale=${locale}`
  const { data, isLoading } = useSWR<{ products: Product[] }>(swrKey, fetcher, {
    fallbackData: { products: initialBestSellers },
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 120000,
  })
  const bestSellers = data?.products ?? []
  const hasHeroVideo = Boolean(HERO_VIDEO_URL) && !HERO_VIDEO_URL.includes('/undefined/')

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center overflow-hidden">
        {mounted && hasHeroVideo ? (
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
            <Link href={withLocale('/prodavnica')} className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 bg-lime text-bg-dark font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors shadow-lg">{t('home.orderNow')}</Link>
            <Link href={withLocale('/nasa-prica')} className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 bg-transparent text-white font-sans text-[12px] font-semibold uppercase tracking-[0.08em] border-[1.5px] border-white/40 rounded hover:border-white hover:bg-white/10 transition-colors">{t('home.ourStoryLink')}</Link>
          </div>
        </div>
      </section>

      <section className="bg-bg-page py-4 md:py-6 lg:py-8">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mt-3 sm:mt-4 font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">{t('home.bestSellersSubtitle')}</h2>
            </div>
            <Link href={withLocale('/prodavnica')} className="inline-flex w-fit items-center px-6 py-3 bg-bg-hero text-cream font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-bg-dark transition-colors md:self-end">{t('home.viewAllProducts')}</Link>
          </div>
          {isLoading ? (
            <div className="mt-14 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 flex min-h-[280px] items-center justify-center">
              <div className="flex items-center gap-3 text-text-nav">
                <Spinner className="size-6 text-lime" />
                <p className="font-sans text-sm sm:text-base">{t('shop.loadingProducts')}</p>
              </div>
            </div>
          ) : (
            <div className="mt-14 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-8 gap-y-6 sm:gap-y-8 lg:gap-y-10">
              {bestSellers.map((product, index) => (
                <ProductCard key={product.id} product={product} featuredImageLift imagePriority={index === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-bg-page py-4 sm:pt-6 lg:pt-8 pb-12">
  <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] gap-8 lg:gap-12 items-start">
      <div>
        <h2 className="font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">
          {t('home.aboutSubtitle')}
        </h2>

        <div className="mt-4 sm:mt-6 space-y-4 font-sans text-sm sm:text-base text-text-nav leading-relaxed">
          <p>{t('home.aboutParagraph1')}</p>
          <p>{t('home.aboutParagraph2')}</p>
          <Link href={withLocale('/nasa-prica')} className="inline-flex items-center px-4 py-2 bg-bg-hero text-cream font-sans text-[10px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-bg-dark transition-colors">{t('home.aboutParagraph3')}</Link>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end min-w-0">
        <div className="relative w-full max-w-[400px] h-[300px] rounded-lg overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dfpdrglba/image/upload/v1777040620/Paket_voca_hmnanr.webp"
            alt="Our offer of fruit"
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            className="object-contain"
          />
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
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-bg-dark"><Martini className="w-7 h-7 sm:w-8 sm:h-8 text-lime" /></div>
              <h3 className="mt-4 font-serif font-semibold text-lg sm:text-xl text-cream">{t('home.natural')}</h3>
              <p className="mt-2 font-sans text-xs sm:text-sm text-text-body-light leading-relaxed max-w-xs">{t('home.naturalDesc')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-bg-dark"><Apple className="w-7 h-7 sm:w-8 sm:h-8 text-lime" /></div>
              <h3 className="mt-4 font-serif font-semibold text-lg sm:text-xl text-cream">{t('home.sustainable')}</h3>
              <p className="mt-2 font-sans text-xs sm:text-sm text-text-body-light leading-relaxed max-w-xs">{t('home.sustainableDesc')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-bg-dark"><PartyPopper className="w-7 h-7 sm:w-8 sm:h-8 text-lime" /></div>
              <h3 className="mt-4 font-serif font-semibold text-lg sm:text-xl text-cream">{t('home.premium')}</h3>
              <p className="mt-2 font-sans text-xs sm:text-sm text-text-body-light leading-relaxed max-w-xs">{t('home.premiumDesc')}</p>
            </div>
          </div>
          <Link href={withLocale('/prodavnica')} className="mt-8 inline-flex items-center px-7 py-3.5 bg-bg-page text-bg-dark font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors">{t('home.orderNow')}</Link>
        </div>
      </section>
      <SpeedInsights />
    </>
  )
}
