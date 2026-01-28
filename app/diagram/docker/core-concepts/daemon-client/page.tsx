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
    api: Position;
    daemon: Position;
    containerd: Position;
    runc: Position;
    container: Position;
  };
  colors: {
    client: string;
    daemon: string;
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
    { id: "client", label: "CLIENT LAYER", x: 20, y: 50, w: 200, h: 400, color: "#1e293b", text: "#fff" },
    { id: "daemon", label: "DAEMON LAYER", x: 260, y: 50, w: 300, h: 400, color: "#eff6ff", text: "#334155" },
    { id: "runtime", label: "CONTAINER RUNTIME", x: 600, y: 50, w: 380, h: 400, color: "#f0fdf4", text: "#14532d" },
  ],
  positions: {
    client: { x: 120, y: 150 },
    api: { x: 290, y: 150 },
    daemon: { x: 410, y: 200 },
    containerd: { x: 740, y: 150 },
    runc: { x: 740, y: 280 },
    container: { x: 880, y: 280 },
  },
  colors: {
    client: "#1e293b",
    daemon: "#3b82f6",
    runtime: "#10b981",
    highlight: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
  },
};

// ============================================================================
// Main Component
// ============================================================================
export default function DockerDaemonClientPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <DockerDaemonClientDiagram />
    </div>
  );
}

