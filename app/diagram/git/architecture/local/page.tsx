"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { VscSourceControl } from "react-icons/vsc";

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
    workingDir: Position;
    stagingArea: Position;
    localRepo: Position;
    fileIcon: Position;
  };
  colors: {
    workingDir: string;
    stagingArea: string;
    localRepo: string;
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
    { id: "working", label: "WORKING DIRECTORY", x: 20, y: 50, w: 280, h: 400, color: "#fef3c7", text: "#78350f" },
    { id: "staging", label: "STAGING AREA (INDEX)", x: 340, y: 50, w: 280, h: 400, color: "#ddd6fe", text: "#4c1d95" },
    { id: "repository", label: "LOCAL REPOSITORY", x: 660, y: 50, w: 320, h: 400, color: "#d1fae5", text: "#064e3b" },
  ],
  positions: {
    workingDir: { x: 160, y: 250 },
    stagingArea: { x: 480, y: 250 },
    localRepo: { x: 820, y: 250 },
    fileIcon: { x: 160, y: 200 },
  },
  colors: {
    workingDir: "#fef3c7",
    stagingArea: "#ddd6fe",
    localRepo: "#d1fae5",
    highlight: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
  },
};

// ============================================================================
// Main Component
// ============================================================================
export default function GitLocalArchitecturePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitLocalArchitectureDiagram />
    </div>
  );
}

function GitLocalArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const fileCountRef = useRef(0);
  const commitCountRef = useRef(0);
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

    // Working Directory Icon (Folder)
    const workingGroup = svg.append("g").attr("transform", `translate(${config.positions.workingDir.x}, ${config.positions.workingDir.y})`);
    workingGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#fbbf24").attr("rx", 4);
    workingGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#78350f").style("font-size", "11px").text("Files");

    // Staging Area Icon (Box)
    const stagingGroup = svg.append("g").attr("transform", `translate(${config.positions.stagingArea.x}, ${config.positions.stagingArea.y})`);
    stagingGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#8b5cf6").attr("stroke", "#6d28d9").attr("stroke-width", 2).attr("rx", 4);
    stagingGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "11px").text("Index");

    // Local Repository Icon (Database)
    const repoX = config.positions.localRepo.x;
    const repoY = config.positions.localRepo.y;
    const repoGroup = svg.append("g").attr("transform", `translate(${repoX}, ${repoY})`);
    repoGroup.append("ellipse").attr("cx", 0).attr("cy", -20).attr("rx", 35).attr("ry", 8).attr("fill", "#10b981");
    repoGroup.append("rect").attr("x", -35).attr("y", -20).attr("width", 70).attr("height", 40).attr("fill", "#10b981");
    repoGroup.append("ellipse").attr("cx", 0).attr("cy", 20).attr("rx", 35).attr("ry", 8).attr("fill", "#059669");

    // Storage Areas Labels
    svg.append("text").attr("x", 160).attr("y", 320).attr("text-anchor", "middle").attr("fill", "#78350f").style("font-size", "12px").text("Modified Files");
    svg.append("text").attr("x", 480).attr("y", 320).attr("text-anchor", "middle").attr("fill", "#4c1d95").style("font-size", "12px").text("Staged Changes");
    svg.append("text").attr("x", 820).attr("y", 320).attr("text-anchor", "middle").attr("fill", "#064e3b").style("font-size", "12px").text("Commit History");

    // File list areas
    svg.append("rect").attr("x", 60).attr("y", 340).attr("width", 200).attr("height", 80).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg.append("rect").attr("x", 380).attr("y", 340).attr("width", 200).attr("height", 80).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg.append("rect").attr("x", 700).attr("y", 340).attr("width", 240).attr("height", 80).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);

    // Create Dynamic Layers
    svg.append("g").attr("id", "connections");
    svg.append("g").attr("id", "particles");
    svg.append("g").attr("id", "objects");

    // Add initial file
    setTimeout(() => {
      addFileToWorking(svg, "README.md");
    }, 300);
  }, []);

  // Helper: Add file to working directory
  const addFileToWorking = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, name: string) => {
    const objectLayer = svg.select("#objects");
    const count = fileCountRef.current % 3;

    const g = objectLayer.append("g").attr("class", "working-file");

    g.append("rect")
      .attr("x", 70)
      .attr("y", 350 + count * 25)
      .attr("width", 180)
      .attr("height", 20)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 80)
      .attr("y", 365 + count * 25)
      .text(name)
      .style("font-size", "11px")
      .style("fill", "#78350f")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    fileCountRef.current++;
  };

  // Helper: Add file to staging
  const addFileToStaging = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, name: string) => {
    const objectLayer = svg.select("#objects");
    const count = Math.floor(fileCountRef.current / 2) % 3;

    const g = objectLayer.append("g").attr("class", "staging-file");

    g.append("rect")
      .attr("x", 390)
      .attr("y", 350 + count * 25)
      .attr("width", 180)
      .attr("height", 20)
      .attr("fill", "#e9d5ff")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 400)
      .attr("y", 365 + count * 25)
      .text(name)
      .style("font-size", "11px")
      .style("fill", "#4c1d95")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
  };

  // Helper: Add commit to repository
  const addCommitToRepo = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, hash: string) => {
    const objectLayer = svg.select("#objects");
    const count = commitCountRef.current % 3;

    const g = objectLayer.append("g").attr("class", "commit-item");

    g.append("rect")
      .attr("x", 710)
      .attr("y", 350 + count * 25)
      .attr("width", 220)
      .attr("height", 20)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 720)
      .attr("y", 365 + count * 25)
      .text(hash)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("fill", "#064e3b")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    commitCountRef.current++;
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
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    line.transition().duration(500).attr("x2", x2).attr("y2", y2);
    return line;
  };

  const resetLines = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    svg.select("#connections").selectAll("*").transition().duration(500).style("opacity", 0).remove();
  };

  // Action: git add
  const handleAdd = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ git add README.md", "text-blue-400");

    drawConnection(svg, pos.workingDir.x, pos.workingDir.y, pos.stagingArea.x, pos.stagingArea.y, "#8b5cf6");
    createParticle(svg, pos.workingDir, pos.stagingArea, "#8b5cf6", 1000, () => {
      addFileToStaging(svg, "README.md");
      addLog("File staged for commit", "text-green-500");
      resetLines(svg);
      setIsAnimating(false);
    });
  };

  // Action: git commit
  const handleCommit = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog('$ git commit -m "Initial commit"', "text-purple-400");

    drawConnection(svg, pos.stagingArea.x, pos.stagingArea.y, pos.localRepo.x, pos.localRepo.y, "#10b981");
    createParticle(svg, pos.stagingArea, pos.localRepo, "#10b981", 1000, () => {
      const shortHash = Math.random().toString(36).substring(2, 9);
      addCommitToRepo(svg, `${shortHash} - Initial commit`);
      addLog("Created commit successfully", "text-green-500");
      resetLines(svg);
      setIsAnimating(false);
    });
  };

  // Action: git status
  const handleStatus = () => {
    if (isAnimating || !svgRef.current) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current);
    const pos = config.positions;

    resetLines(svg);
    addLog("$ git status", "text-yellow-400");

    setTimeout(() => {
      addLog("On branch main", "text-green-400");
      addLog("Changes not staged for commit:", "text-yellow-400");
      addLog("  modified: README.md", "text-red-400");
      resetLines(svg);
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <VscSourceControl className="w-8 h-8 text-orange-400" />
            Git Local Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visualize how Working Directory, Staging Area, and Repository interact.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={handleStatus}
            disabled={isAnimating}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            git status
          </button>
          <button
            onClick={handleAdd}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            git add
          </button>
          <button
            onClick={handleCommit}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
          >
            git commit
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
            <div className="text-slate-500">{"// Ready to track your changes..."}</div>
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
