'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
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

const categoryLabelKey: Record<Product['category'], string> = {
  citrus: 'shop.citrus',
  jagodičasto: 'shop.berries',
  egzotično: 'shop.exotic',
}

function parseWeightToGrams(weight: string) {
  const value = Number(weight.replace(',', '.').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(value) || value <= 0) return null
  if (/kg/i.test(weight)) return value * 1000
  if (/g/i.test(weight)) return value
  return null
}

function getPricePer100g(price: number, weight: string) {
  const grams = parseWeightToGrams(weight)
  if (!grams) return null
  return Math.round((price / grams) * 100)
}

export default function ProductDetail() {
  const params = useParams()
  const slug = params.slug as string
  const { t, locale } = useI18n()
  const { data: productData, isLoading, error } = useSWR<{
    product: Product | null
    similarProducts: Product[]
  }>(
    `/api/products?slug=${encodeURIComponent(slug)}&locale=${locale}`,
    fetcher
  )
  const product = productData?.product ?? null

  const [selectedWeight, setSelectedWeight] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()

  const similarProducts = productData?.similarProducts ?? []

  const productImages = product?.images?.length ? product.images : product?.image ? [product.image] : []
  const hasPriceOptions = Boolean(product?.prices?.length)
  const safeSelectedWeight = product && hasPriceOptions ? Math.min(selectedWeight, product.prices.length - 1) : 0
  const currentPrice = product && hasPriceOptions ? product.prices[safeSelectedWeight] : null
  const displayPrice = currentPrice ? (currentPrice.salePrice ?? currentPrice.price) : 0
  const lowestPrice = product && hasPriceOptions
    ? Math.min(...product.prices.map((priceOption) => priceOption.salePrice ?? priceOption.price))
    : 0
  const pricePer100g = currentPrice ? getPricePer100g(displayPrice, currentPrice.weight) : null

  useEffect(() => {
    setIsAdded(false)
  }, [selectedWeight])

  const handleAddToCart = () => {
    if (!product || !currentPrice) return
    addItem({
      id: product.id,
      name: product.name,
      weight: currentPrice.weight,
      price: displayPrice,
      image: product.image,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 500)
  }

  const nextImage = () => {
    if (!productImages.length) return
    setCurrentImage((prev) => (prev + 1) % productImages.length)
    setTranslateX(0)
  }

  const prevImage = () => {
    if (!productImages.length) return
    setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length)
    setTranslateX(0)
  }

  // Swipe/drag handlers for modern slider
  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 80
    if (translateX > threshold) {
      prevImage()
    } else if (translateX < -threshold) {
      nextImage()
    }
    setTranslateX(0)
  }

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

  return (
    <div className="bg-bg-page min-h-screen">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs font-sans text-terra">
            <li>
              <Link href="/prodavnica" className="hover:underline">
                {t('nav.shop')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-text-nav" aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </div>

      {/* Main Product Section - Image Focused */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 md:items-start lg:items-stretch">
          {/* Image Gallery - Takes most space */}
          <div className="flex flex-col lg:h-[clamp(560px,78vh,760px)]">
            {/* Main Image - Modern Swipeable Slider */}
            <div
              ref={sliderRef}
              className="relative aspect-[4/3] sm:aspect-[5/4] md:aspect-[4/3] lg:aspect-auto lg:flex-1 bg-cream rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={(e) => handleDragStart(e.clientX)}
              onMouseMove={(e) => handleDragMove(e.clientX)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
              onTouchEnd={handleDragEnd}
            >
              {/* Slides Container */}
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(calc(-${currentImage * 100}% + ${isDragging ? translateX : 0}px))`,
                  transitionDuration: isDragging ? '0ms' : '300ms'
                }}
              >
                {productImages.map((img, index) => (
                  <div key={index} className="shrink-0 w-full h-full relative">
                    {isImageUrl(img) ? (
                      <Image
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-contain pointer-events-none"
                        priority={index === 0}
                        loading="eager"
                        draggable={false}
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[12rem] pointer-events-none">
                        {img}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Arrows - Minimal Modern Style */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-bg-page/95 text-bg-dark hover:bg-bg-page hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
                    aria-label={t('product.prevImage')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-bg-page/95 text-bg-dark hover:bg-bg-page hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
                    aria-label={t('product.nextImage')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Progress Dots - Modern Style */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-bg-dark/60 backdrop-blur-sm">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(index); setTranslateX(0); }}
                      className={cn(
                        'transition-all duration-300 rounded-full',
                        currentImage === index
                          ? 'w-6 h-2 bg-lime'
                          : 'w-2 h-2 bg-cream/50 hover:bg-cream/80'
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={cn(
                      'shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-cream flex items-center justify-center overflow-hidden transition-all',
                      currentImage === index
                        ? 'ring-2 ring-lime ring-offset-2 ring-offset-bg-page scale-105'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    )}
                  >
                    {isImageUrl(img) ? (
                      <Image src={img} alt="" width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{img}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Compact Sidebar */}
          <div className="md:sticky md:top-4 lg:top-6 lg:h-[clamp(560px,78vh,760px)]">
            <div className="bg-bg-hero rounded-xl p-5 sm:p-6 lg:p-8 lg:h-full">
              {product.badge && (
                <span
                  className={cn(
                    'inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded mb-4',
                    product.badge === 'new' && 'bg-lime text-bg-dark',
                    product.badge === 'limited' && 'bg-bg-dark text-lime',
                    product.badge === 'sale' && 'bg-terra text-bg-page'
                  )}
                >
                  {t(badgeKeys[product.badge] ?? product.badge)}
                </span>
              )}

              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-cream">
                {product.name}
              </h1>

              {/* <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border-card bg-bg-dark/40 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-text-body-light/60">{t('product.infoFrom')}</p>
                  <p className="mt-1 text-sm font-semibold text-lime">{lowestPrice} {t('common.currency')}</p>
                </div>
                <div className="rounded-lg border border-border-card bg-bg-dark/40 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-text-body-light/60">{t('product.infoCategory')}</p>
                  <p className="mt-1 text-sm font-semibold text-cream">{t(categoryLabelKey[product.category])}</p>
                </div>
              </div> */}

              <div className="mt-4 rounded-lg border border-border-card bg-bg-dark/30 p-3">
                <p className="font-sans text-xs text-text-body-light/85 leading-relaxed">
                  {t('product.purchaseNoticeLine1')}
                </p>
                <p className="mt-2 font-sans text-xs text-text-body-light/75 leading-relaxed">
                  {t('product.purchaseNoticeLine2')}{' '}
                  <Link href="/kontakt" className="text-lime hover:text-cream underline underline-offset-2">
                    {t('product.purchaseNoticeFormLink')}
                  </Link>
                  .
                </p>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                {currentPrice ? (
                  <>
                    <span className="font-sans font-bold text-3xl text-lime">
                      {displayPrice} {t('common.currency')}
                    </span>
                    {currentPrice.salePrice && (
                      <span className="text-lg text-text-body-light/50 line-through">
                        {currentPrice.price} {t('common.currency')}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-sans font-semibold text-base text-text-body-light/80">
                    {t('product.noPrice')}
                  </span>
                )}
              </div>
              {pricePer100g && (
                <p className="mt-1 text-xs text-text-body-light/70">
                  {pricePer100g} {t('common.currency')}/100g
                </p>
              )}

              {/* Weight Selection */}
              <div className="mt-6">
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-text-body-light/70 mb-3">
                  {t('product.chooseWeight')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.prices.map((priceOption, index) => (
                    <button
                      key={priceOption.weight}
                      onClick={() => setSelectedWeight(index)}
                      className={cn(
                        'cursor-pointer px-4 py-2.5 text-sm font-medium rounded border transition-colors',
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

              {/* Add to Cart with Feedback */}
              <div className="mt-6 relative">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded || !currentPrice}
                  className={cn(
                    'cursor-pointer w-full py-4 px-6 font-sans text-[13px] font-semibold uppercase tracking-[0.08em] rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
                    isAdded
                      ? 'bg-lime text-bg-dark'
                      : currentPrice
                        ? 'bg-bg-page text-bg-dark hover:bg-cream'
                        : 'bg-bg-page/40 text-text-body-light/60 cursor-not-allowed'
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{t('common.addedToCart')}</span>
                    </>
                  ) : (
                    t('common.addToCart')
                  )}
                </button>

                {/* Success Animation Overlay */}
                {isAdded && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-lime rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <Check className="w-4 h-4 text-bg-dark" />
                  </div>
                )}
              </div>

              <p className="mt-4 font-sans text-xs text-text-body-light/60 text-center">
                {t('common.freeDeliveryNote')}
              </p>


            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="bg-bg-page py-10 sm:py-14 lg:py-16 border-t border-border-card/20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
              {t('product.similar')}
            </span>
            <h2 className="mt-2 font-serif font-semibold text-2xl sm:text-3xl text-bg-dark">
              {t('product.similarSubtitle')}
            </h2>

            <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
