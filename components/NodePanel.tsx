"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GraphNode, GraphEdge } from "@/types/graph";
import { getConnectedEdges } from "@/lib/graphUtils";

interface NodePanelProps {
  node: GraphNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onUpdateNode: (id: string, updates: Partial<Pick<GraphNode, "title" | "note">>) => void;
  onDeleteNode: (id: string) => void;
  onUpdateEdge: (id: string, updates: Partial<Pick<GraphEdge, "label">>) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
}

export default function NodePanel({
  node,
  edges,
  allNodes,
  onUpdateNode,
  onDeleteNode,
  onUpdateEdge,
  onDeleteEdge,
  onClose,
}: NodePanelProps) {
  const [title, setTitle] = useState(node.title);
  const [note, setNote] = useState(node.note);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(node.title);
    setNote(node.note);
    setConfirmDelete(false);
    setEditingEdgeId(null);
  }, [node]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingEdgeId) {
          setEditingEdgeId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, editingEdgeId]);

  const connectedEdges = getConnectedEdges(edges, node.id);

  const handleSave = useCallback(() => {
    onUpdateNode(node.id, { title: title.trim() || node.title, note });
  }, [node, title, note, onUpdateNode]);

  const handleEdgeLabelSave = useCallback(
    (edgeId: string) => {
      const trimmed = editingLabel.trim();
      if (trimmed) {
        onUpdateEdge(edgeId, { label: trimmed });
      }
      setEditingEdgeId(null);
    },
    [editingLabel, onUpdateEdge],
  );

  const getNodeTitle = (id: string) => allNodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div
      ref={panelRef}
      className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white truncate">Edit Node</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          aria-label="Close panel"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Title */}
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </label>

        {/* Note */}
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-y"
          />
        </label>

        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-colors"
        >
          Save
        </button>

        {/* Connected edges */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">
            Connected Edges ({connectedEdges.length})
          </h3>
          {connectedEdges.length === 0 && (
            <p className="text-sm text-slate-500">No edges connected.</p>
          )}
          <ul className="space-y-2">
            {connectedEdges.map((edge) => (
              <li
                key={edge.id}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 truncate mr-2">
                    {getNodeTitle(edge.source)}
                    <span className="text-slate-500 mx-1">&rarr;</span>
                    {getNodeTitle(edge.target)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEdgeId(edge.id);
                        setEditingLabel(edge.label);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteEdge(edge.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline label display / edit */}
                {editingEdgeId === edge.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdgeLabelSave(edge.id);
                      }}
                      autoFocus
                      className="flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white text-xs focus:border-blue-500 outline-none transition"
                    />
                    <button
                      onClick={() => handleEdgeLabelSave(edge.id)}
                      className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingEdgeId(null)}
                      className="text-slate-400 hover:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-xs mt-1">{edge.label}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Delete node */}
        <div className="pt-3 border-t border-slate-700">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 font-medium py-2 transition-colors"
            >
              Delete Node
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-400">
                This will also remove all connected edges. Continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDeleteNode(node.id);
                    onClose();
                  }}
                  className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium py-2 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
