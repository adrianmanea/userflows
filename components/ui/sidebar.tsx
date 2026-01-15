"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Home,
  Layout,
  ChevronRight,
  Smartphone,
  Component,
  GitBranch,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LoginDialog } from "@/components/auth/login-dialog";
import Image from "next/image";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

type FilterDefinition = {
  id: string;
  section: "category" | "screen" | "ui_element" | "flow";
  group_name: string | null;
  name: string;
  slug: string;
};

// Icon Mapping Removed

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    screen: true,
    ui_element: false,
    flow: false,
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const activeFilterIds = useMemo(() => {
    const p = searchParams.get("filters");
    return p ? p.split(",") : [];
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const { data: filtersData } = await supabase
        .from("filter_definitions")
        .select("*")
        .order("name", { ascending: true });

      const { data: relations } = await supabase
        .from("component_filters")
        .select("filter_id");

      if (filtersData) setFilters(filtersData);

      if (relations) {
        const newCounts: Record<string, number> = {};
        relations.forEach((r) => {
          newCounts[r.filter_id] = (newCounts[r.filter_id] || 0) + 1;
        });
        setCounts(newCounts);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // toggleFilter removed in favor of Link

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sections = ["category", "screen", "ui_element", "flow"] as const;

  const sectionConfig: Record<
    string,
    { label: string; icon: React.ElementType }
  > = {
    category: { label: "Categories", icon: Layout },
    screen: { label: "Screens", icon: Smartphone },
    ui_element: { label: "UI Elements", icon: Component },
    flow: { label: "Flows", icon: GitBranch },
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <aside
      className={cn(
        "hidden w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex shrink-0 h-screen overflow-y-auto scrollbar-none",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center px-4 mt-2">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 scrollbar-none">
        {/* Main Nav */}
        <div className="space-y-0.5">
          <NavItem
            href="/"
            icon={Home}
            label="Home"
            active={pathname === "/" && activeFilterIds.length === 0}
          />
        </div>

        {/* Filters */}
        {loading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="pl-4 space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-3 w-32 bg-muted/50 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          sections.map((section) => {
            const sectionFilters = filters.filter((f) => f.section === section);
            if (sectionFilters.length === 0) return null;

            const grouped: Record<string, FilterDefinition[]> = {};
            let hasItems = false;

            sectionFilters.forEach((f) => {
              const count = counts[f.id] || 0;
              if (count > 0 || isDev) {
                const g = f.group_name || "General";
                if (!grouped[g]) grouped[g] = [];
                grouped[g].push(f);
                hasItems = true;
              }
            });

            if (!hasItems) return null;

            const groups = Object.keys(grouped).sort();
            const isOpen = openSections[section];
            const { label, icon: SectionIcon } = sectionConfig[section];

            return (
              <div key={section} className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1 h-auto hover:bg-sidebar-accent hover:text-foreground cursor-pointer",
                    isOpen ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-4 w-4 stroke-[1.5]" />
                    <span className="capitalize text-sm font-medium">
                      {label}
                    </span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                      isOpen && "rotate-90"
                    )}
                  />
                </Button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pb-2">
                        {groups.map((groupName) => (
                          <div key={groupName}>
                            {groupName !== "General" &&
                              section !== "category" && (
                                <div className="text-[10px] font-medium text-muted-foreground px-3 py-1 uppercase mt-1 mb-0.5 ml-2 cursor-pointer">
                                  {groupName}
                                </div>
                              )}
                            <div className="space-y-0.5 border-l border-border/50 ml-4 pl-2">
                              {grouped[groupName].map((filter) => {
                                const count = counts[filter.id] || 0;
                                const isActive = activeFilterIds.includes(
                                  filter.id
                                );

                                return (
                                  <Button
                                    key={filter.id}
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                      "w-full flex items-center justify-between px-2 py-1 h-auto font-normal hover:bg-sidebar-accent hover:text-foreground cursor-pointer",
                                      pathname === `/components/${filter.slug}`
                                        ? "text-sidebar-primary font-medium bg-sidebar-accent"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    <Link href={`/components/${filter.slug}`}>
                                      <span className="truncate text-[13px]">
                                        {filter.name}
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[10px] tabular-nums transition-colors",
                                          pathname ===
                                            `/components/${filter.slug}`
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                      >
                                        {count}
                                      </span>
                                    </Link>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-sidebar-border p-4 m-4">
        {mounted ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
            <div className="flex items-center bg-sidebar-accent/50 rounded-lg p-0.5 border border-sidebar-border/50">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  theme === "light"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}
                title="Light"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  theme === "dark"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}
                title="Dark"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  theme === "system"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}
                title="System"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-8 bg-muted/50 rounded animate-pulse" />
        )}
      </div>
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
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

function Logo() {
  return <Image src="/logo.svg" alt="Logo" width={116} height={24} />;
}
