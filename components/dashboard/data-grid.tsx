import { createClient } from "@/utils/supabase/server";
import { ComponentGrid } from "./component-grid";

interface DataGridProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function DataGrid({ searchParams }: DataGridProps) {
  const filterIds =
    typeof searchParams.filters === "string"
      ? searchParams.filters.split(",")
      : [];

  const supabase = await createClient();

  // Fetch flows
  // Fetch flows if no filters (or assuming flows don't have filters yet)
  let flows: any[] = [];
  if (filterIds.length === 0) {
    try {
      const { data } = await supabase
        .from("flows")
        .select("*, flow_steps(count)")
        .order("created_at", { ascending: false });
      if (data) flows = data;
    } catch (e) {
      console.error(e);
    }
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

  // Merge and Sort
  const items = [...flows, ...components].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return <ComponentGrid items={items} />;
}
