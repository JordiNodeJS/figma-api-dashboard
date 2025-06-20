# Figma API Integration

Your goal is to create or improve Figma API integration for the Next.js application.

Ask for the specific Figma functionality needed if not provided (files, nodes, comments, etc.).

## Requirements for Figma integration:

### API Setup

- Use official Figma REST API or Figma Plugin API
- Implement proper authentication with personal access tokens
- Handle API rate limiting and error responses
- Use environment variables for sensitive data (FIGMA_ACCESS_TOKEN)

### TypeScript Types

- Define proper TypeScript interfaces for Figma API responses
- Use Figma's official type definitions when available
- Create custom types for application-specific data structures
- Implement proper error type handling

### Data Fetching

- Use Server Components for initial Figma data loading
- Implement Server Actions for Figma data mutations
- Use Next.js caching strategies for API responses
- Handle loading states and error boundaries

### Common Figma Operations

- **Files**: Fetch file metadata, thumbnails, and version history
- **Nodes**: Get specific design elements and their properties
- **Comments**: Retrieve and post comments on designs
- **Teams/Projects**: List team files and project organization
- **Webhooks**: Handle real-time design updates

### Security Practices

- Never expose Figma tokens to the client side
- Validate all user inputs before making API calls
- Implement proper error handling for API failures
- Use CORS appropriately for browser-based requests

### Performance Optimization

- Cache Figma API responses appropriately
- Implement pagination for large datasets
- Use Next.js Image component for Figma thumbnails
- Minimize API calls through efficient data fetching

### Error Handling

- Handle Figma API rate limits gracefully
- Provide meaningful error messages to users
- Implement retry logic for transient failures
- Log API errors for debugging

## Example API Integration:

```tsx
// Server Component for Figma data
interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

async function getFigmaFiles(): Promise<FigmaFile[]> {
  const response = await fetch(
    "https://api.figma.com/v1/teams/TEAM_ID/projects",
    {
      headers: {
        "X-Figma-Token": process.env.FIGMA_ACCESS_TOKEN!,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Figma files");
  }

  return response.json();
}

export default async function FigmaFilesPage() {
  const files = await getFigmaFiles();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <FigmaFileCard key={file.key} file={file} />
      ))}
    </div>
  );
}
```

Always implement proper error handling, TypeScript types, and follow Next.js 15 patterns for API integration.
