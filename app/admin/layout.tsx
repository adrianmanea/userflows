import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Header } from "@/components/ui/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-sidebar font-sans antialiased overflow-hidden">
      <AdminSidebar className="w-[260px] shrink-0 border-r-0" />

      <div className="flex-1 flex flex-col h-full py-2 pr-2 pl-0">
        <div className="flex-1 flex flex-col rounded-3xl border border-border bg-card overflow-hidden relative">
          <Header className="bg-transparent border-b border-border/50 backdrop-blur-none" />
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
