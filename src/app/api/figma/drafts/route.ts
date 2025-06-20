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
    const teamId = "958458320512591682"; // Team ID extraído de tu URL

    let drafts;
    if (query) {
      // Get team files and filter by query
      const allFiles = await figmaClient.getTeamFiles(teamId);
      drafts = allFiles.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      // Get all files from the team
      drafts = await figmaClient.getTeamFiles(teamId);
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
