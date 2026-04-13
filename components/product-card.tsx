'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/products'
import { useCart } from './cart-context'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function isImageUrl(src: string) {
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

interface ProductCardProps {
  product: Product
}

const badgeKeys: Record<string, string> = {
  new: 'product.badgeNew',
  limited: 'product.badgeLimited',
  sale: 'product.badgeSale',
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState(0)
  const { addItem } = useCart()
  const { t } = useI18n()

  const currentPrice = product.prices[selectedWeight]
  const displayPrice = currentPrice.salePrice ?? currentPrice.price

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      weight: currentPrice.weight,
      price: displayPrice,
      image: product.image,
    })
  }

  return (
    <div className="group border border-border-card rounded-md overflow-hidden animate-card-hover hover:shadow-lg hover:shadow-bg-dark/20">
      <Link
        href={`/proizvodi/${product.slug}`}
        className="relative block bg-bg-card aspect-[4/3] overflow-hidden"
      >
        {isImageUrl(product.image) ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl transition-transform duration-300">
            {product.image}
          </div>
        )}
        
        {product.badge && (
          <span
            className={cn(
              'absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded',
              product.badge === 'new' && 'bg-lime text-bg-dark',
              product.badge === 'limited' && 'bg-bg-dark text-lime',
              product.badge === 'sale' && 'bg-terra text-bg-page'
            )}
          >
            {t(badgeKeys[product.badge] ?? product.badge)}
          </span>
        )}
      </Link>

      <div className="bg-bg-hero p-4">
        <Link href={`/proizvodi/${product.slug}`}>
          <h3 className="font-serif font-semibold text-lg text-cream hover:text-lime transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[13px] text-text-body-light mt-1">
          {t('common.from')} {product.prices[0].price} {t('common.currency')}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {product.prices.map((priceOption, index) => (
            <button
              key={priceOption.weight}
              onClick={() => setSelectedWeight(index)}
              className={cn(
                'cursor-pointer px-2 py-1 text-[11px] font-medium rounded border transition-colors',
                selectedWeight === index
                  ? 'bg-lime text-bg-dark border-lime'
                  : 'bg-bg-dark border-border-card text-text-body-light hover:border-lime/50'
              )}
            >
              {priceOption.weight}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-sans font-bold text-lg text-lime animate-price-fade">
            {displayPrice} {t('common.currency')}
          </span>
          {currentPrice.salePrice && (
            <span className="text-sm text-text-body-light/50 line-through">
              {currentPrice.price} {t('common.currency')}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="cursor-pointer w-full mt-4 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-text-body-light border border-border-card rounded bg-transparent transition-all hover:border-lime hover:text-lime hover:bg-lime/[0.08]"
        >
          {t('common.addToCart')}
        </button>
      </div>
    </div>
  )
}
