export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag(...args)
}

export type CartAnalyticsItem = {
  id: string
  name: string
  price: number
  quantity: number
}

function toGaItems(items: CartAnalyticsItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))
}

export function trackAddToCart(item: CartAnalyticsItem) {
  gtag('event', 'add_to_cart', {
    currency: 'RSD',
    value: item.price * item.quantity,
    items: toGaItems([item]),
  })
}

export function trackBeginCheckout(items: CartAnalyticsItem[], value: number) {
  gtag('event', 'begin_checkout', {
    currency: 'RSD',
    value,
    items: toGaItems(items),
  })
}

export function trackPurchase(
  orderNumber: string,
  items: CartAnalyticsItem[],
  value: number,
) {
  gtag('event', 'purchase', {
    transaction_id: orderNumber,
    currency: 'RSD',
    value,
    items: toGaItems(items),
  })
}