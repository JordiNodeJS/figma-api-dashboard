import { FigmaDraft } from "@/types/figma";
import Image from "next/image";

interface DraftCardProps {
  draft: FigmaDraft;
}

export default function DraftCard({ draft }: DraftCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenDraft = () => {
    const figmaUrl = `https://figma.com/file/${draft.key}`;
    window.open(figmaUrl, "_blank");
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {/* Thumbnail or placeholder */}
        <div className="mb-3 aspect-video bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative">
          {draft.thumbnail_url ? (
            <Image
              src={draft.thumbnail_url}
              alt={`Preview of ${draft.name}`}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {draft.project_name === "Archivos Manuales"
                    ? "Archivo Manual"
                    : "Sin vista previa"}
                </p>
              </div>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
          {draft.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              draft.project_name === "Archivos Manuales"
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            }`}
          >
            {draft.role}
          </span>
          <time dateTime={draft.last_modified}>
            {formatDate(draft.last_modified)}
          </time>
        </div>

        {draft.project_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Proyecto: {draft.project_name}
            {draft.project_name === "Archivos Manuales" && (
              <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                (Funcionalidad limitada)
              </span>
            )}
          </p>
        )}

        <button
          onClick={handleOpenDraft}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Abrir en Figma
        </button>
      </div>
    </div>
  );
}
