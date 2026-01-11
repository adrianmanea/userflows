"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronDown, ChevronRight, X, Filter } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSearchParams, useRouter } from "next/navigation";

type FilterDefinition = {
  id: string;
  section: "category" | "screen" | "ui_element" | "flow";
  group_name: string | null;
  name: string;
  slug: string;
};

export function ComponentFilterSidebar({ className }: { className?: string }) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // URL State
  // We use "filter" param with comma separated slugs for now, or IDs.
  // Let's use slugs for cleaner URLs if possible, but IDs are easier.
  // Plan said "?category=..." etc. Let's support multi-dimensional.
  // Actually, easiest is a single "filters" param with comma separated IDs or slugs.
  // Using IDs avoids slug collision if any (though slugs are unique).
  const activeFilterIds = useMemo(() => {
    const p = searchParams.get("filters");
    return p ? p.split(",") : [];
  }, [searchParams]);

  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "screen",
    "ui_element",
    "category",
    "flow",
  ]);

  useEffect(() => {
    async function fetchFilters() {
      const { data } = await supabase
        .from("filter_definitions")
        .select("*")
        .order("group_name", { ascending: true })
        .order("name", { ascending: true });

      if (data) setFilters(data);
      setLoading(false);
    }
    fetchFilters();
  }, []);

  const toggleFilter = (id: string, section: string, slug: string) => {
    const newFilters = activeFilterIds.includes(id)
      ? activeFilterIds.filter((fid) => fid !== id)
      : [...activeFilterIds, id];

    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.length > 0) {
      params.set("filters", newFilters.join(","));
    } else {
      params.delete("filters");
    }
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/");
  };

  const toggleGroup = (group: string) => {
    if (expandedGroups.includes(group)) {
      setExpandedGroups(expandedGroups.filter((g) => g !== group));
    } else {
      setExpandedGroups([...expandedGroups, group]);
    }
  };

  // Organize by Section -> Group
  const sections = ["category", "screen", "ui_element", "flow"] as const;
  const sectionLabels: Record<string, string> = {
    category: "Categories",
    screen: "Screens",
    ui_element: "UI Elements",
    flow: "Flows",
  };

  if (loading)
    return (
      <div className="w-64 p-4 text-xs text-muted-foreground">
        Loading filters...
      </div>
    );

  return (
    <div
      className={cn(
        "w-64 border-r border-border bg-card/50 flex flex-col h-[calc(100vh-64px)] overflow-hidden",
        className
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </h2>
        {activeFilterIds.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map((section) => {
          const sectionFilters = filters.filter((f) => f.section === section);
          if (sectionFilters.length === 0) return null;

          // Group by group_name
          const grouped: Record<string, FilterDefinition[]> = {};
          sectionFilters.forEach((f) => {
            const g = f.group_name || "General";
            if (!grouped[g]) grouped[g] = [];
            grouped[g].push(f);
          });

          const groups = Object.keys(grouped).sort();

          return (
            <div key={section} className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {sectionLabels[section]}
              </h3>
              <div className="space-y-1">
                {groups.map((groupName) => {
                  const isGeneral = groupName === "General";
                  // For Categories, we just show list. For others, we might want accordion if many groups.
                  // Let's keep it simple: List of groups headers.

                  return (
                    <div key={groupName} className="space-y-1">
                      {!isGeneral && (
                        <div className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
                          {groupName}
                        </div>
                      )}
                      <div className={cn("grid gap-0.5", !isGeneral && "pl-2")}>
                        {grouped[groupName].map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() =>
                              toggleFilter(filter.id, section, filter.slug)
                            }
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-between group",
                              activeFilterIds.includes(filter.id)
                                ? "bg-secondary text-secondary-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            <span>{filter.name}</span>
                            {activeFilterIds.includes(filter.id) && (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
