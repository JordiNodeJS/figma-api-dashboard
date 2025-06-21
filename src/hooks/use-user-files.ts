import { useState, useEffect } from "react";
import { FigmaDraft } from "@/types/figma";

const STORAGE_KEY = "figma-cursor-user-files";

export function useUserFiles() {
  const [userFiles, setUserFiles] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("🔄 Loading user files from localStorage...");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("✅ Loaded user files:", parsed.length);
        setUserFiles(parsed);
      } else {
        console.log("📝 No saved files found in localStorage");
      }
    } catch (error) {
      console.error("❌ Error loading user files from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  const addUserFile = (file: FigmaDraft) => {
    console.log("🔄 Adding user file:", file);
    setUserFiles((prev) => {
      // Check if file already exists
      const exists = prev.some((f) => f.key === file.key);
      if (exists) {
        console.log("⚠️ File already exists:", file.key);
        return prev;
      }

      const updated = [file, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log(
          "✅ File saved to localStorage. Total files:",
          updated.length
        );
        console.log(
          "📝 Current userFiles state will be:",
          updated.map((f) => f.name)
        );
      } catch (error) {
        console.error("❌ Error saving to localStorage:", error);
      }
      return updated;
    });
  };

  const removeUserFile = (fileKey: string) => {
    setUserFiles((prev) => {
      const updated = prev.filter((f) => f.key !== fileKey);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      return updated;
    });
  };

  const clearAllFiles = () => {
    setUserFiles([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  return {
    userFiles,
    loading,
    addUserFile,
    removeUserFile,
    clearAllFiles,
  };
}
