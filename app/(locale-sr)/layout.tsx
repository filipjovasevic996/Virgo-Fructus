import { I18nProvider } from '@/lib/i18n'
import { ConditionalNavigation } from '@/components/conditional-navigation'
import { ConditionalFooter } from '@/components/conditional-footer'
import { AppToaster } from '@/components/app-toaster'

export default function LocaleSrLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <I18nProvider initialLocale="sr">
      <ConditionalNavigation />
      <main>{children}</main>
      <ConditionalFooter />
      <AppToaster />
    </I18nProvider>
  )
}
