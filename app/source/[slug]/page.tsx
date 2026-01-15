import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Link from "next/link";
import { ComponentCard } from "@/components/dashboard/component-card";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { DisclaimerFooter } from "@/components/ui/disclaimer-footer";

// Dynamic to ensure fresh data
export const dynamic = "force-dynamic";

export default async function SourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isSupabaseConfigured) {
    return <div>Supabase not configured</div>;
  }

  // Fetch Source Info
  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("*")
    .eq("slug", slug)
    .single();

  if (sourceError || !source) {
    console.error("Source not found:", sourceError);
    notFound();
  }

  // Fetch Associated Components
  const { data: components, error: compError } = await supabase
    .from("components")
    .select("*, sources!inner(*)") // inner join optional, but we filter by source_id anyway
    .eq("source_id", source.id)
    .order("created_at", { ascending: false });

  if (compError) {
    console.error("Error fetching components:", compError);
  }

  return (
    <div className="flex h-screen w-full bg-sidebar font-sans antialiased overflow-hidden">
      <Sidebar className="w-[260px] shrink-0 border-r-0" />

      <div className="flex-1 flex flex-col h-full py-2 pr-2 pl-0">
        <div className="flex-1 flex flex-col rounded-3xl border border-border bg-card overflow-hidden relative">
          <Header
            className="bg-transparent border-b border-border/50 backdrop-blur-none"
            breadcrumbs={[
              { label: "Sources" }, // Static label to avoid linking to protected /admin/sources
              { label: source.name },
            ]}
          />
          <main className="flex-1 overflow-y-auto p-8 scrollbar-thin flex flex-col">
            {/* Source Header */}
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center text-4xl font-bold text-muted-foreground">
                {source.name[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {source.name}
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Browse UI patterns and flows inspired by {source.name}.
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline text-sm"
                    >
                      Visit Original App &rarr;
                    </a>
                  )}
                </p>
              </div>
            </div>

            {/* Components Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Components ({components?.length || 0})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {components?.map((component) => (
                  <ComponentCard
                    key={component.id}
                    item={component}
                    href={`/component/${component.id}`}
                  />
                ))}
                {(!components || components.length === 0) && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    No components found for this source yet.
                  </div>
                )}
              </div>
            </section>

            {/* Safe Mode Disclaimer - Integrated into footer of content */}
            <div className="-mx-8 -mb-8 mt-auto">
              <DisclaimerFooter />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
