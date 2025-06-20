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
        {" "}
        {draft.thumbnail_url && (
          <div className="mb-3 aspect-video bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative">
            <Image
              src={draft.thumbnail_url}
              alt={`Preview of ${draft.name}`}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
          {draft.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
            {draft.role}
          </span>
          <time dateTime={draft.last_modified}>
            {formatDate(draft.last_modified)}
          </time>
        </div>
        {draft.project_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Proyecto: {draft.project_name}
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
