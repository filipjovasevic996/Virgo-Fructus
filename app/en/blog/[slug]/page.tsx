import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPostBody } from '@/components/blog/blog-post-body'
import { buildLanguageAlternates } from '@/lib/hreflang'
import {
  getAllPostSlugs,
  getPostBySlug,
  getPostSlugInLocale,
  getRelatedPosts,
} from '@/lib/blog/strapi'
import { authorName } from '@/lib/blog/authors'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'
).replace(/\/+$/, '')

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs('en')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug, 'en')
  if (!post) return { title: 'Post not found' }

  const enPath = `/en/blog/${slug}`
  const srSlug = await getPostSlugInLocale(post.documentId, 'sr')
  const srPath = srSlug ? `/blog/${srSlug}` : '/blog'

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: enPath,
      languages: buildLanguageAlternates(srPath, enPath),
    },
    openGraph: {
      type: 'article',
      title: `${post.title} | Vigor Fructus`,
      description: post.excerpt,
      url: `${SITE_URL}${enPath}`,
      publishedTime: post.publishedAt,
      authors: [authorName(post.author, 'en')],
      images: post.coverImage?.url
        ? [{ url: post.coverImage.url, alt: post.coverImage.alt ?? post.title }]
        : undefined,
      locale: 'en_US',
    },
  }
}

export default async function BlogPostPageEn({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug, 'en')
  if (!post) notFound()

  const related = await getRelatedPosts(post.documentId, 'en')

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/en/blog/${post.slug}#article`,
    inLanguage: 'en',
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/en/blog/${post.slug}`,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: authorName(post.author, 'en') },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: post.coverImage?.url ? [post.coverImage.url] : undefined,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/en/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/en/blog/${post.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogPostBody post={post} related={related} locale="en" />
    </>
  )
}
