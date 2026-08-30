'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cloudinaryProductImageUrl } from '@/lib/cloudinary-delivery-url'
import { useI18n } from '@/lib/i18n'

function isImageUrl(src: string) {
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}

interface ProductGalleryProps {
  images: string[]
  productName: string
  /** Photography without a transparent background: fill the frame, don't letterbox. */
  fillFrame?: boolean
}

export function ProductGallery({ images, productName, fillFrame = false }: ProductGalleryProps) {
  const { t } = useI18n()
  const [currentImage, setCurrentImage] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const safeImages = images.length > 0 ? images : []

  const nextImage = () => {
    if (!safeImages.length) return
    setCurrentImage((prev) => (prev + 1) % safeImages.length)
    setTranslateX(0)
  }

  const prevImage = () => {
    if (!safeImages.length) return
    setCurrentImage((prev) => (prev - 1 + safeImages.length) % safeImages.length)
    setTranslateX(0)
  }

  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    setTranslateX(clientX - startX)
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

  return (
    <div className="flex flex-col lg:h-[clamp(460px,62vh,620px)]">
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
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentImage * 100}% + ${isDragging ? translateX : 0}px))`,
            transitionDuration: isDragging ? '0ms' : '300ms',
          }}
        >
          {safeImages.map((img, index) => (
            <div key={index} className="shrink-0 w-full h-full relative">
              {isImageUrl(img) ? (
                <Image
                  src={cloudinaryProductImageUrl(img)}
                  alt={`${productName} - ${index + 1}`}
                  fill
                  className={cn(
                    'pointer-events-none',
                    fillFrame ? 'object-cover' : 'object-contain',
                  )}
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

        {safeImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-bg-page/95 text-bg-dark hover:bg-bg-page hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
              aria-label={t('product.prevImage')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-bg-page/95 text-bg-dark hover:bg-bg-page hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
              aria-label={t('product.nextImage')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {safeImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-bg-dark/60 backdrop-blur-sm">
            {safeImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImage(index)
                  setTranslateX(0)
                }}
                className={cn(
                  'transition-all duration-300 rounded-full',
                  currentImage === index
                    ? 'w-6 h-2 bg-lime'
                    : 'w-2 h-2 bg-cream/50 hover:bg-cream/80',
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2">
          {safeImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                'shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-cream flex items-center justify-center overflow-hidden transition-all',
                currentImage === index
                  ? 'ring-2 ring-lime ring-offset-2 ring-offset-bg-page scale-105'
                  : 'opacity-60 hover:opacity-100 hover:scale-105',
              )}
            >
              {isImageUrl(img) ? (
                <Image
                  src={cloudinaryProductImageUrl(img)}
                  alt=""
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <span className="text-4xl">{img}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
