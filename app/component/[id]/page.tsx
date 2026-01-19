import { createClient } from "@/utils/supabase/server";
import { PreviewClient } from "./preview-client";
import type { Metadata } from "next";

// Force dynamic to ensure we don't cache stale preview URLs
export const dynamic = "force-dynamic";

// Helper to check if URL is an image (not video)
function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { title: "Component Preview" };
  }

  const supabase = await createClient();

  const { data: component } = await supabase
    .from("components")
    .select("name, description, og_image_url, thumbnail_url, sources(name)")
    .eq("id", id)
    .single();

  if (!component) {
    return { title: "Component Not Found" };
  }

  // Handle sources relation - Supabase types it as array but .single() returns object
  const sourceName = (component.sources as unknown as { name: string } | null)
    ?.name;

  // Priority: og_image_url > thumbnail_url (if image) > default
  const ogImage =
    component.og_image_url ||
    (isImageUrl(component.thumbnail_url) ? component.thumbnail_url : null) ||
    "/og-image.png";

  const title = component.name;
  const description =
    component.description ||
    `Interactive UI pattern from ${sourceName || "PageInspo"}. Explore and copy this component for your next project.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: component.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

import { notFound } from "next/navigation";

// Mock Data Removed

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let component = null;
  let variants: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data: compData } = await supabase
        .from("components")
        .select("*, sources (name, slug, icon_url)")
        .eq("id", id)
        .single();

      if (compData) {
        component = compData;

        // Create the default variant from the main component
        const defaultVariant = {
          id: "default-main",
          name: "Default",
          code_string: component.code_string,
          preview_url: component.preview_url,
          is_default: true,
        };

        // Fetch additional variants
        const { data: varData } = await supabase
          .from("component_variants")
          .select("*")
          .eq("component_id", id)
          .order("is_default", { ascending: false }) // Default first
          .order("created_at", { ascending: true });

        // Combine default + additional variants
        if (varData && varData.length > 0) {
          variants = [defaultVariant, ...varData];
        } else {
          // Just the default variant
          variants = [defaultVariant];
        }
      }
    }
  } catch (e) {
    console.error("Error fetching component:", e);
  }

  if (!component) {
    notFound();
  }

  // Mock variants for offline/mock mode (only if component exists but has no variants? No, if comp exists, we just show it)
  if (variants.length === 0) {
    variants = [
      {
        id: "default-main",
        name: "Default",
        code_string: component.code_string,
        preview_url: component.preview_url,
        is_default: true,
      },
    ];
  }

  return <PreviewClient component={component} variants={variants} />;
}
