# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Interactive Fiction Platform is a React-based web application for creating and playing interactive fiction stories. Users can visually design story narratives with branching choices, export/import story data, and preview their stories in a reader mode. The platform now includes cloud-based story persistence with Supabase authentication.

## Tech Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (comprehensive component library)
- **Icons**: Lucide React
- **State Management**: Local component state (React useState)
- **Backend/Database**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Charts**: Recharts

## Development Commands

```bash
npm i              # Install dependencies
npm run dev        # Start development server (opens http://localhost:3000)
npm run build      # Build for production (outputs to dist/ directory)
```

## Architecture Overview

### Authentication & Cloud Persistence (Supabase)

The application integrates Supabase for user authentication and cloud-based story storage. Key files:

**`src/utils/supabase/client.ts`** - Initializes singleton Supabase client
**`src/utils/supabase/info.tsx`** - Contains `projectId` and `publicAnonKey` configuration

**`src/components/AuthPage.tsx`** - Handles login/signup:
- Login form with email/password
- Signup form with name, email, password (minimum 6 chars)
- Calls Supabase Edge Function endpoint for signup: `/functions/v1/make-server-c931b1bb/signup`

**`src/components/StoryHistory.tsx`** - Displays saved stories:
- Lists all stories with metadata (title, description, scene count, updated date)
- Click to load a story
- Delete button with confirmation dialog

**App.tsx** - Enhanced with:
- Session persistence on mount
- Login/signup/logout handlers
- Save story to Supabase: POST `/functions/v1/make-server-c931b1bb/stories`
- Load story history: GET `/functions/v1/make-server-c931b1bb/stories`
- Load individual story: GET `/functions/v1/make-server-c931b1bb/stories/{storyId}`
- Delete story: DELETE `/functions/v1/make-server-c931b1bb/stories/{storyId}`
- User state includes `id`, `email`, `name`

### Core Data Structure

The application uses a story graph model defined in `src/types/story.ts`:
- **Story**: Root container with metadata (id, title, description, createdAt, updatedAt) and array of StoryNodes
- **StoryNode**: Individual scenes with text content, choices, position coordinates, and flags (isStart, isEnd)
- **Choice**: Links from one node to another with display text and target node reference
- **StoryMeta**: Lightweight story metadata (id, title, description, createdAt, updatedAt, nodeCount) for history display

### Editor Components

**StoryEditor.tsx** - Graph canvas editor that provides:
- Visual node layout on a 2000x2000px canvas
- SVG-based connection visualization with curved arrows
- Node drag-and-drop positioning
- Add/delete node operations
- Opens NodeEditor dialog for editing individual nodes

**StoryPreview.tsx** - Player/reader mode that:
- Displays story content sequentially
- Renders choices as buttons
- Tracks navigation history
- Requires a start node (isStart flag) to begin playback

**NodeEditor.tsx** - Modal dialog for editing node details (content, title, choices)

**StoryNode.tsx** - Individual draggable node component in the editor canvas

**StoryMetadata.tsx** - Dialog for editing story title and description

### UI Component Library

The `src/components/ui/` directory contains Radix UI component wrappers with Tailwind styling. Pre-built components include:
- Button, Card, Dialog, Input, Textarea
- Select, Checkbox, Switch
- Tooltip, AlertDialog, Tabs, Drawer
- Accordion, Popover, Dropdown Menu

## Key Implementation Details

**Canvas System**: The editor uses a relative-positioned container with absolutely positioned nodes. SVG overlays render connection curves between nodes.

**Choice System**: Choices are stored as part of each node and reference target nodes by ID. When a node is deleted, the editor automatically removes orphaned choice references.

**Export/Import**: Uses JSON serialization of the complete Story object. Files are named based on story title with spaces replaced by underscores.

**Position Tracking**: All nodes store their canvas position (x, y coordinates) for persistence across edits.

**Session Management**: Supabase session is checked on app mount. If valid session found, user is logged in automatically. Access token passed to all API requests via `Authorization: Bearer` header.

**Error Handling**: API errors display alert dialogs with error messages. Network requests include try-catch blocks with proper error logging.

## Supabase Edge Functions Integration

The backend is implemented as Supabase Edge Functions at `/functions/v1/make-server-c931b1bb/`. Key endpoints:
- **POST /signup** - User registration (email, password, name)
- **POST /stories** - Save a new story or update existing
- **GET /stories** - List all stories for logged-in user
- **GET /stories/{storyId}** - Fetch complete story data
- **DELETE /stories/{storyId}** - Delete a story

All endpoints require `Authorization: Bearer {accessToken}` header (except signup).
