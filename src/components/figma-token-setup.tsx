"use client";

import { useState } from "react";
import { useFigmaToken } from "@/hooks/use-figma-token";

export default function FigmaTokenSetup() {
  const { token, saveToken, clearToken } = useFigmaToken();
  const [inputToken, setInputToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Verify token by making a test API call
      const response = await fetch("/api/figma/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: inputToken.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Token inválido");
      }

      // Save token if verification successful
      saveToken(inputToken.trim());
      setInputToken("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error verificando el token"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearToken = () => {
    clearToken();
    setError(null);
  };

  if (token) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
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
            <div className="text-sm">
              <p className="text-green-800 dark:text-green-200 font-medium mb-1">
                Token de Figma Configurado
              </p>
              <p className="text-green-700 dark:text-green-300">
                Tu token está configurado y funcionando correctamente.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs text-green-600 dark:text-green-400 hover:underline"
                >
                  {showToken ? "Ocultar" : "Mostrar"} token
                </button>
                {showToken && (
                  <code className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded font-mono">
                    {token.substring(0, 8)}...
                    {token.substring(token.length - 8)}
                  </code>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClearToken}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
            title="Eliminar token"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <svg
          className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Token de Figma Requerido
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
            Para acceder a tus archivos y proyectos de Figma, necesitas
            proporcionar tu token de acceso personal.
          </p>
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-md mb-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              ¿Cómo obtener tu token de Figma?
            </p>{" "}
            <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>
                1. Ve a{" "}
                <a
                  href="https://www.figma.com/developers/api#access-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-600"
                >
                  Figma Settings
                </a>
              </li>
              <li>2. Genera un nuevo &quot;Personal access token&quot;</li>
              <li>3. Copia el token y pégalo aquí</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="figma-token"
            className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2"
          >
            Token de Acceso de Figma
          </label>
          <input
            id="figma-token"
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="figd_..."
            className="w-full px-4 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-yellow-900/20 dark:text-white"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isVerifying || !inputToken.trim()}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
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
              Verificando...
            </>
          ) : (
            <>
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
              Configurar Token
            </>
          )}
        </button>
      </form>
    </div>
  );
}
