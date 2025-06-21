import { useState, useEffect, useCallback } from "react";
import { FigmaDraft } from "@/types/figma";

const STORAGE_KEY = "figma-cursor-user-files";

export function useUserFiles() {
  const [userFiles, setUserFiles] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load from server
  const loadFromServer = useCallback(async () => {
    try {
      console.log("🌐 Loading user files from server...");
      const response = await fetch("/api/figma/user-drafts");
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Loaded from server:", data.drafts.length);
        return data.drafts || [];
      } else {
        console.warn("⚠️ Server response not OK, falling back to localStorage");
        return [];
      }
    } catch (error) {
      console.error("❌ Error loading from server, falling back to localStorage:", error);
      return [];
    }
  }, []);

  // Save to server
  const saveToServer = useCallback(async (draft: FigmaDraft, action: 'add' | 'remove' = 'add') => {
    try {
      setSyncing(true);
      console.log(`🌐 ${action === 'add' ? 'Saving' : 'Removing'} file to/from server:`, draft.key);
      
      const response = await fetch("/api/figma/user-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action, 
          draft: action === 'add' ? draft : undefined,
          fileKey: action === 'remove' ? draft.key : undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Server ${action} successful:`, data.message);
        return true;
      } else {
        console.error(`❌ Server ${action} failed`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error ${action === 'add' ? 'saving to' : 'removing from'} server:`, error);
      return false;
    } finally {
      setSyncing(false);
    }
  }, []);

  // Clear server data
  const clearServer = useCallback(async () => {
    try {
      setSyncing(true);
      console.log("🌐 Clearing server data...");
      
      const response = await fetch("/api/figma/user-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (response.ok) {
        console.log("✅ Server data cleared");
        return true;
      } else {
        console.error("❌ Failed to clear server data");
        return false;
      }
    } catch (error) {
      console.error("❌ Error clearing server data:", error);
      return false;
    } finally {
      setSyncing(false);
    }
  }, []);

  // Load initial data (localStorage + server merge)
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("� Loading initial user files...");
      
      // Load from localStorage first (faster)
      let localFiles: FigmaDraft[] = [];
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          localFiles = JSON.parse(saved);
          console.log("📱 Loaded from localStorage:", localFiles.length);
        }
      } catch (error) {
        console.error("❌ Error loading from localStorage:", error);
      }

      // Load from server
      const serverFiles = await loadFromServer();
      
      // Merge localStorage and server data (server takes precedence)
      const mergedFiles = [...serverFiles];
        // Add any localStorage files that aren't on the server
      for (const localFile of localFiles) {
        if (!serverFiles.some((serverFile: FigmaDraft) => serverFile.key === localFile.key)) {
          mergedFiles.push(localFile);
          // Sync this file to server in the background
          saveToServer(localFile, 'add');
        }
      }

      console.log("🔗 Merged files:", mergedFiles.length);
      setUserFiles(mergedFiles);
      
      // Update localStorage with merged data
      if (mergedFiles.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedFiles));
        } catch (error) {
          console.error("❌ Error updating localStorage:", error);
        }
      }
      
      setLoading(false);
    };    loadInitialData();
  }, [loadFromServer, saveToServer]);

  const addUserFile = async (file: FigmaDraft) => {
    console.log("🔄 Adding user file:", file);
    
    // Check if file already exists
    const exists = userFiles.some((f) => f.key === file.key);
    if (exists) {
      console.log("⚠️ File already exists:", file.key);
      return;
    }

    const newFile = {
      ...file,
      last_modified: new Date().toISOString(),
    };

    // Update local state immediately
    const updatedFiles = [newFile, ...userFiles];
    setUserFiles(updatedFiles);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
      console.log("✅ File saved to localStorage. Total files:", updatedFiles.length);
    } catch (error) {
      console.error("❌ Error saving to localStorage:", error);
    }

    // Save to server in background
    await saveToServer(newFile, 'add');
  };

  const removeUserFile = async (fileKey: string) => {
    console.log("🔄 Removing user file:", fileKey);
    
    const fileToRemove = userFiles.find(f => f.key === fileKey);
    if (!fileToRemove) {
      console.log("⚠️ File not found:", fileKey);
      return;
    }

    // Update local state
    const updatedFiles = userFiles.filter((f) => f.key !== fileKey);
    setUserFiles(updatedFiles);

    // Update localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
      console.log("✅ File removed from localStorage");
    } catch (error) {
      console.error("❌ Error updating localStorage:", error);
    }

    // Remove from server in background
    await saveToServer(fileToRemove, 'remove');
  };

  const clearAllFiles = async () => {
    console.log("🔄 Clearing all user files");
    
    // Update local state
    setUserFiles([]);
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ LocalStorage cleared");
    } catch (error) {
      console.error("❌ Error clearing localStorage:", error);
    }

    // Clear server data
    await clearServer();
  };

  return {
    userFiles,
    loading,
    syncing,
    addUserFile,
    removeUserFile,
    clearAllFiles,
  };
}
