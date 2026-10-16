import { MetadataRoute } from 'next';

const BASE_URL = 'https://digen.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE_URL}/features`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/docs`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/creator`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/chat`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
  ];

  return routes;
}
