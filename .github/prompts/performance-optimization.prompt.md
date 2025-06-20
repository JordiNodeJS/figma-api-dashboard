# Performance Optimization

Your goal is to optimize performance for the Next.js 15 application.

Ask for the specific performance area to optimize if not provided.

## Requirements for Performance Optimization:

### Core Web Vitals

- Optimize Largest Contentful Paint (LCP) < 2.5s
- Minimize First Input Delay (FID) < 100ms
- Reduce Cumulative Layout Shift (CLS) < 0.1
- Monitor and measure Core Web Vitals regularly

### Image Optimization

- Use Next.js Image component for all images
- Implement proper image sizing and formats
- Use modern formats (WebP, AVIF) when supported
- Implement lazy loading for off-screen images
- Optimize image compression and quality

### Bundle Optimization

- Analyze bundle size with @next/bundle-analyzer
- Implement code splitting with dynamic imports
- Tree shake unused code and dependencies
- Use barrel exports carefully to avoid large bundles
- Optimize third-party library imports

### Caching Strategies

- Implement appropriate cache headers for static assets
- Use Next.js data caching with fetch and unstable_cache
- Implement client-side caching for API responses
- Use service workers for advanced caching strategies

### Data Fetching

- Use Server Components for initial data loading
- Implement parallel data fetching to reduce waterfalls
- Use proper loading states and suspense boundaries
- Optimize database queries and external API calls

### Runtime Performance

- Minimize client-side JavaScript execution
- Use React.memo() for expensive components
- Implement proper key props for list rendering
- Avoid unnecessary re-renders with useCallback and useMemo

## Example Optimizations:

### Image Optimization

```tsx
import Image from "next/image";

export default function OptimizedImageGallery({
  images,
}: {
  images: ImageData[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative aspect-square">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={image.priority} // Only for above-fold images
            placeholder="blur"
            blurDataURL={image.blurDataURL}
          />
        </div>
      ))}
    </div>
  );
}
```

### Code Splitting

```tsx
import { lazy, Suspense } from "react";
import Loading from "./loading";

// Lazy load heavy components
const HeavyComponent = lazy(() => import("./heavy-component"));
const ChartComponent = lazy(() => import("./chart-component"));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>

      <Suspense fallback={<Loading />}>
        <HeavyComponent />
      </Suspense>

      <Suspense
        fallback={<div className="h-64 bg-gray-100 animate-pulse rounded" />}
      >
        <ChartComponent />
      </Suspense>
    </div>
  );
}
```

### Optimized Data Fetching

```tsx
// Parallel data fetching in Server Component
async function getUserData(userId: string) {
  return fetch(`/api/users/${userId}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  }).then((res) => res.json());
}

async function getUserPosts(userId: string) {
  return fetch(`/api/users/${userId}/posts`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  }).then((res) => res.json());
}

export default async function UserProfile({
  params,
}: {
  params: { id: string };
}) {
  // Fetch data in parallel
  const [userData, userPosts] = await Promise.all([
    getUserData(params.id),
    getUserPosts(params.id),
  ]);

  return (
    <div className="space-y-6">
      <UserInfo user={userData} />
      <UserPostsList posts={userPosts} />
    </div>
  );
}
```

### Bundle Analysis Configuration

```tsx
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable bundle analyzer
  ...(process.env.ANALYZE === "true" && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
};

export default config;
```

### Performance Monitoring

```tsx
// app/layout.tsx
export function reportWebVitals(metric: any) {
  if (metric.label === "web-vital") {
    console.log(metric); // Replace with analytics service

    // Send to analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // })
  }
}
```

### Optimized Font Loading

```tsx
// app/layout.tsx
import { Inter, Geist } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Improve loading performance
  variable: "--font-inter",
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${geist.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

Always measure performance before and after optimizations, and focus on the most impactful improvements first.
