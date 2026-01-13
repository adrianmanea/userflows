"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateComponent(id: number, data: { name: string; description: string; code?: string; thumbnail_url?: string | null; preview_url?: string | null }) {
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
  // 1. Fetch component data to get file paths
  const { data: component } = await supabase
    .from("components")
    .select("preview_url, thumbnail_url")
    .eq("id", id)
    .single();

  if (component) {
    // 2. Delete from Storage
    const filesToDelete = [];
    
    // Extract paths from URLs
    // URL format: .../storage/v1/object/public/component-previews/filename.ext
    if (component.preview_url && component.preview_url.includes("component-previews/")) {
      const path = component.preview_url.split("component-previews/")[1];
      if (path) filesToDelete.push(path);
    }
    
    if (component.thumbnail_url && component.thumbnail_url.includes("component-previews/")) {
      const path = component.thumbnail_url.split("component-previews/")[1];
      if (path) filesToDelete.push(path);
    }

    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("component-previews")
        .remove(filesToDelete);
        
      if (storageError) {
        console.error("Error deleting storage files:", storageError);
        // Continue with DB delete even if storage cleanup fails
      }
    }
  }

  // 3. Delete from DB (Rows in `component_filters` and `flow_steps` cascade automatically)
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
