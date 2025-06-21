import { useState, useEffect, useCallback } from "react";
import { FigmaDraft } from "@/types/figma";

const STORAGE_KEY = "figma-cursor-user-files";

export function useUserFiles() {
  const [userFiles, setUserFiles] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string[]>([]);

  // Helper function to add log entry
  const addLogEntry = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setSyncLog((prev) => [...prev.slice(-4), logEntry]); // Keep only last 5 entries
    console.log(logEntry);
  }, []);
  // Load from server
  const loadFromServer = useCallback(async () => {
    try {
      addLogEntry("🌐 Conectando al servidor...");
      const response = await fetch("/api/figma/user-drafts");

      if (response.ok) {
        const data = await response.json();
        addLogEntry(`✅ Cargados ${data.drafts.length} archivos del servidor`);
        return data.drafts || [];
      } else {
        addLogEntry("⚠️ Error del servidor, usando datos locales");
        return [];
      }
    } catch (error) {
      addLogEntry("❌ Sin conexión al servidor, usando datos locales");
      return [];
    }
  }, [addLogEntry]);
  // Save to server
  const saveToServer = useCallback(
    async (draft: FigmaDraft, action: "add" | "remove" = "add") => {
      try {
        setSyncing(true);
        addLogEntry(
          `🔄 ${action === "add" ? "Guardando" : "Eliminando"} "${
            draft.name
          }" en servidor...`
        );

        const response = await fetch("/api/figma/user-drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            draft: action === "add" ? draft : undefined,
            fileKey: action === "remove" ? draft.key : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          addLogEntry(
            `✅ ${
              action === "add" ? "Guardado" : "Eliminado"
            } en servidor exitosamente`
          );
          return true;
        } else {
          addLogEntry(
            `❌ Error en servidor al ${
              action === "add" ? "guardar" : "eliminar"
            }`
          );
          return false;
        }
      } catch (error) {
        addLogEntry(
          `❌ Sin conexión: ${
            action === "add" ? "guardado" : "eliminado"
          } solo localmente`
        );
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [addLogEntry]
  );
  // Clear server data
  const clearServer = useCallback(async () => {
    try {
      setSyncing(true);
      addLogEntry("🗑️ Limpiando datos del servidor...");

      const response = await fetch("/api/figma/user-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });

      if (response.ok) {
        addLogEntry("✅ Datos del servidor eliminados");
        return true;
      } else {
        addLogEntry("❌ Error al limpiar datos del servidor");
        return false;
      }
    } catch (error) {
      addLogEntry("❌ Sin conexión: no se pudieron limpiar datos del servidor");
      return false;
    } finally {
      setSyncing(false);
    }
  }, [addLogEntry]);

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
        if (
          !serverFiles.some(
            (serverFile: FigmaDraft) => serverFile.key === localFile.key
          )
        ) {
          mergedFiles.push(localFile);
          // Sync this file to server in the background
          saveToServer(localFile, "add");
        }
      }
      console.log("🔗 Merged files:", mergedFiles.length);
      setUserFiles(mergedFiles);

      // Update localStorage with merged data
      if (mergedFiles.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedFiles));
        } catch (error) {
          addLogEntry("❌ Error al actualizar archivos locales");
        }
      }

      setLoading(false);
    };
    loadInitialData();
  }, [loadFromServer, saveToServer, addLogEntry]);
  const addUserFile = async (file: FigmaDraft) => {
    addLogEntry(`� Añadiendo "${file.name}"...`);

    // Check if file already exists
    const exists = userFiles.some((f) => f.key === file.key);
    if (exists) {
      addLogEntry(`⚠️ "${file.name}" ya existe`);
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
      addLogEntry(`💾 "${file.name}" guardado localmente`);
    } catch (error) {
      addLogEntry(`❌ Error al guardar "${file.name}" localmente`);
    }

    // Save to server in background
    await saveToServer(newFile, "add");
  };
  const removeUserFile = async (fileKey: string) => {
    const fileToRemove = userFiles.find((f) => f.key === fileKey);
    if (!fileToRemove) {
      addLogEntry(`⚠️ Archivo no encontrado: ${fileKey}`);
      return;
    }

    addLogEntry(`🗑️ Eliminando "${fileToRemove.name}"...`);

    // Update local state
    const updatedFiles = userFiles.filter((f) => f.key !== fileKey);
    setUserFiles(updatedFiles);

    // Update localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
      addLogEntry(`💾 "${fileToRemove.name}" eliminado localmente`);
    } catch (error) {
      addLogEntry(`❌ Error al eliminar "${fileToRemove.name}" localmente`);
    }

    // Remove from server in background
    await saveToServer(fileToRemove, "remove");
  };
  const clearAllFiles = async () => {
    addLogEntry("�️ Limpiando todos los archivos...");

    // Update local state
    setUserFiles([]);

    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      addLogEntry("💾 Archivos locales eliminados");
    } catch (error) {
      addLogEntry("❌ Error al limpiar archivos locales");
    }

    // Clear server data
    await clearServer();
  };

  return {
    userFiles,
    loading,
    syncing,
    syncLog,
    addUserFile,
    removeUserFile,
    clearAllFiles,
  };
}
