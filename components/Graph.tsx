"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types/graph";

interface SimNode extends GraphNode, d3.SimulationNodeDatum {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  label: string;
}

interface GraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onConnect: (sourceId: string, targetId: string) => void;
}

const NODE_RADIUS = 28;
const ARROW_ID = "arrowhead";
const TEMP_ARROW_ID = "temp-arrowhead";

export default function Graph({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onConnect,
}: GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const connectCallbackRef = useRef(onConnect);
  connectCallbackRef.current = onConnect;

  const buildSimData = useCallback(() => {
    const simNodes: SimNode[] = nodes.map((n) => {
      const existing = nodesRef.current.find((sn) => sn.id === n.id);
      return {
        ...n,
        x: existing?.x ?? n.x ?? undefined,
        y: existing?.y ?? n.y ?? undefined,
        fx: n.x != null ? (existing?.fx ?? n.x) : existing?.fx ?? undefined,
        fy: n.y != null ? (existing?.fy ?? n.y) : existing?.fy ?? undefined,
      };
    });

    const nodeIds = new Set(simNodes.map((n) => n.id));
    const simLinks: SimLink[] = edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({ ...e, source: e.source, target: e.target }));

    return { simNodes, simLinks };
  }, [nodes, edges]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl) as d3.Selection<SVGSVGElement, unknown, null, undefined>;
    const width = svgEl.clientWidth;
    const height = svgEl.clientHeight;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // Arrowhead for real edges
    defs
      .append("marker")
      .attr("id", ARROW_ID)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 28)
      .attr("refY", 5)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#64748b");

    // Arrowhead for temp connecting line
    defs
      .append("marker")
      .attr("id", TEMP_ARROW_ID)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#60a5fa");

    // Glow filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    filter
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .join("feMergeNode")
      .attr("in", (d) => d);

    // Zoom layer
    const g = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Groups
    const linkGroup = g.append("g").attr("class", "links");
    const linkLabelGroup = g.append("g").attr("class", "link-labels");
    const tempLineGroup = g.append("g").attr("class", "temp-line");
    const nodeGroup = g.append("g").attr("class", "nodes");

    // Temp connecting line (hidden by default)
    const tempLine = tempLineGroup
      .append("line")
      .attr("stroke", "#60a5fa")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 4")
      .attr("marker-end", `url(#${TEMP_ARROW_ID})`)
      .style("opacity", 0);

    const { simNodes, simLinks } = buildSimData();
    nodesRef.current = simNodes;
    linksRef.current = simLinks;

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(160),
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(50))
      .alphaDecay(0.02);

    simRef.current = simulation;

    // State for shift-drag connecting
    let connectSource: SimNode | null = null;

    function render() {
      const currentNodes = nodesRef.current;
      const currentLinks = linksRef.current;

      // --- Edges ---
      const lines = linkGroup
        .selectAll<SVGLineElement, SimLink>("line")
        .data(currentLinks, (d) => d.id);

      lines.exit().transition().duration(300).style("opacity", 0).remove();

      const linesEnter = lines
        .enter()
        .append("line")
        .attr("stroke", "#475569")
        .attr("stroke-width", 1.5)
        .attr("marker-end", `url(#${ARROW_ID})`)
        .style("opacity", 0);

      linesEnter.transition().duration(400).style("opacity", 1);

      const linesMerged = linesEnter.merge(lines);

      // --- Edge labels ---
      const labels = linkLabelGroup
        .selectAll<SVGTextElement, SimLink>("text")
        .data(currentLinks, (d) => d.id);

      labels.exit().remove();

      const labelsEnter = labels
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", -6)
        .attr("fill", "#94a3b8")
        .attr("font-size", 11)
        .attr("pointer-events", "none");

      const labelsMerged = labelsEnter.merge(labels);
      labelsMerged.text((d) => d.label);

      // --- Nodes ---
      const nodeSelection = nodeGroup
        .selectAll<SVGGElement, SimNode>("g.node")
        .data(currentNodes, (d) => d.id);

      nodeSelection.exit().transition().duration(300).style("opacity", 0).remove();

      const nodeEnter = nodeSelection
        .enter()
        .append("g")
        .attr("class", "node")
        .style("cursor", "pointer")
        .style("opacity", 0);

      nodeEnter.transition().duration(400).style("opacity", 1);

      nodeEnter
        .append("circle")
        .attr("class", "node-circle")
        .attr("r", NODE_RADIUS)
        .attr("fill", "#1e293b")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2);

      // Small outer ring hint for connecting (visible on hover)
      nodeEnter
        .append("circle")
        .attr("class", "connect-ring")
        .attr("r", NODE_RADIUS + 6)
        .attr("fill", "none")
        .attr("stroke", "#60a5fa")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3 3")
        .style("opacity", 0)
        .style("pointer-events", "none");

      nodeEnter
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", NODE_RADIUS + 16)
        .attr("fill", "#e2e8f0")
        .attr("font-size", 12)
        .attr("font-weight", 500)
        .attr("pointer-events", "none");

      const nodeMerged = nodeEnter.merge(nodeSelection);

      nodeMerged.select("text").text((d) => d.title);

      // Highlight logic
      nodeMerged
        .select(".node-circle")
        .attr("fill", (d) => (d.id === selectedNodeId ? "#3b82f6" : "#1e293b"))
        .attr("stroke", (d) => (d.id === selectedNodeId ? "#60a5fa" : "#3b82f6"))
        .attr("stroke-width", (d) => (d.id === selectedNodeId ? 3 : 2))
        .attr("filter", (d) => (d.id === selectedNodeId ? "url(#glow)" : "none"));

      // Show connect ring on hover when shift is held
      nodeMerged
        .on("mouseenter", function (event) {
          if (event.shiftKey || connectSource) {
            d3.select(this).select(".connect-ring").style("opacity", 0.6);
          }
        })
        .on("mouseleave", function () {
          d3.select(this).select(".connect-ring").style("opacity", 0);
        });

      // Dim non-connected elements when a node is selected
      if (selectedNodeId) {
        const connectedIds = new Set<string>();
        connectedIds.add(selectedNodeId);
        currentLinks.forEach((l) => {
          const sId = typeof l.source === "object" ? (l.source as SimNode).id : String(l.source);
          const tId = typeof l.target === "object" ? (l.target as SimNode).id : String(l.target);
          if (sId === selectedNodeId || tId === selectedNodeId) {
            connectedIds.add(sId);
            connectedIds.add(tId);
          }
        });
        nodeMerged.style("opacity", (d) => (connectedIds.has(d.id) ? 1 : 0.15));
        linesMerged.style("opacity", (d) => {
          const sId = typeof d.source === "object" ? (d.source as SimNode).id : String(d.source);
          const tId = typeof d.target === "object" ? (d.target as SimNode).id : String(d.target);
          return sId === selectedNodeId || tId === selectedNodeId ? 1 : 0.08;
        });
        labelsMerged.style("opacity", (d) => {
          const sId = typeof d.source === "object" ? (d.source as SimNode).id : String(d.source);
          const tId = typeof d.target === "object" ? (d.target as SimNode).id : String(d.target);
          return sId === selectedNodeId || tId === selectedNodeId ? 1 : 0.08;
        });
      } else {
        nodeMerged.style("opacity", 1);
        linesMerged.style("opacity", 1);
        labelsMerged.style("opacity", 1);
      }

      // Click handler (only fire if not connecting)
      nodeMerged.on("click", (_event, d) => {
        if (connectSource) return;
        onSelectNode(d.id === selectedNodeId ? null : d.id);
      });

      // Drag: normal move OR shift+drag to connect
      const drag = d3
        .drag<SVGGElement, SimNode>()
        .on("start", function (event, d) {
          if (event.sourceEvent?.shiftKey) {
            connectSource = d;
            tempLine
              .attr("x1", d.x!)
              .attr("y1", d.y!)
              .attr("x2", d.x!)
              .attr("y2", d.y!)
              .style("opacity", 1);
            return;
          }
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", function (event, d) {
          if (connectSource) {
            const transform = d3.zoomTransform(svgRef.current!);
            const [mx, my] = transform.invert([event.sourceEvent.offsetX, event.sourceEvent.offsetY]);
            tempLine.attr("x2", mx).attr("y2", my);

            // Highlight node under cursor
            nodeMerged.select(".connect-ring").style("opacity", function (nd: SimNode) {
              if (nd.id === connectSource!.id) return 0;
              const dx = nd.x! - mx;
              const dy = nd.y! - my;
              return Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS + 10 ? 0.6 : 0;
            });
            return;
          }
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", function (event, d) {
          if (connectSource) {
            tempLine.style("opacity", 0);
            nodeMerged.select(".connect-ring").style("opacity", 0);

            const transform = d3.zoomTransform(svgRef.current!);
            const [mx, my] = transform.invert([event.sourceEvent.offsetX, event.sourceEvent.offsetY]);

            // Find target node under cursor
            const target = currentNodes.find((n) => {
              if (n.id === connectSource!.id) return false;
              const dx = n.x! - mx;
              const dy = n.y! - my;
              return Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS + 10;
            });

            if (target) {
              connectCallbackRef.current(connectSource.id, target.id);
            }

            connectSource = null;
            return;
          }
          if (!event.active) simulation.alphaTarget(0);
          d.fx = event.x;
          d.fy = event.y;
          onUpdateNodePosition(d.id, event.x, event.y);
        });

      nodeMerged.call(drag);

      // Tick handler
      simulation.on("tick", () => {
        linesMerged
          .attr("x1", (d) => (d.source as SimNode).x!)
          .attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!)
          .attr("y2", (d) => (d.target as SimNode).y!);

        labelsMerged
          .attr("x", (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
          .attr("y", (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);

        nodeMerged.attr("transform", (d) => `translate(${d.x},${d.y})`);

        // Keep temp line attached to source if simulation moves it
        if (connectSource) {
          tempLine.attr("x1", connectSource.x!).attr("y1", connectSource.y!);
        }
      });
    }

    render();

    (simRef.current as unknown as Record<string, unknown>)._render = render;

    return () => {
      simulation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync data when nodes/edges change
  useEffect(() => {
    const simulation = simRef.current;
    if (!simulation) return;

    const { simNodes, simLinks } = buildSimData();
    nodesRef.current = simNodes;
    linksRef.current = simLinks;

    simulation.nodes(simNodes);
    const linkForce = simulation.force("link") as d3.ForceLink<SimNode, SimLink>;
    if (linkForce) linkForce.links(simLinks);

    const renderFn = (simulation as unknown as Record<string, unknown>)._render as (() => void) | undefined;
    if (renderFn) renderFn();

    simulation.alpha(0.3).restart();
  }, [nodes, edges, selectedNodeId, buildSimData]);

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if ((e.target as Element).tagName === "svg") {
        onSelectNode(null);
      }
    },
    [onSelectNode],
  );

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-[#0f172a]"
      onClick={handleSvgClick}
    />
  );
}
