"use client";

import { useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { FilterSelector } from "./filter-selector";
import { updateComponent } from "@/utils/actions";
import { Edit } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    startTransition(async () => {
      try {
        let thumbnailUrl = component.thumbnail_url;

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

        // Update component details
        await updateComponent(component.id, {
          name,
          description,
          thumbnail_url: thumbnailUrl,
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
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Component</DialogTitle>
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
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {thumbnailFile
                    ? "New file selected"
                    : "Current thumbnail set"}
                </span>
              )}
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
