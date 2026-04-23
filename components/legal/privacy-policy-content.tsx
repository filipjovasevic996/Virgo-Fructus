'use client'

import { useI18n } from '@/lib/i18n'

export function PrivacyPolicyContent() {
  const { t } = useI18n()

  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-8">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
          {t('legal.label')}
        </span>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl text-bg-dark">
          {t('legal.privacy.title')}
        </h1>

        <div className="mt-8 space-y-7 font-sans text-sm sm:text-base leading-[1.75] text-text-nav">
          {Array.from({ length: 11 }).map((_, idx) => (
            <section key={idx}>
              <h2 className="font-serif text-xl sm:text-2xl text-bg-dark">
                {t(`legal.privacy.sections.s${idx + 1}.title`)}
              </h2>
              {idx + 1 === 2 || idx + 1 === 9 ? (
                <p className="mt-3">
                  {t(`legal.privacy.sections.s${idx + 1}.prefix`)}{' '}
                  <a className="underline hover:text-text-nav-hover" href="mailto:vigorfructus@gmail.com">
                    vigorfructus@gmail.com
                  </a>
                  {t(`legal.privacy.sections.s${idx + 1}.suffix`)}
                </p>
              ) : (
                <p className="mt-3">{t(`legal.privacy.sections.s${idx + 1}.body`)}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
