'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'

/** Hide storefront nav on admin routes so the panel can use full width (especially on mobile) */
export function ConditionalNavigation() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <Navigation />
}
