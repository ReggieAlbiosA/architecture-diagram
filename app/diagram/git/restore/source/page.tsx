"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { RotateCcw } from "lucide-react";

export default function GitRestoreSourcePage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitRestoreSourceDiagram />
    </div>
  );
}

function GitRestoreSourceDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Commit history at top
    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("fill", "#334155")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Commit History");

    const commits = [
      { id: "C1", x: 150, y: 80, label: "C1", ver: "v1.0" },
      { id: "C2", x: 300, y: 80, label: "C2", ver: "v2.0" },
      { id: "HEAD", x: 450, y: 80, label: "HEAD", ver: "v3.0" },
    ];

    svg.append("line")
      .attr("x1", 150).attr("y1", 80)
      .attr("x2", 300).attr("y2", 80)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 3);

    svg.append("line")
      .attr("x1", 300).attr("y1", 80)
      .attr("x2", 450).attr("y2", 80)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 3);

    commits.forEach((commit) => {
      const color = commit.id === "HEAD" ? "#22c55e" : commit.id === "C1" ? "#3b82f6" : "#8b5cf6";
      
      svg.append("circle")
        .attr("class", `commit-${commit.id}`)
        .attr("cx", commit.x)
        .attr("cy", commit.y)
        .attr("r", 20)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 3);

      svg.append("text")
        .attr("x", commit.x)
        .attr("y", commit.y + 6)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "600")
        .attr("font-size", "13px")
        .text(commit.label);

      svg.append("text")
        .attr("x", commit.x)
        .attr("y", commit.y + 38)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .style("font-size", "11px")
        .style("font-family", "monospace")
        .style("font-weight", "600")
        .text(commit.ver);
    });

    // Three-tree zones
    const zones = [
      { id: "working", label: "WORKING DIRECTORY", x: 20, y: 150, w: 280, h: 350, color: "#fef3c7", text: "#78350f" },
      { id: "staging", label: "STAGING AREA (INDEX)", x: 340, y: 150, w: 280, h: 350, color: "#ddd6fe", text: "#4c1d95" },
      { id: "repository", label: "LOCAL REPOSITORY", x: 660, y: 150, w: 300, h: 350, color: "#d1fae5", text: "#064e3b" },
    ];

    zones.forEach((zone) => {
      svg.append("rect")
        .attr("x", zone.x)
        .attr("y", zone.y)
        .attr("width", zone.w)
        .attr("height", zone.h)
        .attr("rx", 10)
        .attr("fill", zone.color)
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2);

      svg.append("text")
        .attr("x", zone.x + zone.w / 2)
        .attr("y", zone.y + 30)
        .attr("text-anchor", "middle")
        .style("fill", zone.text)
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .style("font-size", "14px")
        .text(zone.label);
    });

    // Icons
    const workingGroup = svg.append("g").attr("transform", "translate(160, 240)");
    workingGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#fbbf24").attr("rx", 4);
    workingGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#78350f").style("font-size", "11px").text("Files");

    const stagingGroup = svg.append("g").attr("transform", "translate(480, 240)");
    stagingGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#8b5cf6").attr("stroke", "#6d28d9").attr("stroke-width", 2).attr("rx", 4);
    stagingGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "11px").text("Index");

    const repoGroup = svg.append("g").attr("transform", "translate(810, 240)");
    repoGroup.append("ellipse").attr("cx", 0).attr("cy", -20).attr("rx", 35).attr("ry", 8).attr("fill", "#10b981");
    repoGroup.append("rect").attr("x", -35).attr("y", -20).attr("width", 70).attr("height", 40).attr("fill", "#10b981");
    repoGroup.append("ellipse").attr("cx", 0).attr("cy", 20).attr("rx", 35).attr("ry", 8).attr("fill", "#059669");

    // Labels
    svg.append("text").attr("x", 160).attr("y", 310).attr("text-anchor", "middle").attr("fill", "#78350f").style("font-size", "12px").style("font-weight", "600").text("Current Files");
    svg.append("text").attr("x", 480).attr("y", 310).attr("text-anchor", "middle").attr("fill", "#4c1d95").style("font-size", "12px").style("font-weight", "600").text("Staged Changes");
    svg.append("text").attr("x", 810).attr("y", 310).attr("text-anchor", "middle").attr("fill", "#064e3b").style("font-size", "12px").style("font-weight", "600").text("Commit History");

    svg.append("rect").attr("x", 60).attr("y", 330).attr("width", 200).attr("height", 150).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg.append("rect").attr("x", 380).attr("y", 330).attr("width", 200).attr("height", 150).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg.append("rect").attr("x", 710).attr("y", 330).attr("width", 200).attr("height", 150).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);

    svg.append("g").attr("class", "connections");
    svg.append("g").attr("class", "particles");
    svg.append("g").attr("class", "working-files");
    svg.append("g").attr("class", "staging-files");
    svg.append("g").attr("class", "repo-files");

   
    renderFileState(svg, step);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    renderFileState(svg, step);
  }, [step]);

  const renderFileState = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, currentStep: number) => {
    svg.select(".working-files").selectAll("*").remove();
    svg.select(".staging-files").selectAll("*").remove();
    svg.select(".repo-files").selectAll("*").remove();
    svg.select(".connections").selectAll("*").remove();
    svg.select(".particles").selectAll("*").remove();

    if (currentStep === 0) {
      // Initial: At HEAD (v3.0)
      addWorkingFile(svg, "config.json (v3.0)", 0, false);
      addStagingFile(svg, "config.json (v3.0)", 0);
      addRepoFile(svg, "C1: v1.0", 0, false);
      addRepoFile(svg, "C2: v2.0", 1, false);
      addRepoFile(svg, "HEAD: v3.0", 2, false);

    } else if (currentStep === 1) {
      // After restore --source=C1
      addWorkingFile(svg, "config.json (v1.0)", 0, true);
      addStagingFile(svg, "config.json (v3.0)", 0);
      addRepoFile(svg, "C1: v1.0", 0, true);
      addRepoFile(svg, "C2: v2.0", 1, false);
      addRepoFile(svg, "HEAD: v3.0", 2, false);

      // Curved arrow from C1 (repo) to working
      const conn = svg.select(".connections");
      conn.append("defs")
        .append("marker")
        .attr("id", "arrow-source")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 9)
        .attr("refY", 3)
        .attr("orient", "auto")
        .append("polygon")
        .attr("points", "0 0, 10 3, 0 6")
        .attr("fill", "#3b82f6");

      conn.append("path")
        .attr("d", "M 710 345 Q 400 280, 260 360")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrow-source)")
        .attr("stroke-dasharray", "8,4")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 0.9);

      conn.append("text")
        .attr("x", 420)
        .attr("y", 270)
        .attr("text-anchor", "middle")
        .attr("fill", "#3b82f6")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      // Highlight C1
      svg.select(".commit-C1")
        .transition()
        .duration(800)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 5);
    }
  };

  const addRepoFile = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, text: string, index: number, highlighted: boolean) => {
    const g = svg.select(".repo-files").append("g");
    g.append("rect")
      .attr("x", 720)
      .attr("y", 345 + index * 30)
      .attr("width", 180)
      .attr("height", 24)
      .attr("fill", highlighted ? "#dbeafe" : "#d1fae5")
      .attr("stroke", highlighted ? "#3b82f6" : "#10b981")
      .attr("stroke-width", highlighted ? 2 : 1)
      .attr("rx", 3);
    g.append("text")
      .attr("x", 730)
      .attr("y", 345 + index * 30 + 16)
      .attr("fill", highlighted ? "#1e40af" : "#064e3b")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("font-weight", highlighted ? "600" : "400")
      .text(text);
  };

  const addStagingFile = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, text: string, index: number) => {
    const g = svg.select(".staging-files").append("g");
    g.append("rect")
      .attr("x", 390)
      .attr("y", 345 + index * 30)
      .attr("width", 180)
      .attr("height", 24)
      .attr("fill", "#f3e8ff")
      .attr("stroke", "#c4b5fd")
      .attr("stroke-width", 1)
      .attr("rx", 3);
    g.append("text")
      .attr("x", 400)
      .attr("y", 345 + index * 30 + 16)
      .attr("fill", "#4c1d95")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(text);
  };

  const addWorkingFile = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, text: string, index: number, highlighted: boolean) => {
    const g = svg.select(".working-files").append("g");
    const rect = g.append("rect")
      .attr("x", 70)
      .attr("y", 345 + index * 30)
      .attr("width", 180)
      .attr("height", 24)
      .attr("fill", highlighted ? "#dbeafe" : "#fef3c7")
      .attr("stroke", highlighted ? "#3b82f6" : "#fbbf24")
      .attr("stroke-width", highlighted ? 2 : 1)
      .attr("rx", 3);

    const txt = g.append("text")
      .attr("x", 80)
      .attr("y", 345 + index * 30 + 16)
      .attr("fill", highlighted ? "#1e40af" : "#78350f")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("font-weight", highlighted ? "600" : "400")
      .text(text + (highlighted ? " ✨" : ""));

    if (highlighted) {
      rect.style("opacity", 0).transition().duration(800).style("opacity", 1);
      txt.style("opacity", 0).transition().duration(800).style("opacity", 1);
    }
  };

  const handleRestore = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStep(1);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnimating(false);
  };

  const handleReset = () => {
    setStep(0);
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.select(".commit-C1")
        .attr("stroke", "white")
        .attr("stroke-width", 3);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-7 h-7 text-blue-400" />
              Git Restore --source
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Restore file from a specific commit (time travel to any version)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isAnimating}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Reset Demo
            </button>
            <button
              onClick={handleRestore}
              disabled={isAnimating || step === 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              git restore --source=C1 config.json
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 550"
          className="w-full"
          style={{ maxHeight: "550px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Initial State:</strong> Currently at HEAD (v3.0). We want to restore config.json from C1 (v1.0).
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-green-400">After git restore --source=C1 config.json:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>File from <strong>C1 (v1.0)</strong> restored to Working Directory ✨</li>
                <li>Staging Area unchanged (still at v3.0)</li>
                <li>Repository/HEAD unchanged (still at v3.0)</li>
                <li className="text-blue-400">💡 Great for recovering old versions or reverting specific files</li>
                <li className="text-yellow-400">⚡ You can now edit, stage, and commit this old version</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
