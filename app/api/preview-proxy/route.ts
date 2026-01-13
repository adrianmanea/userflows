import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    // Security check: Only allow fetching from Supabase storage and trusted CDNs
    const urlObj = new URL(targetUrl);
    const allowedDomains = ["supabase.co"];
    const isAllowed = allowedDomains.some((domain) =>
      urlObj.hostname.endsWith(domain)
    );

    if (!isAllowed) {
      return new NextResponse("Invalid URL domain", { status: 403 });
    }

    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch content: ${response.statusText}`, { 
        status: response.status 
      });
    }

    const content = await response.blob();
    
    // Force text/html for html files, otherwise trust upstream or default
    let contentType = response.headers.get("content-type") || "text/html";
    if (targetUrl.toLowerCase().split("?")[0].endsWith(".html")) {
      contentType = "text/html";
    }

    // Create a new response with the content
    const newResponse = new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Crucial: Open up CSP constraints
        "Content-Security-Policy": "frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com blob: data:;",
        "X-Frame-Options": "SAMEORIGIN",
        // Cache control to improve performance
        "Cache-Control": "public, max-age=3600",
      },
    });

    return newResponse;

  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse(`Proxy error: ${error.message}`, { status: 500 });
  }
}
