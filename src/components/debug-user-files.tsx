"use client";

import { useUserFiles } from "@/hooks/use-user-files";
import { useEffect, useState } from "react";

export default function DebugUserFiles() {
  const { userFiles, loading } = useUserFiles();
  const [rawData, setRawData] = useState<string | null>(null);

  useEffect(() => {
    // Update raw data when userFiles change
    const data = localStorage.getItem("figma-cursor-user-files");
    setRawData(data);
  }, [userFiles]);

  const clearLocalStorage = () => {
    localStorage.removeItem("figma-cursor-user-files");
    window.location.reload();
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

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 rounded">Loading user files...</div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3">🐛 Debug: User Files</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Hook loading:</strong> {loading ? "Yes" : "No"}
        </p>
        <p>
          <strong>Total user files (from hook):</strong> {userFiles.length}
        </p>
        <p>
          <strong>Raw localStorage length:</strong>{" "}
          {rawData ? JSON.parse(rawData).length : 0}
        </p>
        <div className="space-y-1">
          {userFiles.map((file, index) => (
            <div key={file.key} className="pl-4 border-l-2 border-blue-500">
              <p>
                <strong>#{index + 1}:</strong> {file.name}
              </p>
              <p className="text-gray-600">Key: {file.key}</p>
              <p className="text-gray-600">Project: {file.project_name}</p>
            </div>
          ))}
        </div>
        {userFiles.length === 0 && (
          <p className="text-red-600">❌ No user files found</p>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={showLocalStorageData}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Show Raw Data
        </button>
        <button
          onClick={clearLocalStorage}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
}
