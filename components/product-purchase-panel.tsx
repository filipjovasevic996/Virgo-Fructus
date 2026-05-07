'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/components/cart-context'
import { useI18n } from '@/lib/i18n'
import type { Product } from '@/lib/products'
import { maxQuantityForCartLine } from '@/lib/product-stock'
import { formatKgFixed4 } from '@/lib/stock-kg'
import { preferredPriceIndex as computePreferredPriceIndex } from '@/lib/preferred-price-index'
import { toast } from 'sonner'

interface ProductPurchasePanelProps {
  product: Product
  initialPreferredIndex: number
}

/**
 * Client island for the interactive purchase area: weight selector,
 * dynamic price/stock display, and add-to-cart button. Initial selection
 * is computed on the server (`initialPreferredIndex`) so SSR HTML matches
 * client hydration without flicker.
 */
export function ProductPurchasePanel({
  product,
  initialPreferredIndex,
}: ProductPurchasePanelProps) {
  const { t } = useI18n()
  const { addItem, items: cartItems } = useCart()
  const [selectedWeight, setSelectedWeight] = useState(initialPreferredIndex)
  const [isAdded, setIsAdded] = useState(false)

  const hasPriceOptions = Boolean(product.prices?.length)
  const safeSelectedWeight = hasPriceOptions
    ? Math.min(selectedWeight, product.prices.length - 1)
    : 0
  const currentPrice = hasPriceOptions ? product.prices[safeSelectedWeight] : null
  const hasSalePrice = currentPrice
    ? typeof currentPrice.salePrice === 'number' && currentPrice.salePrice > 0
    : false
  const displayPrice = currentPrice
    ? hasSalePrice
      ? currentPrice.salePrice!
      : currentPrice.price
    : 0
  const isQuantityMode = product.pricingMode === 'quantity'

  const hasPricedOptions = useMemo(
    () =>
      (product.prices ?? []).some((entry) => {
        const effectivePrice =
          typeof entry.salePrice === 'number' && entry.salePrice > 0
            ? entry.salePrice
            : entry.price
        return effectivePrice > 0
      }),
    [product],
  )

  const preferredPriceIndex = useMemo(() => computePreferredPriceIndex(product), [product])

  const weightMaxQty = useMemo(() => {
    if (!product.prices?.length) return []
    return product.prices.map((po) =>
      maxQuantityForCartLine(
        product.id,
        po.weight,
        product.stockKg ?? 0,
        cartItems,
        product.pricingMode ?? 'weight',
      ),
    )
  }, [product, cartItems])

  useEffect(() => {
    if (!hasPricedOptions) return
    if (!weightMaxQty.length) return

    const selected = product.prices?.[selectedWeight]
    const selectedEffectivePrice = selected
      ? typeof selected.salePrice === 'number' && selected.salePrice > 0
        ? selected.salePrice
        : selected.price
      : 0

    if (selectedEffectivePrice <= 0 && preferredPriceIndex !== selectedWeight) {
      setSelectedWeight(preferredPriceIndex)
      return
    }

    const hasStockForSelected = (weightMaxQty[selectedWeight] ?? 0) >= 1
    if (hasStockForSelected) return

    const preferredWithStock =
      preferredPriceIndex >= 0 && (weightMaxQty[preferredPriceIndex] ?? 0) >= 1
        ? preferredPriceIndex
        : -1

    const firstWithStockAndPrice =
      product.prices?.findIndex((entry, idx) => {
        const effectivePrice =
          typeof entry.salePrice === 'number' && entry.salePrice > 0
            ? entry.salePrice
            : entry.price
        return effectivePrice > 0 && (weightMaxQty[idx] ?? 0) >= 1
      }) ?? -1

    const firstWithStock = weightMaxQty.findIndex((m) => m >= 1)
    const next =
      preferredWithStock >= 0
        ? preferredWithStock
        : firstWithStockAndPrice >= 0
          ? firstWithStockAndPrice
          : firstWithStock

    if (next >= 0 && next !== selectedWeight) setSelectedWeight(next)
  }, [weightMaxQty, selectedWeight, preferredPriceIndex, product, hasPricedOptions])

  useEffect(() => {
    setIsAdded(false)
  }, [selectedWeight])

  const maxQty = currentPrice
    ? maxQuantityForCartLine(
        product.id,
        currentPrice.weight,
        product.stockKg ?? 0,
        cartItems,
        product.pricingMode ?? 'weight',
      )
    : 0

  const handleAddToCart = () => {
    if (!currentPrice) return
    const added = addItem(
      {
        id: product.id,
        name: product.name,
        weight: currentPrice.weight,
        price: displayPrice,
        image: product.image,
      },
      { maxQuantity: maxQty },
    )
    if (!added) {
      toast.error(t('cart.addToCartBlocked'))
      return
    }
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1000)
  }

  return (
    <>
      <div className="mt-6">
        {!isQuantityMode && (
          <p
            className={cn(
              'mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-text-body-light/70',
              !hasPricedOptions && 'invisible',
            )}
          >
            {t('product.chooseWeight')}
          </p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          {!isQuantityMode && (
            <div
              className={cn(
                'flex min-h-[42px] flex-wrap gap-2',
                !hasPricedOptions && 'invisible',
              )}
            >
              {product.prices.map((priceOption, index) => {
                const optMax = weightMaxQty[index] ?? 0
                const unavailable = optMax < 1
                return priceOption.price ? (
                  <button
                    key={`${priceOption.weight}-${index}`}
                    type="button"
                    disabled={unavailable}
                    onClick={() => !unavailable && setSelectedWeight(index)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-medium rounded border transition-colors min-w-[4.5rem]',
                      unavailable &&
                        'cursor-not-allowed border-border-card/40 bg-bg-dark/40 text-text-body-light/35',
                      !unavailable &&
                        safeSelectedWeight === index &&
                        'bg-lime text-bg-dark border-lime cursor-pointer',
                      !unavailable &&
                        safeSelectedWeight !== index &&
                        'bg-bg-dark border-border-card text-text-body-light hover:border-lime/50 cursor-pointer',
                    )}
                  >
                    {priceOption.weight}
                  </button>
                ) : null
              })}
            </div>
          )}
          {hasPricedOptions && (
            <div className={cn('text-right', !isQuantityMode && 'ml-auto')}>
              {currentPrice ? (
                <div className="flex items-baseline justify-end gap-2 sm:gap-3">
                  <span className="font-sans font-bold text-2xl sm:text-3xl text-lime">
                    {displayPrice} {t('common.currency')}
                  </span>
                  {hasSalePrice && (
                    <span className="text-base sm:text-lg text-text-body-light/50 line-through">
                      {currentPrice.price} {t('common.currency')}
                    </span>
                  )}
                </div>
              ) : (
                <span className="font-sans font-semibold text-base text-text-body-light/80">
                  {t('product.noPrice')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {currentPrice && maxQty >= 1 && (
        <div className="mt-4 font-sans text-sm text-text-nav">
          <p className="leading-relaxed">
            {t('product.stockRemainingKg', { kg: formatKgFixed4(product.stockKg) })}
          </p>
        </div>
      )}

      <div className="mt-6 relative">
        <button
          onClick={handleAddToCart}
          disabled={isAdded || !currentPrice || !hasPricedOptions || maxQty < 1}
          className={cn(
            'cursor-pointer w-full py-4 px-6 font-sans text-[13px] font-semibold uppercase tracking-[0.08em] rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
            isAdded
              ? 'bg-lime text-bg-dark'
              : currentPrice && maxQty >= 1
                ? 'bg-bg-page text-bg-dark hover:bg-cream'
                : 'bg-bg-page/40 text-text-body-light/60 cursor-not-allowed',
          )}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              <span>{t('common.addedToCart')}</span>
            </>
          ) : !hasPricedOptions ? (
            t('product.noPrice')
          ) : maxQty < 1 ? (
            t('product.outOfStock')
          ) : (
            t('common.addToCart')
          )}
        </button>

        {isAdded && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-lime rounded-full flex items-center justify-center animate-bounce shadow-lg">
            <Check className="w-4 h-4 text-bg-dark" />
          </div>
        )}
      </div>
    </>
  )
}
