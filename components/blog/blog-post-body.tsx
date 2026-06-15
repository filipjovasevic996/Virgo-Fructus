'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/i18n/use-localized-path'
import { categoryTagClasses } from '@/lib/blog/categories'
import type { BlogLocale, BlogPost } from '@/lib/blog/types'
import { BlogAuthorByline, BlogAuthorCard } from './blog-author-byline'
import { BlogCardArt } from './blog-card-art'
import { BlogPostContent } from './blog-post-content'

type Props = {
  post: BlogPost
  related: BlogPost[]
  locale: BlogLocale
}

function formatDate(iso: string, locale: BlogLocale) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'sr-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function BlogPostBody({ post, related, locale }: Props) {
  const { t } = useI18n()
  const { withLocale } = useLocalizedPath()
  const minutes = post.readingTimeMinutes ?? estimateReadingMinutes(post.content)

  return (
    <article className="bg-bg-page min-h-screen pb-16">
      <header className="mx-auto max-w-[820px] px-5 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <Link
          href={withLocale('/blog')}
          className="font-sans text-sm text-text-nav/70 hover:text-text-nav-hover transition-colors"
        >
          {t('blog.backToBlog')}
        </Link>

        <h1 className="mt-6 font-serif font-bold text-[32px] leading-[1.1] sm:text-5xl lg:text-[56px] text-bg-dark">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 font-sans text-sm text-text-nav/65">
          <BlogAuthorByline author={post.author} locale={locale} />
          {post.category && (
            <>
              <span aria-hidden>·</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] ${categoryTagClasses(post.category)}`}
              >
                {post.category.name}
              </span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{formatDate(post.publishedAt, locale)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t('blog.readingTime', { minutes })}
          </span>
        </div>
      </header>

      <div className="mx-auto mt-10 max-w-[1100px] px-5 sm:px-6 lg:px-8">
        <BlogCardArt post={post} priority className="aspect-[16/9] rounded-2xl" />
      </div>

      <div className="mx-auto mt-10 sm:mt-14 max-w-[720px] px-5 sm:px-6 lg:px-8">
        <BlogPostContent content={post.content} />
        <BlogAuthorCard author={post.author} locale={locale} />
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-16 sm:mt-20 max-w-[1200px] px-5 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-bg-dark">
            {t('blog.relatedTitle')}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.documentId}
                href={withLocale(`/blog/${p.slug}`)}
                className="group flex flex-col rounded-xl border border-text-nav/12 bg-bg-page transition-colors hover:border-text-nav/35"
              >
                <BlogCardArt post={p} className="aspect-[16/10] rounded-t-xl" />
                <div className="flex flex-col p-5">
                  {p.category && (
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] ${categoryTagClasses(p.category)}`}
                    >
                      {p.category.name}
                    </span>
                  )}
                  <h3 className="mt-3 font-serif text-lg text-bg-dark transition-colors group-hover:text-text-nav-hover">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
