# CLAUDE.md - AI Assistant Development Guide

**Last Updated**: 2025-11-15
**Project**: Flash AI Coding Agent
**Version**: 0.1.0

This document provides comprehensive guidance for AI assistants (like Claude) working on this codebase. It covers architecture, conventions, patterns, and workflows to ensure consistent and effective contributions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Key Configuration Files](#key-configuration-files)
5. [Coding Conventions](#coding-conventions)
6. [Component Patterns](#component-patterns)
7. [State Management](#state-management)
8. [API Routes & Backend](#api-routes--backend)
9. [Development Workflows](#development-workflows)
10. [Git Conventions](#git-conventions)
11. [Testing Guidelines](#testing-guidelines)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

Flash is an AI-powered coding agent platform with gamified learning experiences. It's a Next.js 14 (App Router) application that combines:

- **AI Coding Agent**: LangGraph-based agent for code generation, Git analysis, and automated commits
- **Code Editing**: Monaco Editor integration for syntax highlighting and diff viewing
- **Quiz System**: Interactive coding quizzes with multiple question types
- **Gamification**: Level/XP system, badges, leaderboards, and activity feeds
- **Authentication**: NextAuth.js with Google OAuth and credentials providers

**Current Phase**: Frontend MVP (Backend Django + FastAPI planned)

**Language**: Korean documentation in README, but code/comments should be in English.

---

## Technology Stack

### Core Framework
- **Next.js**: 14.2.25 (App Router, React Server Components)
- **React**: 19 (latest)
- **TypeScript**: 5 (strict mode enabled)
- **Node.js**: 18+ LTS required

### UI & Styling
- **Tailwind CSS**: 3.4.17 with custom Flash brand colors
- **Radix UI**: 40+ primitive components for accessibility
- **Shadcn/ui**: Component library (default style)
- **Lucide React**: Icon library (0.454.0)
- **Framer Motion**: Animations and transitions
- **Geist**: Font family

### Code Editing
- **Monaco Editor**: VSCode's editor for code editing
- **@monaco-editor/react**: React wrapper for Monaco

### State Management
- **Zustand**: Lightweight state management (6 stores)
- **React Query**: Server state management (@tanstack/react-query)
- **Immer**: Immutable state updates

### Forms & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation (@hookform/resolvers)

### Authentication
- **NextAuth.js**: 4.24.12 (v4, not v5)
- **@auth/core**: 0.41.1

### Data Visualization
- **Recharts**: 2.15.0 (charts for gamification)

### Other Key Dependencies
- **axios**: HTTP client with interceptors
- **sonner**: Toast notifications
- **date-fns**: Date manipulation
- **class-variance-authority**: Component variant management
- **tailwind-merge**: className merging utility
- **react-resizable-panels**: Resizable layouts
- **cmdk**: Command menu component

---

## Directory Structure

```
/home/user/flashcording/
├── app/                          # Next.js 14 App Router
│   ├── agent/                    # AI Agent workspace page
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   └── auth/[...nextauth]/   # NextAuth.js configuration
│   │       └── route.ts
│   ├── diff/                     # Git diff viewer & commit page
│   │   └── page.tsx
│   ├── gamification/             # Gamification dashboard
│   │   └── page.tsx
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── quiz/                     # Quiz system page
│   │   └── page.tsx
│   ├── register/                 # Registration page
│   │   └── page.tsx
│   ├── settings/                 # User settings page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing/intro page
│   ├── providers.tsx             # Client-side providers wrapper
│   └── globals.css               # Global Tailwind styles
│
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui primitives (76 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── flash-logo.tsx        # Custom Flash lightning logo
│   │   ├── sidebar.tsx
│   │   └── ...
│   ├── activity-feed.tsx         # Gamification activity feed
│   ├── agent-header.tsx          # Agent workspace header
│   ├── agent-sidebar.tsx         # Agent-specific sidebar
│   ├── app-layout.tsx            # Main application layout wrapper
│   ├── app-sidebar.tsx           # Main navigation sidebar
│   ├── badge-card.tsx            # Badge display card
│   ├── badge-gallery.tsx         # Badge collection view
│   ├── code-editor.tsx           # Monaco Editor wrapper
│   ├── code-writing-question.tsx # Quiz code writing component
│   ├── diff-viewer.tsx           # Monaco Diff Editor wrapper
│   ├── fade-in.tsx               # Framer Motion fade animation
│   ├── leaderboard.tsx           # Gamification leaderboard
│   ├── mesh-gradient-svg.tsx     # Animated gradient background
│   ├── profile-card.tsx          # User profile card
│   ├── quiz-card.tsx             # Quiz pool card
│   ├── quiz-question.tsx         # Multiple choice question
│   ├── stagger-container.tsx     # Framer Motion stagger animation
│   ├── stats-grid.tsx            # Statistics grid
│   ├── theme-provider.tsx        # Next-themes wrapper
│   └── theme-toggle.tsx          # Dark/light mode toggle
│
├── lib/                          # Utilities & business logic
│   ├── api/                      # API client modules
│   │   ├── client.ts             # Axios instances with interceptors
│   │   ├── gamification.ts       # Gamification API methods
│   │   └── quiz.ts               # Quiz API methods
│   ├── mocks/                    # Mock data for development
│   │   ├── gamification.ts       # Mock badges, leaderboard, activities
│   │   └── quiz.ts               # Mock quiz pools & questions
│   ├── store/                    # Zustand state management
│   │   ├── agent-store.ts        # Agent processing state
│   │   ├── diff-sidebar-store.ts # Diff sidebar collapse state
│   │   ├── quiz-store.ts         # Quiz session state
│   │   ├── sidebar-store.ts      # Main sidebar collapse state
│   │   ├── theme-store.ts        # Theme preference state
│   │   └── user-store.ts         # User authentication state
│   ├── env.ts                    # Environment variables management
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions (cn helper)
│
├── hooks/                        # Custom React hooks
│   ├── use-discharge-sound.ts    # Web Audio API hook for Flash sound
│   ├── use-mobile.tsx            # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
│
├── public/                       # Static assets
│   └── sounds/
│       └── flash.mp3             # Flash discharge sound effect
│
├── styles/                       # Global styles
│   └── globals.css
│
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # Shadcn/ui configuration
├── package.json                  # Dependencies
├── .gitignore                    # Git ignore patterns
├── README.md                     # Project documentation (Korean)
├── requirements.md               # Product requirements (Korean)
├── GOOGLE_OAUTH_SETUP.md         # OAuth setup guide
└── QUICK_FIX_400_ERROR.md        # Troubleshooting guide
```

---

## Key Configuration Files

### next.config.mjs
```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true  // Temporary for rapid development
  },
  images: {
    unoptimized: true       // Required for static export
  }
};
```

**Important**: `ignoreBuildErrors` should be removed before production.

### tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "target": "ES6",
    "strict": true,
    "paths": {
      "@/*": ["./*"]  // Path alias for imports
    }
  }
}
```

**Key Setting**: All imports use `@/` prefix (e.g., `@/components/ui/button`).

### tailwind.config.ts

**Dark Mode**: Class-based (`darkMode: ['class']`)

**Custom Brand Colors**:
- **Primary**: Blue/Cyan (#0E9FE8, #06B6D4) - Innovation, technology
- **Secondary**: Orange/Amber (#F59E0B, #FB923C) - Achievement, rewards
- **Accent**: Green (#10B981, #34D399) - Growth, progress

**Color System**: All colors use HSL CSS variables defined in `app/globals.css`:
```css
:root {
  --primary: 199 89% 48%;      /* #0E9FE8 */
  --secondary: 32 95% 51%;     /* #F59E0B */
  --accent: 160 84% 39%;       /* #10B981 */
  /* ... etc */
}
```

**Animations**: Custom accordion animations via `tailwindcss-animate` plugin.

### components.json (Shadcn/ui)
```json
{
  "style": "default",
  "rsc": true,                 // React Server Components enabled
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Coding Conventions

### File Naming

| Type | Convention | Examples |
|------|-----------|----------|
| **Pages** | `page.tsx` | `app/agent/page.tsx` |
| **Layouts** | `layout.tsx` | `app/layout.tsx` |
| **Components** | `kebab-case.tsx` | `app-sidebar.tsx`, `code-editor.tsx` |
| **UI Components** | `lowercase.tsx` | `button.tsx`, `card.tsx` |
| **Stores** | `kebab-case-store.ts` | `agent-store.ts`, `user-store.ts` |
| **Hooks** | `use-kebab-case.ts` | `use-mobile.tsx`, `use-toast.ts` |
| **API Modules** | `kebab-case.ts` | `client.ts`, `gamification.ts` |
| **Types** | `types.ts` | `lib/types.ts` |
| **Config** | `kebab-case.ts/.mjs` | `next.config.mjs`, `tailwind.config.ts` |

### Import Organization

**Standard Import Order**:
```typescript
// 1. React & Next.js
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 2. Third-party libraries
import { motion } from "framer-motion"
import { toast } from "sonner"

// 3. Components (UI first, then feature)
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AppLayout } from "@/components/app-layout"

// 4. Hooks & Stores
import { useAgentStore } from "@/lib/store/agent-store"

// 5. Utils & Types
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

// 6. Icons (last)
import { Sparkles, Send, Copy } from "lucide-react"
```

**Path Aliases**: Always use `@/` prefix (never relative imports like `../../`):
```typescript
// ✅ Good
import { Button } from "@/components/ui/button"

// ❌ Bad
import { Button } from "../../components/ui/button"
```

**Type Imports**: Use explicit `type` keyword:
```typescript
import type { User, QuizQuestion } from "@/lib/types"
```

**No Barrel Exports**: Import directly from specific files:
```typescript
// ✅ Good
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// ❌ Bad (no index.ts files exist)
import { Button, Card } from "@/components/ui"
```

### TypeScript Patterns

**Strict Mode Enabled**: All files must pass strict TypeScript checks.

**Type Definitions** (`lib/types.ts`):
- Comprehensive types for all domains (User, Quiz, Badge, Git, Agent, Activity)
- Use `interface` for object shapes
- Use `type` for unions, intersections, and utilities

**Example Types**:
```typescript
export interface User {
  id: string
  email: string
  username: string
  level: number
  exp: number
  avatar?: string
}

export interface QuizQuestion {
  id: number
  text: string
  type?: "multiple-choice" | "code-writing"
  options: QuizOption[]
  correct_option_id: number
  explanation?: string
  code_template?: string
  test_cases?: TestCase[]
  language?: string
}

export type BadgeRarity = "common" | "rare" | "epic"
```

**Component Props**: Define props interfaces:
```typescript
interface ButtonProps {
  variant?: "default" | "destructive" | "outline"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
  onClick?: () => void
}
```

---

## Component Patterns

### Client vs Server Components

**Client Components**: Mark with `"use client"` directive (first line):
```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function MyComponent() {
  const [count, setCount] = useState(0)
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>
}
```

**When to use "use client"**:
- Using React hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (localStorage, window, etc.)
- Zustand stores
- Third-party client libraries (Framer Motion, Monaco Editor)

**Server Components**: Default (no directive needed):
```typescript
// No "use client" directive
export default function ServerComponent() {
  return <div>Static content</div>
}
```

### Standard Page Structure

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Components
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"

// Stores & Hooks
import { useAgentStore } from "@/lib/store/agent-store"

// Types
import type { User } from "@/lib/types"

export default function PageName() {
  // 1. Hooks (router, stores, state)
  const router = useRouter()
  const { state, actions } = useAgentStore()
  const [localState, setLocalState] = useState<string>("")

  // 2. Event handlers
  const handleSubmit = async () => {
    try {
      // Business logic
      toast.success("Success!")
    } catch (error) {
      toast.error("Failed!")
    }
  }

  // 3. Render
  return (
    <AppLayout showSidebar={true} showHeader={true}>
      {/* JSX */}
    </AppLayout>
  )
}
```

### Layout Wrapper Pattern

Use `AppLayout` for consistent page structure:
```typescript
import { AppLayout } from "@/components/app-layout"

<AppLayout showSidebar={true} showHeader={true}>
  <div className="p-6">
    {/* Page content */}
  </div>
</AppLayout>
```

### Animation Pattern (Framer Motion)

```typescript
import { motion, AnimatePresence } from "framer-motion"

// Fade in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Toast Notifications

Use `sonner` for all notifications:
```typescript
import { toast } from "sonner"

// Success
toast.success("Operation completed!")

// Error
toast.error("Something went wrong!")

// Loading
const toastId = toast.loading("Processing...")
// Later: toast.dismiss(toastId)

// With description
toast.success("Success!", {
  description: "Your changes have been saved."
})
```

### Monaco Editor Integration

**Code Editor** (`components/code-editor.tsx`):
```typescript
import { CodeEditor } from "@/components/code-editor"

<CodeEditor
  value={code}
  onChange={setCode}
  language="python"
  height="400px"
  theme="vs-dark"
/>
```

**Diff Viewer** (`components/diff-viewer.tsx`):
```typescript
import { DiffViewer } from "@/components/diff-viewer"

<DiffViewer
  original={originalCode}
  modified={modifiedCode}
  language="typescript"
  height="600px"
/>
```

---

## State Management

### Zustand Stores (6 Total)

#### 1. Agent Store (`lib/store/agent-store.ts`)
**Purpose**: AI agent processing state (code generation, streaming)
**Persistence**: None
**Usage**:
```typescript
import { useAgentStore } from "@/lib/store/agent-store"

const { isProcessing, progress, setProcessing, reset } = useAgentStore()
```

#### 2. Diff Sidebar Store (`lib/store/diff-sidebar-store.ts`)
**Purpose**: Diff page sidebar collapse state
**Persistence**: localStorage (`diff-sidebar-storage`)
**Usage**:
```typescript
import { useDiffSidebarStore } from "@/lib/store/diff-sidebar-store"

const { isCollapsed, toggle } = useDiffSidebarStore()
```

#### 3. Quiz Store (`lib/store/quiz-store.ts`)
**Purpose**: Quiz session management (current question, score, answers)
**Persistence**: None
**Usage**:
```typescript
import { useQuizStore } from "@/lib/store/quiz-store"

const { currentQuestionIndex, score, answers, submitAnswer } = useQuizStore()
```

#### 4. Sidebar Store (`lib/store/sidebar-store.ts`)
**Purpose**: Main navigation sidebar collapse state
**Persistence**: localStorage (`sidebar-storage`)
**Usage**:
```typescript
import { useSidebarStore } from "@/lib/store/sidebar-store"

const { isCollapsed, toggle } = useSidebarStore()
```

#### 5. Theme Store (`lib/store/theme-store.ts`)
**Purpose**: Theme preference (light/dark mode)
**Persistence**: localStorage (`theme-storage`)
**Usage**:
```typescript
import { useThemeStore } from "@/lib/store/theme-store"

const { theme, setTheme } = useThemeStore()
```

#### 6. User Store (`lib/store/user-store.ts`)
**Purpose**: User authentication state (user data, JWT tokens)
**Persistence**: localStorage (`user-storage`)
**Usage**:
```typescript
import { useUserStore } from "@/lib/store/user-store"

const { user, accessToken, setUser, logout } = useUserStore()
```

### Store Pattern (Standard Structure)

**Non-Persisted Store**:
```typescript
import { create } from "zustand"

interface StoreState {
  // State
  value: string
  count: number

  // Actions
  setValue: (value: string) => void
  increment: () => void
  reset: () => void
}

export const useMyStore = create<StoreState>((set) => ({
  // Initial state
  value: "",
  count: 0,

  // Actions
  setValue: (value) => set({ value }),
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ value: "", count: 0 })
}))
```

**Persisted Store** (localStorage):
```typescript
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface StoreState {
  value: string
  setValue: (value: string) => void
}

export const useMyStore = create<StoreState>()(
  persist(
    (set) => ({
      value: "",
      setValue: (value) => set({ value })
    }),
    {
      name: "my-storage",  // localStorage key
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : undefined
      )
    }
  )
)
```

**SSR Safety**: Always check `typeof window !== "undefined"` for persisted stores.

### Server State (React Query)

Currently configured but not actively used. API calls are handled via Axios in `lib/api/`.

**Future Usage**:
```typescript
import { useQuery, useMutation } from "@tanstack/react-query"

const { data, isLoading } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId)
})
```

---

## API Routes & Backend

### NextAuth API Route

**Location**: `app/api/auth/[...nextauth]/route.ts`

**Providers**:
1. **Google OAuth**: Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. **Credentials**: Email/password (placeholder implementation)

**Session Strategy**: JWT (not database sessions)

**Session Duration**: 30 days (`maxAge: 30 * 24 * 60 * 60`)

**Custom Pages**:
- Sign In: `/login` (not default `/api/auth/signin`)

**Environment Variables**:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-generate-with-openssl
```

**Generate Secret**:
```bash
openssl rand -base64 32
```

### External API (Django + FastAPI - Planned)

**API Client** (`lib/api/client.ts`):
```typescript
import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 10000
})

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Mock Data** (Development): `lib/mocks/`
- `gamification.ts`: Mock badges, leaderboard, activities
- `quiz.ts`: Mock quiz pools & questions

**Planned API Endpoints** (from requirements.md):
- `/api/users/register` - User registration
- `/api/users/login` - Login
- `/api/quizzes` - Quiz pools
- `/api/quiz/sessions` - Quiz sessions
- `/api/gami/badges` - Badges
- `/api/gami/leaderboard` - Leaderboard
- `/api/activity` - Activity logging
- `/api/analyze` - Code analysis (LangGraph agent)
- `/api/git/{project_id}/commits` - Git commit metadata

---

## Development Workflows

### Setup & Installation

**Prerequisites**:
- Node.js 18+ (LTS)
- pnpm (recommended) or npm

**Install Dependencies**:
```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install
```

**Environment Variables**:
```bash
# Copy example (if it exists) or create new
cp .env.example .env.local
# Edit .env.local with your values
```

**Run Development Server**:
```bash
pnpm dev
# or
npm run dev
```

**Build for Production**:
```bash
pnpm build
pnpm start
```

**Lint**:
```bash
pnpm lint
```

### Adding New Components

**Shadcn/ui Component**:
```bash
# Using npx
npx shadcn@latest add [component-name]

# Example
npx shadcn@latest add alert-dialog
```

This adds the component to `components/ui/`.

**Custom Component**:
1. Create file in `components/` with kebab-case naming
2. Use "use client" if interactive
3. Import from `@/components/component-name`

### Adding New Pages

1. Create folder in `app/` (e.g., `app/my-feature/`)
2. Add `page.tsx` inside
3. Use `AppLayout` wrapper for consistent structure
4. Add navigation link to `components/app-sidebar.tsx`

**Example**:
```typescript
// app/my-feature/page.tsx
"use client"

import { AppLayout } from "@/components/app-layout"

export default function MyFeaturePage() {
  return (
    <AppLayout showSidebar={true} showHeader={true}>
      <div className="p-6">
        <h1>My Feature</h1>
      </div>
    </AppLayout>
  )
}
```

### Adding New Zustand Store

1. Create file in `lib/store/` with `*-store.ts` naming
2. Follow standard store pattern (see State Management section)
3. Add persistence if state should survive page reload
4. Use SSR-safe localStorage check

**Example**:
```typescript
// lib/store/my-feature-store.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface MyFeatureState {
  value: string
  setValue: (value: string) => void
}

export const useMyFeatureStore = create<MyFeatureState>()(
  persist(
    (set) => ({
      value: "",
      setValue: (value) => set({ value })
    }),
    {
      name: "my-feature-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : undefined
      )
    }
  )
)
```

### Adding Types

Add all new types to `lib/types.ts`:
```typescript
export interface MyNewType {
  id: string
  name: string
  createdAt: Date
}
```

---

## Git Conventions

### Branch Naming

**Current Branch**: `claude/claude-md-mhzl94r2z0enzzep-019ijzJGQ2uaFdyuAjp2iqZp`

**Pattern**: `claude/[description]-[session-id]`

### Commit Messages

**Format**: Conventional Commits

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples** (from git history):
```
feat: add looping flash.mp3 sound to intro page with Web Audio API
feat: implement Flash lightning logo component
feat: implement Zustand store for managing diff sidebar state
fix: add missing React imports to diff page
refactor: remove unused imports from diff page
```

**Guidelines**:
- Use lowercase for type and description
- Keep first line under 72 characters
- Use imperative mood ("add" not "added")
- Be descriptive but concise
- Reference issues if applicable (e.g., `feat: add login page (#123)`)

### Push Strategy

**Always push to feature branch**:
```bash
git push -u origin claude/[branch-name]
```

**Never push directly to main/master**.

---

## Testing Guidelines

### Current State

**No tests currently exist** in this repository.

### Recommended Testing Stack (Future)

- **Unit Tests**: Vitest or Jest
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Type Checking**: TypeScript compiler (`tsc --noEmit`)

### When Adding Tests

1. Create `__tests__/` folder next to the code being tested
2. Name test files: `component-name.test.tsx` or `function-name.test.ts`
3. Follow Arrange-Act-Assert pattern
4. Mock external dependencies (API calls, Zustand stores)

---

## Common Tasks

### Task 1: Add a New Quiz Question Type

1. **Update Types** (`lib/types.ts`):
```typescript
export type QuestionType = "multiple-choice" | "code-writing" | "my-new-type"
```

2. **Update Quiz Store** (`lib/store/quiz-store.ts`):
```typescript
// Add any new state for your question type
```

3. **Create Component** (`components/my-new-question-type.tsx`):
```typescript
"use client"

import type { QuizQuestion } from "@/lib/types"

interface Props {
  question: QuizQuestion
  onAnswer: (answer: string) => void
}

export function MyNewQuestionType({ question, onAnswer }: Props) {
  return <div>{/* Your question UI */}</div>
}
```

4. **Update Quiz Page** (`app/quiz/page.tsx`):
```typescript
// Add conditional rendering for new type
{question.type === "my-new-type" && (
  <MyNewQuestionType question={question} onAnswer={handleAnswer} />
)}
```

### Task 2: Add a New Badge

1. **Update Mock Data** (`lib/mocks/gamification.ts`):
```typescript
export const mockBadges: Badge[] = [
  // ... existing badges
  {
    id: "my-new-badge",
    name: "My Achievement",
    description: "Earned by doing something cool",
    icon: "🏆",
    rarity: "rare",
    earned: false
  }
]
```

2. **Badge will auto-appear** in gamification page (uses mock data).

### Task 3: Add a New Sidebar Navigation Item

**Edit**: `components/app-sidebar.tsx`

```typescript
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link href="/my-new-page">
      <MyIcon className="h-4 w-4" />
      <span>My New Page</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

### Task 4: Style a Component with Tailwind

**Use `cn()` utility** for conditional classes:
```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

**Use CSS variables** for theme colors:
```typescript
<div className="bg-primary text-primary-foreground">
  Primary colored background
</div>
```

**Available color classes**:
- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-accent`, `text-accent`, `border-accent`
- `bg-destructive`, `text-destructive`, `border-destructive`
- `bg-muted`, `text-muted`, `text-muted-foreground`
- `bg-card`, `text-card-foreground`
- `bg-popover`, `text-popover-foreground`

### Task 5: Debug Zustand Store

**Access store outside React**:
```typescript
import { useMyStore } from "@/lib/store/my-store"

// Get current state
const currentState = useMyStore.getState()

// Subscribe to changes
const unsubscribe = useMyStore.subscribe((state) => {
  console.log("State changed:", state)
})

// Later: unsubscribe()
```

**DevTools**: Install Zustand DevTools extension for Chrome/Firefox.

---

## Troubleshooting

### Issue: Build Errors with TypeScript

**Current Workaround**: `ignoreBuildErrors: true` in `next.config.mjs`

**Proper Fix**:
1. Run `pnpm tsc --noEmit` to see all type errors
2. Fix errors one by one
3. Remove `ignoreBuildErrors: true` from config

### Issue: "window is not defined" Error

**Cause**: Using browser APIs in Server Components or during SSR.

**Fix**: Add client component directive and check for window:
```typescript
"use client"

useEffect(() => {
  if (typeof window !== "undefined") {
    // Browser-only code
  }
}, [])
```

### Issue: Zustand Store Not Persisting

**Check**:
1. Persistence is configured with `persist()` middleware
2. SSR-safe storage check: `typeof window !== "undefined"`
3. localStorage is not cleared by browser
4. Storage key is unique (no conflicts)

**Debug**:
```typescript
// Check localStorage
console.log(localStorage.getItem("my-storage"))
```

### Issue: Monaco Editor Not Loading

**Check**:
1. Component has `"use client"` directive
2. Dynamic import if needed:
```typescript
import dynamic from "next/dynamic"

const CodeEditor = dynamic(() => import("@/components/code-editor"), {
  ssr: false
})
```

### Issue: 400 Error with Google OAuth

**See**: `QUICK_FIX_400_ERROR.md` for detailed troubleshooting.

**Common Fixes**:
1. Verify redirect URI in Google Console matches exactly
2. Check environment variables are loaded
3. Ensure `NEXTAUTH_URL` matches your domain

### Issue: Mock Data Not Updating

**Cause**: Mock data is static and hardcoded in `lib/mocks/`.

**Fix**: Edit the mock files directly:
- `lib/mocks/gamification.ts`
- `lib/mocks/quiz.ts`

**Future**: Replace with real API calls once backend is ready.

---

## Key Development Principles

1. **TypeScript First**: Use strict types, avoid `any`
2. **Component Reusability**: Use Shadcn/ui primitives, create composite components
3. **Performance**: Use React Server Components where possible, lazy load heavy components
4. **Accessibility**: Follow Radix UI patterns, use semantic HTML, add ARIA labels
5. **Responsive Design**: Mobile-first with Tailwind breakpoints
6. **Error Handling**: Always catch errors, show user-friendly messages with toast
7. **Loading States**: Show loading indicators for async operations
8. **Consistency**: Follow existing patterns (imports, naming, structure)
9. **Documentation**: Add JSDoc comments for complex functions
10. **Git Hygiene**: Atomic commits, descriptive messages, feature branches

---

## Future Roadmap (Backend Integration)

**Phase 2**: Backend API Integration
- Django server with PostgreSQL database
- FastAPI server for LLM operations (LangGraph agent)
- Replace mock data with real API calls
- Implement WebSocket for real-time agent streaming
- Add Celery for background tasks

**Phase 3**: Advanced Features
- Local Git integration (Desktop Backend with Python)
- Code complexity analysis (AST parsing)
- Adaptive learning algorithm (quiz recommendations)
- Mobile app (React Native)

**See**: `requirements.md` for full product roadmap (Korean).

---

## Quick Reference

### Most Important Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, providers, metadata |
| `app/page.tsx` | Landing page with intro animation |
| `components/app-layout.tsx` | Main layout wrapper for pages |
| `components/app-sidebar.tsx` | Navigation sidebar |
| `lib/types.ts` | All TypeScript type definitions |
| `lib/utils.ts` | Utility functions (`cn` helper) |
| `lib/api/client.ts` | Axios client configuration |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth configuration |
| `tailwind.config.ts` | Tailwind & theme configuration |
| `tsconfig.json` | TypeScript & path aliases |

### Key Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Adding Components
npx shadcn@latest add [component]  # Add Shadcn component

# TypeScript
pnpm tsc --noEmit     # Check types without building
```

### Key URLs

- **Dev Server**: http://localhost:3000
- **Google OAuth Setup**: See `GOOGLE_OAUTH_SETUP.md`
- **GitHub Repo**: (Add your repo URL here)
- **Requirements**: `requirements.md` (Korean)

---

## Contact & Support

For questions about this codebase:
1. Check this CLAUDE.md file
2. Review `requirements.md` for product context
3. Check README.md for setup instructions
4. Review existing code patterns in similar components

**Last Updated**: 2025-11-15
**Maintained by**: Flash Team

---

**End of CLAUDE.md**
