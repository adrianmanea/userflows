"use client";

import { X, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

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
  if (!component) return null;

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">
                {component.name}
              </h3>
              <span className="text-xs text-muted-foreground truncate">
                {component.original_app || "Unknown Source"}
              </span>
            </div>
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
            src={component.preview_url || `/component/${component.id}/preview`}
            className="w-full h-full border-0"
            title="Component Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
