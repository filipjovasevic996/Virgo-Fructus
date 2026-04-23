'use client'

import { useI18n } from '@/lib/i18n'

export function ReturnsComplaintsContent() {
  const { t } = useI18n()

  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          {t('legal.label')}
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          {t('legal.returns.title')}
        </h1>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.returns.sections.withdrawal.title')}
            </h2>
            <p className="mt-3">{t('legal.returns.sections.withdrawal.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.returns.sections.conditions.title')}
            </h2>
            <p className="mt-3">{t('legal.returns.sections.conditions.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.returns.sections.complaints.title')}
            </h2>
            <p className="mt-3">{t('legal.returns.sections.complaints.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.returns.sections.responseDeadline.title')}
            </h2>
            <p className="mt-3">{t('legal.returns.sections.responseDeadline.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.returns.sections.refunds.title')}
            </h2>
            <p className="mt-3">{t('legal.returns.sections.refunds.body')}</p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
              {t('legal.returns.sections.contact.title')}
            </h2>
            <p className="mt-3">
              {t('legal.returns.sections.contact.prefix')}{' '}
              <a className="underline hover:text-text-nav-hover" href="mailto:vigorfructus@gmail.com">
                vigorfructus@gmail.com
              </a>{' '}
              {t('legal.returns.sections.contact.suffix')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
