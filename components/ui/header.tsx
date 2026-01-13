"use client";

import { Search, PanelLeft, User, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginDialog } from "@/components/auth/login-dialog";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="search"
            placeholder="Search components..."
            className="h-9 w-full rounded-full border-border bg-muted/50 pl-9 pr-4 text-[13px] hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-border"
          />
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
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 ring-1 ring-border flex items-center justify-center text-xs font-medium text-foreground">
              {user.email?.[0].toUpperCase()}
            </div>
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
    </header>
  );
}
