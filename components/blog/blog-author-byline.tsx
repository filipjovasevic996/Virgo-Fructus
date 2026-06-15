import Image from 'next/image'
import { authorInitials, authorName } from '@/lib/blog/authors'
import type { BlogAuthor, BlogLocale } from '@/lib/blog/types'

type Props = {
  author: BlogAuthor | null
  locale: BlogLocale
  size?: 'sm' | 'md'
  showBio?: boolean
  className?: string
}

const SIZE = {
  sm: { avatar: 28, text: 'text-sm', bio: 'text-xs' },
  md: { avatar: 48, text: 'text-base', bio: 'text-sm' },
} as const

export function BlogAuthorByline({
  author,
  locale,
  size = 'sm',
  showBio = false,
  className = '',
}: Props) {
  const name = authorName(author, locale)
  const dims = SIZE[size]
  const avatar = author?.avatar

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <span
        className="relative shrink-0 overflow-hidden rounded-full bg-bg-dark/10 ring-1 ring-text-nav/15"
        style={{ width: dims.avatar, height: dims.avatar }}
      >
        {avatar ? (
          <Image
            src={avatar.url}
            alt={avatar.alt}
            fill
            sizes={`${dims.avatar}px`}
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-sans text-[10px] font-semibold text-text-nav/70">
            {authorInitials(name)}
          </span>
        )}
      </span>
      <div className="min-w-0">
        <span className={`block font-sans ${dims.text} text-text-nav/80 truncate`}>
          {name}
        </span>
        {showBio && author?.bio && (
          <p className={`mt-1 font-sans ${dims.bio} leading-relaxed text-text-nav/65`}>
            {author.bio}
          </p>
        )}
      </div>
    </div>
  )
}

export function BlogAuthorCard({
  author,
  locale,
}: {
  author: BlogAuthor | null
  locale: BlogLocale
}) {
  if (!author?.bio && !author?.avatar) return null

  return (
    <aside className="mt-12 rounded-xl border border-text-nav/12 bg-bg-page p-5 sm:p-6">
      <BlogAuthorByline author={author} locale={locale} size="md" showBio />
    </aside>
  )
}
