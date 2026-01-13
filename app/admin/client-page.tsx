"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { createClient } from "@/utils/supabase/client";

export default function AdminClientPage() {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [originalApp, setOriginalApp] = useState("");
  const [code, setCode] = useState(`export default function Component() {
  return (
    <div className="p-4 bg-white text-black">
      <h1>Hello World</h1>
    </div>
  )
}`);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const supabase = createClient();

  const handleSave = async () => {
    if (!name) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      setMessage({
        type: "error",
        text: "You must be logged in to publish. Please log in and try again.",
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error } = await supabase.from("components").insert({
        name,
        code_string: code,
        original_app: originalApp || null,
        tags: tagArray,
      });

      if (error) throw error;

      setMessage({ text: "Component saved successfully!", type: "success" });
      setName("");
      setTags("");
      setOriginalApp("");
    } catch (e: any) {
      console.error(e);
      let msg = e.message;
      if (msg.includes("row-level security policy")) {
        msg = "Permission denied. Please ensure you are logged in.";
      }
      setMessage({
        type: "error",
        text: "Error publishing: " + msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin: Add Component</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form & Editor */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Component Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g. Login Card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Original App (Optional)
              </label>
              <input
                type="text"
                value={originalApp}
                onChange={(e) => setOriginalApp(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g. Uber"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g. auth, form, card"
              />
            </div>

            <div className="h-[500px] border rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Component"}
            </button>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          {/* Preview Instructions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
            <h2 className="font-bold mb-4 text-gray-500 uppercase text-xs tracking-wider">
              Preview Instructions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>
                Write your component as a default export function or named{" "}
                <code>Component</code>.
              </li>
              <li>Tailwind CSS is available.</li>
              <li>Inputs inside the sandbox might be limited for now.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
