import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function GET(request: NextRequest) {
  try {
    // First check for client token in headers
    const clientToken = request.headers.get("x-figma-token");
    const accessToken = clientToken || process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    const figmaClient = new FigmaClient(accessToken);

    // Get team ID from query params
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const query = searchParams.get("q");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    let projects;
    if (query) {
      // Get all projects and filter by query
      const allProjects = await figmaClient.getTeamProjects(teamId);
      projects = allProjects.projects.filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      const response = await figmaClient.getTeamProjects(teamId);
      projects = response.projects;
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching Figma projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects from Figma" },
      { status: 500 }
    );
  }
}
