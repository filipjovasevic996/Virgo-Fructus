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
  const slugs = await getAllPostSlugs('sr')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug, 'sr')
  if (!post) return { title: 'Tekst nije pronađen' }

  const srPath = `/blog/${slug}`
  const enSlug = await getPostSlugInLocale(post.documentId, 'en')
  const enPath = enSlug ? `/en/blog/${enSlug}` : '/en/blog'

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: srPath,
      languages: buildLanguageAlternates(srPath, enPath),
    },
    openGraph: {
      type: 'article',
      title: `${post.title} | Vigor Fructus`,
      description: post.excerpt,
      url: `${SITE_URL}${srPath}`,
      publishedTime: post.publishedAt,
      authors: [authorName(post.author, 'sr')],
      images: post.coverImage?.url
        ? [{ url: post.coverImage.url, alt: post.coverImage.alt ?? post.title }]
        : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug, 'sr')
  if (!post) notFound()

  const related = await getRelatedPosts(post.documentId, 'sr')

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#article`,
    inLanguage: 'sr',
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: authorName(post.author, 'sr') },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: post.coverImage?.url ? [post.coverImage.url] : undefined,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
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
      <BlogPostBody post={post} related={related} locale="sr" />
    </>
  )
}
