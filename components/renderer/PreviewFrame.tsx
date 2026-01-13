"use client";
import { useEffect, useRef } from "react";

interface PreviewFrameProps {
  code?: string;
  theme?: "light" | "dark";
  previewUrl?: string | null;
}

export function PreviewFrame({
  code,
  theme = "light",
  previewUrl,
}: PreviewFrameProps) {
  const iframeRef = useRef(null);

  // Fallback to runtime sandbox logic (only runs if no previewUrl)
  useEffect(() => {
    if (previewUrl) return; // Skip if we are in URL mode

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Allow iframe to load before sending messages
    const handleLoad = () => {
      // Send theme
      iframe.contentWindow?.postMessage(
        { type: "THEME_CHANGE", payload: theme },
        "*"
      );
      // Send code
      iframe.contentWindow?.postMessage(
        { type: "RENDER_CODE", payload: code },
        "*"
      );
    };

    iframe.addEventListener("load", handleLoad);
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }
    return () => iframe.removeEventListener("load", handleLoad);
  }, [code, theme, previewUrl]);

  // Re-send code if it changes
  useEffect(() => {
    if (previewUrl) return;
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument?.readyState === "complete") {
      iframe.contentWindow?.postMessage(
        { type: "RENDER_CODE", payload: code },
        "*"
      );
    }
  }, [code, previewUrl]);

  // Re-send theme if it changes
  useEffect(() => {
    if (previewUrl) return;
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument?.readyState === "complete") {
      iframe.contentWindow?.postMessage(
        { type: "THEME_CHANGE", payload: theme },
        "*"
      );
    }
  }, [theme, previewUrl]);

  // If a static preview URL is provided, just use that.
  if (previewUrl) {
    return (
      <div className="w-full h-full bg-transparent rounded-lg shadow-sm overflow-hidden border border-gray-200/0">
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title="Component Preview"
          sandbox="allow-scripts"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-transparent rounded-lg shadow-sm overflow-hidden border border-gray-200/0">
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        className="w-full h-full border-0"
        title="Component Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
