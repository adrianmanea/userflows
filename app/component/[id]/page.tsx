import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PreviewFrame } from "@/components/renderer/PreviewFrame";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import { ArrowLeft, Code, ExternalLink } from "lucide-react";

// Mock Data
const MOCK_COMPONENT = {
  name: "Login Screen",
  description: "A simple login screen with email and password fields.",
  code_string: `
    function Component() {
      return (
        <div className="p-8 bg-zinc-950 min-h-screen flex flex-col justify-center text-white">
          <h1 className="text-2xl font-bold mb-6">Component View</h1>
        </div>
      )
    }
  `,
  original_app: "Mock App",
  tags: ["auth", "form"],
};

export default async function ComponentPage({
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
      if (data) component = data;
    }
  } catch (e) {
    console.error(e);
  }

  if (!component) component = MOCK_COMPONENT;

  return (
    <div className="flex min-h-screen items-start bg-background text-foreground font-sans antialiased">
      <Sidebar className="sticky top-0 h-screen hidden lg:flex" />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  {component.name}
                </h1>
                {component.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {component.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview Config/Info */}
            <div className="space-y-6 lg:order-2">
              <div className="bg-card/40 border border-border rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  Metadata
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Original App
                    </span>
                    <span className="text-sm text-foreground/80">
                      {component.original_app || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {component.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md bg-secondary border border-border text-xs text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      )) || (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 lg:order-1 h-[600px] bg-background border border-border rounded-2xl overflow-hidden relative shadow-sm">
              <PreviewFrame
                code={component.code_string}
                previewUrl={component.preview_url}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
