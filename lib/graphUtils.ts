import type { GraphNode, GraphEdge, GraphState } from "@/types/graph";

const STORAGE_KEY = "kg-graph-state";

export function loadGraphState(fallback: GraphState): GraphState {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: GraphState = JSON.parse(raw);
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveGraphState(state: GraphState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function removeNodeAndEdges(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeId: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return {
    nodes: nodes.filter((n) => n.id !== nodeId),
    edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
  };
}

export function getConnectedEdges(edges: GraphEdge[], nodeId: string): GraphEdge[] {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId);
}
