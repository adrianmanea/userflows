"use client";

import { Search, PanelLeft, User, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { SearchPopover } from "@/components/search/search-popover";
import { getGradient } from "@/utils/get-gradient";
import { Avatar } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";

interface HeaderProps {
  className?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ className, breadcrumbs }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header
      className={cn(
        "flex h-14 items-center gap-4 border-b border-border px-4",
        className,
      )}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
          <Sidebar className="flex w-full h-full border-r-0" />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-4">
        {/* Breadcrumbs (Desktop) */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="hidden lg:flex items-center text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Components
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center">
                <span className="mx-2 text-border">/</span>
                <span
                  className={cn(
                    "text-foreground",
                    crumb.href ? "hover:text-foreground/80" : "",
                  )}
                >
                  {crumb.href ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    crumb.label
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="hidden lg:flex items-center text-sm font-medium text-muted-foreground/50">
            Components
          </div>
        )}

        <div className="relative w-full max-w-sm ml-auto lg:ml-0">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground bg-muted/50 border-border hover:bg-muted h-9 rounded-full px-3 text-[13px] font-normal cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search components...
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-muted rounded animate-pulse hidden sm:block" />
            <div className="h-8 w-20 bg-muted rounded-full animate-pulse hidden sm:block" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="rounded-full border-border bg-muted/50 h-8 gap-2 px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Avatar className="h-8 w-8 border border-border">
              <div
                className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundImage: getGradient(user.email || "User") }}
              >
                {user.email?.[0].toUpperCase()}
              </div>
            </Avatar>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLoginOpen(true)}
            className="rounded-full px-4 h-8 text-[13px] font-medium gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Log In</span>
          </Button>
        )}
      </div>

      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SearchPopover open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
}
