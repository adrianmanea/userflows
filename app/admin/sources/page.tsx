"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface Source {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  url: string | null;
}

export default function SourcesAdminPage() {
  const supabase = createClient();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for New/Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Source>>({
    name: "",
    slug: "",
    url: "",
  });
  // const [iconFile, setIconFile] = useState<File | null>(null); // Removed

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("sources").select("*").order("name");

    if (data) {
      setSources(data);
    }
    setIsLoading(false);
  };

  const handleEdit = (source: Source) => {
    setEditingId(source.id);
    setFormData({
      name: source.name,
      slug: source.slug,
      url: source.url,
    });

    // setIconFile(null);
  };

  const handleCreateRequest = () => {
    setEditingId("new");

    setFormData({ name: "", slug: "", url: "" });
    // setIconFile(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      alert("Name and Slug are required");
      return;
    }

    setIsSaving(true);
    try {
      // Image upload logic removed
      // if (iconFile) { ... }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        url: formData.url,
        // icon_url: iconUrl, // Removed
      };

      if (editingId === "new") {
        const { error } = await supabase.from("sources").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sources")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      }

      setEditingId(null);
      await fetchSources();
    } catch (e: any) {
      console.error(e);
      alert("Error saving source: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This relies on ON DELETE SET NULL in DB."))
      return;
    const { error } = await supabase.from("sources").delete().eq("id", id);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchSources();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Manage Sources
          </h1>
        </div>
        <Button onClick={handleCreateRequest}>
          <Plus className="w-4 h-4 mr-2" /> New Source
        </Button>
      </div>

      {editingId && (
        <div className="bg-card/40 border border-border rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Original URL</label>
              <input
                className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg"
                value={formData.url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>
            {/* Icon upload removed */}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sources.map((source) => {
          if (source.id === editingId) return null;
          return (
            <div
              key={source.id}
              className="flex items-center justify-between p-4 bg-card/60 border rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground border border-border">
                  {source.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{source.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    /{source.slug}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(source)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(source.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
