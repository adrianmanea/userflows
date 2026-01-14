import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PreviewClient } from "./preview-client";

// Force dynamic to ensure we don't cache stale preview URLs
export const dynamic = "force-dynamic";

// Mock Data
const MOCK_COMPONENT = {
  name: "Login Screen",
  code_string: `
    function Component() {
      return (
        <div className="p-8 bg-black min-h-screen flex flex-col justify-center text-white">
          <h1 className="text-2xl font-bold mb-6">Preview Mode</h1>
          <p className="mb-4">This is the preview of the component.</p>
        </div>
      )
    }
  `,
};

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let component = null;
  let variants: any[] = [];

  try {
    if (isSupabaseConfigured) {
      const { data: compData } = await supabase
        .from("components")
        .select("*")
        .eq("id", id)
        .single();

      if (compData) {
        component = compData;

        // Fetch variants
        const { data: varData } = await supabase
          .from("component_variants")
          .select("*")
          .eq("component_id", id)
          .order("is_default", { ascending: false }) // Default first
          .order("created_at", { ascending: true });

        if (varData && varData.length > 0) {
          variants = varData;
        } else {
          // Implicit default variant from the main component data
          variants = [
            {
              id: "default-legacy",
              name: "Default",
              code_string: component.code_string,
              preview_url: component.preview_url,
              is_default: true,
            },
          ];
        }
      }
    }
  } catch (e) {
    console.error("Error fetching component:", e);
  }

  if (!component) component = MOCK_COMPONENT;
  // Mock variants for offline/mock mode
  if (variants.length === 0 && component === MOCK_COMPONENT) {
    variants = [
      {
        id: "mock-default",
        name: "Default",
        code_string: MOCK_COMPONENT.code_string,
        is_default: true,
      },
    ];
  }

  return <PreviewClient component={component} variants={variants} />;
}
