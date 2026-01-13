import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PreviewFrame } from "@/components/renderer/PreviewFrame";

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

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let component = null;

  try {
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from("components")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        component = data;
      }
    }
  } catch (e) {
    console.error("Error fetching component:", e);
  }

  if (!component) component = MOCK_COMPONENT;

  return (
    <div className="w-full h-screen overflow-hidden">
      <PreviewFrame
        code={component.code_string}
        previewUrl={
          component.preview_url
            ? `/api/preview-proxy?url=${encodeURIComponent(
                component.preview_url
              )}`
            : null
        }
        theme="dark"
      />
    </div>
  );
}
