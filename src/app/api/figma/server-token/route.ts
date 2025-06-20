import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serverToken = process.env.FIGMA_ACCESS_TOKEN;

    return NextResponse.json({
      hasServerToken: !!serverToken,
    });
  } catch (error) {
    console.error("Error checking server token:", error);
    return NextResponse.json(
      { error: "Failed to check server token" },
      { status: 500 }
    );
  }
}
