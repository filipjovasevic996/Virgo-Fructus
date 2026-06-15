import Image from 'next/image'
import type { BlogPost } from '@/lib/blog/types'

const CARD_GRADIENTS = [
  'bg-[linear-gradient(135deg,#C75B3A_0%,#E8B567_55%,#EDE8D8_100%)]',
  'bg-[linear-gradient(135deg,#2D3D1C_0%,#5C7A1A_55%,#A8C36E_100%)]',
  'bg-[linear-gradient(135deg,#1E2A0E_0%,#3A4E22_55%,#A8C36E_100%)]',
  'bg-[linear-gradient(135deg,#1E2A0E_0%,#C75B3A_55%,#EDE8D8_100%)]',
] as const

function gradientForPost(post: BlogPost) {
  const key = post.category?.slug ?? post.documentId
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i)) % CARD_GRADIENTS.length
  }
  return CARD_GRADIENTS[hash]!
}

type Props = {
  post: BlogPost
  className?: string
  priority?: boolean
}

export function BlogCardArt({ post, className = '', priority = false }: Props) {
  const cover = post.coverImage
  const gradient = gradientForPost(post)

  return (
    <div className={`relative overflow-hidden bg-bg-card ${className}`}>
      {cover ? (
        <Image
          src={cover.url}
          alt={cover.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority={priority}
          unoptimized
        />
      ) : (
        <div className={`absolute inset-0 ${gradient}`}>
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.45), transparent 45%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.25), transparent 50%)',
            }}
            aria-hidden
          />
          <span className="absolute bottom-3 right-4 font-serif text-[64px] leading-none text-bg-page/35 select-none">
            VF
          </span>
        </div>
      )}
    </div>
  )
}
