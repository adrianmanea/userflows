"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { createClient } from "@/utils/supabase/client";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { FilterSelector } from "@/components/admin/filter-selector";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminClientPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [originalApp, setOriginalApp] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [publishMode, setPublishMode] = useState<"builder" | "upload" | "url">(
    "builder"
  );

  // Builder Mode State
  const [code, setCode] = useState(`export default function Component() {
  return (
    <div className="p-4 bg-white text-black">
      <h1>Hello World</h1>
    </div>
  )
}`);

  // Upload Mode State
  const [file, setFile] = useState<File | null>(null);

  // URL Mode State
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
      const componentId = crypto.randomUUID(); // Generate ID client-side for file path consistency

      // 0. Handle Thumbnail Upload
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `thumbnails/${componentId}.${fileExt}`;

        const { error: thumbError } = await supabase.storage
          .from("component-previews")
          .upload(fileName, thumbnailFile, { upsert: true });

        if (thumbError) {
          console.error("Thumbnail upload failed:", thumbError);
          // don't throw, just log
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("component-previews")
            .getPublicUrl(fileName);
          thumbnailUrl = publicUrlData.publicUrl;
        }
      }

      // 1. Handle Artifact Generation/Upload based on Mode
      if (publishMode === "builder") {
        const { buildComponentHtml } = await import(
          "@/utils/component-builder"
        );
        const htmlContent = buildComponentHtml(code);
        const blob = new Blob([htmlContent], { type: "text/html" });
        const fileName = `${componentId}.html`;

        const { error: uploadError } = await supabase.storage
          .from("component-previews")
          .upload(fileName, blob, { upsert: true, contentType: "text/html" });

        if (uploadError)
          throw new Error("Upload failed: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("component-previews")
          .getPublicUrl(fileName);

        previewUrl = publicUrlData.publicUrl;
      } else if (publishMode === "upload") {
        if (!file) throw new Error("No file selected");

        const fileExt = file.name.split(".").pop();
        const fileName = `${componentId}.${fileExt}`;

        // Force conversion to Blob with proper type to override browser detection
        const blob = new Blob([file], { type: "text/html" });
        console.log("Uploading file as text/html:", fileName, blob.type);

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
        if (!externalUrl) throw new Error("No URL provided");
        previewUrl = externalUrl;
      }

      // 2. Save Metadata to DB
      const { data: componentData, error } = await supabase
        .from("components")
        .insert({
          name,
          code_string: publishMode === "builder" ? code : null, // Only save code if using builder
          original_app: originalApp || null,
          tags: [], // Deprecated
          preview_url: previewUrl,
          thumbnail_url: thumbnailUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Save Filters
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
          setMessage({
            type: "error",
            text: "Component saved but filters failed: " + filterError.message,
          });
          return;
        }
      }

      setMessage({
        type: "success",
        text: "Component published successfully!",
      });
      // Reset form (optional, or keep values for re-publish)
      setName("");
      setSelectedFilters([]);
      setOriginalApp("");
      setFile(null);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Publish Component
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
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
                  Original App{" "}
                  <span className="text-muted-foreground/70">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={originalApp}
                  onChange={(e) => setOriginalApp(e.target.value)}
                  className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
                  placeholder="e.g. Uber"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Thumbnail{" "}
                  <span className="text-muted-foreground/70">
                    (Image or MP4)
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={(e) =>
                      setThumbnailFile(e.target.files?.[0] || null)
                    }
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
                {(["builder", "upload", "url"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPublishMode(mode)}
                    className={cn(
                      "px-4 py-2 text-xs font-medium rounded-md transition-all",
                      publishMode === mode
                        ? "bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode === "builder" && "Code Builder"}
                    {mode === "upload" && "Upload File"}
                    {mode === "url" && "External URL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Input Area */}
            <div className="space-y-2">
              {publishMode === "builder" && (
                <>
                  <label className="text-sm font-medium text-muted-foreground flex justify-between">
                    <span>React Code</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Will be auto-built to HTML
                    </span>
                  </label>
                  <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-[#1e1e1e]">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </>
              )}

              {publishMode === "upload" && (
                <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-border transition-colors bg-muted/20">
                  <input
                    type="file"
                    accept=".html"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer space-y-3"
                  >
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

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-10 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Publishing..." : "Publish Component"}
            </button>
          </div>
        </div>

        {/* Sidebar / Instructions */}
        <div className="space-y-6">
          <div className="bg-card/40 border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4 text-sm">
              Instructions
            </h2>
            <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              {publishMode === "builder" && (
                <>
                  <li className="flex gap-2">
                    <span className="bg-muted rounded-full h-4 w-4 flex items-center justify-center text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                      1
                    </span>
                    Write your code as a standard React component (export
                    default).
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-muted rounded-full h-4 w-4 flex items-center justify-center text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                      2
                    </span>
                    Imports are stripped. Use global <code>React</code>,{" "}
                    <code>LucideIcons</code>, etc.
                  </li>
                </>
              )}
              {publishMode === "upload" && (
                <li className="flex gap-2">
                  <span className="bg-muted rounded-full h-4 w-4 flex items-center justify-center text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Upload a single <code>.html</code> file with all
                  styles/scripts inlined or CDN linked.
                </li>
              )}
              {publishMode === "url" && (
                <li className="flex gap-2">
                  <span className="bg-muted rounded-full h-4 w-4 flex items-center justify-center text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Ensure the URL is publicly accessible and supports iframe
                  embedding (X-Frame-Options).
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
