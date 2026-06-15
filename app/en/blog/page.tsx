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
    'Recipes, guides, and stories behind Vigor Fructus — dehydrated fruit for cocktails and healthy snacking.',
  alternates: {
    canonical: '/en/blog',
    languages: buildLanguageAlternates('/blog'),
  },
  openGraph: {
    type: 'website',
    title: 'Blog | Vigor Fructus',
    description:
      'Recipes, guides, and stories behind Vigor Fructus — dehydrated fruit for cocktails and healthy snacking.',
    url: `${SITE_URL}/en/blog`,
    locale: 'en_US',
  },
}

export default async function BlogIndexPageEn() {
  const [posts, categories] = await Promise.all([
    getAllPosts('en'),
    getAllCategories('en'),
  ])

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/en/blog#blog`,
    inLanguage: 'en',
    url: `${SITE_URL}/en/blog`,
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: posts.slice(0, 12).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/en/blog/${p.slug}`,
      datePublished: p.publishedAt,
      author: { '@type': 'Person', name: authorName(p.author, 'en') },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/en/blog` },
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
      <BlogIndexClient posts={posts} categories={categories} locale="en" />
    </>
  )
}
