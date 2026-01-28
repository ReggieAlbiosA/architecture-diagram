"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { SiDocker } from "react-icons/si";

interface Position {
  x: number;
  y: number;
}

const config = {
  width: 1000,
  height: 500,
  modes: [
    { id: "bridge", label: "Bridge", x: 150, y: 150, color: "#93c5fd", desc: "Default isolated network" },
    { id: "host", label: "Host", x: 500, y: 150, color: "#fcd34d", desc: "Shares host network stack" },
    { id: "none", label: "None", x: 850, y: 150, color: "#cbd5e1", desc: "No networking" },
    { id: "container", label: "Container", x: 325, y: 350, color: "#d8b4fe", desc: "Share another container's network" },
    { id: "custom", label: "Custom", x: 675, y: 350, color: "#86efac", desc: "User-defined bridge" },
  ],
};

export default function ContainerNetworkingPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerNetworkingDiagram />
    </div>
  );
}

function ContainerNetworkingDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedMode, setSelectedMode] = useState("bridge");
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, color: string = "text-green-400") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, message, color }]);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw mode boxes
    config.modes.forEach((mode) => {
      const g = svg.append("g");

      g.append("rect")
        .attr("x", mode.x - 90)
        .attr("y", mode.y - 50)
        .attr("width", 180)
        .attr("height", 100)
        .attr("rx", 10)
        .attr("fill", mode.color)
        .attr("stroke", selectedMode === mode.id ? "#1e40af" : "#94a3b8")
        .attr("stroke-width", selectedMode === mode.id ? 4 : 2);

      g.append("text")
        .attr("x", mode.x)
        .attr("y", mode.y - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#1f2937")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(mode.label);

      g.append("text")
        .attr("x", mode.x)
        .attr("y", mode.y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#374151")
        .style("font-size", "11px")
        .text(mode.desc);

      // Add network mode specific visuals
      if (mode.id === "bridge") {
        // Bridge icon
        g.append("rect")
          .attr("x", mode.x - 20)
          .attr("y", mode.y + 18)
          .attr("width", 40)
          .attr("height", 3)
          .attr("fill", "#1e40af");
      } else if (mode.id === "host") {
        // Host icon
        g.append("circle")
          .attr("cx", mode.x)
          .attr("cy", mode.y + 25)
          .attr("r", 8)
          .attr("fill", "#78350f");
      } else if (mode.id === "none") {
        // None icon (X)
        g.append("line")
          .attr("x1", mode.x - 10)
          .attr("y1", mode.y + 15)
          .attr("x2", mode.x + 10)
          .attr("y2", mode.y + 35)
          .attr("stroke", "#64748b")
          .attr("stroke-width", 3);
        g.append("line")
          .attr("x1", mode.x + 10)
          .attr("y1", mode.y + 15)
          .attr("x2", mode.x - 10)
          .attr("y2", mode.y + 35)
          .attr("stroke", "#64748b")
          .attr("stroke-width", 3);
      } else if (mode.id === "container") {
        // Container share icon
        g.append("rect")
          .attr("x", mode.x - 15)
          .attr("y", mode.y + 18)
          .attr("width", 12)
          .attr("height", 15)
          .attr("fill", "#7c3aed")
          .attr("rx", 2);
        g.append("rect")
          .attr("x", mode.x + 3)
          .attr("y", mode.y + 18)
          .attr("width", 12)
          .attr("height", 15)
          .attr("fill", "#7c3aed")
          .attr("rx", 2);
      } else if (mode.id === "custom") {
        // Custom network icon
        g.append("circle")
          .attr("cx", mode.x - 10)
          .attr("cy", mode.y + 25)
          .attr("r", 5)
          .attr("fill", "#059669");
        g.append("circle")
          .attr("cx", mode.x + 10)
          .attr("cy", mode.y + 25)
          .attr("r", 5)
          .attr("fill", "#059669");
        g.append("line")
          .attr("x1", mode.x - 10)
          .attr("y1", mode.y + 25)
          .attr("x2", mode.x + 10)
          .attr("y2", mode.y + 25)
          .attr("stroke", "#059669")
          .attr("stroke-width", 2);
      }
    });

    svg.append("g").attr("id", "particles");
  }, [selectedMode]);

  const createParticle = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    start: Position,
    end: Position,
    color: string,
    callback?: () => void
  ) => {
    const particleLayer = svg.select("#particles");
    const p = particleLayer
      .append("circle")
      .attr("cx", start.x)
      .attr("cy", start.y)
      .attr("r", 8)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    p.transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("cx", end.x)
      .attr("cy", end.y)
      .on("end", () => {
        p.remove();
        if (callback) callback();
      });
  };

  const handleSelectMode = (modeId: string) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const mode = config.modes.find((m) => m.id === modeId);
    if (!mode) return;

    addLog(`$ docker run --network ${modeId} nginx`, "text-blue-400");

    setSelectedMode(modeId);

    setTimeout(() => {
      if (modeId === "bridge") {
        addLog("Created virtual bridge (docker0)", "text-purple-400");
        addLog("Assigned IP: 172.17.0.2/16", "text-green-400");
        addLog("Port mapping via iptables NAT", "text-yellow-400");
      } else if (modeId === "host") {
        addLog("Using host network namespace", "text-yellow-400");
        addLog("No network isolation", "text-red-400");
        addLog("Container shares host ports", "text-yellow-400");
      } else if (modeId === "none") {
        addLog("No network interfaces created", "text-red-400");
        addLog("Only loopback (lo) available", "text-yellow-400");
      } else if (modeId === "container") {
        addLog("Sharing network with container: web", "text-purple-400");
        addLog("Using same IP and ports", "text-yellow-400");
      } else if (modeId === "custom") {
        addLog("Using custom bridge: my-network", "text-green-400");
        addLog("Automatic DNS resolution", "text-blue-400");
        addLog("Isolated from default bridge", "text-purple-400");
      }

      setTimeout(() => {
        addLog(`Network mode: ${mode.label} configured`, "text-green-500");
        setIsAnimating(false);
      }, 500);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Container Networking
          </h1>
          <p className="text-slate-400 text-sm mt-1">Docker network modes and how containers communicate.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button onClick={() => handleSelectMode("bridge")} disabled={isAnimating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            bridge
          </button>
          <button onClick={() => handleSelectMode("host")} disabled={isAnimating} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            host
          </button>
          <button onClick={() => handleSelectMode("none")} disabled={isAnimating} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            none
          </button>
          <button onClick={() => handleSelectMode("container")} disabled={isAnimating} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            container
          </button>
          <button onClick={() => handleSelectMode("custom")} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            custom
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-4">
        <div className="mb-4 text-center">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Selected Mode: </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase">{selectedMode}</span>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="w-full"
          style={{ maxHeight: "420px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-3 border-t border-slate-700">
        <div className="font-mono text-xs md:text-sm h-28 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500">{"// Default network mode: bridge..."}</div>
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
