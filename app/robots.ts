import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot'],
        allow: '/',
      },
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'Claude-SearchBot',
          'Claude-User',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
        ],
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'CCBot', 'Bytespider'],
        disallow: '/',
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
