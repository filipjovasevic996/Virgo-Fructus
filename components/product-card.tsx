'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/products'
import { useCart } from './cart-context'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import { cn } from '@/lib/utils'
import { cloudinaryProductImageUrl } from '@/lib/cloudinary-delivery-url'
import { maxQuantityForCartLine } from '@/lib/product-stock'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

function isImageUrl(src: string) {
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

interface ProductCardProps {
  product: Product
  featuredImageLift?: boolean
  imagePriority?: boolean
}

const badgeKeys: Record<string, string> = {
  new: 'product.badgeNew',
  limited: 'product.badgeLimited',
  sale: 'product.badgeSale',
}

export function ProductCard({ product, featuredImageLift = false, imagePriority = false }: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, items: cartItems } = useCart()
  const { t } = useI18n()
  const { withLocale } = useLocalizedPath()

  const safeIdx = Math.min(selectedWeight, Math.max(0, product.prices.length - 1))
  const currentPrice = product.prices[safeIdx]

  const weightMaxQty = useMemo(
    () =>
      product.prices.map((po) =>
        maxQuantityForCartLine(product.id, po.weight, product.stockKg ?? 0, cartItems),
      ),
    [product.id, product.stockKg, product.prices, cartItems],
  )

  useEffect(() => {
    if (!weightMaxQty.length) return
    if (weightMaxQty[safeIdx] >= 1) return
    const next = weightMaxQty.findIndex((m) => m >= 1)
    if (next >= 0) setSelectedWeight(next)
  }, [weightMaxQty, safeIdx])

  useEffect(() => {
    setIsAdded(false)
  }, [safeIdx])

  const displayPrice = currentPrice.salePrice ?? currentPrice.price

  const maxQty = maxQuantityForCartLine(
    product.id,
    currentPrice.weight,
    product.stockKg ?? 0,
    cartItems,
  )

  const handleAddToCart = () => {
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
    <div
      className={cn(
        'group flex h-full w-full min-h-0 flex-col border border-border-card rounded-md overflow-visible bg-bg-hero animate-card-hover hover:shadow-lg hover:shadow-bg-dark/20',
        featuredImageLift && 'pt-1 lg:pt-2',
      )}
    >
      <Link
        href={withLocale(`/proizvodi/${product.slug}`)}
        className={cn(
          'relative block w-full aspect-[4/3] rounded-t-md',
          featuredImageLift ? 'overflow-visible' : 'overflow-hidden',
          featuredImageLift &&
            'lg:-mt-8 -mx-px w-[calc(100%+2px)] rounded-t-md shadow-[0_14px_34px_-12px_rgba(0,0,0,0.56)] ring-1 ring-black/15',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 z-0 rounded-t-md',
            featuredImageLift ? 'bg-cream' : 'bg-bg-card',
          )}
        />
        {isImageUrl(product.image) ? (
          <Image
            src={cloudinaryProductImageUrl(product.image)}
            alt={product.name}
            fill
            priority={imagePriority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              'z-[1] object-contain object-center transition-transform duration-300',
              featuredImageLift &&
                'lg:scale-[1.13] lg:-translate-y-12',
            )}
          />
        ) : (
          <div className="absolute inset-0 z-[1] flex items-center justify-center text-7xl transition-transform duration-300">
            {product.image}
          </div>
        )}

        {product.badge && (
          <span
            className={cn(
              'absolute bottom-3 right-3 z-[2] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded',
              product.badge === 'new' && 'bg-lime text-bg-dark',
              product.badge === 'limited' && 'bg-bg-dark text-lime',
              product.badge === 'sale' && 'bg-terra text-bg-page'
            )}
          >
            {t(badgeKeys[product.badge] ?? product.badge)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col bg-bg-hero p-4 rounded-b-md">
        <Link href={withLocale(`/proizvodi/${product.slug}`)}>
          <h3 className="font-serif font-semibold text-lg text-cream hover:text-lime transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 min-h-[5.75rem] sm:min-h-[6.5rem]">
          <p className="text-[13px] leading-relaxed text-text-body-light/85 line-clamp-4 sm:line-clamp-5">
            {product.shortDescription || ''}
          </p>
        </div>
        {/* <p className="text-[13px] text-text-body-light mt-1">
          {t('common.from')} {product.prices[0].price} {t('common.currency')}
        </p> */}

        <div className="flex flex-wrap gap-2 mt-3">
          {product.prices.map((priceOption, index) => {
            const optMax = weightMaxQty[index] ?? 0
            const unavailable = optMax < 1
            return (
              <button
                key={priceOption.weight}
                type="button"
                disabled={unavailable}
                onClick={() => !unavailable && setSelectedWeight(index)}
                className={cn(
                  'px-2 py-1 text-[11px] font-medium rounded border transition-colors',
                  unavailable &&
                    'cursor-not-allowed border-border-card/40 bg-bg-dark/40 text-text-body-light/35',
                  !unavailable &&
                    safeIdx === index &&
                    'bg-lime text-bg-dark border-lime cursor-pointer',
                  !unavailable &&
                    safeIdx !== index &&
                    'cursor-pointer bg-bg-dark border-border-card text-text-body-light hover:border-lime/50',
                )}
              >
                {priceOption.weight}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-sans font-bold text-lg text-lime animate-price-fade">
            {displayPrice} {t('common.currency')}
          </span>
          {!!currentPrice.salePrice &&  (
            <span className="text-sm text-text-body-light/50 line-through">
              {currentPrice.price} {t('common.currency')}
            </span>
          )}
        </div>

        <div className="mt-4 relative">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded || maxQty < 1}
            className={cn(
              'w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider border rounded transition-all duration-300 flex items-center justify-center gap-2',
              isAdded &&
                'bg-lime text-bg-dark border-lime cursor-default',
              !isAdded &&
                maxQty >= 1 &&
                'cursor-pointer text-text-body-light bg-transparent border-border-card hover:border-lime hover:text-lime hover:bg-lime/[0.08]',
              !isAdded &&
                maxQty < 1 &&
                'cursor-not-allowed opacity-50 text-text-body-light/50 border-border-card',
            )}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>{t('common.addedToCart')}</span>
              </>
            ) : maxQty < 1 ? (
              t('product.outOfStock')
            ) : (
              t('common.addToCart')
            )}
          </button>
          {isAdded && (
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-lime rounded-full flex items-center justify-center animate-bounce shadow-lg pointer-events-none"
              aria-hidden
            >
              <Check className="w-3 h-3 text-bg-dark" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
