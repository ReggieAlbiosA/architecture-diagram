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
    containerd: Position;
    ociSpec: Position;
    runc: Position;
    namespaces: Position;
    cgroups: Position;
    rootfs: Position;
    container: Position;
  };
  colors: {
    containerd: string;
    spec: string;
    runc: string;
    kernel: string;
    container: string;
    highlight: string;
    success: string;
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
    { id: "runtime", label: "RUNTIME LAYER", x: 20, y: 50, w: 280, h: 180, color: "#dcfce7", text: "#14532d" },
    { id: "kernel", label: "LINUX KERNEL", x: 20, y: 250, w: 460, h: 200, color: "#fee2e2", text: "#7f1d1d" },
    { id: "container", label: "CONTAINER PROCESS", x: 520, y: 50, w: 460, h: 400, color: "#dbeafe", text: "#1e3a8a" },
  ],
  positions: {
    containerd: { x: 160, y: 140 },
    ociSpec: { x: 360, y: 140 },
    runc: { x: 160, y: 330 },
    namespaces: { x: 250, y: 360 },
    cgroups: { x: 360, y: 360 },
    rootfs: { x: 750, y: 180 },
    container: { x: 750, y: 330 },
  },
  colors: {
    containerd: "#10b981",
    spec: "#8b5cf6",
    runc: "#f59e0b",
    kernel: "#ef4444",
    container: "#3b82f6",
    highlight: "#3b82f6",
    success: "#22c55e",
  },
};

// ============================================================================
// Main Component
// ============================================================================
export default function RuncArchitecturePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <RuncArchitectureDiagram />
    </div>
  );
}

