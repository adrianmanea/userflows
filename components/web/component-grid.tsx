"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Link as LinkIcon, Files } from "lucide-react";
import { ComponentDialog } from "@/components/ui/component-dialog";
import { ComponentCard } from "./component-card";

export function ComponentGrid({
  items,
  title = "Newest",
  viewAllLink,
  hideSource,
}: {
  items: any[];
  title?: string;
  viewAllLink?: string;
  hideSource?: boolean;
}) {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  if (items.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <div className="flex w-full items-center justify-center">
          <div className="bg-background border-border hover:border-border/80 text-center border-2 border-dashed rounded-xl p-14 w-full group hover:bg-muted/50 transition duration-500 hover:duration-200">
            <div className="flex justify-center isolate">
              <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                <FileText
                  className="w-6 h-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                <LinkIcon
                  className="w-6 h-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                <Files
                  className="w-6 h-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>
            <h2 className="text-foreground font-medium mt-6">
              No Components Found
            </h2>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
              There are no components in this category yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <ComponentDialog
        isOpen={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
        component={selectedComponent}
      />

      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const isFlow = "flow_steps" in item;

          if (isFlow) {
            return (
              <ComponentCard
                key={item.id}
                item={item}
                href={`/flow/${item.id}`}
                hideSource={hideSource}
              />
            );
          }

          return (
            <ComponentCard
              key={item.id}
              item={item}
              onClick={() => setSelectedComponent(item)}
              hideSource={hideSource}
            />
          );
        })}
      </div>
    </div>
  );
}
