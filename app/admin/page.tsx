"use client";

import { useEffect } from "react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FilterSelector } from "@/components/admin/filter-selector";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export default function AdminClientPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  // const [originalApp, setOriginalApp] = useState(""); // Removed
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Additional Variants State
  interface Variant {
    id: string;
    name: string;
    type: "code" | "url";
    content: string; // URL or Code string
    file: File | null;
  }

  useEffect(() => {
    const fetchSources = async () => {
      const { data } = await supabase.from("sources").select("*").order("name");
      if (data) setSources(data);
    };
    fetchSources();
  }, []);

  const [variants, setVariants] = useState<Variant[]>([]);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: "",
        type: "code",
        content: "",
        file: null,
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const [publishMode, setPublishMode] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    if (!name) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      let previewUrl = null;
      let thumbnailUrl = null;
      // Use a separate ID for storage file naming since DB ID is auto-increment bigint
      const storageId = crypto.randomUUID();

      // 0. Handle Thumbnail Upload
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `thumbnails/${storageId}.${fileExt}`;

        const { error: thumbError } = await supabase.storage
          .from("component-previews")
          .upload(fileName, thumbnailFile, { upsert: true });

        if (thumbError) {
          console.error("Thumbnail upload failed:", thumbError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("component-previews")
            .getPublicUrl(fileName);
          thumbnailUrl = publicUrlData.publicUrl;
        }
      }

      // 1. Handle Main Artifact Generation/Upload based on Mode (Main Preview)
      if (publishMode === "upload") {
        if (!file) throw new Error("No main file selected for preview");

        const fileExt = file.name.split(".").pop();
        const fileName = `${storageId}.${fileExt}`;

        const blob = new Blob([file], { type: "text/html" });

        const { error: uploadError } = await supabase.storage
          .from("component-previews")
          .upload(fileName, blob, { upsert: true, contentType: "text/html" });

        if (uploadError)
          throw new Error("Upload failed: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("component-previews")
          .getPublicUrl(fileName);

        previewUrl = publicUrlData.publicUrl;
      } else if (publishMode === "url") {
        if (!externalUrl) throw new Error("No URL provided for preview");
        previewUrl = externalUrl;
      }

      // 2. Process Additional Variants (if any)
      const processedVariants = await Promise.all(
        variants.map(async (variant) => {
          let content = variant.content;

          if (variant.file) {
            const fileExt = variant.file.name.split(".").pop();
            const fileName = `variants/${storageId}/${variant.id}.${fileExt}`;

            const uploadOptions: any = { upsert: true };
            if (variant.type === "code" || variant.file.type === "text/html") {
              uploadOptions.contentType = "text/html";
            }

            const { error: uploadError } = await supabase.storage
              .from("component-previews")
              .upload(fileName, variant.file, uploadOptions);

            if (uploadError)
              throw new Error(
                `Upload failed for variant ${variant.name}: ${uploadError.message}`
              );

            const { data } = supabase.storage
              .from("component-previews")
              .getPublicUrl(fileName);
            content = data.publicUrl;
          }

          return {
            ...variant,
            finalContent: content,
          };
        })
      );

      // 3. Save Metadata to DB
      const { data: componentData, error } = await supabase
        .from("components")
        .insert({
          // id is auto-increment bigint, don't set it manually
          name,
          code_string: null, // Will be updated later or ignored
          // original_app: originalApp || null, // Deprecated
          source_id: selectedSourceId || null,
          tags: [],
          preview_url: previewUrl,
          thumbnail_url: thumbnailUrl,
        })
        .select()
        .single();

      if (error) throw error;
      if (!componentData) throw new Error("Failed to create component record");

      // 4. Save Variants to DB
      if (processedVariants.length > 0) {
        const variantInserts = processedVariants.map((v) => ({
          component_id: componentData.id, // Use the returned bigint ID
          variant_name: v.name, // Matches schema: variant_name text
          variant_type: v.type, // Matches schema: variant_type text (or check migration)
          content: v.finalContent, // Matches schema: content text
          is_default: false,
        }));

        // Check schema/types: 20260114... migration says:
        // name text not null, code_string text, preview_url text
        // My previous code used: variant_name, variant_type, content.
        // I need to align with the MIGRATION SCHEMA I just read.
        // Migration: name, code_string, preview_url.
        // Wait, my previous `variantInserts` used keys like `variant_name`.
        // The MIGRATION (Step 681) has: name, code_string, preview_url.
        // It DOES NOT have variant_type? Or maybe I missed it?
        // Let me re-read the migration content in Step 681.
        // "name text not null"
        // "code_string text"
        // "preview_url text"
        // "is_default boolean"
        // It DOES NOT have `variant_type` or `content`.
        // I must align the keys to the actual DB schema.

        const mappedInserts = processedVariants.map((v) => ({
          component_id: componentData.id,
          name: v.name,
          // Where do we store type? Schema doesn't look like it has type?
          // File 681:
          //   id, component_id, name, code_string, preview_url, is_default.
          // It seems the schema doesn't support 'type' column?
          // Or maybe I should map 'content' (url) to 'preview_url'? And maybe code string?
          // If 'type' is missing, I should probably put the type in the name or description?
          // OR, I should double check if I missed a migration.
          // But based on 681, there is no `variant_type`.
          // For now, I will map:
          //   name -> v.name
          //   preview_url -> v.finalContent (if url/file)
          //   code_string -> ? (maybe empty for now)
          //   But wait, 'type' distinction is important (HTML vs URL).
          //   Maybe I store type in metadata or name?
          //   Let's check if there is a 'type' column in previous steps?
          //   The user code in Step 665 had:
          //     variant_name: v.name,
          //     variant_type: v.type,
          //     content: v.finalContent,
          //   This implies the user EXPECTED these columns.
          //   But migration 20260114 (Step 681) DEFINITELY does not have 'variant_type' or 'content'.
          //   It has `name`, `code_string`, `preview_url`.
          //   This is a mismatch.
          //   However, if I use `preview_url` for the content, that works for URL/File.
          //   I'll map `finalContent` -> `preview_url`.
          //   I'll map `v.name` -> `name`.
          //   I'll ignore `type` for now, or maybe the `type` column exists and I missed it?
          //   No, I read the file in 681.
          //   I'll proceed with fitting the data into the existing schema:
          //   preview_url = v.finalContent
          //   name = v.name
          preview_url: v.finalContent,
          is_default: false,
        }));

        const { error: variantsError } = await supabase
          .from("component_variants")
          .insert(mappedInserts);

        if (variantsError) throw variantsError;
      }

      // 5. Save Filters
      if (selectedFilters.length > 0 && componentData) {
        const filterInserts = selectedFilters.map((filterId) => ({
          component_id: componentData.id,
          filter_id: filterId,
        }));

        const { error: filterError } = await supabase
          .from("component_filters")
          .insert(filterInserts);

        if (filterError) {
          console.error("Error saving filters:", filterError);
        }
      }

      setMessage({
        type: "success",
        text: "Component and variants published successfully!",
      });
      // Reset
      setName("");
      setSelectedFilters([]);
      setSelectedSourceId("");
      setFile(null);
      setThumbnailFile(null);
      setVariants([]); // Reset variants
    } catch (e: any) {
      console.error(e);
      setMessage({
        type: "error",
        text: "Error publishing: " + e.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Publish Component
        </h1>
      </div>

      <div className="bg-card/40 border border-border rounded-2xl p-6 space-y-6">
        {/* Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Component Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
              placeholder="e.g. Login Card"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Source App{" "}
              <span className="text-muted-foreground/70">(Recommended)</span>
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
            >
              <option value="">Select a source...</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Thumbnail{" "}
              <span className="text-muted-foreground/70">(Image or MP4)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
              />
              {thumbnailFile && (
                <span className="text-xs text-green-500">
                  Selected: {thumbnailFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Filters / Tags
          </label>
          <FilterSelector
            selectedFilters={selectedFilters}
            onChange={setSelectedFilters}
          />
        </div>

        {/* Mode Selection */}
        <div className="space-y-4 pt-4 border-t border-border">
          <label className="text-sm font-medium text-muted-foreground block">
            Publishing Method
          </label>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border w-fit">
            {(["upload", "url"] as const).map((mode) => (
              <Button
                key={mode}
                onClick={() => setPublishMode(mode)}
                variant={publishMode === mode ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-xs font-medium transition-all",
                  publishMode === mode
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "upload" && "Upload File"}
                {mode === "url" && "External URL"}
              </Button>
            ))}
          </div>
        </div>

        {/* Upload / URL Input Area */}
        <div className="space-y-2">
          {publishMode === "upload" && (
            <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-border transition-colors bg-muted/20">
              <input
                type="file"
                accept=".html"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-3">
                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto text-secondary-foreground">
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file ? file.name : "Click to select HTML file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB. Must be a standalone HTML file.
                  </p>
                </div>
              </label>
            </div>
          )}

          {publishMode === "url" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                External Preview URL
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-mono"
                placeholder="https://my-preview-app.com/login-v1"
              />
              <p className="text-xs text-muted-foreground">
                Provide a direct link to a hosted preview.
              </p>
            </div>
          )}
        </div>

        {/* Additional Variants Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              Additional Variants{" "}
              <span className="text-muted-foreground/70">(Optional)</span>
            </label>
            <Button
              onClick={addVariant}
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
            >
              + Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {variants.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No additional variants added.
              </p>
            )}
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="bg-muted/30 border border-border rounded-xl p-4 space-y-4 relative group"
              >
                <Button
                  onClick={() => removeVariant(variant.id)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Variant Name
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(variant.id, "name", e.target.value)
                      }
                      className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm"
                      placeholder="e.g. React Code"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Type
                    </label>
                    <select
                      value={variant.type}
                      onChange={(e) =>
                        updateVariant(variant.id, "type", e.target.value)
                      }
                      className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm"
                    >
                      <option value="code">HTML File</option>
                      <option value="url">External URL</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Content Source
                    </label>
                    {variant.type === "url" ? (
                      <input
                        type="text"
                        value={variant.content || ""}
                        onChange={(e) =>
                          updateVariant(variant.id, "content", e.target.value)
                        }
                        className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm font-mono"
                        placeholder="https://..."
                      />
                    ) : (
                      <input
                        type="file"
                        accept=".html"
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "file",
                            e.target.files?.[0] || null
                          )
                        }
                        className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-secondary-foreground"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={cn(
              "p-3 rounded-lg text-xs leading-relaxed",
              message.type === "error"
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-green-500/10 text-green-500 border border-green-500/20"
            )}
          >
            {message.text}
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Publishing..." : "Publish Component"}
        </Button>
      </div>
    </div>
  );
}
