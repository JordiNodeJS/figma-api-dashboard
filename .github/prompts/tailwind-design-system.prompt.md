# Tailwind CSS Design System

Your goal is to create or improve design system components using Tailwind CSS 4.

Ask for the specific component or design system element needed if not provided.

## Requirements for Tailwind CSS 4:

### Utility-First Approach

- Use Tailwind utility classes for all styling
- Avoid custom CSS unless absolutely necessary
- Leverage Tailwind's design tokens for consistency
- Use CSS variables for custom properties when needed

### Responsive Design

- Implement mobile-first responsive design
- Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:, 2xl:)
- Ensure components work across all screen sizes
- Test on different devices and viewports

### Color System

- Use semantic color names from Tailwind's palette
- Implement proper contrast ratios for accessibility
- Support dark mode with dark: variants
- Use CSS variables for custom brand colors

### Spacing and Layout

- Use Tailwind's spacing scale consistently
- Implement proper typography scale
- Use flexbox and grid utilities for layouts
- Follow consistent spacing patterns

### Component Variants

- Create reusable component variants using classes
- Use conditional classes for different states
- Implement size variants (sm, md, lg, xl)
- Support different visual styles (primary, secondary, etc.)

### Accessibility

- Ensure proper color contrast ratios
- Use focus-visible utilities for keyboard navigation
- Implement proper ARIA attributes
- Test with screen readers

## Example Design System Components:

### Button Component

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Card Component

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}
```

### Input Component

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

## Dark Mode Support:

```tsx
// Add to tailwind.config.js
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        // Add more custom colors
      },
    },
  },
};
```

Always ensure components are accessible, responsive, and follow Tailwind CSS 4 best practices.
