"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { ComponentDialog } from "@/components/ui/component-dialog";
import { ComponentCard } from "@/components/dashboard/component-card";

export function ComponentGrid({
  items,
  title = "Latest",
  description,
}: {
  items: any[];
  title?: string;
  description?: string;
}) {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  return (
    <>
      <ComponentDialog
        isOpen={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
        component={selectedComponent}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-card/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
            <LayoutGrid className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            No items found
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Try adjusting your search filters or check back later for new
            components.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const isFlow = "flow_steps" in item;

            if (isFlow) {
              return (
                <ComponentCard
                  key={`flow-${item.id}`}
                  item={item}
                  href={`/flow/${item.id}`}
                />
              );
            }

            return (
              <ComponentCard
                key={`comp-${item.id}`}
                item={item}
                onClick={() => setSelectedComponent(item)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
