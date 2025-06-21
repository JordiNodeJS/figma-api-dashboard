"use client";

import { FigmaProject } from "@/types/figma";
import Image from "next/image";

interface ProjectCardProps {
  project: FigmaProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const handleClick = () => {
    // Construir URL de Figma para el proyecto
    const figmaUrl = `https://www.figma.com/files/project/${project.id}`;
    window.open(figmaUrl, "_blank", "noopener,noreferrer");
  };

  const handleFileClick = (fileKey: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se abra el proyecto
    const figmaFileUrl = `https://www.figma.com/design/${fileKey}`;
    window.open(figmaFileUrl, "_blank", "noopener,noreferrer");
  };

  // Obtener hasta 4 archivos para mostrar en la previsualización
  const previewFiles = project.files?.slice(0, 4) || [];
  const hasMoreFiles = (project.files?.length || 0) > 4;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group">
      {/* Project Header */}
      <div onClick={handleClick} className="p-6 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {project.name}
            </h3>
          </div>
          <div className="ml-3 flex-shrink-0">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
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
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{project.files?.length || 0} archivos</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium">Abrir proyecto</span>
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Files Preview */}
      {previewFiles.length > 0 && (
        <div className="px-6 pb-4">
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Archivos del proyecto
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {previewFiles.map((file) => (
                <div
                  key={file.key}
                  onClick={(e) => handleFileClick(file.key, e)}
                  className="relative group/file cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-full h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-md mb-2 flex items-center justify-center relative overflow-hidden">
                    {" "}
                    {file.thumbnail_url ? (
                      <Image
                        src={file.thumbnail_url}
                        alt={file.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/file:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white opacity-0 group-hover/file:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* File info */}
                  <div className="text-xs">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {file.last_modified
                        ? new Date(file.last_modified).toLocaleDateString(
                            "es-ES",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Sin fecha"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* More files indicator */}
            {hasMoreFiles && (
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{(project.files?.length || 0) - 4} archivos más
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project ID (for debugging) */}
      <div className="px-6 pb-4">
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            ID: {project.id}
          </p>
        </div>
      </div>
    </div>
  );
}
