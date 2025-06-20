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

    const { teamId, teamUrl } = await request.json();

    // Extract team ID from URL if provided
    let finalTeamId = teamId;
    if (teamUrl && !teamId) {
      finalTeamId = FigmaClient.extractTeamId(teamUrl);
      if (!finalTeamId) {
        return NextResponse.json(
          { error: "Invalid team URL format" },
          { status: 400 }
        );
      }
    }

    if (!finalTeamId) {
      return NextResponse.json(
        { error: "Team ID or team URL is required" },
        { status: 400 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    // Get all files from the team
    const files = await figmaClient.getTeamFiles(finalTeamId);

    return NextResponse.json({
      success: true,
      teamId: finalTeamId,
      filesCount: files.length,
      files,
    });
  } catch (error) {
    console.error("Error fetching team files:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("403")) {
        return NextResponse.json(
          { error: "Access denied. You need admin permissions for this team." },
          { status: 403 }
        );
      }
      if (error.message.includes("404")) {
        return NextResponse.json(
          { error: "Team not found or not accessible." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch team files" },
      { status: 500 }
    );
  }
}
