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
    cli: Position;
    daemon: Position;
    registry: Position;
    imgArea: Position;
    cntArea: Position;
  };
  colors: {
    client: string;
    host: string;
    registry: string;
    highlight: string;
    success: string;
    warning: string;
    registryFlow: string;
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
    { id: "client", label: "DOCKER CLIENT", x: 20, y: 50, w: 200, h: 400, color: "#1e293b", text: "#fff" },
    { id: "host", label: "DOCKER HOST (DAEMON)", x: 260, y: 50, w: 460, h: 400, color: "#eff6ff", text: "#334155" },
    { id: "registry", label: "REGISTRY (HUB)", x: 760, y: 50, w: 220, h: 400, color: "#f3e8ff", text: "#581c87" },
  ],
  positions: {
    cli: { x: 120, y: 150 },
    daemon: { x: 490, y: 120 },
    registry: { x: 870, y: 150 },
    imgArea: { x: 380, y: 320 },
    cntArea: { x: 600, y: 320 },
  },
  colors: {
    client: "#1e293b",
    host: "#eff6ff",
    registry: "#f3e8ff",
    highlight: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
    registryFlow: "#a855f7",
  },
};

// ============================================================================
// Main Component
// ============================================================================
export default function DockerArchitecturePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <DockerArchitectureDiagram />
    </div>
  );
}

function DockerArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const imageCountRef = useRef(0);
  const containerCountRef = useRef(0);
  const logIdRef = useRef(0);

  // Add log message
  const addLog = useCallback((message: string, color: string = "text-green-400") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, message, color }]);
  }, []);

  // Initialize SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // ========================================
    // 1. Draw Zone Backgrounds
    // ========================================
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
      .attr("stroke-width", 1);

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
    // 2. Draw Static Components
    // ========================================

    // Client CLI Terminal
    const clientGroup = svg.append("g").attr("transform", "translate(40, 100)");
    clientGroup.append("rect").attr("width", 160).attr("height", 100).attr("fill", "#0f172a").attr("rx", 4);
    clientGroup
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text("$ docker_")
      .attr("fill", "#22c55e")
      .style("font-family", "monospace")
      .style("font-size", "12px");

    // Docker Daemon
    const daemonGroup = svg.append("g").attr("transform", `translate(${config.positions.daemon.x}, ${config.positions.daemon.y})`);
    daemonGroup.append("circle").attr("r", 30).attr("fill", "#3b82f6").attr("class", "daemon-core");
    daemonGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "10px").text("dockerd");
    daemonGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 45)
      .attr("fill", "#475569")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Daemon");

    // Images Cache Area (white box)
    svg.append("rect").attr("x", 280).attr("y", 220).attr("width", 200).attr("height", 200).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg
      .append("text")
      .attr("x", 380)
      .attr("y", 240)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .style("font-size", "12px")
      .text("Images Cache");

    // Running Containers Area (white box)
    svg.append("rect").attr("x", 500).attr("y", 220).attr("width", 200).attr("height", 200).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg
      .append("text")
      .attr("x", 600)
      .attr("y", 240)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .style("font-size", "12px")
      .text("Running Containers");

    // Registry Database Icon
    const regX = config.positions.registry.x;
    const regY = config.positions.registry.y;
    const stackG = svg.append("g").attr("transform", `translate(${regX}, ${regY + 30})`);
    stackG.append("ellipse").attr("cx", 0).attr("cy", -10).attr("rx", 20).attr("ry", 6).attr("fill", "#a855f7");
    stackG.append("rect").attr("x", -20).attr("y", -10).attr("width", 40).attr("height", 20).attr("fill", "#a855f7");
    stackG.append("ellipse").attr("cx", 0).attr("cy", 10).attr("rx", 20).attr("ry", 6).attr("fill", "#d8b4fe");

    // ========================================
    // 3. Create Dynamic Layers (AFTER static elements)
    // ========================================
    svg.append("g").attr("id", "connections");
    svg.append("g").attr("id", "particles");
    svg.append("g").attr("id", "objects");

    // ========================================
    // 4. Add Initial Image
    // ========================================
    setTimeout(() => {
      addImageBlock(svg, "ubuntu:20.04");
    }, 300);
  }, []);

  // Helper: Add image block
  const addImageBlock = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, name: string) => {
    const objectLayer = svg.select("#objects");
    const count = imageCountRef.current;

    if (count > 3) {
      objectLayer.selectAll(".image-item").remove();
      imageCountRef.current = 0;
    }

    const g = objectLayer.append("g").attr("class", "image-item");

    g.append("rect")
      .attr("x", 300)
      .attr("y", 260 + count * 35)
      .attr("width", 160)
      .attr("height", 30)
      .attr("fill", "#dcfce7")
      .attr("stroke", "#86efac")
      .attr("stroke-width", 2)
      .attr("rx", 5)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 310)
      .attr("y", 280 + count * 35)
      .text(name)
      .style("font-size", "12px")
      .style("fill", "#14532d")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    imageCountRef.current++;
  };

  // Helper: Add container block
  const addContainerBlock = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, name: string) => {
    const objectLayer = svg.select("#objects");
    const count = containerCountRef.current;

    if (count > 3) {
      objectLayer.selectAll(".container-item").remove();
      containerCountRef.current = 0;
    }

    const g = objectLayer.append("g").attr("class", "container-item");

    g.append("rect")
      .attr("x", 520)
      .attr("y", 260 + count * 35)
      .attr("width", 160)
      .attr("height", 30)
      .attr("fill", "#e0f2fe")
      .attr("stroke", "#bae6fd")
      .attr("stroke-width", 2)
      .attr("rx", 5)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 530)
      .attr("y", 280 + count * 35)
      .text(name)
      .style("font-size", "12px")
      .style("fill", "#0c4a6e")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Running indicator
    g.append("circle")
      .attr("cx", 670)
      .attr("cy", 275 + count * 35)
      .attr("r", 4)
      .attr("fill", "#22c55e")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    containerCountRef.current++;
  };

  // Helper: Create particle animation
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

  // Helper: Draw connection line
  const drawConnection = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = "#94a3b8"
  ) => {
    const connectionLayer = svg.select("#connections");
    const line = connectionLayer
      .append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x1)
      .attr("y2", y1)
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    line.transition().duration(500).attr("x2", x2).attr("y2", y2);

    return line;
  };

  // Helper: Reset connection lines
  const resetLines = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    svg.select("#connections").selectAll("*").transition().duration(500).style("opacity", 0).remove();
  };

  // Action: Docker Pull
  const handlePull = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("Command sent: docker pull nginx", "text-purple-400");

    // Step 1: CLI -> Daemon
    drawConnection(svg, pos.cli.x, pos.cli.y, pos.daemon.x, pos.daemon.y);
    createParticle(svg, pos.cli, pos.daemon, config.colors.highlight, 1000, () => {
      addLog("Daemon: Image not found locally. Connecting to Registry...", "text-yellow-400");

      // Step 2: Daemon -> Registry
      drawConnection(svg, pos.daemon.x, pos.daemon.y, pos.registry.x, pos.registry.y, config.colors.registryFlow);
      createParticle(svg, pos.daemon, pos.registry, config.colors.registryFlow, 1000, () => {
        addLog("Registry: Locating image layer...", "text-purple-300");

        // Step 3: Registry -> Daemon
        createParticle(svg, pos.registry, pos.daemon, config.colors.registryFlow, 1000, () => {
          addLog("Daemon: Image download complete.");

          // Step 4: Save to Image Cache
          createParticle(svg, pos.daemon, pos.imgArea, config.colors.success, 500, () => {
            addImageBlock(svg, "nginx:latest");
            addLog("Success: Image saved to Host storage.", "text-green-500");
            resetLines(svg);
            setIsAnimating(false);
          });
        });
      });
    });
  };

  // Action: Docker Run
  const handleRun = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("Command sent: docker run -d nginx", "text-blue-400");

    // Step 1: CLI -> Daemon
    drawConnection(svg, pos.cli.x, pos.cli.y, pos.daemon.x, pos.daemon.y);
    createParticle(svg, pos.cli, pos.daemon, config.colors.highlight, 800, () => {
      addLog("Daemon: Analyzing request.");

      // Step 2: Check Image Cache
      const checkLine = drawConnection(svg, pos.daemon.x, pos.daemon.y, pos.imgArea.x, pos.imgArea.y - 80, config.colors.success);

      setTimeout(() => {
        addLog("Daemon: Image found locally.");
        checkLine.remove();

        // Step 3: Create Container
        createParticle(svg, pos.daemon, pos.cntArea, config.colors.highlight, 800, () => {
          addContainerBlock(svg, "romantic_turing");
          addLog("Daemon: Container started.", "text-green-500");
          resetLines(svg);
          setIsAnimating(false);
        });
      }, 800);
    });
  };

  // Action: Docker Build
  const handleBuild = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("Command sent: docker build . -t my-app", "text-green-500");

    // Step 1: CLI Uploads Context -> Daemon
    drawConnection(svg, pos.cli.x, pos.cli.y, pos.daemon.x, pos.daemon.y);

    // Send multiple particles to simulate file context upload
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createParticle(svg, pos.cli, pos.daemon, "#64748b", 800 + i * 200);
      }, i * 100);
    }

    setTimeout(() => {
      addLog("Daemon: Building layers from Dockerfile...", "text-yellow-400");

      // Animation of "work" happening at daemon
      svg
        .select(".daemon-core")
        .transition()
        .duration(200)
        .attr("fill", "#f59e0b")
        .transition()
        .duration(200)
        .attr("fill", "#3b82f6")
        .transition()
        .duration(200)
        .attr("fill", "#f59e0b")
        .transition()
        .duration(200)
        .attr("fill", "#3b82f6");

      setTimeout(() => {
        // Step 2: Store new image
        createParticle(svg, pos.daemon, pos.imgArea, config.colors.success, 600, () => {
          addImageBlock(svg, "my-app:v1");
          addLog("Success: Image built and tagged.", "text-green-500");
          resetLines(svg);
          setIsAnimating(false);
        });
      }, 1500);
    }, 1400);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Docker Engine Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visualize how Client, Host, and Registry interact.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handlePull}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            docker pull
          </button>
          <button
            onClick={handleRun}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            docker run
          </button>
          <button
            onClick={handleBuild}
            disabled={isAnimating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            docker build
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
            <div className="text-slate-500">{"// System ready. Waiting for command..."}</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`${log.color} mb-1`}>
                &gt; {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
