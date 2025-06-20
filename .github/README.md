# GitHub Copilot Custom Instructions Setup

## Overview

This directory contains GitHub Copilot custom instructions and specific prompt files for the Figma Cursor Next.js project.

## Files Structure

### Main Custom Instructions

- **`.github/copilot-instructions.md`** - Repository-wide custom instructions that apply to all GitHub Copilot conversations in this repository

### Specific Prompt Files (`.github/prompts/`)

- **`create-nextjs-component.prompt.md`** - For creating new React components with Next.js 15 best practices
- **`figma-api-integration.prompt.md`** - For Figma API integration and data fetching
- **`server-actions-implementation.prompt.md`** - For implementing Next.js Server Actions
- **`api-route-handler.prompt.md`** - For creating API Route Handlers
- **`tailwind-design-system.prompt.md`** - For building design system components with Tailwind CSS 4
- **`performance-optimization.prompt.md`** - For optimizing application performance

## How to Use

### Repository Custom Instructions (Automatic)

The instructions in `.github/copilot-instructions.md` are automatically applied to all GitHub Copilot conversations when:

- You're working in this repository in VS Code
- Using Copilot Chat on GitHub.com with this repository attached
- The custom instructions feature is enabled in your Copilot settings

### Prompt Files (Manual)

To use specific prompt files in VS Code:

1. **Enable prompt files** in your workspace settings:

   ```json
   {
     "chat.promptFiles": true
   }
   ```

2. **Use a prompt file** in Copilot Chat:
   - Click the paperclip icon (📎) in the chat input
   - Select "Prompt..." from the dropdown
   - Choose the specific prompt file you want to use
   - Add your specific requirements and submit

### Example Usage

#### Creating a New Component

1. Open Copilot Chat in VS Code
2. Attach the `create-nextjs-component.prompt.md` prompt
3. Type: "Create a FigmaFileCard component that displays file thumbnail, name, and last modified date"

#### Figma Integration

1. Attach the `figma-api-integration.prompt.md` prompt
2. Type: "Create a function to fetch all files from a Figma team"

#### Performance Optimization

1. Attach the `performance-optimization.prompt.md` prompt
2. Type: "Optimize the image loading on the gallery page"

## Features Covered

The custom instructions ensure both GitHub Copilot and Cursor understand:

- **Technology Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Architecture Patterns**: App Router, Server Components, Server Actions
- **Best Practices**: Performance, security, accessibility, testing
- **Code Standards**: TypeScript strict mode, proper error handling
- **Figma Integration**: API patterns, authentication, data handling

## Cursor IDE Compatibility

This repository also includes Cursor-specific configuration files:

### Cursor Files Structure

```
.cursor/
├── settings.json           # Cursor-specific settings
├── instructions.md         # Detailed instructions for Cursor AI
└── component-rules.md      # Component creation guidelines

.cursorrules                # Main Cursor rules file
```

### Using with Cursor IDE

1. **Automatic**: Cursor will automatically detect and use the `.cursorrules` file
2. **Enhanced Context**: The `.cursor/instructions.md` provides additional context
3. **Component Guidelines**: Use `.cursor/component-rules.md` for component creation patterns

### Cursor Features

- **Smart Code Completion**: Follows project patterns automatically
- **Context-Aware Suggestions**: Understands your tech stack
- **Error Prevention**: Suggests fixes based on project rules
- **Consistent Code Style**: Maintains project conventions

## Customization

You can modify these files to:

- Add new prompt files for specific use cases
- Update the custom instructions based on project evolution
- Include project-specific coding standards or patterns
- Add new technology integrations or frameworks

## Benefits

- **Consistent Code Quality**: All generated code follows project standards
- **Faster Development**: Pre-defined patterns for common tasks
- **Best Practices**: Automatic enforcement of Next.js 15 and React 19 patterns
- **Type Safety**: Proper TypeScript implementation across all generated code
- **Performance**: Built-in optimization recommendations
- **Accessibility**: WCAG compliance in all UI components

The custom instructions work automatically, while prompt files give you targeted assistance for specific development tasks.
