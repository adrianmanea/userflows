"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FilterSelector } from "./filter-selector";
import { updateComponent } from "@/utils/actions";
import { Edit } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { DialogDescription } from "@/components/ui/dialog";

interface ComponentEditDialogProps {
  component: any;
  filters: any[]; // All available filters
  currentFilters: string[]; // IDs of currently assigned filters
}

export function ComponentEditDialog({
  component,
  filters,
  currentFilters,
}: ComponentEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(component.name);
  const [description, setDescription] = useState(component.description || "");
  const [selectedFilters, setSelectedFilters] =
    useState<string[]>(currentFilters);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    component.source_id || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchSources = async () => {
      const { data } = await supabase.from("sources").select("*").order("name");
      if (data) setSources(data);
    };
    fetchSources();
  }, []);

  const handleSave = async () => {
    startTransition(async () => {
      try {
        let thumbnailUrl = component.thumbnail_url;
        let previewUrl = component.preview_url;

        // Upload new thumbnail if selected
        if (thumbnailFile) {
          setIsUploading(true);
          const fileExt = thumbnailFile.name.split(".").pop();
          const fileName = `thumbnails/${
            component.id
          }-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("component-previews")
            .upload(fileName, thumbnailFile, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("component-previews")
            .getPublicUrl(fileName);

          thumbnailUrl = publicUrlData.publicUrl;
        }

        // Upload new HTML file if selected
        if (htmlFile) {
          setIsUploading(true);
          const fileExt = htmlFile.name.split(".").pop();
          const fileName = `${component.id}-${Date.now()}.${fileExt}`;

          // Force conversion to Blob with proper type
          const blob = new Blob([htmlFile], { type: "text/html" });

          const { error: uploadError } = await supabase.storage
            .from("component-previews")
            .upload(fileName, blob, { upsert: true, contentType: "text/html" });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("component-previews")
            .getPublicUrl(fileName);

          previewUrl = publicUrlData.publicUrl;
        } else {
          // Check for external URL input
          const urlInput = document.getElementById(
            "external-url-input"
          ) as HTMLInputElement;
          if (urlInput && urlInput.value) {
            previewUrl = urlInput.value;
          }
        }

        // Update component details
        await updateComponent(component.id, {
          name,
          description,
          thumbnail_url: thumbnailUrl,
          preview_url: previewUrl,
          source_id:
            selectedSourceId && selectedSourceId !== "none"
              ? selectedSourceId
              : null,
          original_app: null, // Clear legacy field
        });

        // Update filters
        // First delete existing
        await supabase
          .from("component_filters")
          .delete()
          .eq("component_id", component.id);

        // Then insert new
        if (selectedFilters.length > 0) {
          await supabase.from("component_filters").insert(
            selectedFilters.map((fid) => ({
              component_id: component.id,
              filter_id: fid,
            }))
          );
        }

        setOpen(false);
      } catch (e) {
        console.error("Failed to update", e);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full !max-w-[90vw] max-h-[85vh] overflow-y-auto bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Component</DialogTitle>
          <DialogDescription>
            Make changes to your component details here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-input"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-input"
            />
          </div>
          <div className="grid gap-2">
            <Label>Thumbnail</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*,video/mp4"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="bg-background border-input text-xs"
              />
              {(thumbnailFile || component.thumbnail_url) && (
                <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded border border-border">
                  {thumbnailFile ? (
                    thumbnailFile.type.startsWith("video/") ? (
                      <video
                        src={URL.createObjectURL(thumbnailFile)}
                        className="h-full w-full object-cover"
                        itemProp="video"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="New thumbnail"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : component.thumbnail_url?.match(/\.(mp4|webm)$/i) ? (
                    <video
                      src={component.thumbnail_url}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={component.thumbnail_url}
                      alt="Current thumbnail"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Attribution Source</Label>
            <Select
              value={selectedSourceId}
              onValueChange={setSelectedSourceId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Content Source</Label>

            <div className="space-y-4 pt-2">
              <div className="grid gap-2 p-3 border border-border rounded-lg bg-muted/20">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Option A: Upload HTML File (Replaces URL)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".html"
                    onChange={(e) => {
                      setHtmlFile(e.target.files?.[0] || null);
                      // Clear URL input if file is selected
                      const urlInput = document.getElementById(
                        "external-url-input"
                      ) as HTMLInputElement;
                      if (urlInput) urlInput.value = "";
                    }}
                    className="bg-background border-input text-xs"
                  />
                  {htmlFile && (
                    <span className="text-xs text-green-500 truncate max-w-[100px]">
                      New HTML selected
                    </span>
                  )}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground uppercase">
                  OR
                </span>
                <div className="absolute inset-0 border-t border-border -z-10"></div>
              </div>

              <div className="grid gap-2 p-3 border border-border rounded-lg bg-muted/20">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Option B: External URL
                </Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  defaultValue={
                    component.preview_url?.startsWith("http") &&
                    !component.preview_url?.includes("supabase.co")
                      ? component.preview_url
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setHtmlFile(null); // Clear file if URL provided
                    }
                  }}
                  className="bg-background border-input text-xs font-mono"
                  id="external-url-input"
                />
                <p className="text-[10px] text-muted-foreground">
                  Provide a direct link to a hosted preview (e.g. Vercel,
                  Netlify).
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Filters</Label>
            <FilterSelector
              selectedFilters={selectedFilters}
              onChange={setSelectedFilters}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || isUploading}>
            {isPending || isUploading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
