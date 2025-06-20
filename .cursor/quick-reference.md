# Cursor AI Global Rules for This Project

## Quick Reference Commands

### Component Creation

When you need to create a component, say:
"Create a [ComponentName] component that [functionality description]"

### API Endpoint Creation

When you need an API endpoint, say:
"Create an API endpoint for [functionality] at /api/[route]"

### Styling Implementation

When you need styling, say:
"Style this [element] with Tailwind CSS for [appearance description]"

### Figma Integration

When you need Figma integration, say:
"Create Figma API integration to [specific functionality]"

## Project-Specific Shortcuts

### File Creation Patterns

- Components: `src/components/[feature]/[component-name].tsx`
- API Routes: `src/app/api/[route]/route.ts`
- Server Actions: `src/lib/actions/[action-name].ts`
- Types: `src/lib/types/[domain].ts`
- Utils: `src/lib/utils/[utility-name].ts`

### Common Import Patterns

```typescript
// Next.js imports
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// React imports
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

// Utility imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### Environment Variables

- `FIGMA_ACCESS_TOKEN` - Figma API token
- `NEXT_PUBLIC_*` - Only for public client-side data
- All sensitive data stays server-side

### Code Style Reminders

- Use `interface` over `type` for objects
- Export components as default
- Use Server Components unless client features needed
- Include JSDoc comments for all components
- Use Tailwind classes, no custom CSS
- Implement proper error handling
- Add accessibility attributes

This file helps Cursor understand the project context and provide more accurate suggestions.
