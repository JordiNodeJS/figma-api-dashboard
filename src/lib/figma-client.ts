import {
  FigmaDraft,
  FigmaUserResponse,
  FigmaFile,
  FigmaProject,
} from "@/types/figma";

const FIGMA_API_BASE = "https://api.figma.com/v1";

/**
 * Cache configuration
 */
const CACHE_DURATION = {
  TEAMS: 5 * 60 * 1000, // 5 minutes
  PROJECTS: 3 * 60 * 1000, // 3 minutes
  FILES: 2 * 60 * 1000, // 2 minutes
  USER: 10 * 60 * 1000, // 10 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Simple in-memory cache for Figma API responses
 */
class FigmaCache {
  private static cache = new Map<string, CacheEntry<unknown>>();
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }
    return entry.data as T;
  }

  static set<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  static clear(): void {
    this.cache.clear();
  }

  static clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

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
    // Check cache first
    const cachedUser = FigmaCache.get<FigmaUserResponse>("user");
    if (cachedUser) {
      console.log("Returning cached user data");
      return cachedUser;
    }

    // Fetch from API
    const userData = await this.makeRequest<FigmaUserResponse>("/me");

    // Cache the user data
    FigmaCache.set("user", userData, CACHE_DURATION.USER);

    return userData;
  }
  /**
   * Get all projects for a team
   */
  async getTeamProjects(teamId: string): Promise<{ projects: FigmaProject[] }> {
    // Check cache first
    const cachedProjects = FigmaCache.get<{ projects: FigmaProject[] }>(`projects_${teamId}`);
    if (cachedProjects) {
      console.log(`Returning cached projects for team ${teamId}`);
      return cachedProjects;
    }

    // Fetch from API
    const projectsResponse = await this.makeRequest<{ projects: FigmaProject[] }>(
      `/teams/${teamId}/projects`
    );

    // Cache the projects data
    FigmaCache.set(`projects_${teamId}`, projectsResponse, CACHE_DURATION.PROJECTS);

    return projectsResponse;
  }

  /**
   * Get files in a project
   */
  async getProjectFiles(projectId: string): Promise<{ files: FigmaFile[] }> {
    // Check cache first
    const cachedFiles = FigmaCache.get<{ files: FigmaFile[] }>(`files_${projectId}`);
    if (cachedFiles) {
      console.log(`Returning cached files for project ${projectId}`);
      return cachedFiles;
    }

    // Fetch from API
    const filesResponse = await this.makeRequest<{ files: FigmaFile[] }>(
      `/projects/${projectId}/files`
    );

    // Cache the files data
    FigmaCache.set(`files_${projectId}`, filesResponse, CACHE_DURATION.FILES);

    return filesResponse;
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
  }  /**
   * Get recent files (drafts) for the authenticated user
   * Note: Figma API doesn't provide a direct endpoint for user's recent files
   * This method returns an empty array - files should come from team projects
   */
  async getRecentFiles(): Promise<FigmaDraft[]> {
    try {
      // Get user information first
      const user = await this.getUser();
      console.log("Fetching files for user:", user.handle);

      // Unfortunately, Figma API doesn't provide a direct way to list all user files
      // The API requires specific access patterns:
      // 1. Team project access (requires team membership)
      // 2. Specific file keys/URLs (requires knowing the file beforehand)
      // 3. Organization access (enterprise features)

      console.log("Note: Recent files must come from team projects or manual file addition");
      
      // Return empty array - real files should come from getTeamFiles()
      return [];
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

  /**
   * Get team projects and their files automatically
   */ async getTeamFiles(teamId: string): Promise<FigmaDraft[]> {
    try {
      console.log(`=== FIGMA CLIENT: Fetching files for team: ${teamId} ===`);

      // First, get all projects for the team
      const projectsResponse = await this.getTeamProjects(teamId);
      const projects = projectsResponse.projects;

      console.log(
        `Found ${projects.length} projects in team:`,
        projects.map((p) => p.name)
      );

      const allFiles: FigmaDraft[] = [];

      // For each project, get all files
      for (const project of projects) {
        try {
          console.log(
            `Fetching files for project: ${project.name} (ID: ${project.id})`
          );
          const filesResponse = await this.getProjectFiles(project.id);

          console.log(`Raw files response for ${project.name}:`, filesResponse);

          // Convert files to FigmaDraft format
          const projectFiles: FigmaDraft[] = filesResponse.files.map(
            (file) => ({
              key: file.key,
              name: file.name,
              thumbnail_url: file.thumbnail_url,
              last_modified: file.last_modified,
              role: "viewer", // Default role, could be determined from file details
              project_id: project.id,
              project_name: project.name,
            })
          );

          console.log(
            `Found ${projectFiles.length} files in project: ${project.name}`,
            projectFiles.map((f) => f.name)
          );
          allFiles.push(...projectFiles);
        } catch (projectError) {
          console.error(
            `Error fetching files for project ${project.name}:`,
            projectError
          );
          // Continue with other projects even if one fails
        }
      }

      console.log(`=== TOTAL FILES FOUND: ${allFiles.length} ===`);
      console.log(
        "All files:",
        allFiles.map((f) => ({ name: f.name, project: f.project_name }))
      );
      return allFiles;
    } catch (error) {
      console.error("Error fetching team files:", error);
      throw error;
    }
  }

  /**
   * Extract team ID from Figma team URL
   */
  static extractTeamId(url: string): string | null {
    const teamIdMatch = url.match(/figma\.com\/files\/team\/([0-9]+)/);
    return teamIdMatch ? teamIdMatch[1] : null;
  }
  /**
   * Get all accessible files from Figma (only real files, no mock data)
   */
  async getAllAccessibleFiles(): Promise<FigmaDraft[]> {
    try {
      console.log("=== GETTING ALL ACCESSIBLE FILES (REAL ONLY) ===");
      
      // Get all drafts from all accessible teams
      const allFiles = await this.getAllUserDrafts();
      
      console.log(`=== TOTAL REAL FILES FOUND: ${allFiles.length} ===`);
      return allFiles;
    } catch (error) {
      console.error("Error getting all accessible files:", error);
      throw error;
    }
  }

  /**
   * Get all teams accessible to the user
   */
  async getUserTeams(): Promise<{ id: string; name: string }[]> {
    try {
      console.log("=== GETTING USER TEAMS ===");

      // First get user info to see what teams they belong to
      const user = await this.getUser();
      console.log("User info:", user);

      // Unfortunately, Figma API doesn't provide a direct way to list all teams
      // The user object might contain team information, but it's limited

      // For now, return the hardcoded team we know about
      return [
        {
          id: "958458320512591682",
          name: "Your Team (from URL)",
        },
      ];
    } catch (error) {
      console.error("Error getting user teams:", error);
      return [];
    }
  }

  /**
   * Get all teams accessible to the current user
   * Note: Figma API doesn't provide a direct endpoint to list user teams
   * This attempts to get teams from user profile or known team IDs
   */
  async getUserAccessibleTeams(): Promise<{ id: string; name: string }[]> {
    try {
      console.log("=== GETTING USER ACCESSIBLE TEAMS ===");
      
      // Get user info to extract team information
      const user = await this.getUser();
      console.log("User profile data:", JSON.stringify(user, null, 2));
      
      // Known teams from URL or configuration
      const knownTeams = [
        {
          id: "958458320512591682",
          name: "Your Team (from URL)"
        }
      ];

      // Try to extract team IDs from user data if available
      // Figma user response might contain team information in various formats
      const userTeamIds: string[] = [];
      
      // Check if user object has team information
      if (user && typeof user === 'object') {
        // Look for team references in user object
        const userStr = JSON.stringify(user);
        const teamMatches = userStr.match(/["\']?team["\']?\s*:\s*["\']?(\d+)["\']?/gi);
        if (teamMatches) {
          teamMatches.forEach(match => {
            const idMatch = match.match(/(\d+)/);
            if (idMatch && idMatch[1] && !userTeamIds.includes(idMatch[1])) {
              userTeamIds.push(idMatch[1]);
            }
          });
        }
      }

      // Add discovered team IDs to known teams
      userTeamIds.forEach(teamId => {
        if (!knownTeams.some(team => team.id === teamId)) {
          knownTeams.push({
            id: teamId,
            name: `Team ${teamId} (auto-detected)`
          });
        }
      });

      console.log(`Testing access to ${knownTeams.length} teams:`, knownTeams.map(t => t.name));

      // Validate that we can access each team
      const accessibleTeams: { id: string; name: string }[] = [];
      
      for (const team of knownTeams) {
        try {
          console.log(`Testing access to team: ${team.name} (${team.id})`);
          const projects = await this.getTeamProjects(team.id);
          console.log(`✅ Access confirmed for team ${team.name}: ${projects.projects.length} projects`);
          
          // Update team name with project count
          accessibleTeams.push({
            ...team,
            name: `${team.name} (${projects.projects.length} projects)`
          });
        } catch (error) {
          console.log(`❌ No access to team ${team.name}:`, error);
        }
      }

      console.log(`Found ${accessibleTeams.length} accessible teams`);
      return accessibleTeams;
    } catch (error) {
      console.error("Error getting user accessible teams:", error);
      return [];
    }
  }

  /**
   * Get all drafts from all accessible teams
   */
  async getAllUserDrafts(): Promise<FigmaDraft[]> {
    try {
      console.log("=== GETTING ALL USER DRAFTS ===");
      const allDrafts: FigmaDraft[] = [];
      
      // Get all accessible teams
      const teams = await this.getUserAccessibleTeams();
      
      for (const team of teams) {
        try {
          console.log(`Getting files from team: ${team.name}`);
          const teamFiles = await this.getTeamFiles(team.id);
          
          // Mark files with team information
          const teamDrafts = teamFiles.map(file => ({
            ...file,
            team_id: team.id,
            team_name: team.name
          }));
          
          allDrafts.push(...teamDrafts);
          console.log(`Added ${teamFiles.length} files from team ${team.name}`);
        } catch (error) {
          console.error(`Error getting files from team ${team.name}:`, error);
        }
      }
      
      console.log(`=== TOTAL USER DRAFTS: ${allDrafts.length} ===`);
      return allDrafts;
    } catch (error) {
      console.error("Error getting all user drafts:", error);
      throw error;
    }
  }
}
