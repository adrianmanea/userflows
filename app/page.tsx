import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Suspense } from "react";
import { HeroHeader } from "@/components/dashboard/hero-header";
import { HorizontalComponentList } from "@/components/dashboard/horizontal-component-list";
import { DisclaimerFooter } from "@/components/ui/disclaimer-footer";

// ... inside Home ...
export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const filterIds =
    typeof searchParams.filters === "string"
      ? searchParams.filters.split(",")
      : [];

  const supabase = await createClient();

  // ... auth check ...

  // Fetch flows (unfiltered)
  let flows: any[] = [];
  try {
    const { data } = await supabase
      .from("flows")
      .select("*, flow_steps(count)")
      .order("created_at", { ascending: false });
    if (data) flows = data;
  } catch (e) {
    console.error(e);
  }

  // Fetch components (unfiltered, ordered by created_at)
  let components: any[] = [];
  try {
    const { data } = await supabase
      .from("components")
      .select("*, sources(name, slug)")
      .order("created_at", { ascending: false });

    if (data) components = data;
  } catch (e) {
    console.error("Error fetching components:", e);
  }

  const searchParamsKey = JSON.stringify(searchParams);

  // No breadcrumbs for home
  let breadcrumbs = undefined;

  return (
    <div className="flex h-screen w-full bg-sidebar font-sans antialiased overflow-hidden">
      <Sidebar className="w-[260px] shrink-0 border-r-0" />

      <div className="flex-1 flex flex-col h-full py-2 pr-2 pl-0">
        <div className="flex-1 flex flex-col rounded-3xl border border-border bg-card overflow-hidden relative">
          <Header
            className="bg-transparent border-b border-border/50 backdrop-blur-none"
            breadcrumbs={breadcrumbs}
          />
          <main className="flex-1 overflow-y-auto p-8 scrollbar-thin flex flex-col">
            {/* Hero Section */}
            <HeroHeader />

            {/* Horizontal List Section */}
            <div className="mb-4">
              <Suspense
                fallback={
                  <div className="h-64 w-full bg-muted/10 rounded-xl animate-pulse" />
                }
              >
                {/* We can reuse DataGrid logic or fetch separately. 
                      For now, let's pass a specialized version or just reuse DataGrid but we need standard props. 
                      Actually, let's fetch 'featured' or 'newest' here directly to pass to HorizontalList.
                   */}
                {/* 
                      For simplicity in this step, I will modify DataGrid to NOT render the grid if we want to custom render, 
                      OR I will verify if I can fetch data here in Page.tsx properly.
                      
                      The Page.tsx already fetches `components`. 
                      I will use the `components` array fetched above for the Horizontal List (Newest).
                    */}
                <HorizontalComponentList
                  items={components.slice(0, 10)}
                  viewAllLink="/explore"
                />
              </Suspense>
            </div>

            {/* DataGrid removed as per user request to delete 'latest' section */}
            <DisclaimerFooter className="mt-auto" />
          </main>
        </div>
      </div>
    </div>
  );
}
