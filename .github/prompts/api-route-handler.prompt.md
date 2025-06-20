# API Route Handler

Your goal is to create or improve API Route Handlers for the Next.js application.

Ask for the specific API endpoint functionality needed if not provided.

## Requirements for API Routes:

### File Structure

- Place in app/api/ directory following App Router conventions
- Use route.ts files for API endpoints
- Support GET, POST, PUT, DELETE, PATCH methods
- Implement proper TypeScript types for requests and responses

### Request Handling

- Handle different HTTP methods appropriately
- Parse request body and query parameters safely
- Validate input data with proper schemas
- Implement proper error handling and status codes

### Response Formatting

- Return consistent JSON response format
- Use appropriate HTTP status codes
- Include proper headers (CORS, Content-Type, etc.)
- Handle edge cases and error responses

### Security Practices

- Validate and sanitize all input data
- Implement proper authentication and authorization
- Use CORS headers appropriately
- Rate limiting for public endpoints
- Never expose sensitive information in responses

### Performance

- Use Next.js caching mechanisms when appropriate
- Optimize database queries and external API calls
- Implement proper error boundaries
- Use streaming for large responses when needed

### Error Handling

- Use structured error responses
- Log errors appropriately for debugging
- Provide meaningful error messages
- Handle different types of errors (validation, database, external API)

## Example API Route:

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch users from database
    // const users = await db.user.findMany({
    //   skip: (page - 1) * limit,
    //   take: limit,
    // })

    const users = []; // Replace with actual data fetching

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = userSchema.parse(body);

    // Create user in database
    // const user = await db.user.create({
    //   data: validatedData,
    // })

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: validatedData, // Replace with actual user data
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("Failed to create user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
```

## Dynamic API Routes:

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Validate ID format
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Fetch user from database
    // const user = await db.user.findUnique({
    //   where: { id: parseInt(userId) },
    // })

    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: 'User not found' },
    //     { status: 404 }
    //   )
    // }

    return NextResponse.json({
      success: true,
      data: { id: userId, name: "Example User" }, // Replace with actual data
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
```

Always implement proper validation, error handling, and follow Next.js 15 API Routes best practices.
