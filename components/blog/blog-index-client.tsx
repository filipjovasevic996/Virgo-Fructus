'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowUpRight, Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import {
  categoriesWithPosts,
  categoryChipClasses,
  categoryTagClasses,
} from '@/lib/blog/categories'
import type { BlogCategory, BlogLocale, BlogPost } from '@/lib/blog/types'
import { BlogAuthorByline } from './blog-author-byline'
import { BlogCardArt } from './blog-card-art'

type Props = {
  posts: BlogPost[]
  categories: BlogCategory[]
  locale: BlogLocale
}

function formatDate(iso: string, locale: BlogLocale) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'sr-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function BlogIndexClient({ posts, categories, locale }: Props) {
  const { t } = useI18n()
  const { withLocale } = useLocalizedPath()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const availableCategories = useMemo(
    () => categoriesWithPosts(categories, posts),
    [categories, posts],
  )

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return posts.filter((p) => {
      const matchesCategory =
        activeCategory === 'all' || p.category?.slug === activeCategory
      const matchesSearch =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [posts, activeCategory, searchQuery])

  const featured = posts[0]
  const showFeatured =
    featured && activeCategory === 'all' && searchQuery.trim() === ''
  const grid = showFeatured
    ? filtered.filter((p) => p.documentId !== featured.documentId)
    : filtered

  return (
    <div className="bg-bg-page min-h-screen pb-16">
      <section className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20">
        <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-terra">
          {t('blog.label')}
        </span>
        <h1 className="mt-3 font-serif font-bold text-[32px] leading-[1.1] sm:text-5xl lg:text-[64px] text-bg-dark">
          {t('blog.title')}
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base sm:text-lg leading-[1.7] text-text-nav/85">
          {t('blog.lead')}
        </p>
      </section>

      {posts.length === 0 ? (
        <section className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 mt-16">
          <div className="border border-text-nav/15 rounded-xl py-14 text-center">
            <p className="font-sans text-base text-text-nav/70">{t('blog.empty')}</p>
          </div>
        </section>
      ) : (
        <>
          {showFeatured && featured && (
            <section className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 mt-10 sm:mt-14">
              <FeaturedCard post={featured} locale={locale} withLocale={withLocale} t={t} />
            </section>
          )}

          <section className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 mt-12 sm:mt-16">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
                <CategoryChip
                  label={t('blog.allCategories')}
                  active={activeCategory === 'all'}
                  onClick={() => setActiveCategory('all')}
                  chipClass={
                    activeCategory === 'all'
                      ? 'bg-bg-dark text-bg-page border-transparent'
                      : 'bg-transparent text-text-nav border-text-nav/25 hover:border-text-nav hover:text-bg-dark'
                  }
                />
                {availableCategories.map((category) => (
                  <CategoryChip
                    key={category.documentId}
                    label={category.name}
                    active={activeCategory === category.slug}
                    onClick={() => setActiveCategory(category.slug)}
                    chipClass={categoryChipClasses(
                      category,
                      activeCategory === category.slug,
                    )}
                  />
                ))}
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-nav/50" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('blog.searchPlaceholder')}
                  className="w-full rounded-full border border-text-nav/25 bg-transparent pl-10 pr-4 py-2.5 font-sans text-sm text-text-nav placeholder:text-text-nav/45 focus:border-text-nav focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8 mt-8 sm:mt-10">
            {grid.length === 0 ? (
              <p className="py-14 text-center font-sans text-sm text-text-nav/65">
                {t('blog.noResults')}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {grid.map((post) => (
                  <ArticleCard
                    key={post.documentId}
                    post={post}
                    locale={locale}
                    withLocale={withLocale}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
  chipClass,
}: {
  label: string
  active: boolean
  onClick: () => void
  chipClass: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 font-sans text-sm font-medium transition-colors ${chipClass}`}
    >
      {label}
    </button>
  )
}

type CardProps = {
  post: BlogPost
  locale: BlogLocale
  withLocale: (path: string) => string
  t: (key: string, vars?: Record<string, string | number>) => string
}

function FeaturedCard({ post, locale, withLocale, t }: CardProps) {
  const minutes = post.readingTimeMinutes ?? estimateReadingMinutes(post.content)

  return (
    <Link
      href={withLocale(`/blog/${post.slug}`)}
      className="group grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 rounded-2xl border border-text-nav/12 bg-bg-page p-3 sm:p-4 lg:p-5 transition-colors hover:border-text-nav/35"
    >
      <BlogCardArt
        post={post}
        priority
        className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[360px] rounded-xl"
      />
      <div className="flex flex-col justify-center px-2 pb-3 lg:px-4 lg:py-6">
        <div className="flex flex-wrap items-center gap-3">
          {post.category && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] ${categoryTagClasses(post.category)}`}
            >
              {post.category.name}
            </span>
          )}
          <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-terra">
            {t('blog.featured')}
          </span>
        </div>
        <h2 className="mt-4 font-serif font-bold text-[28px] leading-[1.15] sm:text-4xl lg:text-[40px] text-bg-dark transition-colors group-hover:text-text-nav-hover">
          {post.title}
        </h2>
        <p className="mt-4 max-w-xl font-sans text-base leading-[1.7] text-text-nav/85">
          {post.excerpt}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm text-text-nav/65">
          <BlogAuthorByline author={post.author} locale={locale} />
          <span aria-hidden>·</span>
          <span>{formatDate(post.publishedAt, locale)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t('blog.readingTime', { minutes })}
          </span>
        </div>
        <span className="mt-6 inline-flex w-fit items-center gap-2 font-sans text-sm font-semibold text-bg-dark transition-transform group-hover:translate-x-1">
          {t('blog.readMore')}
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function ArticleCard({ post, locale, withLocale, t }: CardProps) {
  const minutes = post.readingTimeMinutes ?? estimateReadingMinutes(post.content)

  return (
    <Link
      href={withLocale(`/blog/${post.slug}`)}
      className="group flex flex-col rounded-xl border border-text-nav/12 bg-bg-page transition-colors hover:border-text-nav/35"
    >
      <BlogCardArt post={post} className="aspect-[16/10] rounded-t-xl" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {post.category && (
          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] ${categoryTagClasses(post.category)}`}
          >
            {post.category.name}
          </span>
        )}
        <h3 className="mt-4 font-serif font-bold text-[22px] leading-[1.2] sm:text-2xl text-bg-dark transition-colors group-hover:text-text-nav-hover">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 font-sans text-sm leading-[1.65] text-text-nav/80">
          {post.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4 border-t border-text-nav/10 font-sans text-xs text-text-nav/60">
          <BlogAuthorByline author={post.author} locale={locale} />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {t('blog.readingTime', { minutes })}
          </span>
        </div>
      </div>
    </Link>
  )
}
