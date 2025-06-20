"use client";

import { useFigmaToken } from "@/hooks/use-figma-token";

export default function FigmaTokenStatus() {
  const { token, clearToken, hasToken, hasServerToken } = useFigmaToken();

  if (!hasToken) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-md text-sm">
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {hasServerToken && !token
          ? "Conectado (Token del servidor)"
          : "Conectado a Figma"}
      </span>
      {/* Only show disconnect button if user has a client token */}
      {token && (
        <button
          onClick={clearToken}
          className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
          title="Desconectar"
        >
          <svg
            className="w-3 h-3"
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
      )}
    </div>
  );
}
