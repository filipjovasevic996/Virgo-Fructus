'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { ProductCard } from '@/components/product-card'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products'

function isImageUrl(src: string) {
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Failed to load product data')
  }
  return response.json()
}

const badgeKeys: Record<string, string> = {
  new: 'product.badgeNew',
  limited: 'product.badgeLimited',
  sale: 'product.badgeSale',
}

export default function ProductDetail() {
  const params = useParams()
  const slug = params.slug as string
  const { t, locale } = useI18n()
  const { data: productData, isLoading, error } = useSWR<{ product: Product | null }>(
    `/api/products?slug=${encodeURIComponent(slug)}&locale=${locale}`,
    fetcher
  )
  const product = productData?.product ?? null

  const [selectedWeight, setSelectedWeight] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)
  const { addItem } = useCart()

  const { data: listData } = useSWR<{ products: Product[] }>(`/api/products?locale=${locale}`, fetcher)
  const similarProducts = (listData?.products ?? [])
    .filter((p) => product && p.id !== product.id && p.category === product.category)
    .slice(0, 4)

  if (isLoading) {
    return (
      <div className="bg-bg-page min-h-screen flex items-center justify-center">
        <p className="font-sans text-lg text-text-nav">{t('product.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-bg-page min-h-screen flex items-center justify-center">
        <p className="font-sans text-lg text-terra">{t('product.loadError')}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-bg-page min-h-screen flex items-center justify-center">
        <p className="font-sans text-lg text-text-nav">{t('product.notFound')}</p>
      </div>
    )
  }

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

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="grid lg:grid-cols-2 min-h-[50vh] lg:min-h-[70vh]">
        <div className="bg-bg-page p-4 sm:p-8 lg:p-12 flex flex-col">
          <div className="relative flex-1 bg-cream rounded-lg flex items-center justify-center min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] overflow-hidden">
            {isImageUrl(product.images[currentImage]) ? (
              <Image
                src={product.images[currentImage]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <span className="text-9xl">{product.images[currentImage]}</span>
            )}

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-bg-page/80 text-bg-dark hover:bg-bg-page transition-colors"
              aria-label={t('product.prevImage')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-bg-page/80 text-bg-dark hover:bg-bg-page transition-colors"
              aria-label={t('product.nextImage')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3 mt-4 justify-center">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={cn(
                  'w-16 h-16 rounded-lg bg-cream flex items-center justify-center overflow-hidden transition-all',
                  currentImage === index
                    ? 'ring-2 ring-lime ring-offset-2 ring-offset-bg-page'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                {isImageUrl(img) ? (
                  <Image src={img} alt="" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{img}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bg-hero p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
          <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs font-sans text-terra">
              <li>
                <Link href="/prodavnica" className="hover:underline">
                  {t('nav.shop')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-text-body-light" aria-current="page">{product.name}</li>
            </ol>
          </nav>

          {product.badge && (
            <span
              className={cn(
                'inline-block w-fit px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded mb-4',
                product.badge === 'new' && 'bg-lime text-bg-dark',
                product.badge === 'limited' && 'bg-bg-dark text-lime',
                product.badge === 'sale' && 'bg-terra text-bg-page'
              )}
            >
              {t(badgeKeys[product.badge] ?? product.badge)}
            </span>
          )}

          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-cream">
            {product.name}
          </h1>

          <p className="mt-3 sm:mt-4 font-sans font-light text-sm sm:text-[15px] text-text-body-light leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 sm:mt-8">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-text-body-light/70 mb-3">
              {t('product.chooseWeight')}
            </p>
            <div className="flex flex-wrap gap-3">
              {product.prices.map((priceOption, index) => (
                <button
                  key={priceOption.weight}
                  onClick={() => setSelectedWeight(index)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium rounded border transition-colors',
                    selectedWeight === index
                      ? 'bg-lime text-bg-dark border-lime'
                      : 'bg-bg-dark border-border-card text-text-body-light hover:border-lime/50'
                  )}
                >
                  {priceOption.weight}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex items-baseline gap-3">
            <span className="font-sans font-bold text-2xl sm:text-3xl text-lime">
              {displayPrice} {t('common.currency')}
            </span>
            {currentPrice.salePrice && (
              <span className="text-lg text-text-body-light/50 line-through">
                {currentPrice.price} {t('common.currency')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-6 sm:mt-8 w-full py-3.5 sm:py-4 px-6 bg-bg-page text-bg-dark font-sans text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors"
          >
            {t('common.addToCart')}
          </button>

          <p className="mt-4 font-sans text-xs text-text-body-light/60 text-center">
            {t('common.freeDeliveryNote')}
          </p>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="bg-bg-page py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
              {t('product.similar')}
            </span>
            <h2 className="mt-2 font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
              {t('product.similarSubtitle')}
            </h2>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
