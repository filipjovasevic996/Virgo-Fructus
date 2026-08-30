'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import type { DragEvent } from 'react'
import Image from 'next/image'
import useSWR, { useSWRConfig, mutate } from 'swr'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  ImageIcon,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AdminProduct, LocalizedField } from '@/lib/admin-store'
import { cn } from '@/lib/utils'
import { formatKgFixed4, parseStockKg, roundKgUp4 } from '@/lib/stock-kg'
import { cloudinaryProductImageUrl } from '@/lib/cloudinary-delivery-url'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const categories = [
  { value: 'citrus', label: 'Citrus' },
  { value: 'jagodičasto', label: 'Jagodičasto voće' },
  { value: 'egzotično', label: 'Egzotično voće' },
]

const badges = [
  { value: '', label: 'Bez oznake' },
  { value: 'new', label: 'Novo' },
  { value: 'limited', label: 'Ograničena ponuda' },
  { value: 'sale', label: 'Akcija' },
]

const statuses = [
  { value: 'active', label: 'Aktivan', color: 'bg-lime/20 text-lime' },
  { value: 'hidden', label: 'Sakriven', color: 'bg-terra/20 text-terra' },
]


const localeTabs = [
  { value: 'sr' as const, label: 'Srpski', flag: '🇷🇸' },
  { value: 'en' as const, label: 'English', flag: '🇬🇧' },
]

const pricingModes = [
  { value: 'weight' as const, label: 'Po težini (kg / g)' },
  { value: 'quantity' as const, label: 'Po količini (broj komada)' },
]

type PriceRow = {
  weight?: string
  quantity?: number
  price: number
  salePrice?: number
  pricingMode?: 'weight' | 'quantity'
}

const defaultPricesByMode: Record<'weight' | 'quantity', PriceRow[]> = {
  weight: [
    { weight: '50g', price: 0 },
    { weight: '100g', price: 0 },
    { weight: '1kg', price: 0 },
    { weight: '3kg', price: 0 },
  ],
  quantity: [
    { quantity: 1, price: 0 },
  ],
}

