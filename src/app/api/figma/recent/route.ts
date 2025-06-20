import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function GET(request: NextRequest) {
  try {
    // First check for client token in headers
    const clientToken = request.headers.get("x-figma-token");
    const accessToken = clientToken || process.env.FIGMA_ACCESS_TOKEN;

    console.log("=== EXPERIMENTAL RECENT FILES API CALL ===");
    console.log("Client token present:", !!clientToken);
    console.log("Server token present:", !!process.env.FIGMA_ACCESS_TOKEN);
    console.log("Using token type:", clientToken ? "client" : "server");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    console.log("Attempting experimental recent files discovery...");
    const recentFiles = await figmaClient.getRecentFiles();

    console.log(`Experimental search found ${recentFiles.length} recent files`);

    return NextResponse.json({
      recentFiles,
      count: recentFiles.length,
      experimental: true,
      message:
        "This endpoint attempts to discover recent files through various API endpoints",
    });
  } catch (error) {
    console.error("Error in experimental recent files search:", error);
    return NextResponse.json(
      { error: "Failed to search for recent files", experimental: true },
      { status: 500 }
    );
  }
}
