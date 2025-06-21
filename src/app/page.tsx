"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FigmaDrafts from "@/components/figma-drafts";
import FigmaProjects from "@/components/figma-projects";
import FigmaTokenStatus from "@/components/figma-token-status";
import SyncLog from "@/components/sync-log";

type TabType = "drafts" | "projects";

export default function Home() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabType | null;
  const newFileKey = searchParams.get("new");
  const newFileName = searchParams.get("name");
  const isManualFile = searchParams.get("manual") === "true";
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [showNotification, setShowNotification] = useState(false);

  // Set tab from URL parameter on mount
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === "drafts" || tabFromUrl === "projects")) {
      setActiveTab(tabFromUrl);
    }

    // Show notification if a new file was added
    if (newFileKey && newFileName) {
      setShowNotification(true);
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [tabFromUrl, newFileKey, newFileName]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Notification */}
        {showNotification && newFileName && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
            <div
              className={`p-4 rounded-lg shadow-lg border-l-4 ${
                isManualFile
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600"
                  : "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 mt-0.5 ${
                      isManualFile ? "text-yellow-400" : "text-green-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isManualFile
                          ? "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          : "M5 13l4 4L19 7"
                      }
                    />
                  </svg>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isManualFile
                        ? "text-yellow-800 dark:text-yellow-200"
                        : "text-green-800 dark:text-green-200"
                    }`}
                  >
                    {isManualFile
                      ? "Archivo añadido manualmente"
                      : "¡Archivo añadido exitosamente!"}
                  </p>
                  <p
                    className={`mt-1 text-sm ${
                      isManualFile
                        ? "text-yellow-700 dark:text-yellow-300"
                        : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {decodeURIComponent(newFileName)}
                  </p>
                  {isManualFile && (
                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                      Funcionalidad limitada para archivos de la comunidad
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setShowNotification(false)}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isManualFile
                        ? "text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:ring-yellow-600"
                        : "text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 focus:ring-green-600"
                    }`}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Figma Cursor
          </h1>
          <div className="flex gap-3 items-center">
            <FigmaTokenStatus />
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("projects")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "projects"
                    ? "border-purple-500 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
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
                  Proyectos
                </div>
              </button>
              <button
                onClick={() => setActiveTab("drafts")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "drafts"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Drafts
                </div>
              </button>
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "projects" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Proyectos del Equipo
              </h2>
              <FigmaProjects />
            </div>
          )}
          {activeTab === "drafts" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Tus Drafts de Figma
              </h2>
              <FigmaDrafts newFileKey={newFileKey} />
            </div>
          )}
        </div>
      </div>

      {/* Sync Log - Fixed position */}
      <SyncLog />
    </div>
  );
}