function normalizePriceRowForMode(
  row: PriceRow | undefined,
  mode: 'weight' | 'quantity',
): PriceRow {
  if (mode === 'quantity') {
    const q =
      typeof row?.quantity === 'number' && row.quantity > 0
        ? Math.floor(row.quantity)
        : 1
    return {
      quantity: q,
      price: row?.price ?? 0,
      ...(typeof row?.salePrice === 'number' ? { salePrice: row.salePrice } : {}),
    }
  }
  return {
    weight: typeof row?.weight === 'string' && row.weight ? row.weight : '',
    price: row?.price ?? 0,
    ...(typeof row?.salePrice === 'number' ? { salePrice: row.salePrice } : {}),
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('sr-RS').format(price)
}

function getStatusConfig(status: string) {
  return statuses.find((s) => s.value === status) ?? statuses[0]
}

function resolveField(field: unknown): string {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object') return (field as Record<string, string>).sr || ''
  return ''
}

function toLocalizedField(field: unknown): LocalizedField {
  if (typeof field === 'string') return { sr: field, en: '' }
  if (field && typeof field === 'object') {
    const obj = field as Record<string, string>
    return { sr: obj.sr || '', en: obj.en || '' }
  }
  return { sr: '', en: '' }
}

function resolveRenderableImageSrc(src: string | null | undefined): string | null {
  if (!src || typeof src !== 'string') return null
  const normalized = src.trim()
  if (!normalized) return null
  if (
    !normalized.startsWith('http://') &&
    !normalized.startsWith('https://') &&
    !normalized.startsWith('/')
  ) {
    return null
  }
  const cloudinarySrc = cloudinaryProductImageUrl(normalized).trim()
  return cloudinarySrc || null
}

function createImageItemKey() {
  return `img_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

const ROW_REORDER_MIME = 'application/x-vf-product-reorder'

export function ProductsTab() {
  const { mutate: revalidateByKey } = useSWRConfig()
  const { data, isLoading } = useSWR('/api/admin/products', fetcher)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  // Optimistic ordering override; the server is the source of truth once the
  // PATCH round-trip lands and SWR revalidates.
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null)
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)
  const [dropTargetRowId, setDropTargetRowId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')

  const serverProducts: AdminProduct[] = useMemo(
    () => data?.products || [],
    [data],
  )

  // Products the admin has dragged come first, in the dragged order; anything
  // added/removed server-side since the drag keeps its own relative position.
  const products: AdminProduct[] = useMemo(() => {
    if (!orderedIds) return serverProducts
    const byId = new Map(serverProducts.map((p) => [p.id, p]))
    const listed = orderedIds
      .map((id) => byId.get(id))
      .filter((p): p is AdminProduct => Boolean(p))
    const listedIds = new Set(listed.map((p) => p.id))
    return [...listed, ...serverProducts.filter((p) => !listedIds.has(p.id))]
  }, [serverProducts, orderedIds])

  const persistOrder = async (ids: string[]) => {
    setSavingOrder(true)
    setOrderError('')
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: ids }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setOrderError(payload.error || 'Čuvanje redosleda nije uspelo')
        return
      }
      await mutate('/api/admin/products')
      await revalidateByKey(
        (key) => typeof key === 'string' && key.startsWith('/api/products'),
        undefined,
        { revalidate: true },
      )
    } catch (error) {
      console.error('Reorder error:', error)
      setOrderError('Greška u mreži pri čuvanju redosleda')
    } finally {
      setSavingOrder(false)
    }
  }

  const moveRow = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const ids = products.map((p) => p.id)
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    setOrderedIds(ids)
    void persistOrder(ids)
  }

  const handleRowDragStart = (id: string, e: DragEvent) => {
    setDraggingRowId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(ROW_REORDER_MIME, id)
    e.dataTransfer.setData('text/plain', id)
  }

  const handleRowDragEnd = () => {
    setDraggingRowId(null)
    setDropTargetRowId(null)
  }

  const handleRowDragOver = (id: string, e: DragEvent) => {
    if (!draggingRowId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetRowId(id)
  }

  const handleRowDrop = (id: string, e: DragEvent) => {
    e.preventDefault()
    const fromId =
      e.dataTransfer.getData(ROW_REORDER_MIME) ||
      e.dataTransfer.getData('text/plain')
    handleRowDragEnd()
    if (!fromId) return
    moveRow(fromId, id)
  }

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    setDeleteError('')
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setDeleteError(payload.error || 'Brisanje proizvoda nije uspelo')
        return
      }
      setOrderedIds((prev) => (prev ? prev.filter((v) => v !== id) : prev))
      mutate('/api/admin/products')
      mutate('/api/admin/stats')
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Delete error:', error)
      setDeleteError('Greška u mreži pri brisanju proizvoda')
    }
  }

  const handleToggleVisibility = async (product: AdminProduct) => {
    const currentStatus = product.status ?? 'active'
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active'
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: newStatus }),
      })
      mutate('/api/admin/products')
    } catch (error) {
      console.error('Toggle visibility error:', error)
    }
  }

  const handleToggleFavorite = async (product: AdminProduct) => {
    setTogglingFavoriteId(product.id)
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          isFavorite: !product.isFavorite,
        }),
      })
      await mutate('/api/admin/products')
      await revalidateByKey(
        (key) => typeof key === 'string' && key.includes('bestSellers=1'),
        undefined,
        { revalidate: true },
      )
    } catch (error) {
      console.error('Toggle favorite error:', error)
    } finally {
      setTogglingFavoriteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-lime animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-text-body-light text-sm sm:text-base">
            Ukupno {products.length} proizvoda
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-text-body-light/70">
            {savingOrder ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-lime" />
                Čuvanje redosleda…
              </>
            ) : (
              <>
                <GripVertical className="w-3 h-3 shrink-0" />
                Prevucite red da promenite redosled prikaza na sajtu
              </>
            )}
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-lime text-bg-dark hover:bg-lime/90 w-full sm:w-auto shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Dodaj proizvod
        </Button>
      </div>

      {orderError && (
        <p className="flex items-start gap-2 rounded-md border border-terra/40 bg-terra/10 px-3 py-2 text-sm text-terra">
          <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
          <span>{orderError}</span>
        </p>
      )}

      <div className="bg-bg-hero rounded-lg border border-border-card overflow-hidden -mx-1 sm:mx-0">
        <div className="overflow-x-auto [&_th]:px-3 [&_th]:py-3 [&_td]:px-3 [&_td]:py-3 sm:[&_th]:px-6 sm:[&_th]:py-4 sm:[&_td]:px-6 sm:[&_td]:py-4">
        <table className="w-full min-w-[1030px]">
          <thead>
            <tr className="border-b border-border-card">
              <th className="w-10 px-6 py-4">
                <span className="sr-only">Redosled</span>
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Slika
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Naziv
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Kategorija
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Najprodavanije
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Status
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Oznaka
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Prevod
              </th>
              <th className="text-center px-6 py-4 text-sm font-medium text-text-body-light">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const productName = resolveField(product.name)
              const productShortDesc = resolveField(product.shortDescription)
              const statusVal = product.status || 'active'
              const hasEnglish = !!(toLocalizedField(product.name).en)
              const productThumbSrc = resolveRenderableImageSrc(product.images[0])

              return (
                <tr
                  key={product.id}
                  draggable
                  onDragStart={(e) => handleRowDragStart(product.id, e)}
                  onDragEnd={handleRowDragEnd}
                  onDragOver={(e) => handleRowDragOver(product.id, e)}
                  onDragLeave={() => setDropTargetRowId(null)}
                  onDrop={(e) => handleRowDrop(product.id, e)}
                  className={cn(
                    'border-b border-border-card last:border-b-0 transition-colors',
                    draggingRowId === product.id && 'opacity-50',
                    dropTargetRowId === product.id &&
                      draggingRowId !== product.id &&
                      'bg-lime/10',
                  )}
                >
                  <td className="px-6 py-4">
                    <span
                      className="flex cursor-grab items-center justify-center text-text-muted active:cursor-grabbing"
                      title="Prevucite da promenite redosled prikaza"
                      aria-hidden
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {productThumbSrc ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-bg-card">
                        <Image
                          src={productThumbSrc}
                          alt={productName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-bg-card flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-text-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-cream font-medium">{productName}</p>
                    {/* <p className="text-sm text-text-body-light truncate max-w-xs">
                      {productShortDesc}
                    </p> */}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-body-light capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(product)}
                      disabled={togglingFavoriteId === product.id}
                      title={
                        product.isFavorite
                          ? 'Ukloni sa početne (najprodavanije)'
                          : 'Dodaj na početnu (najprodavanije)'
                      }
                      aria-label={
                        product.isFavorite
                          ? 'Ukloni sa početne'
                          : 'Označi kao najprodavanije na početnoj'
                      }
                      aria-pressed={Boolean(product.isFavorite)}
                      className={cn(
                        'p-1.5 rounded-md transition-colors disabled:opacity-50',
                        product.isFavorite
                          ? 'text-lime hover:bg-lime/15'
                          : 'text-text-muted hover:text-lime hover:bg-bg-card',
                      )}
                    >
                      {togglingFavoriteId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-lime" />
                      ) : (
                        <Star
                          className={cn(
                            'w-4 h-4',
                            product.isFavorite
                              ? 'fill-current'
                              : 'fill-none stroke-current stroke-[1.5]',
                          )}
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const cfg = getStatusConfig(statusVal)
                      return (
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    {product.badge ? (
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          product.badge === 'new'
                            ? 'bg-lime/20 text-lime'
                            : product.badge === 'limited'
                            ? 'bg-terra/20 text-terra'
                            : 'bg-cream/20 text-cream'
                        }`}
                      >
                        {product.badge === 'new'
                          ? 'Novo'
                          : product.badge === 'limited'
                          ? 'Limitirano'
                          : 'Akcija'}
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {hasEnglish ? (
                      <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap px-2 py-1 rounded text-xs font-medium bg-lime/20 text-lime">
                        <span className="shrink-0" aria-hidden>
                          🇬🇧
                        </span>
                        <span>EN</span>
                      </span>
                    ) : (
                      <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap px-1 py-0 rounded text-xs font-medium bg-terra/10 text-terra/70">
                        <span className="shrink-0" aria-hidden>
                          🇷🇸
                        </span>
                        <span>SR</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleVisibility(product)}
                        className="p-2 text-text-body-light hover:text-cream transition-colors"
                        title={statusVal === 'active' ? 'Sakrij proizvod' : 'Prikaži proizvod'}
                      >
                        {statusVal === 'active' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-terra" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-text-body-light hover:text-lime transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 text-text-body-light hover:text-terra transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        {products.length === 0 && (
          <div className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-body-light">Nema proizvoda</p>
            <Button
              onClick={handleAdd}
              variant="outline"
              className="mt-4 border-border-card text-cream hover:bg-bg-card"
            >
              Dodaj prvi proizvod
            </Button>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-hero rounded-lg p-6 max-w-md w-full border border-border-card animate-modal">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-terra/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-cream">
                  Potvrda brisanja
                </h3>
                <p className="text-sm text-text-body-light">
                  Da li ste sigurni da želite da obrišete ovaj proizvod?
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="mb-4 flex items-start gap-2 rounded-md border border-terra/40 bg-terra/10 px-3 py-2 text-sm text-terra">
                <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteConfirm(null)
                  setDeleteError('')
                }}
                className="min-w-[7rem] border-2 border-cream/55 bg-bg-page text-bg-dark hover:bg-cream hover:border-cream hover:text-bg-dark font-semibold shadow-sm"
              >
                Otkaži
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-terra text-cream hover:bg-terra/90"
              >
                Obriši
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductModal({
  product,
  onClose,
}: {
  product: AdminProduct | null
  onClose: () => void
}) {
  const initialPricingMode: 'weight' | 'quantity' =
    product?.prices?.[0]?.pricingMode === 'quantity' ? 'quantity' : 'weight'
  const initialPrices: PriceRow[] = (() => {
    const existing = product?.prices && product.prices.length > 0
      ? product.prices
      : defaultPricesByMode[initialPricingMode].map((entry) => ({ ...entry }))

    if (initialPricingMode === 'quantity') {
      const first = existing[0] as PriceRow | undefined
      return [normalizePriceRowForMode(first, 'quantity')]
    }

    return existing.map((entry) =>
      normalizePriceRowForMode(entry as PriceRow, 'weight'),
    )
  })()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(
    null,
  )
  const [dropTargetImageIndex, setDropTargetImageIndex] = useState<
    number | null
  >(null)
  const [activeLocale, setActiveLocale] = useState<'sr' | 'en'>('sr')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const internalImageReorderDragRef = useRef(false)

  const [formData, setFormData] = useState({
    name: toLocalizedField(product?.name),
    slug: product?.slug || '',
    category: product?.category || 'citrus',
    shortDescription: toLocalizedField(product?.shortDescription),
    description: toLocalizedField(product?.description),
    badge: product?.badge || '',
    status: product?.status || 'active',
    isFavorite: Boolean(product?.isFavorite),
    isRegular: product?.isRegular ?? true,
    images: product?.images || [],
    pricingMode: initialPricingMode,
    prices: initialPrices,
    stockKg: product
      ? roundKgUp4(parseStockKg(product.stockKg))
      : 1000,
  })
  const [imageItemKeys, setImageItemKeys] = useState(() =>
    (product?.images || []).map(() => createImageItemKey()),
  )
  const [stockInput, setStockInput] = useState(String(
    product
      ? roundKgUp4(parseStockKg(product.stockKg))
      : 1000,
  ))

  useEffect(() => {
    setStockInput(String(formData.stockKg))
  }, [formData.stockKg])

  const uploadFiles = async (files: File[]) => {
    setUploadingImages(true)
    setUploadError('')
    const newImages: string[] = []

    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd,
        })
        const data = await response.json()
        if (!response.ok) {
          setUploadError(data.error || 'Upload failed')
          continue
        }
        if (data.url) {
          newImages.push(data.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadError('Network error during upload')
      }
    }

    if (newImages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }))
      setImageItemKeys((prev) => [
        ...prev,
        ...newImages.map(() => createImageItemKey()),
      ])
    }
    setUploadingImages(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await uploadFiles(Array.from(files))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const IMAGE_REORDER_MIME = 'application/x-vf-image-reorder'

  const moveImage = (from: number, to: number) => {
    if (from === to) return
    setFormData((prev) => {
      const next = [...prev.images]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return { ...prev, images: next }
    })
    setImageItemKeys((prev) => {
      const next = [...prev]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return next
    })
  }

  const handleThumbnailDragStart = (index: number, e: DragEvent) => {
    internalImageReorderDragRef.current = true
    setDraggingImageIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(IMAGE_REORDER_MIME, String(index))
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleThumbnailDragEnd = () => {
    internalImageReorderDragRef.current = false
    setDraggingImageIndex(null)
    setDropTargetImageIndex(null)
  }

  const handleThumbnailDragOver = (index: number, e: DragEvent) => {
    if (!internalImageReorderDragRef.current) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetImageIndex(index)
  }

  const handleThumbnailDragLeave = () => {
    setDropTargetImageIndex(null)
  }

  const handleThumbnailDrop = (index: number, e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const fromStr =
      e.dataTransfer.getData(IMAGE_REORDER_MIME) ||
      e.dataTransfer.getData('text/plain')
    const from = parseInt(fromStr, 10)
    handleThumbnailDragEnd()
    if (Number.isNaN(from)) return
    moveImage(from, index)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.getData(IMAGE_REORDER_MIME) !== '') {
      return
    }
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length > 0) await uploadFiles(files)
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = formData.images[index]

    try {
      await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      })
    } catch (error) {
      console.error('Delete error:', error)
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImageItemKeys((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePriceChange = (index: number, field: 'price' | 'salePrice', value: string) => {
    const numValue = parseInt(value) || 0
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.map((p, i) =>
        i === index ? { ...p, [field]: numValue } : p
      ),
    }))
  }

  const setLocalizedField = (
    fieldName: 'name' | 'shortDescription' | 'description',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], [activeLocale]: value },
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đ]/g, 'd')
      .replace(/[ž]/g, 'z')
      .replace(/[č]/g, 'c')
      .replace(/[ć]/g, 'c')
      .replace(/[š]/g, 's')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const method = product ? 'PUT' : 'POST'
      const payload = {
        ...(product ? { id: product.id } : {}),
        ...formData,
        prices: formData.prices.map((price) => ({
          ...normalizePriceRowForMode(price, formData.pricingMode),
          pricingMode: formData.pricingMode,
        })),
        image: formData.images[0] || '',
      }

      await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      mutate('/api/admin/products')
      mutate('/api/admin/stats')
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const enMissing = !formData.name.en || !formData.description.en

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-bg-hero rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto border border-border-card animate-modal">
        <div className="flex items-center justify-between p-6 border-b border-border-card sticky top-0 bg-bg-hero z-10">
          <h3 className="text-xl font-serif text-cream">
            {product ? 'Uredi proizvod' : 'Novi proizvod'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-text-body-light hover:text-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Language Tabs */}
          <div className="flex items-center gap-2">
            {localeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveLocale(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLocale === tab.value
                    ? 'bg-lime text-bg-dark'
                    : 'bg-bg-card text-text-body-light hover:text-cream'
                }`}
              >
                <span className="text-base leading-none">{tab.flag}</span>
                {tab.label}
              </button>
            ))}
            {enMissing && activeLocale === 'sr' && (
              <span className="ml-auto text-xs text-terra/70 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Engleski prevod nije popunjen
              </span>
            )}
          </div>

          {/* Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-text-body-light">
                Naziv {activeLocale === 'en' && <span className="text-xs text-terra">(EN)</span>}
              </label>
              <Input
                value={formData.name[activeLocale]}
                onChange={(e) => {
                  setLocalizedField('name', e.target.value)
                  if (activeLocale === 'sr') {
                    setFormData((prev) => ({
                      ...prev,
                      name: { ...prev.name, sr: e.target.value },
                      slug: generateSlug(e.target.value),
                    }))
                  }
                }}
                className="input-vigor"
                required={activeLocale === 'sr'}
                placeholder={activeLocale === 'en' ? formData.name.sr || 'English name…' : ''}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-body-light">Slug (URL)</label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="input-vigor"
                required
              />
            </div>
          </div>

          {/* Category, Badge, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-text-body-light">Kategorija</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as AdminProduct['category'],
                  }))
                }
                className="w-full px-3 py-2 input-vigor"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-body-light">Oznaka</label>
              <select
                value={formData.badge}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, badge: e.target.value }))
                }
                className="w-full px-3 py-2 input-vigor"
              >
                {badges.map((badge) => (
                  <option key={badge.value} value={badge.value}>
                    {badge.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-body-light">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as 'active' | 'draft' | 'hidden' }))
                }
                className="w-full px-3 py-2 input-vigor"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-body-light">Način vođenja cene i zaliha</label>
            <select
              value={formData.pricingMode}
              onChange={(e) => {
                const nextMode = e.target.value as 'weight' | 'quantity'
                setFormData((prev) => ({
                  ...prev,
                  pricingMode: nextMode,
                  prices: (() => {
                    if (prev.pricingMode === nextMode) {
                      return nextMode === 'quantity'
                        ? [normalizePriceRowForMode(prev.prices[0], 'quantity')]
                        : prev.prices.map((p) =>
                            normalizePriceRowForMode(p, 'weight'),
                          )
                    }
                    if (nextMode === 'quantity') {
                      return [normalizePriceRowForMode(prev.prices[0], 'quantity')]
                    }
                    return defaultPricesByMode.weight.map((entry) => ({ ...entry }))
                  })(),
                }))
              }}
              className="w-full px-3 py-2 input-vigor"
            >
              {pricingModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-body-light/70">
              Izaberite da li je proizvod vezan za gramažu ili za broj komada.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-body-light">
              {formData.pricingMode === 'quantity'
                ? 'Na stanju (broj komada)'
                : 'Na stanju (kg, do 4 decimale)'}
            </label>
            <Input
              type="text"
              inputMode={formData.pricingMode === 'quantity' ? 'numeric' : 'decimal'}
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              onBlur={() => {
                const normalized = stockInput.replace(',', '.').trim()
                const raw = normalized === '' ? 0 : Number(normalized)
                setFormData((prev) => {
                  const nextStock =
                    Number.isFinite(raw)
                      ? prev.pricingMode === 'quantity'
                        ? Math.max(0, Math.floor(raw))
                        : roundKgUp4(Math.max(0, raw))
                      : 0
                  setStockInput(String(nextStock))
                  return {
                    ...prev,
                    stockKg: nextStock,
                  }
                })
              }}
              className="input-vigor tabular-nums"
            />
            <p className="text-xs text-text-body-light/70">
              {formData.pricingMode === 'quantity'
                ? 'Unesite ukupan broj komada na stanju (ceo broj).'
                : 'Jedna količina u kilogramima za sve veličine pakovanja; pri čuvanju se zaokružuje naviše na 4 decimale. Porudžbina oduzima masu po izabranoj gramaži × količina.'}
            </p>
          </div>

          <div className="rounded-xl border-2 border-lime/35 bg-bg-dark/50 px-4 py-3.5 ring-1 ring-lime/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p id="favorite-heading" className="text-sm font-semibold text-cream">
                  Najprodavanije (početna)
                </p>
                <p className="text-xs text-text-body-light/80 mt-0.5">
                  Prikaži proizvod u sekciji „Najprodavanije“ na naslovnoj strani
                </p>
              </div>
              <fieldset
                aria-labelledby="favorite-heading"
                className="shrink-0 border-0 p-0 m-0 flex flex-row flex-nowrap items-center gap-4 sm:gap-6 alig"
              >
                <legend className="sr-only">Najprodavanije na početnoj</legend>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-cream select-none whitespace-nowrap">
                  <input
                    type="radio"
                    name="product-is-favorite"
                    checked={formData.isFavorite}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, isFavorite: true }))
                    }
                    className="size-4 shrink-0 accent-lime border-border-card bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-hero"
                  />
                  Da
                </label>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-text-body-light select-none whitespace-nowrap">
                  <input
                    type="radio"
                    name="product-is-favorite"
                    checked={!formData.isFavorite}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, isFavorite: false }))
                    }
                    className="size-4 shrink-0 accent-lime border-border-card bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-hero"
                  />
                  Ne
                </label>
              </fieldset>
            </div>
          </div>

          <div className="rounded-xl border-2 border-lime/35 bg-bg-dark/50 px-4 py-3.5 ring-1 ring-lime/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p id="regular-image-heading" className="text-sm font-semibold text-cream">
                  Prikaz slike na kartici
                </p>
                <p className="text-xs text-text-body-light/80 mt-0.5">
                  „Standardno“ — slika izlazi izvan kartice na velikim ekranima
                  (za slike sa providnom pozadinom). „Popuni karticu“ — slika
                  ostaje u okviru kartice i popunjava njen prostor.
                </p>
              </div>
              <fieldset
                aria-labelledby="regular-image-heading"
                className="shrink-0 border-0 p-0 m-0 flex flex-row flex-nowrap items-center gap-4 sm:gap-6"
              >
                <legend className="sr-only">Prikaz slike na kartici</legend>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-cream select-none whitespace-nowrap">
                  <input
                    type="radio"
                    name="product-is-regular"
                    checked={formData.isRegular}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, isRegular: true }))
                    }
                    className="size-4 shrink-0 accent-lime border-border-card bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-hero"
                  />
                  Standardno
                </label>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-text-body-light select-none whitespace-nowrap">
                  <input
                    type="radio"
                    name="product-is-regular"
                    checked={!formData.isRegular}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, isRegular: false }))
                    }
                    className="size-4 shrink-0 accent-lime border-border-card bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-hero"
                  />
                  Popuni karticu
                </label>
              </fieldset>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <label className="text-sm text-text-body-light">
              Kratak opis {activeLocale === 'en' && <span className="text-xs text-terra">(EN)</span>}
            </label>
            <Input
              value={formData.shortDescription[activeLocale]}
              onChange={(e) => setLocalizedField('shortDescription', e.target.value)}
              className="input-vigor"
              placeholder={activeLocale === 'en' ? formData.shortDescription.sr || 'Short description in English…' : ''}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-text-body-light">
              Opis {activeLocale === 'en' && <span className="text-xs text-terra">(EN)</span>}
            </label>
            <textarea
              value={formData.description[activeLocale]}
              onChange={(e) => setLocalizedField('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 input-vigor resize-none"
              placeholder={activeLocale === 'en' ? formData.description.sr || 'Full description in English…' : ''}
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <label className="text-sm text-text-body-light">Slike proizvoda</label>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
                dragOver
                  ? 'border-lime bg-lime/5'
                  : 'border-border-card'
              }`}
            >
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  (() => {
                    const imageSrc = resolveRenderableImageSrc(image)
                    return (
                  <div
                    key={imageItemKeys[index] ?? `${image}-${index}`}
                    draggable
                    onDragStart={(e) => handleThumbnailDragStart(index, e)}
                    onDragEnd={handleThumbnailDragEnd}
                    onDragOver={(e) => handleThumbnailDragOver(index, e)}
                    onDragLeave={handleThumbnailDragLeave}
                    onDrop={(e) => handleThumbnailDrop(index, e)}
                    className={cn(
                      'relative aspect-square rounded-md overflow-hidden bg-bg-card group cursor-grab active:cursor-grabbing border-2 transition-colors',
                      draggingImageIndex === index && 'opacity-50 ring-2 ring-lime/60',
                      dropTargetImageIndex === index &&
                        draggingImageIndex !== index &&
                        'border-lime ring-2 ring-lime/40',
                      dropTargetImageIndex !== index &&
                        draggingImageIndex !== index &&
                        'border-transparent',
                    )}
                    title="Prevucite da promenite redosled"
                  >
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={`Product ${index + 1}`}
                        fill
                        draggable={false}
                        className="object-cover pointer-events-none select-none"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-bg-card text-text-muted">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div
                      className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-bg-dark/75 px-1 py-0.5 text-text-body-light pointer-events-none"
                      aria-hidden
                    >
                      <GripVertical className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="absolute top-2 right-2 p-1 bg-bg-dark/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    >
                      <X className="w-4 h-4 text-cream" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-8 px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-lime text-bg-dark rounded pointer-events-none">
                        Glavna
                      </span>
                    )}
                  </div>
                    )
                  })()
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="aspect-square rounded-md border-2 border-dashed border-border-card flex flex-col items-center justify-center gap-2 text-text-body-light hover:border-lime hover:text-lime transition-colors disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Dodaj sliku</span>
                    </>
                  )}
                </button>
              </div>

              {formData.images.length === 0 && !uploadingImages && (
                <p className="text-center text-xs text-text-body-light/60 mt-3">
                  Prevucite slike ovde ili kliknite dugme iznad
                </p>
              )}
            </div>

            {uploadError && (
              <p className="text-sm text-terra flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-text-body-light/50">
              JPEG, PNG, WebP, AVIF · Maks. 5MB po slici · Prva slika je glavna ·
              prevucite slike da promenite redosled
            </p>
          </div>

          {/* Prices */}
          <div className="space-y-4">
            <label className="text-sm text-text-body-light">
              {formData.pricingMode === 'quantity' ? 'Cene po komadu' : 'Cene po težini'}
            </label>
            <div className={cn('grid gap-4', formData.pricingMode === 'quantity' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4')}>
              {formData.prices.map((price, index) => (
                <div
                  key={
                    formData.pricingMode === 'quantity'
                      ? `q-${index}`
                      : `w-${price.weight ?? index}`
                  }
                  className="space-y-2"
                >
                  {formData.pricingMode === 'weight' && (
                    <>
                      <label className="text-xs text-text-muted">Težina</label>
                      <Input
                        type="text"
                        value={price.weight ?? ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            prices: prev.prices.map((p, i) =>
                              i === index ? { ...p, weight: e.target.value } : p
                            ),
                          }))
                        }
                        placeholder="npr. 50g"
                        className="input-vigor"
                      />
                    </>
                  )}
                  {formData.pricingMode === 'quantity' && (
                    <>
                      <label className="text-xs text-text-muted">Količina (kom)</label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        value={price.quantity ?? ''}
                        onChange={(e) => {
                          const raw = parseInt(e.target.value, 10)
                          const q = Number.isFinite(raw) && raw > 0 ? raw : 1
                          setFormData((prev) => ({
                            ...prev,
                            prices: prev.prices.map((p, i) =>
                              i === index ? { ...p, quantity: q } : p
                            ),
                          }))
                        }}
                        placeholder="npr. 1"
                        className="input-vigor"
                      />
                    </>
                  )}
                  <Input
                    type="number"
                    value={price.price || ''}
                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                    placeholder="Cena"
                    className="input-vigor"
                  />
                  {formData.badge === 'sale' && (
                    <Input
                      type="number"
                      value={price.salePrice || ''}
                      onChange={(e) => handlePriceChange(index, 'salePrice', e.target.value)}
                      placeholder="Akcijska cena"
                      className="input-vigor"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-card">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[7rem] border-2 border-cream/55 bg-bg-page text-bg-dark hover:bg-cream hover:border-cream hover:text-bg-dark font-semibold shadow-sm"
            >
              Otkaži
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-lime text-bg-dark hover:bg-lime/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Čuvanje...
                </>
              ) : product ? (
                'Sačuvaj izmene'
              ) : (
                'Dodaj proizvod'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
