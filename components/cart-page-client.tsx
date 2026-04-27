'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, ShoppingBasket, CreditCard, Banknote, Check, Loader2, Trash2 } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import { cn } from '@/lib/utils'
import { maxQuantityForCartLine } from '@/lib/product-stock'
import { cloudinaryProductImageUrl } from '@/lib/cloudinary-delivery-url'

const FREE_DELIVERY_THRESHOLD = 2500
const DELIVERY_FEE = 450

type CheckoutStep = 'cart' | 'details' | 'payment' | 'confirmation'

function resolveRenderableImageSrc(src: string | null | undefined): string | null {
  if (!src || typeof src !== 'string') return null
  const normalized = src.trim()
  if (!normalized) return null
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('/')) {
    return null
  }
  const cloudinarySrc = cloudinaryProductImageUrl(normalized).trim()
  return cloudinarySrc || null
}

export default function CartPageClient() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart()
  const { t } = useI18n()
  const { withLocale } = useLocalizedPath()
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    note: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [stockMap, setStockMap] = useState<Record<string, number>>({})
  const [cartNotice, setCartNotice] = useState('')

  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.id))]
    if (ids.length === 0) {
      setStockMap({})
      return
    }
    let cancelled = false
    fetch(`/api/products/stock?ids=${encodeURIComponent(ids.join(','))}`)
      .then((r) => r.json())
      .then((data: { stock?: Record<string, number> }) => {
        if (!cancelled && data.stock) setStockMap(data.stock)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [items])

  useEffect(() => {
    if (items.length === 0) return
    const ready = items.every((i) => stockMap[i.id] !== undefined)
    if (!ready) return
    let adjusted = false
    for (const item of items) {
      const stock = stockMap[item.id] ?? 0
      const max = maxQuantityForCartLine(item.id, item.weight, stock, items)
      if (item.quantity > max) {
        adjusted = true
        updateQuantity(item.id, item.weight, Math.max(0, max))
      }
    }
    if (adjusted) setCartNotice(t('cart.cartAdjusted'))
  }, [items, stockMap, updateQuantity, t])

  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD
  const deliveryFee = isFreeDelivery ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee
  const progressToFree = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)
  const amountUntilFree = FREE_DELIVERY_THRESHOLD - subtotal

  const handleProceedToDetails = () => {
    if (!acceptedTerms) return
    setStep('details')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = t('cart.errorName')
    if (!formData.phone.trim()) newErrors.phone = t('cart.errorPhone')
    if (!formData.email.trim()) newErrors.email = t('cart.errorEmail')
    if (!formData.city.trim()) newErrors.city = t('cart.errorCity')
    if (!formData.address.trim()) newErrors.address = t('cart.errorAddress')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setStep('payment')
    }
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true)
    setOrderError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
            note: formData.note,
          },
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            weight: item.weight,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          deliveryFee,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setOrderError(
          typeof data.error === 'string' ? data.error : t('cart.orderFailed'),
        )
        return
      }

      setOrderNumber(data.orderNumber || '')
      setStep('confirmation')
      clearCart()
    } catch {
      setOrderError(t('cart.orderFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="bg-bg-page min-h-screen py-12 sm:py-20">
        <div className="mx-auto max-w-md px-5 sm:px-4 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 rounded-full bg-cream flex items-center justify-center">
            <ShoppingBasket className="w-10 h-10 sm:w-12 sm:h-12 text-terra" />
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-bg-dark">
            {t('cart.emptyTitle')}
          </h1>
          <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base text-text-nav">
            {t('cart.emptyDesc')}
          </p>
          <Link
            href={withLocale('/prodavnica')}
            className="mt-8 inline-flex items-center px-7 py-3.5 bg-bg-hero text-cream font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-bg-dark transition-colors"
          >
            {t('cart.browseShop')}
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'confirmation') {
    return (
      <div className="bg-bg-page min-h-screen py-12 sm:py-20">
        <div className="mx-auto max-w-md px-5 sm:px-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 rounded-full bg-lime flex items-center justify-center">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-bg-dark" />
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-bg-dark">
            {t('cart.thankYou')}
          </h1>
          {orderNumber && (
            <p className="mt-2 font-sans text-sm text-text-nav/70">
              {t('cart.orderNumber', { number: orderNumber })}
            </p>
          )}
          <p className="mt-4 font-sans text-text-nav leading-relaxed">
            {t('cart.orderConfirmed')}
          </p>
          <Link
            href={withLocale('/prodavnica')}
            className="mt-8 inline-flex items-center px-7 py-3.5 bg-bg-hero text-cream font-sans text-[12px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-bg-dark transition-colors"
          >
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    )
  }

  const stepLabels = [t('cart.stepDetails'), t('cart.stepPayment'), t('cart.stepConfirm')]

  console.log("THRESHOLD", FREE_DELIVERY_THRESHOLD)
  console.log("SUBTOTAL", subtotal)
  return (
    <div className="bg-bg-page min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        {step !== 'cart' && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            {stepLabels.map((label, index) => {
              const stepIndex = index + 1
              const stepOrder = { details: 1, payment: 2 } as Record<string, number>
              const currentOrder = stepOrder[step] ?? 0
              const isActive = currentOrder === stepIndex
              const isComplete = currentOrder > stepIndex

              return (
                <div key={label} className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      isActive || isComplete
                        ? 'bg-lime text-bg-dark'
                        : 'bg-bg-card text-text-body-light'
                    )}
                  >
                    {isComplete ? <Check className="w-4 h-4" /> : stepIndex}
                  </div>
                  <span
                    className={cn(
                      'font-sans text-sm hidden sm:inline',
                      isActive || isComplete ? 'text-bg-dark' : 'text-text-nav/50'
                    )}
                  >
                    {label}
                  </span>
                  {index < 2 && (
                    <div className="w-12 h-0.5 bg-border-light hidden sm:block" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {step === 'cart' && (
          <>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-bg-dark mb-6 sm:mb-8">
              {t('cart.yourCart')}
            </h1>

            {cartNotice && (
              <p className="mb-4 rounded-lg border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-bg-dark">
                {cartNotice}
              </p>
            )}

            <div className="grid lg:grid-cols-[1fr_400px] gap-6 sm:gap-8">
              <div className="space-y-4">
                {items.map((item) => {
                  const itemImageSrc = resolveRenderableImageSrc(item.image)
                  const lineMax = maxQuantityForCartLine(
                    item.id,
                    item.weight,
                    stockMap[item.id] ?? 0,
                    items,
                  )
                  return (
                  <div
                    key={`${item.id}-${item.weight}`}
                    className="p-3 sm:p-4 bg-cream rounded-lg"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-bg-page rounded flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 overflow-hidden relative">
                        {itemImageSrc ? (
                          <Image
                            src={itemImageSrc}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          item.image?.trim() || '🍊'
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-base sm:text-lg text-bg-dark truncate">
                          {item.name}
                        </h3>
                        <p className="font-sans text-sm text-text-nav">
                          {item.weight}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.weight)}
                        className="p-1.5 sm:p-2 text-text-nav hover:text-terra transition-colors cursor-pointer"
                        aria-label={t('cart.removeProduct')}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border-light/70 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-nav hover:border-text-nav-hover transition-colors cursor-pointer"
                          aria-label={t('cart.decreaseQty')}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-sans font-medium text-bg-dark">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.weight,
                              Math.min(item.quantity + 1, lineMax),
                            )
                          }
                          disabled={item.quantity >= lineMax}
                          className={cn(
                            'w-8 h-8 flex items-center justify-center rounded border border-border-light transition-colors',
                            item.quantity >= lineMax
                              ? 'cursor-not-allowed opacity-40 text-text-nav/50'
                              : 'text-text-nav hover:border-text-nav-hover cursor-pointer',
                          )}
                          aria-label={t('cart.increaseQty')}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-sans font-bold text-base sm:text-lg text-bg-dark text-right break-words">
                        {item.price * item.quantity} {t('common.currency')}
                      </span>
                    </div>
                  </div>
                  )
                })}
              </div>

              <div className="bg-bg-hero rounded-lg p-6 h-fit">
                <h2 className="font-serif font-semibold text-xl text-cream mb-6">
                  {t('cart.orderSummary')}
                </h2>

                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between text-text-body-light">
                    <span>{t('cart.subtotal')}</span>
                    <span>{subtotal} {t('common.currency')}</span>
                  </div>

                  {subtotal < FREE_DELIVERY_THRESHOLD && (
                    <div className="py-3">
                      <div className="h-2 bg-bg-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lime transition-all duration-300"
                          style={{ width: `${progressToFree}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-text-body-light">
                        {t('cart.untilFreeDelivery', { amount: amountUntilFree })}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-text-body-light">
                    <span>{t('cart.delivery')}</span>
                    {isFreeDelivery ? (
                      <span className="text-lime">{t('cart.freeDelivery')}</span>
                    ) : (
                      <span>{deliveryFee} {t('common.currency')}</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border-card flex justify-between">
                    <span className="text-cream font-semibold">{t('cart.total')}</span>
                    <span className="font-bold text-xl text-lime">{total} {t('common.currency')}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-border-card/40 bg-bg-dark/30 p-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-lime"
                    />
                    <span className="font-sans text-sm leading-relaxed text-text-body-light">
                      {t('cart.termsAgreementPrefix')}{' '}
                      <Link
                        href={withLocale('/uslovi-kupovine')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-lime hover:underline"
                      >
                        {t('cart.termsAgreementLink')}
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleProceedToDetails}
                  disabled={!acceptedTerms}
                  className={cn(
                    'mt-4 w-full py-4 px-6 font-sans text-[13px] font-semibold uppercase tracking-[0.08em] rounded transition-colors',
                    acceptedTerms
                      ? 'bg-bg-page text-bg-dark hover:bg-cream cursor-pointer'
                      : 'bg-bg-page/45 text-bg-dark/50 cursor-not-allowed',
                  )}
                >
                  {t('cart.proceedToPayment')}
                </button>

                <Link
                  href={withLocale('/prodavnica')}
                  className="mt-4 block text-center font-sans text-sm text-lime hover:underline"
                >
                  {t('common.backToShop')}
                </Link>
              </div>
            </div>
          </>
        )}

        {step === 'details' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-bg-dark mb-6 sm:mb-8 text-center">
              {t('cart.deliveryDetails')}
            </h1>

            <form onSubmit={handleSubmitDetails} className="bg-bg-hero rounded-lg p-5 sm:p-8">
              <div className="grid gap-6">
                <div>
                  <label htmlFor="name" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('cart.nameLabel')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => {
                      if (!formData.name.trim()) {
                        setErrors({ ...errors, name: t('cart.errorName') })
                      } else {
                        const { name: _, ...rest } = errors
                        setErrors(rest)
                      }
                    }}
                    className="input-vigor w-full px-4 py-3"
                    placeholder={t('cart.namePlaceholder')}
                  />
                  {errors.name && <p className="mt-1 text-sm text-terra">{errors.name}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block font-sans text-sm font-medium text-cream mb-2">
                      {t('cart.phoneLabel')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onBlur={() => {
                        if (!formData.phone.trim()) {
                          setErrors({ ...errors, phone: t('cart.errorPhone') })
                        } else {
                          const { phone: _, ...rest } = errors
                          setErrors(rest)
                        }
                      }}
                      className="input-vigor w-full px-4 py-3"
                      placeholder="+381 69 302 3828"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-terra">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-sans text-sm font-medium text-cream mb-2">
                      {t('cart.emailLabel')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => {
                        if (!formData.email.trim()) {
                          setErrors({ ...errors, email: t('cart.errorEmail') })
                        } else {
                          const { email: _, ...rest } = errors
                          setErrors(rest)
                        }
                      }}
                      className="input-vigor w-full px-4 py-3"
                      placeholder="marko@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-terra">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('cart.cityLabel')}
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    onBlur={() => {
                      if (!formData.city.trim()) {
                        setErrors({ ...errors, city: t('cart.errorCity') })
                      } else {
                        const { city: _, ...rest } = errors
                        setErrors(rest)
                      }
                    }}
                    className="input-vigor w-full px-4 py-3"
                    placeholder={t('cart.cityPlaceholder')}
                  />
                  {errors.city && <p className="mt-1 text-sm text-terra">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="address" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('cart.addressLabel')}
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    onBlur={() => {
                      if (!formData.address.trim()) {
                        setErrors({ ...errors, address: t('cart.errorAddress') })
                      } else {
                        const { address: _, ...rest } = errors
                        setErrors(rest)
                      }
                    }}
                    className="input-vigor w-full px-4 py-3"
                    placeholder={t('cart.addressPlaceholder')}
                  />
                  {errors.address && <p className="mt-1 text-sm text-terra">{errors.address}</p>}
                </div>

                <div>
                  <label htmlFor="note" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('cart.noteLabel')}
                  </label>
                  <textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="input-vigor w-full px-4 py-3 min-h-[100px] resize-none"
                    placeholder={t('cart.notePlaceholder')}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-6 py-3 font-sans text-sm text-lime hover:underline"
                >
                  {t('cart.backToCart')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-bg-page text-bg-dark font-sans text-[13px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors"
                >
                  {t('cart.proceedToPayment')}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-bg-dark mb-6 sm:mb-8 text-center">
              {t('cart.paymentMethod')}
            </h1>

            <div className="bg-bg-hero rounded-lg p-5 sm:p-8">
              <div className="space-y-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-colors',
                    paymentMethod === 'cash'
                      ? 'border-lime bg-bg-card'
                      : 'border-border-card hover:border-border-muted'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-bg-dark flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-lime" />
                  </div>
                  <div className="text-left">
                    <span className="font-sans font-semibold text-cream">
                      {t('cart.cashOnDelivery')}
                    </span>
                    <p className="font-sans text-sm text-text-body-light">
                      {t('cart.cashOnDeliveryDesc')}
                    </p>
                  </div>
                </button>

                <div
                  className="w-full p-4 rounded-lg border-2 border-border-card flex items-center gap-4 opacity-50 relative"
                >
                  <div className="w-12 h-12 rounded-full bg-bg-dark flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-text-body-light" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-sans font-semibold text-cream/60">
                      {t('cart.cardPayment')}
                    </span>
                    <p className="font-sans text-sm text-text-body-light/60">
                      Visa, Mastercard, Maestro
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-terra/20 text-terra text-xs font-semibold whitespace-nowrap">
                    {t('cart.cardComingSoon')}
                  </span>
                </div>
                <p className="text-xs text-text-body-light/60 pl-1">
                  {t('cart.cardComingSoonDesc')}
                </p>
              </div>

              {/* Order items breakdown */}
              <div className="mt-8 pt-6 border-t border-border-card">
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-text-body-light/70 mb-3">
                  {t('cart.orderItems')}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    (() => {
                      const itemImageSrc = resolveRenderableImageSrc(item.image)
                      return (
                    <div
                      key={`${item.id}-${item.weight}`}
                      className="flex items-center gap-2 sm:gap-3 font-sans text-sm text-text-body-light"
                    >
                      <div className="w-8 h-8 rounded bg-bg-card flex items-center justify-center text-lg flex-shrink-0 overflow-hidden relative">
                        {itemImageSrc ? (
                          <Image
                            src={itemImageSrc}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm">{item.image?.trim() || '🍊'}</span>
                        )}
                      </div>
                      <span className="flex-1 min-w-0 truncate">{item.name}</span>
                      <span className="text-text-body-light/60 text-xs whitespace-nowrap">{item.weight} × {item.quantity}</span>
                      <span className="text-cream font-medium text-right whitespace-nowrap">
                        {item.price * item.quantity} {t('common.currency')}
                      </span>
                    </div>
                      )
                    })()
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-border-card">
                <div className="flex justify-between font-sans text-sm text-text-body-light mb-2">
                  <span>{t('cart.subtotal')}</span>
                  <span>{subtotal} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-text-body-light mb-4">
                  <span>{t('cart.delivery')}</span>
                  <span>{isFreeDelivery ? t('common.free') : `${deliveryFee} ${t('common.currency')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans font-semibold text-cream">{t('cart.total')}</span>
                  <span className="font-bold text-xl text-lime">{total} {t('common.currency')}</span>
                </div>
              </div>

              {orderError && (
                <p className="mt-6 text-sm text-terra text-center font-sans">
                  {orderError}
                </p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={isSubmitting}
                  className="px-6 py-3 font-sans text-sm text-lime hover:underline disabled:opacity-50"
                >
                  {t('cart.back')}
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-4 px-6 bg-bg-page text-bg-dark font-sans text-[13px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('cart.processing')}
                    </>
                  ) : (
                    t('cart.confirmOrder')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