function DockerDaemonClientDiagram() {
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
      .attr("y", (d) => d.y + 30)
      .attr("text-anchor", "middle")
      .style("fill", (d) => d.text)
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .style("font-size", "14px")
      .text((d) => d.label);

    // ========================================
    // 1. Docker CLI Client
    // ========================================
    const clientGroup = svg.append("g").attr("transform", `translate(${config.positions.client.x}, ${config.positions.client.y})`);

    // Terminal
    clientGroup.append("rect").attr("x", -60).attr("y", -40).attr("width", 120).attr("height", 80).attr("fill", "#0f172a").attr("rx", 4);
    clientGroup.append("text").attr("x", -50).attr("y", -20).text("$ docker").attr("fill", "#22c55e").style("font-family", "monospace").style("font-size", "11px");
    clientGroup.append("text").attr("text-anchor", "middle").attr("dy", 60).attr("fill", "#fff").style("font-size", "13px").style("font-weight", "600").text("Docker CLI");

    // ========================================
    // 2. REST API Layer
    // ========================================
    const apiGroup = svg.append("g").attr("transform", `translate(${config.positions.api.x}, ${config.positions.api.y})`);

    apiGroup.append("rect").attr("x", -50).attr("y", -30).attr("width", 100).attr("height", 60).attr("fill", "#dbeafe").attr("stroke", "#3b82f6").attr("stroke-width", 2).attr("rx", 5);
    apiGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#1e40af").style("font-size", "11px").style("font-weight", "600").text("REST API");
    apiGroup.append("text").attr("text-anchor", "middle").attr("dy", 50).attr("fill", "#475569").style("font-size", "11px").text("/var/run/");
    apiGroup.append("text").attr("text-anchor", "middle").attr("dy", 62).attr("fill", "#475569").style("font-size", "11px").text("docker.sock");

    // ========================================
    // 3. Docker Daemon
    // ========================================
    const daemonGroup = svg.append("g").attr("transform", `translate(${config.positions.daemon.x}, ${config.positions.daemon.y})`);

    // Daemon circle
    daemonGroup.append("circle").attr("r", 35).attr("fill", "#3b82f6").attr("class", "daemon-core");
    daemonGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "12px").style("font-weight", "600").text("dockerd");

    daemonGroup.append("text").attr("text-anchor", "middle").attr("dy", 55).attr("fill", "#334155").style("font-size", "13px").style("font-weight", "bold").text("Docker Daemon");

    // Responsibilities
    daemonGroup.append("text").attr("text-anchor", "middle").attr("dy", 75).attr("fill", "#64748b").style("font-size", "10px").text("Image Management");
    daemonGroup.append("text").attr("text-anchor", "middle").attr("dy", 88).attr("fill", "#64748b").style("font-size", "10px").text("Network & Volume");

    // ========================================
    // 4. containerd
    // ========================================
    const containerdGroup = svg.append("g").attr("transform", `translate(${config.positions.containerd.x}, ${config.positions.containerd.y})`);

    containerdGroup.append("rect").attr("x", -70).attr("y", -30).attr("width", 140).attr("height", 60).attr("fill", "#dcfce7").attr("stroke", "#22c55e").attr("stroke-width", 2).attr("rx", 5);
    containerdGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#166534").style("font-size", "12px").style("font-weight", "600").text("containerd");

    containerdGroup.append("text").attr("text-anchor", "middle").attr("dy", 50).attr("fill", "#14532d").style("font-size", "11px").text("Container Runtime");

    // ========================================
    // 5. runc
    // ========================================
    const runcGroup = svg.append("g").attr("transform", `translate(${config.positions.runc.x}, ${config.positions.runc.y})`);

    runcGroup.append("rect").attr("x", -60).attr("y", -25).attr("width", 120).attr("height", 50).attr("fill", "#fef3c7").attr("stroke", "#f59e0b").attr("stroke-width", 2).attr("rx", 5);
    runcGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#78350f").style("font-size", "12px").style("font-weight", "600").text("runc");

    runcGroup.append("text").attr("text-anchor", "middle").attr("dy", 45).attr("fill", "#92400e").style("font-size", "10px").text("OCI Runtime");

    // ========================================
    // 6. Container
    // ========================================
    const containerGroup = svg.append("g").attr("transform", `translate(${config.positions.container.x}, ${config.positions.container.y})`);

    containerGroup.append("rect").attr("x", -50).attr("y", -30).attr("width", 100).attr("height", 60).attr("fill", "#e0f2fe").attr("stroke", "#0ea5e9").attr("stroke-width", 2).attr("rx", 5);
    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", -15).attr("fill", "#075985").style("font-size", "11px").style("font-weight", "600").text("Container");

    // Running indicator
    containerGroup.append("circle").attr("cx", 0).attr("cy", 5).attr("r", 4).attr("fill", "#22c55e");
    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", 20).attr("fill", "#0c4a6e").style("font-size", "10px").text("Running");

    containerGroup.append("text").attr("text-anchor", "middle").attr("dy", 50).attr("fill", "#0369a1").style("font-size", "10px").text("nginx:latest");

    // ========================================
    // Static Connection Lines (Architecture)
    // ========================================
    svg
      .append("line")
      .attr("x1", config.positions.client.x + 60)
      .attr("y1", config.positions.client.y)
      .attr("x2", config.positions.api.x - 50)
      .attr("y2", config.positions.api.y)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", config.positions.api.x + 50)
      .attr("y1", config.positions.api.y)
      .attr("x2", config.positions.daemon.x - 35)
      .attr("y2", config.positions.daemon.y)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", config.positions.daemon.x + 35)
      .attr("y1", config.positions.daemon.y)
      .attr("x2", config.positions.containerd.x - 70)
      .attr("y2", config.positions.containerd.y)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", config.positions.containerd.x)
      .attr("y1", config.positions.containerd.y + 30)
      .attr("x2", config.positions.runc.x)
      .attr("y2", config.positions.runc.y - 25)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", config.positions.runc.x + 60)
      .attr("y1", config.positions.runc.y)
      .attr("x2", config.positions.container.x - 50)
      .attr("y2", config.positions.container.y)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

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

  // Action: docker run
  const handleRun = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ docker run -d nginx", "text-blue-400");

    // Step 1: Client -> API
    drawConnection(svg, pos.client.x + 60, pos.client.y, pos.api.x - 50, pos.api.y, "#3b82f6");
    createParticle(svg, { x: pos.client.x + 60, y: pos.client.y }, { x: pos.api.x - 50, y: pos.api.y }, "#3b82f6", 600, () => {
      addLog("API: Received request via Unix socket", "text-purple-400");

      // Step 2: API -> Daemon
      createParticle(svg, { x: pos.api.x + 50, y: pos.api.y }, { x: pos.daemon.x - 35, y: pos.daemon.y }, "#3b82f6", 600, () => {
        addLog("Daemon: Processing container request", "text-blue-400");

        // Daemon pulse
        svg
          .select(".daemon-core")
          .transition()
          .duration(200)
          .attr("fill", "#f59e0b")
          .transition()
          .duration(200)
          .attr("fill", "#3b82f6");

        setTimeout(() => {
          // Step 3: Daemon -> containerd
          createParticle(svg, { x: pos.daemon.x + 35, y: pos.daemon.y }, { x: pos.containerd.x - 70, y: pos.containerd.y }, "#22c55e", 700, () => {
            addLog("containerd: Managing container lifecycle", "text-green-400");

            // Step 4: containerd -> runc
            createParticle(svg, pos.containerd, pos.runc, "#f59e0b", 600, () => {
              addLog("runc: Creating container process", "text-yellow-400");

              // Step 5: runc -> container
              createParticle(svg, { x: pos.runc.x + 60, y: pos.runc.y }, { x: pos.container.x - 50, y: pos.container.y }, "#0ea5e9", 600, () => {
                addLog("Container started successfully!", "text-green-500");
                resetLines(svg);
                setIsAnimating(false);
              });
            });
          });
        }, 800);
      });
    });
  };

  // Action: docker ps
  const handlePs = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ docker ps", "text-purple-400");

    drawConnection(svg, pos.client.x + 60, pos.client.y, pos.api.x - 50, pos.api.y, "#8b5cf6");
    createParticle(svg, { x: pos.client.x + 60, y: pos.client.y }, { x: pos.api.x - 50, y: pos.api.y }, "#8b5cf6", 600, () => {
      createParticle(svg, { x: pos.api.x + 50, y: pos.api.y }, { x: pos.daemon.x - 35, y: pos.daemon.y }, "#8b5cf6", 600, () => {
        addLog("Daemon: Querying container status", "text-blue-400");

        createParticle(svg, { x: pos.daemon.x + 35, y: pos.daemon.y }, { x: pos.containerd.x - 70, y: pos.containerd.y }, "#8b5cf6", 700, () => {
          // Return data
          setTimeout(() => {
            addLog("CONTAINER ID   IMAGE         STATUS", "text-green-400");
            addLog("a3f2b1c8d9e   nginx:latest  Up 2 minutes", "text-green-400");
            resetLines(svg);
            setIsAnimating(false);
          }, 500);
        });
      });
    });
  };

  // Action: docker stop
  const handleStop = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ docker stop <container-id>", "text-red-400");

    drawConnection(svg, pos.client.x + 60, pos.client.y, pos.daemon.x - 35, pos.daemon.y, "#ef4444");
    createParticle(svg, { x: pos.client.x + 60, y: pos.client.y }, { x: pos.daemon.x - 35, y: pos.daemon.y }, "#ef4444", 800, () => {
      addLog("Daemon: Stopping container gracefully", "text-yellow-400");

      createParticle(svg, { x: pos.daemon.x + 35, y: pos.daemon.y }, pos.containerd, "#ef4444", 700, () => {
        createParticle(svg, pos.containerd, pos.runc, "#ef4444", 600, () => {
          createParticle(svg, { x: pos.runc.x + 60, y: pos.runc.y }, { x: pos.container.x - 50, y: pos.container.y }, "#ef4444", 600, () => {
            addLog("Container stopped", "text-red-500");
            resetLines(svg);
            setIsAnimating(false);
          });
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
            <SiDocker className="w-8 h-8 text-blue-400" />
            Docker Daemon-Client Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">How Docker CLI communicates with the daemon and runtime layers.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleRun}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            docker run
          </button>
          <button
            onClick={handlePs}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            docker ps
          </button>
          <button
            onClick={handleStop}
            disabled={isAnimating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            docker stop
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
            <div className="text-slate-500">{"// Ready to execute Docker commands..."}</div>
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
