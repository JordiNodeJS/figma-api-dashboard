"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FigmaDraft } from "@/types/figma";
import DraftCard from "@/components/draft-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useUserFiles } from "@/hooks/use-user-files";
import { useFigmaToken } from "@/hooks/use-figma-token";
import FigmaTokenSetup from "@/components/figma-token-setup";

// Auto-sync configuration
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INITIAL_SYNC_DELAY = 2000; // 2 seconds

export default function FigmaDrafts() {
  const [drafts, setDrafts] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const { userFiles, loading: userFilesLoading } = useUserFiles();
  const { token, isLoading: tokenLoading, hasToken } = useFigmaToken();
  const autoSyncRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchDrafts = useCallback(
    async (query?: string, showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        const url = query
          ? `/api/figma/drafts?q=${encodeURIComponent(query)}`
          : "/api/figma/drafts";

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // Add token to headers if available
        if (token) {
          headers["x-figma-token"] = token;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar los drafts");
        }

        // Only update state if component is still mounted
        if (!mountedRef.current) return;

        // Combine API drafts with user files
        const apiDrafts = data.drafts || [];
        const combinedDrafts = [
          ...userFiles.map((file) => ({
            ...file,
            project_name: file.project_name || "Mis Archivos",
          })),
          ...apiDrafts.filter(
            (draft: FigmaDraft) =>
              !userFiles.some((userFile) => userFile.key === draft.key)
          ),
        ];

        setDrafts(combinedDrafts);
        setLastSyncTime(new Date());

        console.log(`Sync completed: ${combinedDrafts.length} files found`);
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (mountedRef.current && showLoading) {
          setLoading(false);
        }
      }
    },
    [userFiles, token]
  );

  // Auto-sync functionality
  const startAutoSync = useCallback(() => {
    if (autoSyncRef.current) {
      clearInterval(autoSyncRef.current);
    }

    if (isAutoSyncEnabled && hasToken && !tokenLoading) {
      console.log(
        "Starting auto-sync every",
        AUTO_SYNC_INTERVAL / 60000,
        "minutes"
      );
      autoSyncRef.current = setInterval(() => {
        console.log("Auto-syncing drafts...");
        fetchDrafts(undefined, false); // Don't show loading for auto-sync
      }, AUTO_SYNC_INTERVAL);
    }
  }, [isAutoSyncEnabled, hasToken, tokenLoading, fetchDrafts]);

  const stopAutoSync = useCallback(() => {
    if (autoSyncRef.current) {
      clearInterval(autoSyncRef.current);
      autoSyncRef.current = null;
      console.log("Auto-sync stopped");
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    if (!userFilesLoading && !tokenLoading && hasToken) {
      // Initial delay before first sync
      const timeout = setTimeout(() => {
        fetchDrafts();
      }, INITIAL_SYNC_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [userFilesLoading, tokenLoading, hasToken, fetchDrafts]);

  // Auto-sync setup effect
  useEffect(() => {
    if (!userFilesLoading && !tokenLoading && hasToken) {
      startAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [userFilesLoading, tokenLoading, hasToken, startAutoSync, stopAutoSync]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopAutoSync();
    };
  }, [stopAutoSync]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrafts(searchQuery.trim() || undefined);
  };

  const handleManualSync = () => {
    fetchDrafts(searchQuery.trim() || undefined, true);
  };

  const toggleAutoSync = () => {
    setIsAutoSyncEnabled(!isAutoSyncEnabled);
  };

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (draft.project_name &&
        draft.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Show loading while token is being loaded
  if (tokenLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  // Show token setup only if no token is available (neither client nor server)
  if (!hasToken) {
    return <FigmaTokenSetup />;
  }

  return (
    <div className="space-y-6">
      {" "}        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-4 flex-1">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar drafts..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Buscar
            </button>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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
              {loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </form>

          {/* Auto-sync toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutoSync}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm ${
                isAutoSyncEnabled
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isAutoSyncEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              Auto-sync
            </button>

            {/* Add Files Button */}
            <a
              href="/discovery"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2 justify-center whitespace-nowrap"
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Añadir Más Archivos
            </a>
          </div>
        </div>

        {/* Sync Status */}
        {lastSyncTime && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <svg
                className={`w-4 h-4 ${isAutoSyncEnabled ? 'text-green-500' : 'text-gray-400'}`}
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
              <span>
                Última sincronización: {lastSyncTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAutoSyncEnabled && (
                <span className="text-green-600 dark:text-green-400">
                  Auto-sync activo
                </span>
              )}
            </div>
          </div>
        )}
      {/* Info Alert */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
              Sincronización automática con Figma
            </p>
            <div className="text-blue-700 dark:text-blue-300 space-y-1">
              <p>
                • Los archivos se sincronizan automáticamente cada 5 minutos desde todos tus equipos de Figma
              </p>
              <p>
                • La app detecta automáticamente equipos accesibles y consulta todos sus proyectos
              </p>
              <p>
                • Usa <strong>&quot;Sincronizar&quot;</strong> para actualizar manualmente los archivos
              </p>
              <p>
                • Puedes desactivar la sincronización automática usando el botón &quot;Auto-sync&quot;
              </p>
              <p>• Solo se muestran archivos reales de Figma, sin datos de ejemplo</p>
            </div>
          </div>
        </div>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-800 dark:text-red-200 font-medium">
              Error:
            </span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
      )}
      {/* Results Summary */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {searchQuery ? (
              <>
                Mostrando {filteredDrafts.length} de {drafts.length} archivos
                para &quot;{searchQuery}&quot;
              </>            ) : (
              <>
                {drafts.length} archivo{drafts.length !== 1 ? "s" : ""}{" "}
                sincronizado{drafts.length !== 1 ? "s" : ""} automáticamente desde Figma
                {userFiles.length > 0 && (
                  <>
                    {" "}
                    + {userFiles.length} agregado
                    {userFiles.length !== 1 ? "s" : ""} manualmente
                  </>
                )}
                {lastSyncTime && isAutoSyncEnabled && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    • Auto-sync activo
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Drafts Grid */}
      {!loading && !error && (
        <>
          {filteredDrafts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrafts.map((draft) => (
                <DraftCard key={draft.key} draft={draft} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery
                  ? "No se encontraron drafts"
                  : "No tienes drafts agregados"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? "Intenta con una búsqueda diferente o añade más archivos."
                  : "Comienza añadiendo URLs de tus archivos de Figma."}
              </p>
              {!searchQuery && (
                <a
                  href="/discovery"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Añadir Primer Archivo
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
