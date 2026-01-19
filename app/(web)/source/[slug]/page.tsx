import { createClient } from "@/utils/supabase/server";
import { ComponentCard } from "@/components/web/component-card";
import { notFound } from "next/navigation";
import Link from "next/link";

// Dynamic to ensure fresh data
export const dynamic = "force-dynamic";

export default async function SourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <div>Supabase not configured</div>;
  }

  const supabase = await createClient();

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
    .select("*, sources!inner(*)")
    .eq("source_id", source.id)
    .order("created_at", { ascending: false });

  if (compError) {
    console.error("Error fetching components:", compError);
  }

  return (
    <>
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
              <Link
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline text-sm"
              >
                Visit Original App &rarr;
              </Link>
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
    </>
  );
}
