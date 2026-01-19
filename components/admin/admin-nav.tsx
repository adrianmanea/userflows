"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Publish New", href: "/admin" },
    { name: "All Components", href: "/admin/components" },
    { name: "Sources", href: "/admin/sources" },
  ];

  return (
    <div className="flex items-center gap-4 border-b border-border px-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
