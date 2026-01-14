"use strict";

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/utils/cn";
import { PreviewFrame } from "@/components/renderer/PreviewFrame";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PreviewClientProps {
  component: any;
  variants: any[];
}

export function PreviewClient({ component, variants }: PreviewClientProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  // Default to the first variant if available
  const [selectedVariant, setSelectedVariant] = useState(
    variants[0] || component
  );

  // Fallback for code/url
  const currentCode = selectedVariant?.code_string || component.code_string;
  const currentUrl = selectedVariant?.preview_url || component.preview_url;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-none h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold leading-none">
              {component.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mt-0.5">
                Preview Mode
              </span>
              {variants.length > 1 && (
                <Select
                  value={selectedVariant.id}
                  onValueChange={(val) => {
                    const found = variants.find((v) => v.id === val);
                    if (found) setSelectedVariant(found);
                  }}
                >
                  <SelectTrigger className="h-6 w-[140px] text-xs px-2 border-border/60 bg-muted/20">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-xs">
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              device === "desktop"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              device === "tablet"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Tablet (768px)"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              device === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Mobile (375px)"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
        <div className="w-20" /> {/* Spacer for balance */}
      </header>

      {/* Main Preview Area */}
      <main className="flex-1 w-full relative bg-muted/20 flex items-center justify-center overflow-hidden p-4">
        <div
          className={cn(
            "relative transition-all duration-300 ease-in-out bg-background overflow-hidden",
            device === "desktop"
              ? "w-full h-full rounded-none border-0"
              : "shadow-2xl border border-border",
            device === "tablet" && "w-[768px] h-[90%]",
            device === "mobile" && "w-[375px] h-[85%] rounded-[2rem]"
          )}
        >
          <PreviewFrame
            code={currentCode}
            previewUrl={
              currentUrl
                ? `/api/preview-proxy?url=${encodeURIComponent(currentUrl)}`
                : null
            }
            theme="light" // Default to light or make it selectable in future
          />
        </div>
      </main>
    </div>
  );
}
