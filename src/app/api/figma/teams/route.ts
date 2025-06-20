import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function GET(request: NextRequest) {
  try {
    // First check for client token in headers
    const clientToken = request.headers.get("x-figma-token");
    const accessToken = clientToken || process.env.FIGMA_ACCESS_TOKEN;
    
    console.log("=== TEAMS DISCOVERY API CALL ===");
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

    console.log("Discovering user teams...");
    const teams = await figmaClient.getUserAccessibleTeams();
    
    console.log(`Found ${teams.length} accessible teams:`, teams.map(t => t.name));

    // Get detailed information for each team
    const teamDetails = await Promise.all(
      teams.map(async (team) => {
        try {
          const projects = await figmaClient.getTeamProjects(team.id);
          let totalFiles = 0;
          
          // Count total files across all projects
          for (const project of projects.projects) {
            try {
              const files = await figmaClient.getProjectFiles(project.id);
              totalFiles += files.files.length;
            } catch (error) {
              console.error(`Error counting files in project ${project.name}:`, error);
            }
          }

          return {
            id: team.id,
            name: team.name,
            projectCount: projects.projects.length,
            totalFiles,
            projects: projects.projects.map(p => ({
              id: p.id,
              name: p.name,
            })),
          };
        } catch (error) {
          console.error(`Error getting details for team ${team.name}:`, error);
          return {
            id: team.id,
            name: team.name,
            projectCount: 0,
            totalFiles: 0,
            projects: [],
            error: "Could not access team details",
          };
        }
      })
    );

    console.log("Team discovery complete:", teamDetails);

    return NextResponse.json({ 
      teams: teamDetails,
      totalTeams: teams.length,
    });
  } catch (error) {
    console.error("Error discovering teams:", error);
    return NextResponse.json(
      { error: "Failed to discover teams from Figma" },
      { status: 500 }
    );
  }
}
