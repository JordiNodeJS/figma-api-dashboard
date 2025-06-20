"use client";

import { useState, useEffect } from "react";

interface SyncStatusProps {
  lastSyncTime?: Date | null;
  isAutoSyncEnabled?: boolean;
  isLoading?: boolean;
}

export default function SyncStatus({ 
  lastSyncTime, 
  isAutoSyncEnabled = false, 
  isLoading = false 
}: SyncStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeSinceSync = () => {
    if (!lastSyncTime) return null;
    
    const diffMs = currentTime.getTime() - lastSyncTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return "hace menos de 1 minuto";
    if (diffMinutes === 1) return "hace 1 minuto";
    if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "hace 1 hora";
    return `hace ${diffHours} horas`;
  };

  const getStatusColor = () => {
    if (isLoading) return "text-yellow-600 dark:text-yellow-400";
    if (!lastSyncTime) return "text-gray-500 dark:text-gray-400";
    if (isAutoSyncEnabled) return "text-green-600 dark:text-green-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    }

    if (isAutoSyncEnabled) {
      return (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      );
    }

    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>
        {isLoading
          ? "Sincronizando..."
          : lastSyncTime
          ? `Sync: ${getTimeSinceSync()}`
          : "Sin sincronizar"}
      </span>
      {isAutoSyncEnabled && !isLoading && (
        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-1 rounded-full">
          Auto
        </span>
      )}
    </div>
  );
}
