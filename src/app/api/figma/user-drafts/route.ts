import { NextRequest, NextResponse } from "next/server";
import { FigmaDraft } from "@/types/figma";

// Simple in-memory storage for user drafts
// In a real application, you would use a database
const userDraftsStorage: Record<string, FigmaDraft[]> = {};

function getUserId(request: NextRequest): string {
  // In a real app, you would get this from authentication
  // For now, we'll use IP address or a session identifier
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'default-user';
  return ip;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const userDrafts = userDraftsStorage[userId] || [];
    
    console.log(`📖 Getting user drafts for ${userId}:`, userDrafts.length);
    
    return NextResponse.json({
      success: true,
      drafts: userDrafts,
      count: userDrafts.length
    });
  } catch (error) {
    console.error("❌ Error getting user drafts:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener drafts del usuario" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, draft } = body;
    const userId = getUserId(request);
    
    if (!userDraftsStorage[userId]) {
      userDraftsStorage[userId] = [];
    }
    
    switch (action) {
      case 'add': {
        if (!draft || !draft.key) {
          return NextResponse.json(
            { success: false, error: "Draft data is required" },
            { status: 400 }
          );
        }
        
        // Check if draft already exists
        const exists = userDraftsStorage[userId].some(d => d.key === draft.key);
        if (exists) {
          console.log(`⚠️ Draft ${draft.key} already exists for user ${userId}`);
          return NextResponse.json({
            success: true,
            message: "Draft already exists"
          });
        }
        
        // Add draft with timestamp
        const newDraft: FigmaDraft = {
          ...draft,
          last_modified: new Date().toISOString(),
          // Mark as user-added if not specified
          project_name: draft.project_name || "Mis Archivos"
        };
        
        userDraftsStorage[userId].unshift(newDraft);
        
        console.log(`✅ Added draft ${draft.key} for user ${userId}. Total: ${userDraftsStorage[userId].length}`);
        
        return NextResponse.json({
          success: true,
          message: "Draft added successfully",
          draft: newDraft,
          count: userDraftsStorage[userId].length
        });
      }
      
      case 'remove': {
        const { fileKey } = body;
        if (!fileKey) {
          return NextResponse.json(
            { success: false, error: "File key is required" },
            { status: 400 }
          );
        }
        
        const initialLength = userDraftsStorage[userId].length;
        userDraftsStorage[userId] = userDraftsStorage[userId].filter(d => d.key !== fileKey);
        
        const removed = initialLength > userDraftsStorage[userId].length;
        
        console.log(`${removed ? '✅' : '⚠️'} ${removed ? 'Removed' : 'Tried to remove'} draft ${fileKey} for user ${userId}`);
        
        return NextResponse.json({
          success: true,
          message: removed ? "Draft removed successfully" : "Draft not found",
          removed,
          count: userDraftsStorage[userId].length
        });
      }
      
      case 'clear': {
        const count = userDraftsStorage[userId].length;
        userDraftsStorage[userId] = [];
        
        console.log(`🗑️ Cleared ${count} drafts for user ${userId}`);
        
        return NextResponse.json({
          success: true,
          message: `Cleared ${count} drafts`,
          count: 0
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Error in user drafts API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al procesar la solicitud" 
      },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint for clearing all drafts
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const count = userDraftsStorage[userId]?.length || 0;
    userDraftsStorage[userId] = [];
    
    console.log(`🗑️ Cleared ${count} drafts for user ${userId} via DELETE`);
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${count} drafts`,
      count: 0
    });
  } catch (error) {
    console.error("❌ Error clearing user drafts:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al limpiar drafts" 
      },
      { status: 500 }
    );
  }
}
