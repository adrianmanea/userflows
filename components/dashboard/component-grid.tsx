"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, ArrowRight, Component } from "lucide-react";
import { cn } from "@/utils/cn";
import { ComponentDialog } from "@/components/ui/component-dialog";

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const isFlow = "flow_steps" in item;
            const href = isFlow ? `/flow/${item.id}` : `/component/${item.id}`; // Components normally open dialog, but we can standardise or keep specific behavior.
            // Actually, keep component onClick for dialog, flow href for link.

            const CardContent = (
              <>
                {item.thumbnail_url ? (
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-4 border border-border">
                    {item.thumbnail_url.endsWith(".mp4") ? (
                      <video
                        src={item.thumbnail_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors delay-75">
                      {isFlow ? (
                        <LayoutGrid className="h-5 w-5 stroke-[1.5]" />
                      ) : (
                        <Component className="h-5 w-5 stroke-[1.5]" />
                      )}
                    </div>
                    {isFlow && (
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground bg-muted/50 px-2 py-1 rounded-md">
                        {item.flow_steps?.[0]?.count || 0} steps
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-1 w-full">
                  <h3 className="font-medium text-foreground group-hover:text-primary tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed h-10">
                    {item.description ||
                      (isFlow
                        ? "A multi-step user journey flow."
                        : "Reusable UI component.")}
                  </p>
                </div>

                <div className="mt-4 flex items-center text-[11px] font-medium text-primary opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>View {isFlow ? "Flow" : "Component"}</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </>
            );

            if (isFlow) {
              return (
                <Link
                  key={`flow-${item.id}`}
                  href={href}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card/40 p-5 transition-all text-left",
                    "hover:border-ring/50 hover:bg-card/60 cursor-pointer"
                  )}
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <button
                key={`comp-${item.id}`}
                onClick={() => setSelectedComponent(item)}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card/40 p-5 transition-all text-left w-full",
                  "hover:border-ring/50 hover:bg-card/60 cursor-pointer"
                )}
              >
                {CardContent}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
