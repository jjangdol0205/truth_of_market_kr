import { MetadataRoute } from 'next';
import { createClient } from '../utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthofmarket.com';
  
  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/briefings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Dynamic Report Routes
  try {
    const supabase = await createClient();
    const { data: reports } = await supabase
      .from('reports')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (reports) {
      const reportRoutes: MetadataRoute.Sitemap = reports.map((report) => ({
        url: `${baseUrl}/report/${report.id}`,
        lastModified: new Date(report.created_at),
        changeFrequency: 'weekly',
        priority: 0.9,
      }));
      routes.push(...reportRoutes);
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
