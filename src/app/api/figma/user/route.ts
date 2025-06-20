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
    const user = await figmaClient.getUser();

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching Figma user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information from Figma" },
      { status: 500 }
    );
  }
}
