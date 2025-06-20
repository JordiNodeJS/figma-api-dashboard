import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    let drafts;
    if (query) {
      drafts = await figmaClient.searchFiles(query);
    } else {
      drafts = await figmaClient.getRecentFiles();
    }

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Error fetching Figma drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts from Figma" },
      { status: 500 }
    );
  }
}
