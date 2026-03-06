"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GraphNode } from "@/types/graph";

interface AddEdgeModalProps {
  nodes: GraphNode[];
  onAdd: (source: string, target: string, label: string) => void;
  onClose: () => void;
}

export default function AddEdgeModal({ nodes, onAdd, onClose }: AddEdgeModalProps) {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!source || !target || !label.trim()) return;
      if (source === target) {
        setError("Source and target must be different nodes.");
        return;
      }
      onAdd(source, target, label.trim());
      onClose();
    },
    [source, target, label, onAdd, onClose],
  );

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 animate-fade-in"
      >
        <h2 className="text-lg font-semibold text-white">Add Edge</h2>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">Source Node</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          >
            <option value="">Select source…</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">Target Node</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          >
            <option value="">Select target…</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Relationship Label <span className="text-red-400">*</span>
          </span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            placeholder='e.g. "depends on"'
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
