"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { VscSourceControl, VscGithub } from "react-icons/vsc";

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
    localRepo: Position;
    remoteRepo: Position;
    localBranch: Position;
    remoteBranch: Position;
  };
  colors: {
    local: string;
    remote: string;
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
    { id: "local", label: "LOCAL MACHINE", x: 20, y: 50, w: 460, h: 400, color: "#dbeafe", text: "#1e3a8a" },
    { id: "remote", label: "REMOTE SERVER (GitHub/GitLab)", x: 520, y: 50, w: 460, h: 400, color: "#e0e7ff", text: "#3730a3" },
  ],
  positions: {
    localRepo: { x: 250, y: 250 },
    remoteRepo: { x: 750, y: 250 },
    localBranch: { x: 250, y: 180 },
    remoteBranch: { x: 750, y: 180 },
  },
  colors: {
    local: "#dbeafe",
    remote: "#e0e7ff",
    highlight: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
  },
};

// ============================================================================
// Main Component
// ============================================================================
export default function GitRemoteArchitecturePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitRemoteArchitectureDiagram />
    </div>
  );
}

function GitRemoteArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const localCommitCountRef = useRef(0);
  const remoteCommitCountRef = useRef(0);
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

    // Local Repository Icon
    const localX = config.positions.localRepo.x;
    const localY = config.positions.localRepo.y;
    const localGroup = svg.append("g").attr("transform", `translate(${localX}, ${localY})`);
    localGroup.append("ellipse").attr("cx", 0).attr("cy", -25).attr("rx", 40).attr("ry", 10).attr("fill", "#3b82f6");
    localGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#3b82f6");
    localGroup.append("ellipse").attr("cx", 0).attr("cy", 25).attr("rx", 40).attr("ry", 10).attr("fill", "#2563eb");
    localGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 50)
      .attr("fill", "#1e3a8a")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Local Repo");

    // Remote Repository Icon
    const remoteX = config.positions.remoteRepo.x;
    const remoteY = config.positions.remoteRepo.y;
    const remoteGroup = svg.append("g").attr("transform", `translate(${remoteX}, ${remoteY})`);

    // Server/cloud icon
    remoteGroup.append("ellipse").attr("cx", 0).attr("cy", -25).attr("rx", 40).attr("ry", 10).attr("fill", "#8b5cf6");
    remoteGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#8b5cf6");
    remoteGroup.append("ellipse").attr("cx", 0).attr("cy", 25).attr("rx", 40).attr("ry", 10).attr("fill", "#7c3aed");

    // GitHub icon overlay
    remoteGroup
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 18)
      .attr("fill", "#24292f")
      .attr("opacity", 0.9);

    remoteGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 50)
      .attr("fill", "#3730a3")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Remote Repo");

    // Branch labels
    svg
      .append("text")
      .attr("x", localX)
      .attr("y", 130)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e3a8a")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .text("origin/main");

    svg
      .append("text")
      .attr("x", remoteX)
      .attr("y", 130)
      .attr("text-anchor", "middle")
      .attr("fill", "#3730a3")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .text("main");

    // Commit history boxes
    svg.append("rect").attr("x", 60).attr("y", 320).attr("width", 380).attr("height", 100).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg
      .append("text")
      .attr("x", 250)
      .attr("y", 340)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .style("font-size", "12px")
      .text("Local Commits");

    svg.append("rect").attr("x", 560).attr("y", 320).attr("width", 380).attr("height", 100).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg
      .append("text")
      .attr("x", 750)
      .attr("y", 340)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .style("font-size", "12px")
      .text("Remote Commits");

    // Create Dynamic Layers
    svg.append("g").attr("id", "connections");
    svg.append("g").attr("id", "particles");
    svg.append("g").attr("id", "objects");

    // Add initial commits
    setTimeout(() => {
      addLocalCommit(svg, "a3f2b1c - Initial commit");
      addRemoteCommit(svg, "a3f2b1c - Initial commit");
    }, 300);
  }, []);

  // Helper: Add local commit
  const addLocalCommit = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, hash: string) => {
    const objectLayer = svg.select("#objects");
    const count = localCommitCountRef.current % 3;

    const g = objectLayer.append("g").attr("class", "local-commit");

    g.append("rect")
      .attr("x", 70)
      .attr("y", 355 + count * 25)
      .attr("width", 360)
      .attr("height", 20)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 80)
      .attr("y", 370 + count * 25)
      .text(hash)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("fill", "#1e3a8a")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    localCommitCountRef.current++;
  };

  // Helper: Add remote commit
  const addRemoteCommit = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, hash: string) => {
    const objectLayer = svg.select("#objects");
    const count = remoteCommitCountRef.current % 3;

    const g = objectLayer.append("g").attr("class", "remote-commit");

    g.append("rect")
      .attr("x", 570)
      .attr("y", 355 + count * 25)
      .attr("width", 360)
      .attr("height", 20)
      .attr("fill", "#e0e7ff")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 580)
      .attr("y", 370 + count * 25)
      .text(hash)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("fill", "#3730a3")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    remoteCommitCountRef.current++;
  };

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
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");

    line.transition().duration(500).attr("x2", x2).attr("y2", y2);
    return line;
  };

  const resetLines = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    svg.select("#connections").selectAll("*").transition().duration(500).style("opacity", 0).remove();
  };

  // Action: git push
  const handlePush = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ git push origin main", "text-blue-400");

    drawConnection(svg, pos.localRepo.x, pos.localRepo.y, pos.remoteRepo.x, pos.remoteRepo.y, "#3b82f6");

    // Multiple particles for data transfer
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createParticle(svg, pos.localRepo, pos.remoteRepo, "#3b82f6", 1200 + i * 100);
      }, i * 150);
    }

    setTimeout(() => {
      const shortHash = Math.random().toString(36).substring(2, 9);
      addRemoteCommit(svg, `${shortHash} - Update feature`);
      addLog("Pushed successfully to origin/main", "text-green-500");
      resetLines(svg);
      setIsAnimating(false);
    }, 1800);
  };

  // Action: git pull
  const handlePull = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ git pull origin main", "text-purple-400");

    drawConnection(svg, pos.remoteRepo.x, pos.remoteRepo.y, pos.localRepo.x, pos.localRepo.y, "#8b5cf6");

    // Multiple particles for data transfer
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createParticle(svg, pos.remoteRepo, pos.localRepo, "#8b5cf6", 1200 + i * 100);
      }, i * 150);
    }

    setTimeout(() => {
      const shortHash = Math.random().toString(36).substring(2, 9);
      addLocalCommit(svg, `${shortHash} - Merged changes`);
      addLog("Fetched and merged from origin/main", "text-green-500");
      resetLines(svg);
      setIsAnimating(false);
    }, 1800);
  };

  // Action: git fetch
  const handleFetch = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ git fetch origin", "text-yellow-400");

    drawConnection(svg, pos.remoteRepo.x, pos.remoteRepo.y, pos.localRepo.x, pos.localRepo.y, "#f59e0b");
    createParticle(svg, pos.remoteRepo, pos.localRepo, "#f59e0b", 1000, () => {
      addLog("Fetched updates from origin", "text-green-500");
      addLog("Run 'git merge' to integrate changes", "text-yellow-400");
      resetLines(svg);
      setIsAnimating(false);
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <VscSourceControl className="w-8 h-8 text-orange-400" />
            <span className="text-slate-400 mx-2">↔</span>
            <VscGithub className="w-8 h-8 text-white" />
            Git Remote Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visualize how Local and Remote repositories synchronize.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleFetch}
            disabled={isAnimating}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            git fetch
          </button>
          <button
            onClick={handlePull}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            git pull
          </button>
          <button
            onClick={handlePush}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            git push
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
            <div className="text-slate-500">{"// Ready to sync with remote..."}</div>
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
