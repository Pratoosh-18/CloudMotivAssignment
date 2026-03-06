"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GraphNode, GraphEdge, GraphState } from "@/types/graph";
import { seedData } from "@/lib/seedData";
import { loadGraphState, saveGraphState, removeNodeAndEdges } from "@/lib/graphUtils";

export function useGraphState() {
  const initialized = useRef(false);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadGraphState(seedData);
    setNodes(saved.nodes);
    setEdges(saved.edges);
  }, []);

  const persist = useCallback((nextNodes: GraphNode[], nextEdges: GraphEdge[]) => {
    saveGraphState({ nodes: nextNodes, edges: nextEdges });
  }, []);

  const addNode = useCallback((title: string, note: string) => {
    const defaultX = 400 + (Math.random() - 0.5) * 200;
    const defaultY = 300 + (Math.random() - 0.5) * 200;
    const newNode: GraphNode = {
      id: crypto.randomUUID(),
      title,
      note,
      x: defaultX,
      y: defaultY,
    };
    setNodes((prev) => {
      const next = [...prev, newNode];
      setEdges((e) => { persist(next, e); return e; });
      return next;
    });
    return newNode;
  }, [persist]);

  const updateNode = useCallback((id: string, updates: Partial<Pick<GraphNode, "title" | "note" | "x" | "y">>) => {
    setNodes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      setEdges((e) => { persist(next, e); return e; });
      return next;
    });
  }, [persist]);

  const deleteNode = useCallback((id: string) => {
    setNodes((prevNodes) => {
      setEdges((prevEdges) => {
        const result = removeNodeAndEdges(prevNodes, prevEdges, id);
        persist(result.nodes, result.edges);
        setNodes(result.nodes);
        return result.edges;
      });
      return prevNodes;
    });
  }, [persist]);

  const addEdge = useCallback((source: string, target: string, label: string) => {
    const newEdge: GraphEdge = {
      id: crypto.randomUUID(),
      source,
      target,
      label,
    };
    setEdges((prev) => {
      const next = [...prev, newEdge];
      setNodes((n) => { persist(n, next); return n; });
      return next;
    });
    return newEdge;
  }, [persist]);

  const updateEdge = useCallback((id: string, updates: Partial<Pick<GraphEdge, "label">>) => {
    setEdges((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      setNodes((n) => { persist(n, next); return n; });
      return next;
    });
  }, [persist]);

  const deleteEdge = useCallback((id: string) => {
    setEdges((prev) => {
      const next = prev.filter((e) => e.id !== id);
      setNodes((n) => { persist(n, next); return n; });
      return next;
    });
  }, [persist]);

  const state: GraphState = { nodes, edges };

  return { nodes, edges, state, addNode, updateNode, deleteNode, addEdge, updateEdge, deleteEdge };
}
