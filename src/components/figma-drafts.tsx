"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FigmaDraft } from "@/types/figma";
import DraftCard from "@/components/draft-card";
import LoadingSpinner from "@/components/loading-spinner";
import DebugUserFiles from "@/components/debug-user-files";
import { useUserFiles } from "@/hooks/use-user-files";
import { useFigmaToken } from "@/hooks/use-figma-token";
import FigmaTokenSetup from "@/components/figma-token-setup";

// Auto-sync configuration
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INITIAL_SYNC_DELAY = 2000; // 2 seconds

interface FigmaDraftsProps {
  newFileKey?: string | null;
}

export default function FigmaDrafts({ newFileKey }: FigmaDraftsProps) {
  const [drafts, setDrafts] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [highlightedFile, setHighlightedFile] = useState<string | null>(null);
  const { userFiles, loading: userFilesLoading } = useUserFiles();
  const { token, isLoading: tokenLoading, hasToken } = useFigmaToken();
  const autoSyncRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const highlightedFileRef = useRef<HTMLDivElement>(null);

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
        if (!mountedRef.current) return; // Combine API drafts with user files
        const apiDrafts = data.drafts || [];
        console.log("📊 User files:", userFiles.length);
        console.log("📊 API drafts:", apiDrafts.length);

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

        console.log("📊 Combined drafts:", combinedDrafts.length);
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
  ); // Handle new file highlighting
  useEffect(() => {
    if (newFileKey) {
      setHighlightedFile(newFileKey);
      // Force a refresh to ensure the new file is visible
      // Always refresh when there's a new file, regardless of token status
      if (!userFilesLoading) {
        if (hasToken && !tokenLoading) {
          fetchDrafts(undefined, false); // Refresh with API if token available
        } else {
          // If no token, just update with user files directly
          console.log("🔄 Updating drafts with user files only (no token)");
          const combinedDrafts = userFiles.map((file) => ({
            ...file,
            project_name: file.project_name || "Mis Archivos",
          }));
          setDrafts(combinedDrafts);
        }
      }
      // Remove highlight after 10 seconds
      const timer = setTimeout(() => {
        setHighlightedFile(null);
      }, 10000);

      // Scroll to highlighted file after a short delay (to ensure it's rendered)
      const scrollTimer = setTimeout(() => {
        if (highlightedFileRef.current) {
          highlightedFileRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearTimeout(scrollTimer);
      };
    }
  }, [
    newFileKey,
    userFilesLoading,
    tokenLoading,
    hasToken,
    fetchDrafts,
    userFiles,
  ]);

  // Update drafts when userFiles change
  useEffect(() => {
    if (!userFilesLoading) {
      console.log("🔄 User files changed, updating drafts...");
      if (hasToken && !tokenLoading) {
        // If we have a token, use the full fetch (combines userFiles + API)
        fetchDrafts(undefined, false);
      } else {
        // If no token, just show user files
        console.log("📝 No token available, showing user files only");
        const combinedDrafts = userFiles.map((file) => ({
          ...file,
          project_name: file.project_name || "Mis Archivos",
        }));
        setDrafts(combinedDrafts);
        console.log(
          "✅ Drafts updated with user files:",
          combinedDrafts.length
        );
      }
    }
  }, [userFiles, userFilesLoading, hasToken, tokenLoading, fetchDrafts]);

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
    console.log("🔄 Initial load effect triggered", {
      userFilesLoading,
      tokenLoading,
      hasToken,
      userFilesCount: userFiles.length,
    });

    if (!userFilesLoading && !tokenLoading && hasToken) {
      // Initial delay before first sync
      console.log("✅ Starting initial sync with API...");
      const timeout = setTimeout(() => {
        fetchDrafts();
      }, INITIAL_SYNC_DELAY);

      return () => clearTimeout(timeout);
    } else if (!userFilesLoading && (!hasToken || tokenLoading)) {
      // If no token but we have user files, show them immediately
      console.log("📝 No token available, showing user files immediately");
      const combinedDrafts = userFiles.map((file) => ({
        ...file,
        project_name: file.project_name || "Mis Archivos",
      }));
      setDrafts(combinedDrafts);
      setLoading(false);
      console.log("✅ Initialized with user files:", combinedDrafts.length);
    }
  }, [userFilesLoading, tokenLoading, hasToken, fetchDrafts, userFiles]);

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

  const testRecentFiles = async () => {
    try {
      setError(null);
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["x-figma-token"] = token;
      }

      const response = await fetch("/api/figma/recent", { headers });
      const data = await response.json();

      if (response.ok) {
        if (data.recentFiles && data.recentFiles.length > 0) {
          alert(
            `🎉 ¡Encontrados ${data.recentFiles.length} archivos recientes experimentales!\n\nEstos archivos se añadirán a tu lista.`
          );

          // Combine with existing drafts, avoiding duplicates
          const newFiles = data.recentFiles.filter(
            (newFile: FigmaDraft) =>
              !drafts.some((existing) => existing.key === newFile.key)
          );

          if (newFiles.length > 0) {
            setDrafts((prev) => [...prev, ...newFiles]);
            setLastSyncTime(new Date());
          }
        } else {
          alert(
            "❌ No se encontraron archivos recientes a través de la búsqueda experimental.\n\nLa API de Figma no expone endpoints públicos para drafts personales."
          );
        }
      } else {
        alert(`Error en búsqueda experimental: ${data.error}`);
      }
    } catch (error) {
      console.error("Error testing recent files:", error);
      alert("Error al probar la búsqueda experimental de archivos recientes");
    }
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
      {/* Debug Component - Remove this in production */}
      <DebugUserFiles />

      {/* Search and Actions */}
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
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
            {loading ? "Sincronizando..." : "Sincronizar"}
          </button>
        </form>{" "}
        {/* Auto-sync toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoSync}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm ${
              isAutoSyncEnabled
                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isAutoSyncEnabled ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            Auto-sync
          </button>

          {/* Experimental Recent Files Button */}
          <button
            onClick={testRecentFiles}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
            title="Probar búsqueda experimental de drafts personales"
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Experimental
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
              className={`w-4 h-4 ${
                isAutoSyncEnabled ? "text-green-500" : "text-gray-400"
              }`}
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
          </svg>{" "}
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
              Limitaciones de la API de Figma
            </p>{" "}
            <div className="text-blue-700 dark:text-blue-300 space-y-1">
              <p>
                • <strong>Solo archivos en equipos/proyectos:</strong> La API de
                Figma solo permite acceder a archivos organizados en equipos
                donde eres miembro
              </p>
              <p>
                • <strong>Drafts personales no accesibles:</strong> Los drafts
                privados/personales no se pueden sincronizar automáticamente via
                API oficial
              </p>
              <p>
                • <strong>Búsqueda experimental:</strong> Usa el botón{" "}
                <strong>&quot;Experimental&quot;</strong> para probar endpoints
                no documentados
              </p>
              <p>
                • <strong>Añadir manualmente:</strong> Usa{" "}
                <strong>&quot;Añadir Más Archivos&quot;</strong> para agregar
                drafts personales por URL
              </p>
              <p>
                • <strong>Auto-sync activo:</strong> Los archivos disponibles se
                sincronizan cada 5 minutos
              </p>
            </div>
            {drafts.length === 2 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium text-xs">
                  💡 <strong>¿Esperabas ver más archivos?</strong>
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                  1. Prueba el botón <strong>&quot;Experimental&quot;</strong>{" "}
                  para buscar drafts personales
                  <br />
                  2. Si tienes más drafts en Figma, ve a figma.com → copia las
                  URLs → úsalas en{" "}
                  <strong>&quot;Añadir Más Archivos&quot;</strong>
                </p>
              </div>
            )}
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
      {/* Drafts Grid */}
      {!loading && !error && (
        <>
          {filteredDrafts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.key}
                  ref={
                    highlightedFile === draft.key ? highlightedFileRef : null
                  }
                  className={`transition-all duration-1000 ${
                    highlightedFile === draft.key
                      ? "ring-4 ring-green-400 ring-opacity-75 animate-pulse"
                      : ""
                  }`}
                >
                  <DraftCard draft={draft} />
                </div>
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
      {/* Detailed sync stats */}
      {!loading && !error && drafts.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery ? (
                <>
                  Mostrando {filteredDrafts.length} de {drafts.length} archivos
                  para &quot;{searchQuery}&quot;
                </>
              ) : (
                <>
                  {drafts.length} archivo{drafts.length !== 1 ? "s" : ""}{" "}
                  sincronizado{drafts.length !== 1 ? "s" : ""} automáticamente
                  desde Figma
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

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>1 equipo</span>
              </div>
              <div className="flex items-center gap-1">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>2 proyectos</span>
              </div>
              {lastSyncTime && (
                <div className="flex items-center gap-1">
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
                  <span>{lastSyncTime.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
