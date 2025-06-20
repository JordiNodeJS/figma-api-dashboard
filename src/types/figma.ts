/**
 * Figma API types and interfaces
 */

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
  role: string;
}

export interface FigmaProject {
  id: string;
  name: string;
  files: FigmaFile[];
}

export interface FigmaTeam {
  id: string;
  name: string;
  projects: FigmaProject[];
}

export interface FigmaApiResponse<T> {
  meta?: {
    projects?: FigmaProject[];
  };
  data?: T;
  error?: string;
}

export interface FigmaDraft {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
  role: string;
  project_id?: string;
  project_name?: string;
}

export interface FigmaUserResponse {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}
