import { I18nProvider } from '@/lib/i18n'

/** Admin UI strings use `t()` — keep Serbian default outside `/en` storefront. */
export default function AdminLocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <I18nProvider initialLocale="sr">{children}</I18nProvider>
}
