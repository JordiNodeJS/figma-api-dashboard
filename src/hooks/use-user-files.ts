import { useState, useEffect } from "react";
import { FigmaDraft } from "@/types/figma";

const STORAGE_KEY = "figma-cursor-user-files";

export function useUserFiles() {
  const [userFiles, setUserFiles] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserFiles(parsed);
      }
    } catch (error) {
      console.error("Error loading user files from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUserFile = (file: FigmaDraft) => {
    setUserFiles((prev) => {
      // Check if file already exists
      const exists = prev.some((f) => f.key === file.key);
      if (exists) {
        return prev;
      }

      const updated = [file, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
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
