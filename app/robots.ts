import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nglfs.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/dashboard/*',
          '/onboarding',
          '/settings',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
