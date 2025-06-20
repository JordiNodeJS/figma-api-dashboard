"use client";

import { useState, useEffect, useCallback } from "react";
import { FigmaDraft } from "@/types/figma";
import DraftCard from "@/components/draft-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useUserFiles } from "@/hooks/use-user-files";
import { useFigmaToken } from "@/hooks/use-figma-token";
import FigmaTokenSetup from "@/components/figma-token-setup";

export default function FigmaDrafts() {
  const [drafts, setDrafts] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { userFiles, loading: userFilesLoading } = useUserFiles();
  const { token, isLoading: tokenLoading } = useFigmaToken();

  const fetchDrafts = useCallback(
    async (query?: string) => {
      try {
        setLoading(true);
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [userFiles, token]
  );

  useEffect(() => {
    if (!userFilesLoading && !tokenLoading) {
      fetchDrafts();
    }
  }, [userFilesLoading, tokenLoading, userFiles, fetchDrafts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrafts(searchQuery.trim() || undefined);
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

  // Show token setup if no token is available
  if (!token) {
    return <FigmaTokenSetup />;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-4">
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
          onClick={() => fetchDrafts()}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </form>

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
          </svg>
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
              Información sobre el acceso a archivos
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Para ver tus archivos reales de Figma, usa el botón &quot;Añadir
              Archivos&quot; para agregar URLs específicas de tus proyectos. Los
              archivos mostrados son desde tu token de Figma.
            </p>
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
