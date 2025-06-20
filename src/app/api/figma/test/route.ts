import { NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

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

    // Test the actual API connection
    const user = await figmaClient.getUser();

    return NextResponse.json({
      success: true,
      user,
      apiStatus: "Connected to Figma API successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error testing Figma API:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to Figma API",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
