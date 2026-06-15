'use client'

import { useI18n } from '@/lib/i18n'

const FAQ_ITEM_KEYS = [
  'shelfLife',
  'additives',
  'storage',
  'useCases',
  'ordering',
  'wholesale',
  'deliveryTime',
] as const

export function FaqContent() {
  const { t } = useI18n()

  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          {t('faq.label')}
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          {t('faq.title')}
        </h1>
        <p className="mt-4 font-sans text-sm sm:text-base leading-[1.75] text-text-nav max-w-2xl">
          {t('faq.lead')}
        </p>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          {FAQ_ITEM_KEYS.map((key) => (
            <section key={key}>
              <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
                {t(`faq.items.${key}.q`)}
              </h2>
              <p className="mt-3">{t(`faq.items.${key}.a`)}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
