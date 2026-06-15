import type { BlogAuthor, BlogLocale } from './types'

const DEFAULT_AUTHOR_NAME = 'Vigor Fructus'

export function authorName(author: BlogAuthor | null, locale: BlogLocale = 'sr') {
  if (author?.name) return author.name
  return locale === 'en' ? DEFAULT_AUTHOR_NAME : DEFAULT_AUTHOR_NAME
}

export function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
