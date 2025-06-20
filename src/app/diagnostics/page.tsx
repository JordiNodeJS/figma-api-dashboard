"use client";

import { useState } from "react";

export default function DiagnosticsPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/figma/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Error al verificar la URL");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };
  const testEndpoints = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoints = [
        { name: "Usuario", url: "/api/figma/user" },
        { name: "Equipos", url: "/api/figma/teams" },
        { name: "Drafts", url: "/api/figma/drafts" },
        { name: "Test API", url: "/api/figma/test" },
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint.url);
            const data = await response.json();
            return {
              name: endpoint.name,
              status: response.status,
              success: response.ok,
              data: data,
            };
          } catch (error) {
            return {
              name: endpoint.name,
              status: "ERROR",
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      );

      setResult({ endpointTests: results });
    } catch {
      setError("Error al probar endpoints");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Diagnóstico de URLs de Figma
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Herramienta para verificar y diagnosticar problemas con URLs de
            Figma
          </p>
        </div>

        {/* Verificación de URL específica */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Verificar URL de Figma
          </h2>

          <form onSubmit={verifyUrl} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                URL de Figma
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.figma.com/file/abc123/mi-archivo"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? "Verificando..." : "Verificar URL"}
            </button>
          </form>
        </div>

        {/* Test de endpoints */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test de Endpoints de API
          </h2>

          <button
            onClick={testEndpoints}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? "Probando..." : "Probar Todos los Endpoints"}
          </button>
        </div>

        {/* Resultados */}
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

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resultados
            </h3>

            <pre className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Información útil */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Información Útil
          </h3>

          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Formato correcto de URLs:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>https://www.figma.com/file/FILE_KEY/NOMBRE</li>
                <li>https://www.figma.com/design/FILE_KEY/NOMBRE</li>
              </ul>
            </div>

            <div>
              <strong>Endpoints disponibles:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>/api/figma/user - Información de usuario</li>
                <li>/api/figma/drafts - Lista de drafts</li>
                <li>/api/figma/verify - Verificar URL específica</li>
                <li>/api/figma/test - Test de conexión</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
