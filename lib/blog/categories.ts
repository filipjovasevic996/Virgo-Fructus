import type { BlogCategory, BlogLocale } from './types'

const CATEGORY_PALETTES = [
  { activeTextClass: 'text-bg-page', activeBgClass: 'bg-terra' },
  { activeTextClass: 'text-bg-page', activeBgClass: 'bg-bg-hero' },
  { activeTextClass: 'text-bg-dark', activeBgClass: 'bg-lime' },
  { activeTextClass: 'text-bg-page', activeBgClass: 'bg-bg-dark' },
] as const

function paletteForSlug(slug: string) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i)) % CATEGORY_PALETTES.length
  }
  return CATEGORY_PALETTES[hash]!
}

/** Strapi categories that have at least one post in the current locale. */
export function categoriesWithPosts(
  categories: BlogCategory[],
  posts: { category: BlogCategory | null }[],
) {
  const used = new Set(
    posts.map((p) => p.category?.documentId).filter(Boolean) as string[],
  )
  return categories.filter((c) => used.has(c.documentId))
}

export function categoryLabel(category: BlogCategory | null, locale: BlogLocale) {
  if (category?.name) return category.name
  return locale === 'en' ? 'Blog' : 'Blog'
}

export function categoryChipClasses(category: BlogCategory, active: boolean) {
  const preset = paletteForSlug(category.slug)
  if (active) {
    return `${preset.activeBgClass} ${preset.activeTextClass} border-transparent`
  }
  return 'bg-transparent text-text-nav border-text-nav/25 hover:border-text-nav hover:text-bg-dark'
}

export function categoryTagClasses(category: BlogCategory) {
  const preset = paletteForSlug(category.slug)
  return `${preset.activeBgClass} ${preset.activeTextClass}`
}
