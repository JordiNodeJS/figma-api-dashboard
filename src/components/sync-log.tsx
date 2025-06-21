"use client";

import { useUserFiles } from "@/hooks/use-user-files";

export default function SyncLog() {
  const { syncing, syncLog } = useUserFiles();

  // Don't show if no syncing activity
  if (!syncing && syncLog.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              syncing ? "bg-blue-500 animate-pulse" : "bg-green-500"
            }`}
          ></div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
            {syncing ? "Sincronizando..." : "Sincronización"}
          </h4>
        </div>

        <div className="space-y-1 max-h-24 overflow-y-auto">
          {syncLog.slice(-3).map((entry, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 font-mono"
            >
              {entry}
            </div>
          ))}
        </div>

        {syncing && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
