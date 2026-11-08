import type { MetadataRoute } from "next";

/**
 * Shore Nails XML Sitemap
 * Generates /sitemap.xml for search engines (Googlebot, Bingbot, etc.)
 * matching the Next.js App Router metadata route convention.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shorenails.vercel.app";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}

