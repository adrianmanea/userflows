"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { getGradient } from "@/utils/get-gradient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";

interface ComponentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  component: any;
}

export function ComponentDialog({
  isOpen,
  onClose,
  component,
}: ComponentDialogProps) {
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (isOpen && component) {
      // Default variant from the component itself
      const defaultVariant = {
        id: "default-main",
        name: "Default",
        code_string: component.code_string,
        preview_url: component.preview_url,
        is_default: true,
      };

      const fetchVariants = async () => {
        const supabase = createClient();

        try {
          const { data: varData } = await supabase
            .from("component_variants")
            .select("*")
            .eq("component_id", component.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: true });

          if (varData && varData.length > 0) {
            setVariants([defaultVariant, ...varData]);
          } else {
            setVariants([defaultVariant]);
          }
        } catch (e) {
          console.error("Error fetching variants:", e);
          setVariants([defaultVariant]);
        }
      };

      fetchVariants();

      // Initialize selected variant to the constructed default variant
      // This ensures the ID matches "default-main" used in the variants list/select options
      setSelectedVariant(defaultVariant);
    }
  }, [isOpen, component]);

  // When variants load, if we have them, we might want to ensure selectedVariant
  // points to one of them if current selected is unrelated (e.g. from prev open).
  // But purely relying on 'isOpen' reset above is safer.

  if (!component) return null;

  // Use selectedVariant if available, falling back to component defaults
  const currentUrl = selectedVariant?.preview_url || component.preview_url;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[calc(100%-2rem)] w-[90vw] h-[92vh] sm:max-w-[1600px] border-none bg-background p-0 shadow-2xl sm:rounded-[20px] overflow-hidden flex flex-col gap-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{component.name}</DialogTitle>

        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-background flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {component.sources?.slug ? (
              <Link
                href={`/source/${component.sources.slug}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(); // Close dialog when navigating to source
                }}
                className="shrink-0"
              >
                <Avatar className="h-8 w-8 border border-border hover:opacity-80 transition-opacity">
                  <div
                    className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{
                      backgroundImage: getGradient(
                        component.sources?.name || component.name || "Component"
                      ),
                    }}
                  >
                    {(
                      component.sources?.name?.[0] ||
                      component.name?.[0] ||
                      "C"
                    ).toUpperCase()}
                  </div>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="h-8 w-8 border border-border">
                <div
                  className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{
                    backgroundImage: getGradient(
                      component.sources?.name || component.name || "Component"
                    ),
                  }}
                >
                  {(
                    component.sources?.name?.[0] ||
                    component.name?.[0] ||
                    "C"
                  ).toUpperCase()}
                </div>
              </Avatar>
            )}

            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">
                {component.name}
              </h3>
              {component.sources?.slug ? (
                <Link
                  href={`/source/${component.sources.slug}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-xs text-muted-foreground truncate hover:text-foreground hover:underline transition-colors w-fit"
                >
                  {component.sources.name}
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground truncate">
                  {component.original_app || "Pro Concept"}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="ml-4">
                <Select
                  value={selectedVariant?.id || "default-main"}
                  onValueChange={(val) => {
                    const found = variants.find((v) => v.id === val);
                    if (found) setSelectedVariant(found);
                  }}
                >
                  <SelectTrigger className="h-7 w-[130px] text-xs px-2 border-border/60 bg-muted/20">
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
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/component/${component.id}`}
              target="_blank"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content (Iframe) */}
        <div className="flex-1 bg-background relative overflow-hidden">
          <iframe
            src={
              currentUrl
                ? `/api/preview-proxy?url=${encodeURIComponent(currentUrl)}`
                : `/component/${component.id}/preview`
            }
            className="w-full h-full border-0"
            title="Component Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
