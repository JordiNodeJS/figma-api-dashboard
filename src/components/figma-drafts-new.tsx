"use client";

import { useState, useEffect, useCallback } from "react";
import { FigmaDraft } from "@/types/figma";
import DraftCard from "@/components/draft-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useUserFiles } from "@/hooks/use-user-files";

export default function FigmaDrafts() {
  const [drafts, setDrafts] = useState<FigmaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { userFiles, loading: userFilesLoading } = useUserFiles();
  const fetchDrafts = useCallback(
    async (query?: string) => {
      try {
        setLoading(true);
        setError(null);

        const url = query
          ? `/api/figma/drafts?q=${encodeURIComponent(query)}`
          : "/api/figma/drafts";

        const response = await fetch(url);
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
    [userFiles]
  );
  useEffect(() => {
    if (!userFilesLoading) {
      fetchDrafts();
    }
  }, [userFilesLoading, userFiles, fetchDrafts]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Figma Cursor
          </h1>
          <div className="flex gap-3">
            <a
              href="/discovery"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
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
              Añadir Archivos
            </a>
            <a
              href="/diagnostics"
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
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
              Diagnósticos
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Tus Drafts de Figma
          </h2>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
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
                  Para ver tus archivos reales de Figma, usa el botón
                  &quot;Añadir Archivos&quot; para agregar URLs específicas de
                  tus proyectos. Los archivos mostrados sin agregar son ejemplos
                  de demostración.
                </p>
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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
    </div>
  );
}
