export type BlogLocale = 'sr' | 'en'

/** Category from Strapi `categories` collection (localized name + slug). */
export interface BlogCategory {
  documentId: string
  slug: string
  name: string
}

/** Author from Strapi `authors` collection. */
export interface BlogAuthor {
  documentId: string
  name: string
  bio?: string
  avatar?: {
    url: string
    alt: string
  }
}

/** Flattened single-locale article consumed by UI components. */
export interface BlogPost {
  /** Strapi documentId — shared across locale versions of one article. */
  documentId: string
  slug: string
  alternateSlug: string
  locale: BlogLocale
  title: string
  excerpt: string
  /** Markdown body. */
  content: string
  category: BlogCategory | null
  author: BlogAuthor | null
  publishedAt: string
  readingTimeMinutes?: number
  coverImage?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
}
