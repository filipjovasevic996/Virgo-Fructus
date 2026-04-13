'use client'

import Link from 'next/link'
import { Sun, Leaf, Package } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="bg-bg-page min-h-screen">
      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[760px] px-5 sm:px-6">
          <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
            {t('story.title')}
          </span>
          <h1 className="mt-3 sm:mt-4 font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-bg-dark leading-tight">
            {t('story.headline')}
          </h1>

          <div className="mt-5 sm:mt-8 font-sans text-sm sm:text-base text-text-nav leading-[1.7]">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam quis risus eget urna mollis ornare vel eu leo.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-[760px] px-5 sm:px-6">
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
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
                {t('story.beginningLabel')}
              </span>
              <h2 className="mt-3 sm:mt-4 font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
                {t('story.beginningTitle')}
              </h2>
              <div className="mt-4 sm:mt-6 font-sans text-sm sm:text-base text-text-nav leading-[1.7] space-y-4">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-[400px] h-[300px] bg-cream rounded-lg flex items-center justify-center">
                <span className="text-8xl">🌅</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-[300px] sm:max-w-[400px] h-[220px] sm:h-[300px] bg-cream rounded-lg flex items-center justify-center">
                <span className="text-6xl sm:text-8xl">🍋</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
                {t('story.philosophyLabel')}
              </span>
              <h2 className="mt-3 sm:mt-4 font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
                {t('story.philosophyTitle')}
              </h2>
              <div className="mt-4 sm:mt-6 font-sans text-sm sm:text-base text-text-nav leading-[1.7] space-y-4">
                <p>
                  Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
                </p>
                <p>
                  Ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
              {t('story.processLabel')}
            </span>
            <h2 className="mt-3 sm:mt-4 font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
              {t('story.processTitle')}
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-border-card" />

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-bg-hero flex items-center justify-center z-10">
                  <Sun className="w-8 h-8 text-lime" />
                </div>
                <div className="absolute top-8 w-4 h-4 rounded-full bg-lime hidden md:block" style={{ marginTop: '-6px' }} />
                <h3 className="mt-6 font-serif font-semibold text-xl text-bg-dark">
                  {t('story.step1Title')}
                </h3>
                <p className="mt-2 font-sans text-sm text-text-nav leading-relaxed max-w-xs">
                  {t('story.step1Desc')}
                </p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-bg-hero flex items-center justify-center z-10">
                  <Leaf className="w-8 h-8 text-lime" />
                </div>
                <div className="absolute top-8 w-4 h-4 rounded-full bg-lime hidden md:block" style={{ marginTop: '-6px' }} />
                <h3 className="mt-6 font-serif font-semibold text-xl text-bg-dark">
                  {t('story.step2Title')}
                </h3>
                <p className="mt-2 font-sans text-sm text-text-nav leading-relaxed max-w-xs">
                  {t('story.step2Desc')}
                </p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-bg-hero flex items-center justify-center z-10">
                  <Package className="w-8 h-8 text-lime" />
                </div>
                <div className="absolute top-8 w-4 h-4 rounded-full bg-lime hidden md:block" style={{ marginTop: '-6px' }} />
                <h3 className="mt-6 font-serif font-semibold text-xl text-bg-dark">
                  {t('story.step3Title')}
                </h3>
                <p className="mt-2 font-sans text-sm text-text-nav leading-relaxed max-w-xs">
                  {t('story.step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-hero py-10 sm:py-16">
        <div className="mx-auto max-w-[760px] px-5 sm:px-6 text-center">
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-cream">
            {t('story.ctaHeadline')}
          </h2>
          <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base text-text-body-light max-w-md mx-auto">
            {t('story.ctaDesc')}
          </p>
          <Link
            href="/prodavnica"
            className="mt-8 inline-flex items-center px-7 py-3.5 bg-bg-page text-bg-dark font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors"
          >
            {t('story.viewShop')}
          </Link>
        </div>
      </section>
    </div>
  )
}
