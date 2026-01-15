"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { PlusCircle, Component, ArrowLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className, ...props }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden w-[260px] flex-col bg-sidebar text-sidebar-foreground lg:flex shrink-0 h-screen overflow-y-auto scrollbar-none",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center px-4 py-3">
        <Button
          asChild
          variant="ghost"
          className="flex items-center gap-2 rounded-full hover:bg-sidebar-accent transition-colors text-sidebar-primary-foreground pr-2 h-auto py-1 px-1"
        >
          <Link href="/">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-[10px]">
              PI
            </div>
            <span className="text-sm font-semibold tracking-tight">Admin</span>
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 scrollbar-none">
        {/* Main Admin Nav */}
        <div className="space-y-0.5">
          <NavItem
            href="/admin/components"
            icon={Component}
            label="All Components"
            active={pathname === "/admin/components"}
          />
          <NavItem
            href="/admin"
            icon={PlusCircle}
            label="Add New"
            active={pathname === "/admin"}
          />
          <NavItem
            href="/admin/sources"
            icon={Database}
            label="Manage Sources"
            active={pathname === "/admin/sources"}
          />
        </div>

        <div className="pt-4 mt-4 border-t border-sidebar-border/50">
          <NavItem href="/" icon={ArrowLeft} label="Back to App" />
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4 m-4">
        <div className="flex items-center justify-between">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground px-0 h-auto hover:bg-transparent"
            >
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon?: React.ElementType;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 px-3",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Link href={href}>
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </Link>
    </Button>
  );
}
