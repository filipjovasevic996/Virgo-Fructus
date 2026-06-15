'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseContentSegments } from '@/lib/blog/content-segments'

type Props = {
  content: string
}

function ContentGallery({ images }: { images: { alt: string; src: string }[] }) {
  const count = images.length
  const gridClass =
    count === 1
      ? 'grid-cols-1'
      : count === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-3'

  return (
    <figure
      className={`prose-vigor-gallery grid gap-3 sm:gap-4 ${gridClass}`}
      data-count={count}
    >
      {images.map((img, i) => (
        <div
          key={`${img.src}-${i}`}
          className="flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
          />
        </div>
      ))}
    </figure>
  )
}

export function BlogPostContent({ content }: Props) {
  const segments = parseContentSegments(content)

  return (
    <>
      {segments.map((segment, i) =>
        segment.type === 'gallery' ? (
          <ContentGallery key={`gallery-${i}`} images={segment.images} />
        ) : (
          <div
            key={`md-${i}`}
            className="prose-vigor font-sans text-base sm:text-[17px] leading-[1.78] text-text-nav"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {segment.value}
            </ReactMarkdown>
          </div>
        ),
      )}
    </>
  )
}
