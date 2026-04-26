'use client'

import Link from 'next/link'
import { Sun, Leaf, Package } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'

export default function AboutPageClient() {
  const { t } = useI18n()
  const { withLocale } = useLocalizedPath()

  return (
    <div className="bg-bg-page min-h-screen">
      <section className="py-4 sm:py-8">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <h1 className="mt-3 sm:mt-4 font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-bg-dark leading-tight">
            {t('story.headline')}
          </h1>

          <div className="mt-5 sm:mt-8 font-sans text-sm sm:text-base text-text-nav leading-[1.7]">
            <p>{t('story.introLead')}</p>
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-8">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <blockquote className="border-l-4 border-lime bg-bg-hero rounded-r-lg py-6 px-6 sm:py-8 sm:px-8 lg:px-12">
            <p className="font-serif italic text-xl sm:text-2xl lg:text-[26px] text-cream leading-relaxed">
              &ldquo;{t('story.quote')}&rdquo;
            </p>
            <footer className="mt-4 font-sans text-sm text-text-body-light">
              {t('story.quoteAuthor')}
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
                {t('story.beginningTitle')}
              </h2>
              <div className="mt-4 sm:mt-6 font-sans text-sm sm:text-base text-text-nav leading-[1.7] space-y-4">
                <p>{t('story.beginningP1')}</p>
                <p>{t('story.beginningP2')}</p>
              </div>
            </div>
            <div className="w-full">
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[300px] bg-cream rounded-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dfpdrglba/image/upload/v1777127621/ChatGPT_Image_Apr_25_2026_04_33_04_PM_khfslm.webp"
                alt="Cocktail"
                className="w-full h-full object-cover"
              />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="order-2 lg:order-1 flex justify-start">
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[300px] bg-cream rounded-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dfpdrglba/image/upload/v1777115798/IMG_6982_mt67bg.webp"
                alt="Dehydrated fruit"
                className="w-full h-full object-cover"
              />
            </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
                {t('story.philosophyTitle')}
              </h2>
              <div className="mt-4 sm:mt-6 font-sans text-sm sm:text-base text-text-nav leading-[1.7] space-y-4">
                <p>{t('story.philosophyP1')}</p>
                <p>{t('story.philosophyP2')}</p>
                <p>{t('story.philosophyP3')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-hero py-10 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 text-center">
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-cream">
            {t('story.ctaHeadline')}
          </h2>
          <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base text-text-body-light max-w-md mx-auto">
            {t('story.ctaDesc')}
          </p>
          <Link
            href={withLocale('/prodavnica')}
            className="mt-8 inline-flex items-center px-7 py-3.5 bg-bg-page text-bg-dark font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors"
          >
            {t('story.viewShop')}
          </Link>
        </div>
      </section>
    </div>
  )
}
