import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileKey } = body;

    // Get token from headers or environment
    const clientToken = request.headers.get("x-figma-token");
    const accessToken = clientToken || process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    // Get file details to get the thumbnail
    const fileData = await figmaClient.getFile(fileKey);

    return NextResponse.json({
      success: true,
      thumbnail_url: fileData.thumbnailUrl,
      name: fileData.name,
      last_modified: fileData.lastModified,
    });
  } catch (error) {
    console.error("Error fetching file thumbnail:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch file thumbnail",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
