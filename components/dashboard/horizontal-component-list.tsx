"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, LayoutGrid, Component } from "lucide-react";
import { cn } from "@/utils/cn";
import { ComponentDialog } from "@/components/ui/component-dialog";
import { ComponentCard } from "./component-card";

export function HorizontalComponentList({
  items,
  title = "Newest",
  viewAllLink,
}: {
  items: any[];
  title?: string;
  viewAllLink?: string;
}) {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  if (items.length === 0) return null;

  return (
    <div className="w-full space-y-4 mb-12">
      <ComponentDialog
        isOpen={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
        component={selectedComponent}
      />

      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors"
          >
            View all <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="relative w-full overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-4 w-max">
          {items.map((item) => {
            const isFlow = "flow_steps" in item;

            if (isFlow) {
              return (
                <ComponentCard
                  key={item.id}
                  item={item}
                  className="w-[320px]"
                  href={`/flow/${item.id}`}
                />
              );
            }

            return (
              <ComponentCard
                key={item.id}
                item={item}
                onClick={() => setSelectedComponent(item)}
                className="w-[320px]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
