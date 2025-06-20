import { NextRequest, NextResponse } from "next/server";
import { FigmaClient } from "@/lib/figma-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, token } = body;

    // If token is provided, verify the token
    if (token) {
      try {
        const figmaClient = new FigmaClient(token);
        const user = await figmaClient.getUser();

        return NextResponse.json({
          valid: true,
          user: {
            id: user.id,
            handle: user.handle,
            email: user.email,
          },
        });
      } catch (error) {
        console.error("Error verifying Figma token:", error);
        return NextResponse.json(
          { error: "Invalid token or unauthorized access" },
          { status: 401 }
        );
      }
    }

    // Original file verification logic
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Figma access token not configured" },
        { status: 500 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: "Figma URL is required" },
        { status: 400 }
      );
    }

    // Extract file key from Figma URL
    const fileKeyMatch = url.match(
      /figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/
    );

    if (!fileKeyMatch) {
      return NextResponse.json(
        { error: "Invalid Figma URL format" },
        { status: 400 }
      );
    }

    const fileKey = fileKeyMatch[1];
    const figmaClient = new FigmaClient(accessToken);

    // Try to verify the file exists and get its info
    const fileInfo = await figmaClient.verifyFile(fileKey);

    if (!fileInfo) {
      return NextResponse.json(
        { error: "File not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      file: fileInfo,
      originalUrl: url,
    });
  } catch (error) {
    console.error("Error verifying Figma file:", error);
    return NextResponse.json(
      {
        error: "Failed to verify Figma file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
