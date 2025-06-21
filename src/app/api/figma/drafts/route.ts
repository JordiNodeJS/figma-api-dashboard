import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";
import { FigmaDraft } from "@/types/figma";

// Helper function to save discovered drafts to server storage
async function saveDraftsToServer(drafts: FigmaDraft[], request: NextRequest) {
  try {
    // Use the same user identification logic as user-drafts API
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userId = forwardedFor ? forwardedFor.split(',')[0] : 
                  request.headers.get('x-real-ip') || 
                  'default-user';

    // Save each draft that doesn't already exist
    for (const draft of drafts) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/figma/user-drafts`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
            'x-real-ip': request.headers.get('x-real-ip') || ''
          },
          body: JSON.stringify({
            action: 'add',
            draft: {
              ...draft,
              project_name: draft.project_name || "Drafts Sincronizados"
            }
          })
        });
      } catch (error) {
        console.warn(`Failed to save draft ${draft.key} to server:`, error);
      }
    }

    console.log(`📚 Attempted to save ${drafts.length} discovered drafts to server for user ${userId}`);
  } catch (error) {
    console.error("Error saving discovered drafts to server:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // First check for client token in headers
    const clientToken = request.headers.get("x-figma-token");
    const accessToken = clientToken || process.env.FIGMA_ACCESS_TOKEN;
    console.log("=== DRAFTS API CALL ===");
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

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const teamId = "958458320512591682"; // Team ID extraído de tu URL

    console.log("Team ID:", teamId);
    console.log("Search query:", query);
    let drafts;
    if (query) {
      // Get all accessible files and filter by query
      console.log("Fetching filtered files from all sources...");
      const allFiles = await figmaClient.getAllAccessibleFiles();
      console.log("Total files before filter:", allFiles.length);
      drafts = allFiles.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      console.log("Filtered files:", drafts.length);
    } else {
      // Get all accessible files
      console.log("Fetching all accessible files...");
      drafts = await figmaClient.getAllAccessibleFiles();
      console.log("Total files found:", drafts.length);

      // Log detailed information about each file
      console.log("DETAILED FILES INFO:");
      drafts.forEach((draft, index) => {
        console.log(
          `  ${index + 1}. "${draft.name}" (Project: ${
            draft.project_name
          }, Key: ${draft.key})`
        );
      });    }

    console.log("API Response drafts count:", drafts.length);
    
    // Save discovered drafts to server in background (don't wait for completion)
    saveDraftsToServer(drafts, request).catch(error => 
      console.warn("Background save to server failed:", error)
    );
    
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Error fetching Figma drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts from Figma" },
      { status: 500 }
    );
  }
}
