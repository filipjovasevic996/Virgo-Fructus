import type { Metadata } from 'next'
import { BlogIndexClient } from '@/components/blog/blog-index-client'
import { buildLanguageAlternates } from '@/lib/hreflang'
import { getAllCategories, getAllPosts } from '@/lib/blog/strapi'
import { authorName } from '@/lib/blog/authors'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'
).replace(/\/+$/, '')

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Recepti, vodiči i priče iza brenda Vigor Fructus — dehidrirano voće za koktele, dekoraciju pića i zdravu užinu.',
  alternates: {
    canonical: '/blog',
    languages: buildLanguageAlternates('/blog'),
  },
  openGraph: {
    type: 'website',
    title: 'Blog | Vigor Fructus',
    description:
      'Recepti, vodiči i priče iza brenda Vigor Fructus — dehidrirano voće za koktele i zdravu užinu.',
    url: `${SITE_URL}/blog`,
    locale: 'sr_RS',
  },
}

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts('sr'),
    getAllCategories('sr'),
  ])

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    inLanguage: 'sr',
    url: `${SITE_URL}/blog`,
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: posts.slice(0, 12).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      author: { '@type': 'Person', name: authorName(p.author, 'sr') },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogIndexClient posts={posts} categories={categories} locale="sr" />
    </>
  )
}
