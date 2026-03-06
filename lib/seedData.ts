import type { GraphState } from "@/types/graph";

const SEED_POSITIONS: [number, number][] = [
  [320, 180], 
  [520, 180], 
  [720, 280], 
  [120, 380], 
  [320, 380], 
  [520, 380], 
  [120, 180], 
  [720, 180], 
];

export const seedData: GraphState = {
  nodes: [
    { id: "1", title: "React", note: "A JavaScript library for building user interfaces using components.", x: SEED_POSITIONS[0][0], y: SEED_POSITIONS[0][1] },
    { id: "2", title: "Next.js", note: "React framework with SSR, routing, and API support built in.", x: SEED_POSITIONS[1][0], y: SEED_POSITIONS[1][1] },
    { id: "3", title: "TypeScript", note: "Typed superset of JavaScript that compiles to plain JS.", x: SEED_POSITIONS[2][0], y: SEED_POSITIONS[2][1] },
    { id: "4", title: "State Management", note: "Patterns for managing shared application state (Context, Zustand, Redux).", x: SEED_POSITIONS[3][0], y: SEED_POSITIONS[3][1] },
    { id: "5", title: "Component Design", note: "Principles for building reusable, composable UI components.", x: SEED_POSITIONS[4][0], y: SEED_POSITIONS[4][1] },
    { id: "6", title: "Performance", note: "Techniques like memoization, lazy loading, and virtualization.", x: SEED_POSITIONS[5][0], y: SEED_POSITIONS[5][1] },
    { id: "7", title: "Testing", note: "Unit, integration, and e2e testing strategies for frontend apps.", x: SEED_POSITIONS[6][0], y: SEED_POSITIONS[6][1] },
    { id: "8", title: "CSS & Styling", note: "Styling approaches including Tailwind, CSS Modules, and styled-components.", x: SEED_POSITIONS[7][0], y: SEED_POSITIONS[7][1] },
  ],
  edges: [
    { id: "e1", source: "2", target: "1", label: "built on" },
    { id: "e2", source: "1", target: "3", label: "pairs well with" },
    { id: "e3", source: "1", target: "4", label: "uses" },
    { id: "e4", source: "1", target: "5", label: "guides" },
    { id: "e5", source: "2", target: "6", label: "improves" },
    { id: "e6", source: "1", target: "7", label: "requires" },
    { id: "e7", source: "1", target: "8", label: "styled with" },
    { id: "e8", source: "4", target: "6", label: "impacts" },
    { id: "e9", source: "5", target: "6", label: "impacts" },
  ],
};
