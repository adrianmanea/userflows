"use client";

import { getGradient } from "@/utils/get-gradient";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { Component, Eye } from "lucide-react";
import Link from "next/link";

interface ComponentCardProps {
  item: {
    id: number;
    name: string;
    description?: string;
    thumbnail_url?: string;
    original_app?: string;
    view_count?: number;
    [key: string]: any;
  };
  className?: string;
  onClick?: () => void;
  href?: string;
  hideSource?: boolean;
}

export function ComponentCard({
  item,
  className,
  onClick,
  href,
  hideSource,
}: ComponentCardProps) {
  return (
    <div
      className={cn("group cursor-pointer flex flex-col gap-4", className)}
      onClick={onClick}
    >
      {/* Thumbnail Container - Padded & Rounded */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted p-6 sm:p-8 flex items-center justify-center transition-colors group-hover:bg-muted/80">
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-background">
          {item.thumbnail_url ? (
            item.thumbnail_url.endsWith(".mp4") ? (
              <video
                src={item.thumbnail_url}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={item.thumbnail_url}
                alt={item.name}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/20">
              <Component className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Overlay Link */}
        {href && (
          <Link href={href} className="absolute inset-0 z-20 opacity-0" />
        )}
      </div>

      {/* Metadata - Below Card */}
      <div className="flex items-start gap-3 px-1">
        {!hideSource &&
          (item.sources?.slug ? (
            <Link
              href={`/source/${item.sources.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <Avatar className="h-10 w-10 border border-border/50">
                <div
                  className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{
                    backgroundImage: getGradient(
                      item.sources?.name || item.name || "Component",
                    ),
                  }}
                >
                  {(
                    item.sources?.name?.[0] ||
                    item.name?.[0] ||
                    "C"
                  ).toUpperCase()}
                </div>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 border border-border/50">
              <div
                className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{
                  backgroundImage: getGradient(
                    item.sources?.name || item.name || "Component",
                  ),
                }}
              >
                {(
                  item.sources?.name?.[0] ||
                  item.name?.[0] ||
                  "C"
                ).toUpperCase()}
              </div>
            </Avatar>
          ))}

        <div className="flex flex-col min-w-0 gap-0.5 pt-0.5">
          <div className="flex items-center gap-2 w-full">
            {!hideSource &&
              (item.sources?.slug ? (
                <Link
                  href={`/source/${item.sources.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-foreground truncate hover:underline hover:text-primary transition-colors"
                >
                  {item.sources.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-foreground truncate">
                  {item.sources?.name || "Unknown Source"}
                </span>
              ))}
          </div>
          <span
            className={cn(
              "text-sm text-muted-foreground truncate w-full line-clamp-1",
              hideSource && "text-foreground font-medium",
            )}
          >
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
}
