"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { SiDocker } from "react-icons/si";

// ============================================================================
// Types
// ============================================================================
interface Position {
  x: number;
  y: number;
}

interface DiagramConfig {
  width: number;
  height: number;
  zones: ZoneConfig[];
  positions: {
    client: Position;
    grpc: Position;
    metadata: Position;
    content: Position;
    snapshots: Position;
    runtime: Position;
    container: Position;
  };
  colors: {
    api: string;
    services: string;
    runtime: string;
    highlight: string;
    success: string;
    warning: string;
  };
}

interface ZoneConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  text: string;
}

// ============================================================================
// Configuration
// ============================================================================
const config: DiagramConfig = {
  width: 1000,
  height: 500,
  zones: [
    { id: "api", label: "gRPC API", x: 20, y: 50, w: 220, h: 180, color: "#dbeafe", text: "#1e40af" },
    { id: "services", label: "CORE SERVICES", x: 20, y: 250, w: 460, h: 200, color: "#d1fae5", text: "#065f46" },
    { id: "runtime", label: "RUNTIME & EXECUTION", x: 520, y: 50, w: 460, h: 400, color: "#fef3c7", text: "#78350f" },
  ],
  positions: {
    client: { x: 130, y: 140 },
    grpc: { x: 320, y: 140 },
    metadata: { x: 130, y: 330 },
    content: { x: 250, y: 330 },
    snapshots: { x: 370, y: 330 },
    runtime: { x: 750, y: 200 },
    container: { x: 750, y: 350 },
  },
  colors: {
    api: "#3b82f6",
    services: "#10b981",
    runtime: "#f59e0b",
    highlight: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
  },
};

// ============================================================================
// Main Component
// ============================================================================
export default function ContainerdArchitecturePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerdArchitectureDiagram />
    </div>
  );
}

function ContainerdArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, color: string = "text-green-400") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, message, color }]);
  }, []);

  // Initialize SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw Zone Backgrounds
    const zoneGroups = svg
      .selectAll(".zone")
      .data(config.zones)
      .enter()
      .append("g")
      .attr("class", "zone");

    zoneGroups
      .append("rect")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.w)
      .attr("height", (d) => d.h)
      .attr("rx", 10)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2);

    zoneGroups
      .append("text")
      .attr("x", (d) => d.x + d.w / 2)
      .attr("y", (d) => d.y + 25)
      .attr("text-anchor", "middle")
      .style("fill", (d) => d.text)
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .style("font-size", "13px")
      .text((d) => d.label);

    // ========================================
    // gRPC API Client
    // ========================================
    const clientGroup = svg.append("g").attr("transform", `translate(${config.positions.client.x}, ${config.positions.client.y})`);
    clientGroup.append("rect").attr("x", -60).attr("y", -30).attr("width", 120).attr("height", 60).attr("fill", "#3b82f6").attr("stroke", "#1e40af").attr("stroke-width", 2).attr("rx", 5);
    clientGroup.append("text").attr("text-anchor", "middle").attr("dy", -5).attr("fill", "white").style("font-size", "11px").style("font-weight", "600").text("Docker");
    clientGroup.append("text").attr("text-anchor", "middle").attr("dy", 8).attr("fill", "white").style("font-size", "11px").style("font-weight", "600").text("Daemon");

    // ========================================
    // gRPC Server
    // ========================================
    const grpcGroup = svg.append("g").attr("transform", `translate(${config.positions.grpc.x}, ${config.positions.grpc.y})`);
    grpcGroup.append("rect").attr("x", -70).attr("y", -30).attr("width", 140).attr("height", 60).attr("fill", "#60a5fa").attr("stroke", "#2563eb").attr("stroke-width", 2).attr("rx", 5);
    grpcGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "12px").style("font-weight", "600").text("gRPC Server");

    // ========================================
    // Metadata Service
    // ========================================
    const metadataGroup = svg.append("g").attr("transform", `translate(${config.positions.metadata.x}, ${config.positions.metadata.y})`);
    metadataGroup.append("rect").attr("x", -60).attr("y", -35).attr("width", 120).attr("height", 70).attr("fill", "#a7f3d0").attr("stroke", "#10b981").attr("stroke-width", 2).attr("rx", 5);
    metadataGroup.append("text").attr("text-anchor", "middle").attr("dy", -10).attr("fill", "#065f46").style("font-size", "11px").style("font-weight", "600").text("Metadata");
    metadataGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#065f46").style("font-size", "10px").text("Container Info");
    metadataGroup.append("text").attr("text-anchor", "middle").attr("dy", 18).attr("fill", "#065f46").style("font-size", "10px").text("Images, Tasks");

    // ========================================
    // Content Store
    // ========================================
    const contentGroup = svg.append("g").attr("transform", `translate(${config.positions.content.x}, ${config.positions.content.y})`);
    contentGroup.append("rect").attr("x", -60).attr("y", -35).attr("width", 120).attr("height", 70).attr("fill", "#6ee7b7").attr("stroke", "#059669").attr("stroke-width", 2).attr("rx", 5);
    contentGroup.append("text").attr("text-anchor", "middle").attr("dy", -10).attr("fill", "#065f46").style("font-size", "11px").style("font-weight", "600").text("Content");
    contentGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#065f46").style("font-size", "10px").text("Image Layers");
    contentGroup.append("text").attr("text-anchor", "middle").attr("dy", 18).attr("fill", "#065f46").style("font-size", "10px").text("Blobs");

    // ========================================
    // Snapshots
    // ========================================
    const snapshotGroup = svg.append("g").attr("transform", `translate(${config.positions.snapshots.x}, ${config.positions.snapshots.y})`);
    snapshotGroup.append("rect").attr("x", -60).attr("y", -35).attr("width", 120).attr("height", 70).attr("fill", "#34d399").attr("stroke", "#047857").attr("stroke-width", 2).attr("rx", 5);
    snapshotGroup.append("text").attr("text-anchor", "middle").attr("dy", -10).attr("fill", "#064e3b").style("font-size", "11px").style("font-weight", "600").text("Snapshots");
    snapshotGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#064e3b").style("font-size", "10px").text("Filesystem");
    snapshotGroup.append("text").attr("text-anchor", "middle").attr("dy", 18).attr("fill", "#064e3b").style("font-size", "10px").text("Layers");

    // ========================================
    // Runtime (runc)
    // ========================================
    const runtimeGroup = svg.append("g").attr("transform", `translate(${config.positions.runtime.x}, ${config.positions.runtime.y})`);
    runtimeGroup.append("rect").attr("x", -90).attr("y", -40).attr("width", 180).attr("height", 80).attr("fill", "#fcd34d").attr("stroke", "#f59e0b").attr("stroke-width", 2).attr("rx", 5);
    runtimeGroup.append("text").attr("text-anchor", "middle").attr("dy", -15).attr("fill", "#78350f").style("font-size", "12px").style("font-weight", "600").text("Runtime (runc)");
    runtimeGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#92400e").style("font-size", "10px").text("OCI Spec");
    runtimeGroup.append("text").attr("text-anchor", "middle").attr("dy", 18).attr("fill", "#92400e").style("font-size", "10px").text("Process Lifecycle");

    // ========================================
    // Running Container
    // ========================================
    const containerGroup = svg.append("g").attr("transform", `translate(${config.positions.container.x}, ${config.positions.container.y})`);
    containerGroup.append("rect").attr("x", -90).attr("y", -40).attr("width", 180).attr("height", 80).attr("fill", "#fed7aa").attr("stroke", "#ea580c").attr("stroke-width", 2).attr("rx", 5);

    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", -15).attr("fill", "#7c2d12").style("font-size", "12px").style("font-weight", "600").text("Running Container");

    containerGroup.append("circle").attr("cx", 0).attr("cy", 5).attr("r", 5).attr("fill", "#22c55e");
    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", 22).attr("fill", "#9a3412").style("font-size", "10px").text("PID, Namespaces");

    // Static connection lines
    svg.append("line").attr("x1", 190).attr("y1", 140).attr("x2", 250).attr("y2", 140).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 320).attr("y1", 170).attr("x2", 320).attr("y2", 250).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 130).attr("y1", 260).attr("x2", 130).attr("y2", 295).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 250).attr("y1", 260).attr("x2", 250).attr("y2", 295).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 370).attr("y1", 260).attr("x2", 370).attr("y2", 295).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 480).attr("y1", 330).attr("x2", 660).attr("y2", 200).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 750).attr("y1", 240).attr("x2", 750).attr("y2", 310).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    // Create Dynamic Layers
    svg.append("g").attr("id", "connections");
    svg.append("g").attr("id", "particles");
    svg.append("g").attr("id", "objects");
  }, []);

  const createParticle = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    start: Position,
    end: Position,
    color: string,
    duration: number,
    callback?: () => void
  ) => {
    const particleLayer = svg.select("#particles");
    const p = particleLayer
      .append("circle")
      .attr("cx", start.x)
      .attr("cy", start.y)
      .attr("r", 6)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    p.transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attr("cx", end.x)
      .attr("cy", end.y)
      .on("end", () => {
        p.remove();
        if (callback) callback();
      });
  };

  const drawConnection = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = "#3b82f6"
  ) => {
    const connectionLayer = svg.select("#connections");
    const line = connectionLayer
      .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x1)
      .attr("y2", y1)
      .attr("stroke", color)
      .attr("stroke-width", 3);

    line.transition().duration(400).attr("x2", x2).attr("y2", y2);
    return line;
  };

  const resetLines = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    svg.select("#connections").selectAll("*").transition().duration(300).style("opacity", 0).remove();
  };

  // Action: Create Container
  const handleCreate = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("containerd: Create container request", "text-blue-400");

    drawConnection(svg, pos.client.x + 60, pos.client.y, pos.grpc.x - 70, pos.grpc.y, "#3b82f6");
    createParticle(svg, { x: pos.client.x + 60, y: pos.client.y }, { x: pos.grpc.x - 70, y: pos.grpc.y }, "#3b82f6", 600, () => {
      addLog("gRPC: Processing create request", "text-purple-400");

      createParticle(svg, { x: pos.grpc.x, y: pos.grpc.y + 30 }, { x: pos.metadata.x, y: pos.metadata.y - 35 }, "#10b981", 600, () => {
        addLog("Metadata: Storing container info", "text-green-400");

        setTimeout(() => {
          createParticle(svg, { x: pos.grpc.x, y: pos.grpc.y + 30 }, { x: pos.content.x, y: pos.content.y - 35 }, "#10b981", 600, () => {
            addLog("Content: Pulling image layers", "text-green-400");

            setTimeout(() => {
              createParticle(svg, { x: pos.snapshots.x, y: pos.snapshots.y }, { x: pos.runtime.x - 90, y: pos.runtime.y }, "#f59e0b", 700, () => {
                addLog("Runtime: Creating container from snapshot", "text-yellow-400");

                createParticle(svg, { x: pos.runtime.x, y: pos.runtime.y + 40 }, { x: pos.container.x, y: pos.container.y - 40 }, "#ea580c", 600, () => {
                  addLog("Container created successfully!", "text-green-500");
                  resetLines(svg);
                  setIsAnimating(false);
                });
              });
            }, 700);
          });
        }, 700);
      });
    });
  };

  // Action: Start Container
  const handleStart = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("containerd: Start container request", "text-purple-400");

    drawConnection(svg, pos.client.x + 60, pos.client.y, pos.runtime.x - 90, pos.runtime.y, "#8b5cf6");
    createParticle(svg, { x: pos.client.x + 60, y: pos.client.y }, { x: pos.runtime.x - 90, y: pos.runtime.y }, "#8b5cf6", 800, () => {
      addLog("Runtime: Starting container process", "text-yellow-400");

      createParticle(svg, { x: pos.runtime.x, y: pos.runtime.y + 40 }, { x: pos.container.x, y: pos.container.y - 40 }, "#22c55e", 600, () => {
        addLog("Container started and running!", "text-green-500");
        resetLines(svg);
        setIsAnimating(false);
      });
    });
  };

  // Action: List Containers
  const handleList = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("containerd: List containers request", "text-cyan-400");

    drawConnection(svg, pos.client.x + 60, pos.client.y, pos.metadata.x, pos.metadata.y - 35, "#06b6d4");
    createParticle(svg, { x: pos.client.x + 60, y: pos.client.y }, { x: pos.metadata.x, y: pos.metadata.y - 35 }, "#06b6d4", 700, () => {
      addLog("Metadata: Fetching container list", "text-green-400");

      setTimeout(() => {
        addLog("CONTAINER            IMAGE         STATUS", "text-green-400");
        addLog("nginx-prod          nginx:latest  running", "text-green-400");
        resetLines(svg);
        setIsAnimating(false);
      }, 500);
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-green-400" />
            containerd Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">Industry-standard container runtime with gRPC API and pluggable services.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleCreate}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            Create
          </button>
          <button
            onClick={handleStart}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            Start
          </button>
          <button
            onClick={handleList}
            disabled={isAnimating}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            List
          </button>
        </div>
      </div>

      {/* Diagram */}
      <div className="bg-slate-50 dark:bg-zinc-800 p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="w-full"
          style={{ maxHeight: "420px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Logger - Separate section below diagram */}
      <div className="bg-slate-900 p-3 border-t border-slate-700">
        <div className="font-mono text-xs md:text-sm h-28 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500">{"// containerd ready..."}</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`${log.color} mb-1`}>
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
