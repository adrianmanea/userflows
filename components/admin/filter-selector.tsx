"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/utils/cn";

type FilterDefinition = {
  id: string;
  section: "category" | "screen" | "ui_element" | "flow";
  group_name: string | null;
  name: string;
  slug: string;
};

type FilterSelectorProps = {
  selectedFilters: string[]; // Array of Filter IDs
  onChange: (filters: string[]) => void;
};

export function FilterSelector({
  selectedFilters,
  onChange,
}: FilterSelectorProps) {
  const supabase = createClient();
  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "category" | "screen" | "ui_element" | "flow"
  >("category");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    async function fetchFilters() {
      const { data, error } = await supabase
        .from("filter_definitions")
        .select("*")
        .order("group_name", { ascending: true })
        .order("name", { ascending: true });

      if (data) setFilters(data);
      setLoading(false);
    }
    fetchFilters();
  }, []);

  const toggleFilter = (id: string) => {
    if (selectedFilters.includes(id)) {
      onChange(selectedFilters.filter((uid) => uid !== id));
    } else {
      onChange([...selectedFilters, id]);
    }
  };

  const toggleGroup = (group: string) => {
    if (expandedGroups.includes(group)) {
      setExpandedGroups(expandedGroups.filter((g) => g !== group));
    } else {
      setExpandedGroups([...expandedGroups, group]);
    }
  };

  // Group filters by section and group_name
  const currentSectionFilters = filters.filter((f) => f.section === activeTab);

  // Grouping logic
  const groupedFilters: Record<string, FilterDefinition[]> = {};
  currentSectionFilters.forEach((f) => {
    const group = f.group_name || "General";
    if (!groupedFilters[group]) groupedFilters[group] = [];
    groupedFilters[group].push(f);
  });

  const sortedGroups = Object.keys(groupedFilters).sort();

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {(["category", "screen", "ui_element", "flow"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
              activeTab === tab
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab === "category" && "Categories"}
            {tab === "screen" && "Screens"}
            {tab === "ui_element" && "UI Elements"}
            {tab === "flow" && "Flows"}
          </button>
        ))}
      </div>

      {/* Filter List */}
      <div className="h-[300px] overflow-y-auto pr-2 space-y-2 border border-border rounded-lg p-2 bg-muted/20">
        {loading ? (
          <div className="text-xs text-muted-foreground p-2">
            Loading filters...
          </div>
        ) : (
          sortedGroups.map((group) => (
            <div key={group} className="space-y-1">
              {/* Group Header (only if not 'General' or distinct groups exist) */}
              {activeTab !== "category" && (
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between text-left text-xs font-medium text-muted-foreground py-1.5 px-2 hover:bg-muted/50 rounded"
                >
                  {group}
                  {expandedGroups.includes(group) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}

              {/* Items */}
              {/* Always show if category (flat list usually), or if expanded */}
              {(activeTab === "category" || expandedGroups.includes(group)) && (
                <div
                  className={cn(
                    "grid grid-cols-2 gap-1",
                    activeTab !== "category" && "pl-2"
                  )}
                >
                  {groupedFilters[group].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors",
                        selectedFilters.includes(filter.id)
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0",
                          selectedFilters.includes(filter.id)
                            ? "border-primary bg-primary"
                            : "border-border"
                        )}
                      >
                        {selectedFilters.includes(filter.id) && (
                          <Check className="h-2 w-2 text-white" />
                        )}
                      </div>
                      <span className="truncate">{filter.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Selected Tags Summary */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters
            .filter((f) => selectedFilters.includes(f.id))
            .map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs text-secondary-foreground border border-border"
              >
                {f.name}
                <button
                  onClick={() => toggleFilter(f.id)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
