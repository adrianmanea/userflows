import { createClient } from "@/utils/supabase/server";
import { ComponentTable } from "@/components/admin/component-table";

export default async function AdminComponentsPage() {
  const supabase = await createClient();

  // Fetch components
  const { data: components } = await supabase
    .from("components")
    .select("*, sources(name, slug)")
    .order("created_at", { ascending: false });

  // Fetch filters
  const { data: filters } = await supabase
    .from("filter_definitions")
    .select("*")
    .order("name");

  // Fetch relations
  const { data: componentFilters } = await supabase
    .from("component_filters")
    .select("*");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
        <div className="text-sm text-muted-foreground">
          Managing {components?.length || 0} components
        </div>
      </div>

      <ComponentTable
        components={components || []}
        filters={filters || []}
        componentFilters={componentFilters || []}
      />
    </div>
  );
}
