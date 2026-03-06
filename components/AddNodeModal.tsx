"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AddNodeModalProps {
  onAdd: (title: string, note: string) => void;
  onClose: () => void;
}

export default function AddNodeModal({ onAdd, onClose }: AddNodeModalProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onAdd(title.trim(), note.trim());
      onClose();
    },
    [title, note, onAdd, onClose],
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
        <h2 className="text-lg font-semibold text-white">Add Node</h2>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Title <span className="text-red-400">*</span>
          </span>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            placeholder="e.g. GraphQL"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">Note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-y"
            placeholder="Optional description..."
          />
        </label>

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
