'use client'

import { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Loader2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

/** Isti odnos stranica kao okvir slike na kartici proizvoda (aspect-[4/3]). */
export const PRODUCT_IMAGE_ASPECT = 4 / 3

const MAX_OUTPUT_WIDTH = 2400
const FALLBACK_OUTPUT_WIDTH = 1600
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MIN_ZOOM = 0.5
const MAX_ZOOM = 4

export type ImageCropSource =
  | { kind: 'file'; file: File }
  | { kind: 'url'; url: string }

interface ImageCropDialogProps {
  source: ImageCropSource
  /** Npr. „Slika 2 od 3“ kada se uploaduje više slika odjednom. */
  subtitle?: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: (file: File) => Promise<void> | void
}

/**
 * Učitava sliku kao blob sa istog domena, da bi canvas smeo da čita piksele.
 * R2 slike idu kroz /api/admin/upload/source (javni R2 URL nema CORS).
 */
async function loadSourceBlob(source: ImageCropSource): Promise<Blob> {
  if (source.kind === 'file') return source.file

  const isSameOrigin = source.url.startsWith('/')
  const fetchUrl = isSameOrigin
    ? source.url
    : `/api/admin/upload/source?url=${encodeURIComponent(source.url)}`
  const response = await fetch(fetchUrl)
  if (!response.ok) throw new Error('Slika ne može da se učita')
  return response.blob()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Slika ne može da se učita'))
    img.src = src
  })
}

/**
 * PNG ostaje PNG (providna pozadina), WebP ostaje WebP, sve ostalo ide u JPEG.
 * AVIF canvas ne ume pouzdano da kodira, pa ide u PNG da sačuva providnost.
 */
function outputTypeFor(inputType: string): 'image/png' | 'image/webp' | 'image/jpeg' {
  if (inputType === 'image/png' || inputType === 'image/avif') return 'image/png'
  if (inputType === 'image/webp') return 'image/webp'
  return 'image/jpeg'
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
}

function renderCrop(
  img: HTMLImageElement,
  area: Area,
  outputWidth: number,
  type: string,
): Promise<Blob> {
  // Ne povećavamo sliku preko njene stvarne rezolucije.
  const width = Math.round(Math.min(outputWidth, area.width))
  const height = Math.round(width / PRODUCT_IMAGE_ASPECT)
  const scale = width / area.width

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas nije dostupan'))

  // Kad je slika umanjena ispod okvira, prazan prostor je providan za PNG/WebP,
  // a beo za JPEG (koji nema providnost).
  if (type === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    img,
    -area.x * scale,
    -area.y * scale,
    img.naturalWidth * scale,
    img.naturalHeight * scale,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Sečenje nije uspelo'))),
      type,
      0.92,
    )
  })
}

export function ImageCropDialog({
  source,
  subtitle,
  confirmLabel = 'Iseci i sačuvaj',
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [inputType, setInputType] = useState('image/jpeg')
  const [loadError, setLoadError] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let cancelled = false
    let createdUrl: string | null = null

    setObjectUrl(null)
    setLoadError('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setSaveError('')

    loadSourceBlob(source)
      .then((blob) => {
        if (cancelled) return
        createdUrl = URL.createObjectURL(blob)
        setInputType(blob.type || 'image/jpeg')
        setObjectUrl(createdUrl)
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message)
      })

    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [source])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSaving, onCancel])

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!objectUrl || !croppedAreaPixels) return
    setIsSaving(true)
    setSaveError('')
    try {
      const img = await loadImage(objectUrl)
      const type = outputTypeFor(inputType)
      let blob = await renderCrop(img, croppedAreaPixels, MAX_OUTPUT_WIDTH, type)
      if (blob.size > MAX_UPLOAD_BYTES) {
        blob = await renderCrop(img, croppedAreaPixels, FALLBACK_OUTPUT_WIDTH, type)
      }
      // Neki browseri ne umeju da kodiraju WebP i vrate PNG — ime prati stvarni tip.
      const ext = EXTENSION_BY_TYPE[blob.type] ?? 'png'
      await onConfirm(new File([blob], `product.${ext}`, { type: blob.type }))
    } catch (error) {
      console.error('Crop error:', error)
      setSaveError(error instanceof Error ? error.message : 'Sečenje nije uspelo')
    } finally {
      setIsSaving(false)
    }
  }

  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-border-card bg-bg-hero animate-modal">
        <div className="flex items-center justify-between border-b border-border-card px-5 py-4">
          <div>
            <h4 id="image-crop-title" className="font-serif text-lg text-cream">
              Iseci sliku (4:3)
            </h4>
            {subtitle && <p className="text-xs text-text-body-light/70">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-2 text-text-body-light transition-colors hover:text-cream disabled:opacity-50"
            aria-label="Zatvori"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Šahovska pozadina pokazuje gde će slika biti providna. */}
        <div
          className="relative aspect-[4/3] w-full bg-bg-dark"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.06) 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
          }}
        >
          {objectUrl ? (
            <Cropper
              image={objectUrl}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={PRODUCT_IMAGE_ASPECT}
              restrictPosition={false}
              objectFit="contain"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: 'transparent' },
                cropAreaStyle: { border: '2px solid var(--color-lime, #9DC518)' },
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-body-light">
              {loadError ? (
                <p className="px-6 text-center text-sm text-terra">{loadError}</p>
              ) : (
                <Loader2 className="h-8 w-8 animate-spin" />
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => clampZoom(z - 0.1))}
              className="p-1 text-text-body-light hover:text-cream"
              aria-label="Umanji"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <Slider
              value={[zoom]}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              onValueChange={([value]) => setZoom(value)}
              aria-label="Zum"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => clampZoom(z + 0.1))}
              className="p-1 text-text-body-light hover:text-cream"
              aria-label="Uvećaj"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-text-body-light/70">
            Prevucite sliku da je pomerite, točkićem ili klizačem zumirajte. Ako
            umanjite sliku ispod okvira, prazan prostor ostaje providan (PNG/WebP)
            ili beo (JPEG).
          </p>

          {saveError && <p className="text-sm text-terra">{saveError}</p>}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="border-border-card text-cream hover:bg-bg-card"
            >
              Otkaži
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!objectUrl || !croppedAreaPixels || isSaving}
              className="bg-lime text-bg-dark hover:bg-lime/90"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
