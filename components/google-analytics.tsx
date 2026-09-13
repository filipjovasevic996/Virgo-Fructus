import Script from 'next/script'
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from '@/lib/analytics/ga'

export function GoogleAnalytics() {
  const gtagLoaderId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID
  if (!gtagLoaderId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagLoaderId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ''}
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
        `}
      </Script>
    </>
  )
}
