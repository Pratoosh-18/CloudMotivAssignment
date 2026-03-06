# Knowledge Graph Viewer

An interactive, browser-based personal knowledge graph built with Next.js, TypeScript, and D3.js. Map topics as nodes, connect them with labeled edges, edit content inline, and have everything persist across page refreshes via `localStorage`.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **D3.js** — force-directed graph simulation
- **Tailwind CSS** — utility-first styling
- **localStorage** — client-side persistence (no backend)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Force-directed graph** with D3 simulation — nodes repel, edges attract
- **Directed edges** with arrowhead markers and midpoint labels
- **Add / edit / delete nodes** with an inline side panel
- **Add / delete edges** with source/target dropdowns and self-loop prevention
- **Drag nodes** to reposition — positions persist to localStorage
- **Click to select** — connected subgraph highlights, non-connected dims
- **Zoom & pan** via mouse scroll / drag on the canvas
- **Seed data** loads automatically on first visit (8 nodes, 9 edges)
- **Full persistence** — every mutation immediately writes to localStorage
- **Dark theme** — dark canvas background with light labels for readability
- **Empty state** — friendly prompt when no nodes exist
- **Keyboard accessible** — Escape closes all modals and panels
- **Animated transitions** — nodes fade in, panel slides in, modals scale up

## Architecture Notes

- **D3 refs, not React state for ticks**: The simulation runs in a `useRef` and updates the DOM directly via D3 selections on each tick. This avoids re-rendering React on every frame (~60fps) and keeps the graph performant.
- **`useGraphState` hook**: All CRUD logic and localStorage sync lives in a single custom hook, keeping components focused on presentation.
- **Separate types file**: `types/graph.ts` defines `GraphNode`, `GraphEdge`, and `GraphState` — shared across all modules with no `any` types.
- **Seed data as typed objects**: Defined in `lib/seedData.ts` as a `GraphState` literal — no CSV parsing at runtime.

## Project Structure

```
app/
  page.tsx            ← Root page, renders the graph app
  layout.tsx          ← Root layout with dark theme
  globals.css         ← Tailwind imports + animations
components/
  Graph.tsx           ← D3 SVG canvas with force simulation
  NodePanel.tsx       ← Sidebar for node detail + editing
  AddNodeModal.tsx    ← Modal to add a new node
  AddEdgeModal.tsx    ← Modal to add a new edge
hooks/
  useGraphState.ts    ← All graph state logic + localStorage sync
lib/
  seedData.ts         ← Hardcoded seed data as typed JS objects
  graphUtils.ts       ← Helper functions (remove node + edges, etc.)
types/
  graph.ts            ← TypeScript interfaces
```
