# Component Creation Rules for Cursor

## When creating React components:

### Component Template

```tsx
interface [ComponentName]Props {
  // Required props
  id: string;
  // Optional props with defaults
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * [Brief component description]
 *
 * @param props - Component props
 * @param props.id - Unique identifier
 * @param props.variant - Visual variant
 * @param props.size - Component size
 * @param props.disabled - Whether component is disabled
 * @param props.children - Child elements
 */
export default function [ComponentName]({
  id,
  variant = 'primary',
  size = 'md',
  disabled = false,
  children
}: [ComponentName]Props) {
  // Component logic here

  return (
    <div
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center",
        // Variant styles
        variant === 'primary' && "bg-primary text-primary-foreground",
        variant === 'secondary' && "bg-secondary text-secondary-foreground",
        variant === 'outline' && "border border-input bg-background",
        // Size styles
        size === 'sm' && "h-8 px-3 text-sm",
        size === 'md' && "h-10 px-4",
        size === 'lg' && "h-12 px-6 text-lg",
        // State styles
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
}
```

### Component Rules:

- Always use TypeScript interfaces for props
- Include JSDoc comments for all components
- Use default parameter values in destructuring
- Implement proper ARIA attributes
- Use semantic HTML elements
- Include responsive design with Tailwind classes
- Use the `cn()` utility for conditional classes
- Export as default export
- Place in appropriate directory under `src/components/`

### Server vs Client Components:

- Default to Server Components
- Only add "use client" when you need:
  - useState, useEffect, or other React hooks
  - Event handlers (onClick, onSubmit, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Third-party libraries that require client-side rendering

### Accessibility Requirements:

- Always include proper ARIA attributes
- Use semantic HTML elements
- Implement keyboard navigation
- Add focus management
- Include alt text for images
- Ensure proper color contrast
- Test with screen readers

## Utility Functions Required

### cn() Utility

Make sure this utility is available in your project:

```tsx
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Common Component Patterns

### Button Component Example

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        // Variants
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" &&
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        // Sizes
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 py-2",
        size === "lg" && "h-11 px-8"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
```

### Card Component Example

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
```

## File Organization Examples

### Component Directory Structure

```
src/components/
├── ui/                 # Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── index.ts
├── figma/             # Figma-specific components
│   ├── file-card.tsx
│   ├── file-list.tsx
│   └── index.ts
├── layout/            # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── index.ts
└── forms/             # Form components
    ├── login-form.tsx
    ├── file-upload.tsx
    └── index.ts
```

### Index File Pattern

```tsx
// src/components/ui/index.ts
export { default as Button } from "./button";
export { Card, CardHeader, CardContent } from "./card";
export { default as Input } from "./input";
```
