'use client'

import { useI18n } from '@/lib/i18n'

export function TermsOfPurchaseContent() {
  const { t } = useI18n()

  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          {t('legal.label')}
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          {t('legal.terms.title')}
        </h1>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.contractingParties.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.contractingParties.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.subjectAndScope.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.subjectAndScope.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.pricingAndPayment.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.pricingAndPayment.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.orderingAndContractConclusion.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.orderingAndContractConclusion.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.delivery.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.delivery.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.liabilityLimitation.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.liabilityLimitation.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.intellectualProperty.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.intellectualProperty.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.terms.sections.amendments.title')}
            </h2>
            <p className="mt-3">{t('legal.terms.sections.amendments.body')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
