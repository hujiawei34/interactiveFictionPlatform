# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Interactive Fiction Platform is a React-based web application for creating and playing interactive fiction stories. Users can visually design story narratives with branching choices, export/import story data, and preview their stories in a reader mode.

## Tech Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (comprehensive component library)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **State Management**: Local component state (React useState)
- **Charts**: Recharts

## Development Commands

```bash
npm i              # Install dependencies
npm run dev        # Start development server (opens http://localhost:3000)
npm run build      # Build for production (outputs to build/ directory)
```

## Architecture Overview

### Core Data Structure

The application uses a story graph model defined in `src/types/story.ts`:
- **Story**: Root container with metadata (id, title, description) and array of StoryNodes
- **StoryNode**: Individual scenes with text content, choices, position coordinates, and flags (isStart, isEnd)
- **Choice**: Links from one node to another with display text and target node reference

### Main Components

**App.tsx** - Root component that manages:
- Global story state (title, description, nodes)
- Mode switching between editor and preview modes
- Import/export functionality (JSON-based)
- Story metadata dialog

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

The `src/components/ui/` directory contains Radix UI component wrappers with Tailwind styling. These are pre-built and commonly imported throughout the application. Key ones used:
- Button, Card, Dialog, Input, Textarea
- Select, Checkbox, Switch
- Tooltip, AlertDialog

## Key Implementation Details

**Canvas System**: The editor uses a relative-positioned container with absolutely positioned nodes. SVG overlays render connection curves between nodes.

**Choice System**: Choices are stored as part of each node and reference target nodes by ID. When a node is deleted, the editor automatically removes orphaned choice references.

**Export/Import**: Uses JSON serialization of the complete Story object. Files are named based on story title with spaces replaced by underscores.

**Position Tracking**: All nodes store their canvas position (x, y coordinates) for persistence across edits.

## Common Development Tasks

### Adding a new feature to nodes
Edit `src/types/story.ts` to extend the StoryNode interface, then update StoryEditor.tsx and NodeEditor.tsx to handle the new property.

### Styling modifications
Use Tailwind CSS classes in components. Global styles are in `src/index.css` and `src/styles/globals.css`.

### Import path aliases
The Vite config defines `@` as an alias to `src/` for cleaner imports: `import { Button } from '@/components/ui/button'`
