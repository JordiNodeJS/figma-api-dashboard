import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function GET(request: NextRequest) {
  try {
    // First check for client token in headers
    const clientToken = request.headers.get("x-figma-token");
    const accessToken = clientToken || process.env.FIGMA_ACCESS_TOKEN;

    console.log("=== EXPERIMENTAL RECENT FILES API CALL ===");
    console.log("📝 Note: Figma API doesn't support personal drafts access");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    // This will now return empty array - Figma doesn't support personal drafts access
    const recentFiles = await figmaClient.getRecentFiles();

    return NextResponse.json({
      recentFiles,
      count: recentFiles.length,
      experimental: true,
      message:
        "Figma API doesn't provide access to personal drafts. Use team discovery or manual URL addition instead.",
      limitation: "Personal drafts are not accessible via Figma's public API",
    });
  } catch (error) {
    console.error("Error in experimental recent files search:", error);
    return NextResponse.json(
      { error: "Failed to search for recent files", experimental: true },
      { status: 500 }
    );
  }
}
