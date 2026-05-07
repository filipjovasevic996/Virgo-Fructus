import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { ProductGallery } from '@/components/product-gallery'
import { ProductPurchasePanel } from '@/components/product-purchase-panel'
import { getTranslator } from '@/lib/i18n/server'
import { localizePath } from '@/lib/i18n/routing'
import { preferredPriceIndex } from '@/lib/preferred-price-index'
import type { Locale } from '@/lib/i18n'

const badgeKeys: Record<string, string> = {
  new: 'product.badgeNew',
  limited: 'product.badgeLimited',
  sale: 'product.badgeSale',
}

interface ProductDetailProps {
  product: Product
  similarProducts: Product[]
  locale: Locale
}

export default function ProductDetail({
  product,
  similarProducts,
  locale,
}: ProductDetailProps) {
  const t = getTranslator(locale)
  const productImages = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : []
  const fullDescription = (product.description ?? '').trim()
  const initialPreferredIndex = preferredPriceIndex(product)
  const shopPath = localizePath('/prodavnica', locale)

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs font-sans text-terra">
            <li>
              <Link href={shopPath} className="hover:underline">
                {t('nav.shop')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-text-nav" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-6 lg:gap-10 lg:items-start">
          <ProductGallery images={productImages} productName={product.name} />

          <div className="lg:sticky lg:top-6 self-start">
            <div className="bg-bg-hero rounded-xl p-5 sm:p-6 lg:p-8">
              {product.badge && (
                <span
                  className={cn(
                    'inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded mb-4',
                    product.badge === 'new' && 'bg-lime text-bg-dark',
                    product.badge === 'limited' && 'bg-bg-dark text-lime',
                    product.badge === 'sale' && 'bg-terra text-bg-page',
                  )}
                >
                  {t(badgeKeys[product.badge] ?? product.badge)}
                </span>
              )}

              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-cream">
                {product.name}
              </h1>

              {fullDescription && (
                <div className="mt-3">
                  <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-text-body-light/75">
                    {fullDescription}
                  </p>
                </div>
              )}

              <ProductPurchasePanel
                product={product}
                initialPreferredIndex={initialPreferredIndex}
              />

              <p className="mt-4 font-sans text-xs text-text-body-light/60 text-center">
                {t('common.freeDeliveryNote')}
              </p>

              <div className="mt-4 rounded-lg border border-border-card bg-bg-dark/30 p-3">
                <p className="font-sans text-xs text-text-body-light/85 leading-relaxed">
                  {t('product.purchaseNoticeLine1')}
                </p>
                <p className="mt-2 font-sans text-xs text-text-body-light/75 leading-relaxed">
                  {t('product.purchaseNoticeLine2')}{' '}
                  <Link
                    href={localizePath('/kontakt', locale)}
                    className="text-lime hover:text-cream underline underline-offset-2"
                  >
                    {t('product.purchaseNoticeFormLink')}
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="bg-bg-page py-6 sm:py-10 lg:py-12 border-t border-border-card/20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
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
