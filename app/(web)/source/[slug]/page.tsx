import { createClient } from "@/utils/supabase/server";
import { ComponentGrid } from "@/components/web/component-grid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { getGradient } from "@/utils/get-gradient";

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
        <Avatar className="w-20 h-20 rounded-2xl border border-border">
          <div
            className="h-full w-full flex items-center justify-center text-white text-3xl font-bold"
            style={{
              backgroundImage: getGradient(source.name),
            }}
          >
            {source.name[0]?.toUpperCase()}
          </div>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {source.name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Browse UI patterns and flows inspired by {source.name}.
            {source.url && (
              <Link
                href={
                  (source.url.startsWith("http")
                    ? source.url
                    : `https://${source.url}`) + "?ref=pageinspo.com"
                }
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

        <ComponentGrid items={components || []} hideSource={true} />
      </section>
    </>
  );
}
