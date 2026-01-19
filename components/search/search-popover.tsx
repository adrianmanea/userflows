"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  X,
  Smartphone,
  Layout,
  Component,
  GitBranch,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/utils/cn";

interface SearchPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterDefinition = {
  id: string;
  section: "category" | "screen" | "ui_element" | "flow";
  group_name: string | null;
  name: string;
  slug: string;
};

export function SearchPopover({ open, onOpenChange }: SearchPopoverProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("category");
  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!open) return; // Only fetch when open

      const { data: filtersData } = await supabase
        .from("filter_definitions")
        .select("*")
        .order("name", { ascending: true });

      const { data: relations } = await supabase
        .from("component_filters")
        .select("filter_id");

      if (filtersData) setFilters(filtersData);

      if (relations) {
        const newCounts: Record<string, number> = {};
        relations.forEach((r) => {
          newCounts[r.filter_id] = (newCounts[r.filter_id] || 0) + 1;
        });
        setCounts(newCounts);
      }

      setLoading(false);
    }
    fetchData();
  }, [open]);

  const sidebarTabs = [
    { label: "Categories", value: "category", icon: Layout },
    { label: "Screens", value: "screen", icon: Smartphone },
    { label: "UI Elements", value: "ui_element", icon: Component },
    { label: "Flows", value: "flow", icon: GitBranch },
  ];

  // Filtering Logic
  const filteredItems = useMemo(() => {
    let items = filters;

    // 1. Filter by Tab
    items = filters.filter((f) => f.section === activeTab);

    // 2. Filter by Search Query
    if (searchQuery) {
      items = items.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return items;
  }, [filters, activeTab, searchQuery]);

  const handleSelect = (slug: string) => {
    // Navigate to category page
    router.push(`/components/${slug}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full h-[85vh] max-h-[720px] p-0 gap-0 overflow-hidden bg-background/90 backdrop-blur-xl border-border shadow-2xl rounded-3xl flex flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for components, screens, flows and more.
        </DialogDescription>
        {/* Header Section */}
        <div className="flex flex-col border-b border-border/40">
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 flex items-center gap-3 bg-transparent rounded-full pr-4 h-12 border-none transition-all">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Web Apps, Screens, UI Elements, Flows or Keywords..."
                className="flex-1 bg-transparent dark:bg-transparent border-0 h-full p-0 text-xl placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <Kbd>ESC</Kbd>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-[240px] border-r border-border/40 p-4 gap-1 overflow-y-auto">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer",
                  activeTab === tab.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <tab.icon
                  className={cn(
                    "h-4 w-4 stroke-[1.5]",
                    activeTab === tab.value
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  {sidebarTabs.find((t) => t.value === activeTab)?.label}
                </h3>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-full bg-muted/40 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => handleSelect(filter.slug)}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 group transition-colors text-left cursor-pointer"
                        >
                          <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                            {filter.name}
                          </span>
                          <span className="text-xs text-muted-foreground group-hover:text-foreground/70 bg-muted/50 px-2 py-0.5 rounded-md group-hover:bg-muted">
                            {counts[filter.id] || 0}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                        <Search className="h-4 w-4 mb-3 text-muted-foreground" />
                        <span>
                          No results found for "{searchQuery}" in{" "}
                          {
                            sidebarTabs.find((t) => t.value === activeTab)
                              ?.label
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
