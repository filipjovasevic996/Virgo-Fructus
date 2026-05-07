import type { Metadata } from 'next'
import CartPageClient from '@/components/cart-page-client'

/**
 * The cart is a transactional / personal-state page — never useful in SERPs
 * and contains nothing crawlers should index. `noindex, nofollow` keeps it
 * out of search results without needing hreflang.
 */
export const metadata: Metadata = {
  title: 'Cart',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default CartPageClient
