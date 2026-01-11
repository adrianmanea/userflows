"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateComponent(id: number, data: { name: string; description: string; code?: string; thumbnail_url?: string | null }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("components")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("Error updating component:", error);
    throw new Error("Failed to update component");
  }

  revalidatePath("/admin/components");
  revalidatePath("/");
}

export async function deleteComponent(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("components")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting component:", error);
    throw new Error("Failed to delete component");
  }

  revalidatePath("/admin/components");
  revalidatePath("/");
}
