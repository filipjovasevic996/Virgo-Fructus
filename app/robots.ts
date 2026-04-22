import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Googlebot-Extended'],
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/api/', '/korpa'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
