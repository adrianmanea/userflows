import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-start bg-zinc-950 text-zinc-100">
      <Suspense fallback={null}>
        <Sidebar className="sticky top-0 h-screen" />
      </Suspense>
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
