import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Figma URL is required" },
        { status: 400 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);
    const fileInfo = await figmaClient.addFileByUrl(url);

    if (!fileInfo) {
      return NextResponse.json(
        { error: "Could not add file. Please check the URL and permissions." },
        { status: 404 }
      );
    }

    // In a real app, you would save this to a database
    // For now, we'll return the file info
    return NextResponse.json({
      success: true,
      file: fileInfo,
      message: "File added successfully",
    });
  } catch (error) {
    console.error("Error adding Figma file:", error);
    return NextResponse.json(
      {
        error: "Failed to add Figma file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    // Try to get files from user's accessible files
    // This would normally come from a database of user's added files
    const files = await figmaClient.getRecentFiles();

    return NextResponse.json({
      files,
      message:
        "For real files, please add them using the POST endpoint with specific URLs",
    });
  } catch (error) {
    console.error("Error fetching user files:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
