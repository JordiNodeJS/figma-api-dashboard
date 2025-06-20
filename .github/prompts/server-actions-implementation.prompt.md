# Server Actions Implementation

Your goal is to create or improve Server Actions for form handling and data mutations in the Next.js application.

Ask for the specific action functionality needed if not provided.

## Requirements for Server Actions:

### Basic Structure

- Use "use server" directive at the top of server action files
- Implement proper TypeScript types for action parameters
- Return proper action results with success/error states
- Handle form data and validation server-side

### Security Practices

- Validate all user inputs within the action
- Implement proper authorization checks
- Sanitize data before processing
- Use CSRF protection and rate limiting when needed

### Error Handling

- Use try-catch blocks for error handling
- Return structured error responses
- Log errors appropriately for debugging
- Provide user-friendly error messages

### Form Integration

- Work seamlessly with HTML forms and FormData
- Support progressive enhancement
- Handle loading states with useFormStatus
- Implement optimistic updates when appropriate

### Data Validation

- Use validation libraries like Zod for schema validation
- Validate data types and formats
- Check required fields and constraints
- Return validation errors in a structured format

### Performance

- Use Next.js caching mechanisms appropriately
- Implement efficient database operations
- Minimize external API calls
- Use proper error boundaries

## Example Server Action:

```tsx
// actions/user-actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    // Validate form data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    const validatedData = userSchema.parse(rawData);

    // Perform the action (e.g., save to database)
    // const user = await db.user.create({ data: validatedData })

    // Revalidate relevant pages
    revalidatePath("/users");

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Failed to create user:", error);
    return {
      success: false,
      message: "Failed to create user",
    };
  }
}
```

## Client Component Usage:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { createUser } from "./actions/user-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create User"}
    </button>
  );
}

export default function UserForm() {
  return (
    <form action={createUser} className="space-y-4">
      <input
        name="name"
        placeholder="Name"
        className="w-full p-2 border rounded"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        required
      />
      <SubmitButton />
    </form>
  );
}
```

Always implement proper validation, error handling, and follow Next.js 15 Server Actions best practices.
