"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "@/components/loading-spinner";
import SyncLog from "@/components/sync-log";
import { useUserFiles } from "@/hooks/use-user-files";

interface FileDiscoveryResult {
  url: string;
  fileKey: string;
  accessible: boolean;
  fileData?: {
    key: string;
    name: string;
    role: string;
    thumbnail_url?: string;
    last_modified?: string;
  };
  error?: string;
}

export default function FileDiscoveryTool() {
  const router = useRouter();
  const [discoveryMethod, setDiscoveryMethod] = useState<"manual" | "team">(
    "manual"
  );
  const [fileUrl, setFileUrl] = useState("");
  const [teamId, setTeamId] = useState("");
  const [results, setResults] = useState<FileDiscoveryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null); // Track which file is being added
  const [showHelp, setShowHelp] = useState(true);
  const { addUserFile } = useUserFiles();

  const discoverFileByUrl = async (url: string) => {
    try {
      const response = await fetch("/api/figma/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          url,
          fileKey: data.file.key,
          accessible: true,
          fileData: data.file,
        };
      } else {
        return {
          url,
          fileKey:
            url.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/)?.[1] || "",
          accessible: false,
          error: data.error,
        };
      }
    } catch (error) {
      return {
        url,
        fileKey: "",
        accessible: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const handleManualDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim()) return;

    setLoading(true);
    const result = await discoverFileByUrl(fileUrl.trim());
    setResults((prev) => [result, ...prev]);
    setFileUrl("");
    setLoading(false);
  };
  const addToMyFiles = async (fileData: {
    key: string;
    name: string;
    role: string;
    thumbnail_url?: string;
    last_modified?: string;
  }) => {
    try {
      setAdding(fileData.key);

      // Add to both localStorage and server
      await addUserFile({
        key: fileData.key,
        name: fileData.name,
        role: fileData.role,
        thumbnail_url: fileData.thumbnail_url,
        last_modified: fileData.last_modified || new Date().toISOString(),
        project_name: "Mis Archivos",
      });

      // Wait a bit longer to ensure the state update propagates
      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log("🚀 Redirecting to drafts with new file:", fileData.key);

      // Redirect to main page with drafts tab and highlight the new file
      router.push(
        `/?tab=drafts&new=${fileData.key}&name=${encodeURIComponent(
          fileData.name
        )}`
      );
    } catch (error) {
      console.error("Error adding file:", error);
      alert("Error al añadir archivo");
      setAdding(null);
    }
  };
  const addFileManually = async (url: string, fileName?: string) => {
    try {
      // Extract file key from URL
      const fileKeyMatch = url.match(
        /figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/
      );

      if (!fileKeyMatch) {
        alert("URL de Figma inválida");
        return;
      }

      const fileKey = fileKeyMatch[1];
      setAdding(fileKey);
      const defaultName = fileName || `Archivo de Figma (${fileKey})`;

      // Add directly to both localStorage and server
      await addUserFile({
        key: fileKey,
        name: defaultName,
        role: "viewer", // Default role for community files
        last_modified: new Date().toISOString(),
        project_name: "Archivos Manuales",
        thumbnail_url: undefined, // Will be empty for community files
      });

      // Wait a bit longer to ensure the state update propagates
      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log("🚀 Redirecting to drafts with manual file:", fileKey);

      // Redirect to main page with drafts tab and highlight the new file
      router.push(
        `/?tab=drafts&new=${fileKey}&name=${encodeURIComponent(
          defaultName
        )}&manual=true`
      );
    } catch (error) {
      console.error("Error adding file manually:", error);
      alert("Error al añadir archivo manualmente");
      setAdding(null);
    }
  };

  const handleTeamDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the team ID from your URL if not provided
    const finalTeamId = teamId.trim() || "958458320512591682";

    setLoading(true);

    try {
      const response = await fetch("/api/figma/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: finalTeamId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Convert team files to discovery results format
        const teamResults: FileDiscoveryResult[] = data.files.map(
          (file: {
            key: string;
            name: string;
            role: string;
            thumbnail_url?: string;
            last_modified?: string;
          }) => ({
            url: `https://www.figma.com/design/${file.key}/${file.name.replace(
              /\s+/g,
              "-"
            )}`,
            fileKey: file.key,
            accessible: true,
            fileData: {
              key: file.key,
              name: file.name,
              role: file.role,
              thumbnail_url: file.thumbnail_url,
              last_modified: file.last_modified,
            },
          })
        );

        setResults(teamResults);

        // Show success message
        alert(`¡Encontrados ${data.filesCount} archivos en el equipo!`);
      } else {
        // Handle specific errors
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching team files:", error);
      alert("Error al conectar con el equipo de Figma");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {" "}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>{" "}
            <span className="font-medium">Volver a Inicio</span>
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Descubrir Archivos de Figma
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Encuentra y añade tus archivos de Figma a la aplicación
            </p>
          </div>
        </div>
      </div>
      {/* Help Section for Personal Drafts */}
      {showHelp && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  💡 ¿Cómo encontrar tus drafts personales de Figma?
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-3 text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <p className="font-medium">
                  La API de Figma solo puede acceder a archivos en
                  equipos/proyectos. Los drafts personales no son accesibles
                  automáticamente.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      🔍 Paso 1: Encontrar tus drafts en Figma
                    </h4>{" "}
                    <ul className="text-xs space-y-1">
                      <li>
                        • Ve a <strong>figma.com</strong> en tu navegador
                      </li>
                      <li>
                        • Busca en tu página principal o &quot;Recents&quot;
                      </li>
                      <li>
                        • Mira en la sección &quot;Drafts&quot; de tu perfil
                      </li>
                      <li>• Revisa archivos no organizados en equipos</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      📋 Paso 2: Copiar URLs de tus drafts
                    </h4>
                    <ul className="text-xs space-y-1">
                      <li>• Abre cada draft que quieras añadir</li>
                      <li>• Copia la URL completa del navegador</li>
                      <li>• Pégala en el campo &quot;URL Manual&quot; abajo</li>
                      <li>• Repite para cada draft personal</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>💡 Tip:</strong> Una vez añadidos aquí, tus drafts
                    personales aparecerán junto con los archivos sincronizados
                    automáticamente en la página principal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Method Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Método de Descubrimiento
        </h2>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setDiscoveryMethod("manual")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              discoveryMethod === "manual"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            URL Manual
          </button>
          <button
            onClick={() => setDiscoveryMethod("team")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              discoveryMethod === "team"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Por Equipo
          </button>
        </div>
        {discoveryMethod === "manual" && (
          <form onSubmit={handleManualDiscovery} className="space-y-4">
            {" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL del Archivo de Figma
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://www.figma.com/file/abc123/mi-archivo"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
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
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      Archivos de la Comunidad
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Los archivos públicos de la comunidad de Figma pueden no
                      ser completamente accesibles a través de la API. Si el
                      archivo no se puede verificar automáticamente, podrás
                      añadirlo manualmente con funcionalidad limitada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              Verificar Archivo
            </button>
          </form>
        )}{" "}
        {discoveryMethod === "team" && (
          <form onSubmit={handleTeamDiscovery} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID del Equipo (opcional)
              </label>
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="958458320512591682 (se usará por defecto si está vacío)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Si lo dejas vacío, se usará tu team ID por defecto:
                958458320512591682
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              Listar Archivos del Equipo
            </button>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>¡Nuevo!</strong> Esta funcionalidad listará
                automáticamente todos los archivos de tu equipo de Figma. Puede
                tardar unos momentos si tienes muchos proyectos.
              </p>
            </div>
          </form>
        )}
      </div>
      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Archivos Descubiertos
          </h2>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                data-testid="discovered-file"
                className={`p-4 rounded-lg border ${
                  result.accessible
                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                    : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {result.accessible ? (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-red-600"
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
                      )}
                      <span
                        className={`font-medium ${
                          result.accessible
                            ? "text-green-800 dark:text-green-200"
                            : "text-red-800 dark:text-red-200"
                        }`}
                      >
                        {result.accessible ? "Accesible" : "No Accesible"}
                      </span>
                    </div>{" "}
                    {result.fileData && (
                      <div className="mb-3">
                        {/* Thumbnail preview */}
                        {result.fileData.thumbnail_url && (
                          <div className="mb-2 aspect-video bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative max-w-xs">
                            <Image
                              src={result.fileData.thumbnail_url}
                              alt={`Preview of ${result.fileData.name}`}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {result.fileData.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Clave: {result.fileData.key} | Rol:{" "}
                          {result.fileData.role}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                      {result.url}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Error: {result.error}
                      </p>
                    )}
                  </div>{" "}
                  {result.accessible && result.fileData && (
                    <button
                      onClick={() =>
                        result.fileData && addToMyFiles(result.fileData)
                      }
                      disabled={adding === result.fileData.key}
                      className={`ml-4 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors duration-200 flex items-center gap-2 ${
                        adding === result.fileData.key
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {adding === result.fileData.key ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Añadiendo...
                        </>
                      ) : (
                        "Añadir"
                      )}
                    </button>
                  )}
                  {!result.accessible && (
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => addFileManually(result.url)}
                        disabled={adding === result.fileKey}
                        className={`text-white text-sm font-medium py-1 px-3 rounded-md transition-colors duration-200 flex items-center gap-2 ${
                          adding === result.fileKey
                            ? "bg-yellow-400 cursor-not-allowed"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                        title="Añadir archivo manualmente (funcionalidad limitada)"
                      >
                        {adding === result.fileKey ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Añadiendo...
                          </>
                        ) : (
                          "Añadir Manual"
                        )}
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Los archivos de la comunidad pueden tener acceso
                        limitado
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Help Section */}
      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Cómo Obtener URLs de Tus Archivos
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Método 1 - Desde Figma Web:</strong>
              <ol className="list-decimal list-inside mt-1 ml-4 space-y-1">
                <li>Ve a https://www.figma.com</li>
                <li>Abre cualquier archivo tuyo</li>
                <li>Copia la URL del navegador</li>
                <li>Pégala en el campo de arriba</li>
              </ol>
            </div>

            <div>
              <strong>Método 2 - Desde Figma Desktop:</strong>
              <ol className="list-decimal list-inside mt-1 ml-4 space-y-1">
                <li>Abre un archivo en Figma Desktop</li>
                <li>Ve a Archivo → Copiar enlace</li>
                <li>Pega el enlace aquí</li>
              </ol>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Ocultar Ayuda
          </button>{" "}
        </div>
      )}

      {/* Sync Log - Fixed position */}
      <SyncLog />
    </div>
  );
}
