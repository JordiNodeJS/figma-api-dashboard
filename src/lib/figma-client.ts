import {
  FigmaDraft,
  FigmaUserResponse,
  FigmaFile,
  FigmaProject,
} from "@/types/figma";

const FIGMA_API_BASE = "https://api.figma.com/v1";

/**
 * Additional Figma API types
 */
interface FigmaFileResponse {
  document: Record<string, unknown>;
  components: Record<string, unknown>;
  schemaVersion: number;
  styles: Record<string, unknown>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
}

/**
 * Figma API client for interacting with Figma's REST API
 */
export class FigmaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: {
        "X-Figma-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Figma API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get current user information
   */
  async getUser(): Promise<FigmaUserResponse> {
    return this.makeRequest<FigmaUserResponse>("/me");
  }
  /**
   * Get all projects for a team
   */
  async getTeamProjects(teamId: string): Promise<{ projects: FigmaProject[] }> {
    return this.makeRequest<{ projects: FigmaProject[] }>(
      `/teams/${teamId}/projects`
    );
  }

  /**
   * Get files in a project
   */
  async getProjectFiles(projectId: string): Promise<{ files: FigmaFile[] }> {
    return this.makeRequest<{ files: FigmaFile[] }>(
      `/projects/${projectId}/files`
    );
  }

  /**
   * Get file details including thumbnail
   */
  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    return this.makeRequest<FigmaFileResponse>(`/files/${fileKey}`);
  }

  /**
   * Get file images/thumbnails
   */
  async getFileImages(
    fileKey: string,
    options: { format?: "jpg" | "png" | "svg"; scale?: number } = {}
  ): Promise<{ images: Record<string, string> }> {
    const params = new URLSearchParams();
    params.append("ids", fileKey);
    if (options.format) params.append("format", options.format);
    if (options.scale) params.append("scale", options.scale.toString());

    return this.makeRequest<{ images: Record<string, string> }>(
      `/images/${fileKey}?${params.toString()}`
    );
  }
  /**
   * Get recent files (drafts) for the authenticated user
   * Note: This is a simplified implementation as Figma's API access depends on your plan
   */
  async getRecentFiles(): Promise<FigmaDraft[]> {
    try {
      // Get user information first
      const user = await this.getUser();
      console.log("Fetching files for user:", user.handle);

      // Note: The Figma API doesn't provide a direct way to list all files
      // You typically need:
      // 1. Specific file keys/URLs
      // 2. Team access (requires team admin privileges)
      // 3. Or use Figma's webhooks/plugins for file discovery

      // For demonstration, return some example files with proper Figma URL structure
      const mockDrafts: FigmaDraft[] = [
        {
          key: "sample-file-key-1",
          name: "Mi Primer Diseño",
          thumbnail_url: undefined, // Thumbnails require specific API calls with file keys
          last_modified: new Date(Date.now() - 3600000).toISOString(),
          role: "owner",
          project_id: "sample-project-1",
          project_name: "Proyectos Personales",
        },
        {
          key: "sample-file-key-2",
          name: "Componentes UI",
          thumbnail_url: undefined,
          last_modified: new Date(Date.now() - 7200000).toISOString(),
          role: "editor",
          project_id: "sample-project-2",
          project_name: "Design System",
        },
      ];

      return mockDrafts;
    } catch (error) {
      console.error("Error fetching recent files:", error);
      throw error;
    }
  }

  /**
   * Search for files by name
   */
  async searchFiles(query: string): Promise<FigmaDraft[]> {
    try {
      // Get all recent files and filter by query
      const allFiles = await this.getRecentFiles();

      return allFiles.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching files:", error);
      throw error;
    }
  }

  /**
   * Verify if a file exists and get its real information
   * This is useful for validating file keys from user input
   */
  async verifyFile(fileKey: string): Promise<FigmaDraft | null> {
    try {
      const fileData = await this.getFile(fileKey);

      return {
        key: fileKey,
        name: fileData.name,
        thumbnail_url: fileData.thumbnailUrl,
        last_modified: fileData.lastModified,
        role: fileData.role,
      };
    } catch (error) {
      console.error(`File ${fileKey} not found or not accessible:`, error);
      return null;
    }
  }

  /**
   * Get real file thumbnails
   */
  async getFileThumbnails(fileKeys: string[]): Promise<Record<string, string>> {
    try {
      const thumbnails: Record<string, string> = {};

      for (const fileKey of fileKeys) {
        try {
          const images = await this.getFileImages(fileKey, {
            format: "png",
            scale: 1,
          });
          if (images.images && images.images[fileKey]) {
            thumbnails[fileKey] = images.images[fileKey];
          }
        } catch (error) {
          console.error(`Could not get thumbnail for ${fileKey}:`, error);
        }
      }

      return thumbnails;
    } catch (error) {
      console.error("Error getting file thumbnails:", error);
      return {};
    }
  }

  /**
   * Add a file to the user's accessible files by URL
   */
  async addFileByUrl(url: string): Promise<FigmaDraft | null> {
    try {
      // Extract file key from URL
      const fileKeyMatch = url.match(
        /figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/
      );

      if (!fileKeyMatch) {
        throw new Error("Invalid Figma URL format");
      }

      const fileKey = fileKeyMatch[1];

      // Try to get file information
      const fileData = await this.getFile(fileKey);

      return {
        key: fileKey,
        name: fileData.name,
        thumbnail_url: fileData.thumbnailUrl,
        last_modified: fileData.lastModified,
        role: fileData.role,
      };
    } catch (error) {
      console.error("Error adding file by URL:", error);
      return null;
    }
  }
}
