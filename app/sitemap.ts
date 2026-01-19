import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pageinspo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Fetch dynamic routes from database
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return staticRoutes;
  }

  const supabase = await createClient();

  // Fetch all components
  const { data: components } = await supabase
    .from("components")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const componentRoutes: MetadataRoute.Sitemap = (components || []).map(
    (component) => ({
      url: `${BASE_URL}/component/${component.id}`,
      lastModified: new Date(component.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Fetch all sources
  const { data: sources } = await supabase
    .from("sources")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  const sourceRoutes: MetadataRoute.Sitemap = (sources || []).map((source) => ({
    url: `${BASE_URL}/source/${source.slug}`,
    lastModified: new Date(source.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch all flows
  const { data: flows } = await supabase
    .from("flows")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const flowRoutes: MetadataRoute.Sitemap = (flows || []).map((flow) => ({
    url: `${BASE_URL}/flow/${flow.id}`,
    lastModified: new Date(flow.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...componentRoutes, ...sourceRoutes, ...flowRoutes];
}
