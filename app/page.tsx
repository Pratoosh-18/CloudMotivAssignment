"use client";

import { useState, useMemo, useCallback } from "react";
import Graph from "@/components/Graph";
import NodePanel from "@/components/NodePanel";
import AddNodeModal from "@/components/AddNodeModal";
import AddEdgeModal from "@/components/AddEdgeModal";
import { useGraphState } from "@/hooks/useGraphState";

export default function Home() {
  const {
    nodes,
    edges,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    updateEdge,
    deleteEdge,
  } = useGraphState();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [pendingConnect, setPendingConnect] = useState<{ source: string; target: string } | null>(null);
  const [connectLabel, setConnectLabel] = useState("");

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    updateNode(id, { x, y });
  };

  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    setPendingConnect({ source: sourceId, target: targetId });
    setConnectLabel("");
  }, []);

  const handleConfirmConnect = useCallback(() => {
    if (pendingConnect && connectLabel.trim()) {
      addEdge(pendingConnect.source, pendingConnect.target, connectLabel.trim());
    }
    setPendingConnect(null);
    setConnectLabel("");
  }, [pendingConnect, connectLabel, addEdge]);

  const getNodeTitle = (id: string) => nodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-blue-400">Knowledge</span> Graph
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Shift + drag between nodes to connect
          </span>
          <button
            onClick={() => setShowAddNode(true)}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-sm font-medium transition-colors"
          >
            + Add Node
          </button>
          <button
            onClick={() => setShowAddEdge(true)}
            className="rounded-lg border border-slate-600 hover:bg-slate-800 px-4 py-1.5 text-sm font-medium transition-colors"
          >
            + Add Edge
          </button>
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 relative overflow-hidden">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <p className="text-slate-400 text-lg">No nodes yet.</p>
              <button
                onClick={() => setShowAddNode(true)}
                className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm font-medium transition-colors"
              >
                Add your first node
              </button>
            </div>
          </div>
        ) : (
          <Graph
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodePosition={handleUpdatePosition}
            onConnect={handleConnect}
          />
        )}
      </main>

      {/* Side panel */}
      {selectedNode && (
        <NodePanel
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          onUpdateNode={updateNode}
          onDeleteNode={(id) => {
            deleteNode(id);
            setSelectedNodeId(null);
          }}
          onUpdateEdge={updateEdge}
          onDeleteEdge={deleteEdge}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Modals */}
      {showAddNode && (
        <AddNodeModal
          onAdd={addNode}
          onClose={() => setShowAddNode(false)}
        />
      )}
      {showAddEdge && (
        <AddEdgeModal
          nodes={nodes}
          onAdd={addEdge}
          onClose={() => setShowAddEdge(false)}
        />
      )}

      {/* Inline connect label prompt */}
      {pendingConnect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setPendingConnect(null); }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); handleConfirmConnect(); }}
            className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 animate-fade-in"
          >
            <h2 className="text-lg font-semibold text-white">Connect Nodes</h2>
            <p className="text-sm text-slate-400">
              <span className="text-white font-medium">{getNodeTitle(pendingConnect.source)}</span>
              <span className="mx-2">&rarr;</span>
              <span className="text-white font-medium">{getNodeTitle(pendingConnect.target)}</span>
            </p>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">
                Relationship Label <span className="text-red-400">*</span>
              </span>
              <input
                type="text"
                value={connectLabel}
                onChange={(e) => setConnectLabel(e.target.value)}
                required
                autoFocus
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder='e.g. "depends on"'
              />
            </label>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-colors"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => setPendingConnect(null)}
                className="flex-1 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