function RuncArchitectureDiagram() {
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
    // containerd
    // ========================================
    const containerdGroup = svg.append("g").attr("transform", `translate(${config.positions.containerd.x}, ${config.positions.containerd.y})`);
    containerdGroup.append("rect").attr("x", -70).attr("y", -30).attr("width", 140).attr("height", 60).attr("fill", "#10b981").attr("stroke", "#059669").attr("stroke-width", 2).attr("rx", 5);
    containerdGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "12px").style("font-weight", "600").text("containerd");

    // ========================================
    // OCI Runtime Spec
    // ========================================
    const specGroup = svg.append("g").attr("transform", `translate(${config.positions.ociSpec.x}, ${config.positions.ociSpec.y})`);
    specGroup.append("rect").attr("x", -80).attr("y", -40).attr("width", 160).attr("height", 80).attr("fill", "#e9d5ff").attr("stroke", "#8b5cf6").attr("stroke-width", 2).attr("rx", 5);
    specGroup.append("text").attr("text-anchor", "middle").attr("dy", -12).attr("fill", "#581c87").style("font-size", "12px").style("font-weight", "600").text("OCI Spec");
    specGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#6b21a8").style("font-size", "10px").text("config.json");
    specGroup.append("text").attr("text-anchor", "middle").attr("dy", 18).attr("fill", "#6b21a8").style("font-size", "10px").text("runtime.json");

    // ========================================
    // runc CLI
    // ========================================
    const runcGroup = svg.append("g").attr("transform", `translate(${config.positions.runc.x}, ${config.positions.runc.y})`);
    runcGroup.append("rect").attr("x", -70).attr("y", -35).attr("width", 140).attr("height", 70).attr("fill", "#fbbf24").attr("stroke", "#f59e0b").attr("stroke-width", 2).attr("rx", 5);
    runcGroup.append("text").attr("text-anchor", "middle").attr("dy", -10).attr("fill", "#78350f").style("font-size", "13px").style("font-weight", "bold").text("runc");
    runcGroup.append("text").attr("text-anchor", "middle").attr("dy", 8).attr("fill", "#92400e").style("font-size", "10px").text("OCI Runtime");

    // ========================================
    // Namespaces
    // ========================================
    const nsGroup = svg.append("g").attr("transform", `translate(${config.positions.namespaces.x}, ${config.positions.namespaces.y})`);
    nsGroup.append("rect").attr("x", -55).attr("y", -25).attr("width", 110).attr("height", 50).attr("fill", "#fca5a5").attr("stroke", "#dc2626").attr("stroke-width", 2).attr("rx", 5);
    nsGroup.append("text").attr("text-anchor", "middle").attr("dy", -5).attr("fill", "#7f1d1d").style("font-size", "11px").style("font-weight", "600").text("Namespaces");
    nsGroup.append("text").attr("text-anchor", "middle").attr("dy", 10).attr("fill", "#991b1b").style("font-size", "9px").text("PID, NET, MNT");

    // ========================================
    // Cgroups
    // ========================================
    const cgroupGroup = svg.append("g").attr("transform", `translate(${config.positions.cgroups.x}, ${config.positions.cgroups.y})`);
    cgroupGroup.append("rect").attr("x", -55).attr("y", -25).attr("width", 110).attr("height", 50).attr("fill", "#f87171").attr("stroke", "#b91c1c").attr("stroke-width", 2).attr("rx", 5);
    cgroupGroup.append("text").attr("text-anchor", "middle").attr("dy", -5).attr("fill", "#7f1d1d").style("font-size", "11px").style("font-weight", "600").text("Cgroups");
    cgroupGroup.append("text").attr("text-anchor", "middle").attr("dy", 10).attr("fill", "#991b1b").style("font-size", "9px").text("CPU, Memory");

    // ========================================
    // Root Filesystem
    // ========================================
    const rootfsGroup = svg.append("g").attr("transform", `translate(${config.positions.rootfs.x}, ${config.positions.rootfs.y})`);
    rootfsGroup.append("rect").attr("x", -90).attr("y", -40).attr("width", 180).attr("height", 80).attr("fill", "#bfdbfe").attr("stroke", "#3b82f6").attr("stroke-width", 2).attr("rx", 5);
    rootfsGroup.append("text").attr("text-anchor", "middle").attr("dy", -15).attr("fill", "#1e3a8a").style("font-size", "12px").style("font-weight", "600").text("Root Filesystem");
    rootfsGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#1e40af").style("font-size", "10px").text("/bin, /lib, /etc");
    rootfsGroup.append("text").attr("text-anchor", "middle").attr("dy", 18).attr("fill", "#1e40af").style("font-size", "10px").text("Overlay/AUFS");

    // ========================================
    // Container Process
    // ========================================
    const containerGroup = svg.append("g").attr("transform", `translate(${config.positions.container.x}, ${config.positions.container.y})`);
    containerGroup.append("rect").attr("x", -90).attr("y", -50).attr("width", 180).attr("height", 100).attr("fill", "#93c5fd").attr("stroke", "#2563eb").attr("stroke-width", 2).attr("rx", 5);

    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", -25).attr("fill", "#1e3a8a").style("font-size", "13px").style("font-weight", "bold").text("Container Process");

    containerGroup.append("circle").attr("cx", 0).attr("cy", -5).attr("r", 5).attr("fill", "#22c55e");
    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", 10).attr("fill", "#1e40af").style("font-size", "10px").text("PID: 1 (isolated)");

    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", 25).attr("fill", "#1e40af").style("font-size", "10px").text("nginx master");
    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", 38).attr("fill", "#1e40af").style("font-size", "10px").text("Resource limits applied");

    // Static connection lines
    svg.append("line").attr("x1", 230).attr("y1", 140).attr("x2", 280).attr("y2", 140).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 160).attr("y1", 170).attr("x2", 160).attr("y2", 295).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 360).attr("y1", 180).attr("x2", 360).attr("y2", 250).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 230).attr("y1", 330).attr("x2", 305).attr("y2", 360).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 230).attr("y1", 330).attr("x2", 195).attr("y2", 360).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 480).attr("y1", 330).attr("x2", 660).attr("y2", 330).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 750).attr("y1", 220).attr("x2", 750).attr("y2", 280).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

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

  // Action: Create
  const handleCreate = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ runc create nginx-container", "text-blue-400");

    drawConnection(svg, pos.containerd.x + 70, pos.containerd.y, pos.ociSpec.x - 80, pos.ociSpec.y, "#8b5cf6");
    createParticle(svg, { x: pos.containerd.x + 70, y: pos.containerd.y }, { x: pos.ociSpec.x - 80, y: pos.ociSpec.y }, "#8b5cf6", 600, () => {
      addLog("Reading OCI runtime specification", "text-purple-400");

      createParticle(svg, { x: pos.ociSpec.x, y: pos.ociSpec.y + 40 }, { x: pos.runc.x, y: pos.runc.y - 35 }, "#f59e0b", 700, () => {
        addLog("runc: Parsing container configuration", "text-yellow-400");

        setTimeout(() => {
          // Setup namespaces
          createParticle(svg, { x: pos.runc.x + 70, y: pos.runc.y }, { x: pos.namespaces.x - 55, y: pos.namespaces.y }, "#dc2626", 500, () => {
            addLog("Kernel: Creating namespaces (PID, NET, MNT, UTS, IPC)", "text-red-400");
          });

          // Setup cgroups
          setTimeout(() => {
            createParticle(svg, { x: pos.runc.x + 70, y: pos.runc.y }, { x: pos.cgroups.x - 55, y: pos.cgroups.y }, "#dc2626", 500, () => {
              addLog("Kernel: Setting up cgroups (CPU, Memory limits)", "text-red-400");

              setTimeout(() => {
                createParticle(svg, { x: pos.cgroups.x + 55, y: pos.cgroups.y }, { x: pos.rootfs.x - 90, y: pos.rootfs.y + 20 }, "#3b82f6", 800, () => {
                  addLog("Mounting root filesystem", "text-blue-400");

                  createParticle(svg, { x: pos.rootfs.x, y: pos.rootfs.y + 40 }, { x: pos.container.x, y: pos.container.y - 50 }, "#22c55e", 600, () => {
                    addLog("Container process created (not started)", "text-green-500");
                    resetLines(svg);
                    setIsAnimating(false);
                  });
                });
              }, 700);
            });
          }, 300);
        }, 800);
      });
    });
  };

  // Action: Start
  const handleStart = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ runc start nginx-container", "text-purple-400");

    drawConnection(svg, pos.runc.x, pos.runc.y, pos.container.x - 90, pos.container.y, "#22c55e");
    createParticle(svg, { x: pos.runc.x + 70, y: pos.runc.y }, { x: pos.container.x - 90, y: pos.container.y }, "#22c55e", 800, () => {
      addLog("Executing container entrypoint", "text-yellow-400");

      setTimeout(() => {
        addLog("Container process started as PID 1", "text-green-500");
        addLog("nginx: master process started", "text-green-400");
        resetLines(svg);
        setIsAnimating(false);
      }, 500);
    });
  };

  // Action: Delete
  const handleDelete = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ runc delete nginx-container", "text-red-400");

    drawConnection(svg, pos.runc.x, pos.runc.y, pos.container.x - 90, pos.container.y, "#ef4444");
    createParticle(svg, { x: pos.runc.x + 70, y: pos.runc.y }, { x: pos.container.x - 90, y: pos.container.y }, "#ef4444", 600, () => {
      addLog("Stopping container process", "text-yellow-400");

      createParticle(svg, { x: pos.container.x - 90, y: pos.container.y }, { x: pos.namespaces.x, y: pos.namespaces.y }, "#dc2626", 600, () => {
        addLog("Kernel: Cleaning up namespaces", "text-red-400");

        createParticle(svg, { x: pos.container.x - 90, y: pos.container.y }, { x: pos.cgroups.x, y: pos.cgroups.y }, "#dc2626", 600, () => {
          addLog("Kernel: Releasing cgroup resources", "text-red-400");

          setTimeout(() => {
            addLog("Container deleted", "text-red-500");
            resetLines(svg);
            setIsAnimating(false);
          }, 500);
        });
      });
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-yellow-400" />
            runc Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">OCI Runtime that spawns and manages container processes using Linux primitives.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleCreate}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            runc create
          </button>
          <button
            onClick={handleStart}
            disabled={isAnimating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            runc start
          </button>
          <button
            onClick={handleDelete}
            disabled={isAnimating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            runc delete
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
            <div className="text-slate-500">{"// runc ready to spawn containers..."}</div>
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
