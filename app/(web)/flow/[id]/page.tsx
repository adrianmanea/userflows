import { createClient } from "@/utils/supabase/server";
import FlowViewer from "@/components/flow/flow-viewer";

// Mock Data duplicate for Server Component Fallback
// (In a real app, strict shared lib or DB access only)
import { notFound } from "next/navigation";

// Mock Data Removed

export default async function Page({ params }: { params: { id: string } }) {
  // Await params object (Next.js 14+)
  const { id } = await params; // Updated to await params properly if not already done in previous chunks, but focusing on replacement

  let steps = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("flow_steps")
        .select("*, component:components(*)")
        .eq("flow_id", id)
        .order("step_order", { ascending: true });
      if (data) steps = data;
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback if no data found
  if (steps.length === 0) {
    notFound();
  }

  return <FlowViewer steps={steps} />;
}
