'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

/** Hide site footer on admin routes */
export function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <Footer />
}
