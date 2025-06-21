"use client";

import { useUserFiles } from "@/hooks/use-user-files";
import { useEffect, useState } from "react";
import { FigmaDraft } from "@/types/figma";

interface ServerResponse {
  success: boolean;
  drafts?: FigmaDraft[];
  count?: number;
  error?: string;
}

export default function DebugUserFiles() {
  const { userFiles, loading, syncing, syncLog, clearAllFiles } =
    useUserFiles();
  const [rawData, setRawData] = useState<string | null>(null);
  const [serverData, setServerData] = useState<ServerResponse | null>(null);
  const [serverLoading, setServerLoading] = useState(false);

  useEffect(() => {
    // Update raw data when userFiles change
    const data = localStorage.getItem("figma-cursor-user-files");
    setRawData(data);
  }, [userFiles]);

  const clearLocalStorage = () => {
    localStorage.removeItem("figma-cursor-user-files");
    window.location.reload();
  };

  const clearAllData = async () => {
    if (
      confirm(
        "¿Estás seguro de que quieres limpiar todos los datos (localStorage y servidor)?"
      )
    ) {
      await clearAllFiles();
      window.location.reload();
    }
  };

  const showLocalStorageData = () => {
    const data = localStorage.getItem("figma-cursor-user-files");
    console.log("📦 Raw localStorage data:", data);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log("📦 Parsed localStorage data:", parsed);
        alert(
          `Found ${parsed.length} files in localStorage:\n${parsed
            .map((f: { name: string }) => f.name)
            .join("\n")}`
        );
      } catch (e) {
        console.error("❌ Error parsing localStorage data:", e);
        alert("Error parsing localStorage data");
      }
    } else {
      alert("No data found in localStorage");
    }
  };

  const loadServerData = async () => {
    setServerLoading(true);
    try {
      const response = await fetch("/api/figma/user-drafts");
      const data = await response.json();
      setServerData(data);
      console.log("🌐 Server data:", data);
    } catch (error) {
      console.error("❌ Error loading server data:", error);
      setServerData({ success: false, error: "Failed to load server data" });
    } finally {
      setServerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        Loading user files...
        {syncing && <span className="ml-2 text-blue-600">🔄 Syncing...</span>}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3">
        🐛 Debug: User Files
        {syncing && (
          <span className="ml-2 text-blue-600 text-sm">🔄 Syncing...</span>
        )}
      </h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Hook loading:</strong> {loading ? "Yes" : "No"}
        </p>
        <p>
          <strong>Total user files (from hook):</strong> {userFiles.length}
        </p>{" "}
        <p>
          <strong>Raw localStorage length:</strong>{" "}
          {rawData ? JSON.parse(rawData).length : 0}
        </p>
        <p>
          <strong>Server status:</strong>{" "}
          {serverData
            ? serverData.success
              ? `✅ Connected (${serverData.count || 0} files)`
              : `❌ Error: ${serverData.error}`
            : "Not checked"}
        </p>
        <div className="space-y-1">
          {userFiles.map((file, index) => (
            <div key={file.key} className="pl-4 border-l-2 border-blue-500">
              <p>
                <strong>#{index + 1}:</strong> {file.name}
              </p>
              <p className="text-gray-600">Key: {file.key}</p>
              <p className="text-gray-600">Project: {file.project_name}</p>
              <p className="text-gray-600 text-xs">
                Modified: {new Date(file.last_modified).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        {userFiles.length === 0 && (
          <p className="text-red-600">❌ No user files found</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={showLocalStorageData}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          📱 Show localStorage
        </button>
        <button
          onClick={loadServerData}
          disabled={serverLoading}
          className="px-3 py-1 bg-green-600 disabled:bg-green-400 text-white rounded text-sm"
        >
          {serverLoading ? "🔄" : "🌐"} Check Server
        </button>
        <button
          onClick={clearLocalStorage}
          className="px-3 py-1 bg-orange-600 text-white rounded text-sm"
        >
          🗑️ Clear localStorage
        </button>
        <button
          onClick={clearAllData}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          💥 Clear All Data
        </button>
      </div>
      {serverData && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
          <h4 className="font-semibold mb-2">🌐 Server Data:</h4>
          <pre className="text-xs overflow-auto max-h-32 bg-gray-100 dark:bg-gray-900 p-2 rounded">
            {JSON.stringify(serverData, null, 2)}
          </pre>
        </div>
      )}

      {/* Sync Log */}
      {(syncing || syncLog.length > 0) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
            📊 Log de Sincronización:
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {syncLog.map((entry, index) => (
              <div
                key={index}
                className="text-xs font-mono text-blue-700 dark:text-blue-300"
              >
                {entry}
              </div>
            ))}
            {syncing && (
              <div className="text-xs font-mono text-blue-600 dark:text-blue-400 animate-pulse">
                🔄 Sincronizando...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
