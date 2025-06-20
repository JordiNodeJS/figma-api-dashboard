# Create Next.js Component

Your goal is to generate a new React component for the Next.js 15 application.

Ask for the component name, props, and functionality if not provided.

## Requirements for the component:

### TypeScript

- Use TypeScript with explicit type definitions
- Define proper interface for component props
- Use React 19 types and patterns
- Implement proper error handling

### Component Structure

- Use Server Components by default unless client-side features are needed
- Add "use client" directive only when necessary (state, events, browser APIs)
- Follow the component structure: props interface, component function, export
- Use descriptive prop names and add JSDoc comments

### Styling

- Use Tailwind CSS 4 utility classes
- Implement responsive design with mobile-first approach
- Follow consistent spacing using Tailwind's spacing scale
- Use semantic color classes and CSS variables for theming
- Support dark mode with dark: variants

### File Organization

- Place in appropriate directory under src/components/
- Use kebab-case for file names (e.g., user-profile.tsx)
- Export as default export
- Create index.ts files for component groups

### Performance

- Use Next.js Image component for images
- Implement proper code splitting if needed
- Use React.memo() for performance optimization when appropriate
- Avoid unnecessary re-renders

### Accessibility

- Include proper ARIA attributes
- Use semantic HTML elements
- Implement keyboard navigation support
- Add proper focus management
- Include alt text for images

## Example Structure:

```tsx
interface ComponentNameProps {
  // Define props with proper types
}

export default function ComponentName({ props }: ComponentNameProps) {
  // Component implementation
  return <div className="tailwind-classes">{/* Component content */}</div>;
}
```

Always include proper TypeScript types, accessibility features, and follow Next.js 15 best practices.
