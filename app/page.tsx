import Link from "next/link";
import {
  LayoutGrid,
  Play,
  Component,
  AlignJustify,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { cn } from "@/utils/cn";
import { ComponentGrid } from "@/components/dashboard/component-grid";
import { Suspense } from "react";
import { DataGrid } from "@/components/dashboard/data-grid";
import { GridSkeleton } from "@/components/dashboard/skeletons/grid-skeleton";

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

  // Fetch flows (unfiltered for now, or filter them too if they have tags?)
  // Let's assume flows don't have filters in this phase as user focused on "components" filters.
  let flows: any[] = [];
  try {
    // ... fetch flows ...
    const { data } = await supabase
      .from("flows")
      .select("*, flow_steps(count)")
      .order("created_at", { ascending: false });
    if (data) flows = data;
  } catch (e) {
    console.error(e);
  }

  // Fetch components
  let components: any[] = [];
  try {
    let query = supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply Filters
    if (filterIds.length > 0) {
      // Find components that match filters
      // Using inner join approach or two-step
      // Two-step is easier with Supabase JS client usually, unless we use RPC

      const { data: matchedRelations } = await supabase
        .from("component_filters")
        .select("component_id")
        .in("filter_id", filterIds);

      const matchedComponentIds =
        matchedRelations?.map((r) => r.component_id as number) || [];

      if (matchedComponentIds.length > 0) {
        query = query.in("id", matchedComponentIds);
      } else {
        // No matches found for these filters
        query = query.in("id", [-1]);
      }
    }

    const { data } = await query;
    if (data) components = data;
  } catch (e) {
    console.error("Error fetching components:", e);
  }

  const searchParamsKey = JSON.stringify(searchParams);

  // Fetch breadcrumb label if filter is active
  let breadcrumbs = undefined;
  if (filterIds.length > 0) {
    const { data: filtersData } = await supabase
      .from("filter_definitions")
      .select("name")
      .in("id", filterIds)
      .single();

    if (filtersData) {
      breadcrumbs = [{ label: filtersData.name }];
    }
  }

  return (
    <div className="flex h-screen w-full bg-sidebar font-sans antialiased overflow-hidden">
      <Sidebar className="w-[260px] shrink-0 border-r-0" />

      <div className="flex-1 flex flex-col h-full py-2 pr-2 pl-0">
        <div className="flex-1 flex flex-col rounded-3xl border border-border bg-card overflow-hidden relative">
          <Header
            className="bg-transparent border-b border-border/50 backdrop-blur-none"
            breadcrumbs={breadcrumbs}
          />
          <main className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin">
            <Suspense key={searchParamsKey} fallback={<GridSkeleton />}>
              <DataGrid searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
