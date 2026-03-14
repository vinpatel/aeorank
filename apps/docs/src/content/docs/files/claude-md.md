---
title: CLAUDE.md
description: Repository context file that helps AI coding assistants understand your codebase.
---

The `CLAUDE.md` file provides repository context for AI coding assistants like Claude, GitHub Copilot, and Cursor.

## What it is

A markdown file placed in your repository root that describes your project's technology stack, directory structure, build commands, and conventions. AI assistants read this file to understand how to work with your codebase.

## Why it matters

Without context, AI assistants make generic suggestions. With `CLAUDE.md`, they understand your specific patterns, dependencies, and conventions — leading to more accurate and useful code suggestions.

## Example output

```markdown
# CLAUDE.md — Example Site

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database: PostgreSQL via Prisma
- Auth: Clerk

## Directory Structure
- src/app/ — App Router pages and layouts
- src/components/ — React components
- src/lib/ — Utility functions
- prisma/ — Database schema

## Commands
- npm run dev — Start development server
- npm run build — Production build
- npm test — Run test suite
- npx prisma db push — Sync database schema

## Conventions
- Use server components by default
- Client components in src/components/client/
- API routes in src/app/api/
```

## How to deploy

Place `CLAUDE.md` in the root of your repository:

```
your-repo/CLAUDE.md
```

AI coding assistants automatically detect and read this file when working in your repository.
