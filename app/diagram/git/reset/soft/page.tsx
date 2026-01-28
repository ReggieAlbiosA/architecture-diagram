"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { History } from "lucide-react";

// ============================================================================
// Git Soft Reset Architecture
// ============================================================================

export default function GitSoftResetPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitSoftResetDiagram />
    </div>
  );
}

function GitSoftResetDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 600;

    // Draw three-tree architecture zones
    const zones = [
      {
        id: "working",
        label: "WORKING DIRECTORY",
        x: 20,
        y: 320,
        w: 280,
        h: 250,
        color: "#fef3c7",
        text: "#78350f",
      },
      {
        id: "staging",
        label: "STAGING AREA (INDEX)",
        x: 340,
        y: 320,
        w: 280,
        h: 250,
        color: "#ddd6fe",
        text: "#4c1d95",
      },
      {
        id: "repository",
        label: "LOCAL REPOSITORY",
        x: 660,
        y: 320,
        w: 300,
        h: 250,
        color: "#d1fae5",
        text: "#064e3b",
      },
    ];

    zones.forEach((zone) => {
      svg
        .append("rect")
        .attr("x", zone.x)
        .attr("y", zone.y)
        .attr("width", zone.w)
        .attr("height", zone.h)
        .attr("rx", 10)
        .attr("fill", zone.color)
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2);

      svg
        .append("text")
        .attr("x", zone.x + zone.w / 2)
        .attr("y", zone.y + 25)
        .attr("text-anchor", "middle")
        .style("fill", zone.text)
        .style("font-weight", "bold")
        .style("font-family", "monospace")
        .style("font-size", "12px")
        .text(zone.label);
    });

    // Draw commit graph section
    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("fill", "#334155")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Commit History");

    // Draw commit nodes
    const commits = [
      { id: "C1", x: 150, y: 120, label: "C1" },
      { id: "C2", x: 300, y: 120, label: "C2" },
      { id: "C3", x: 450, y: 120, label: "C3" },
    ];

    // Links between commits
    svg
      .append("line")
      .attr("x1", 150)
      .attr("y1", 120)
      .attr("x2", 300)
      .attr("y2", 120)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 3);

    svg
      .append("line")
      .attr("class", "c2-c3-link")
      .attr("x1", 300)
      .attr("y1", 120)
      .attr("x2", 450)
      .attr("y2", 120)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 3);

    // Draw commit nodes
    commits.forEach((commit) => {
      svg
        .append("circle")
        .attr("class", `commit-${commit.id}`)
        .attr("cx", commit.x)
        .attr("cy", commit.y)
        .attr("r", 20)
        .attr("fill", "#8b5cf6")
        .attr("stroke", "white")
        .attr("stroke-width", 3);

      svg
        .append("text")
        .attr("x", commit.x)
        .attr("y", commit.y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "600")
        .attr("font-size", "14px")
        .text(commit.label);
    });

    // HEAD pointer (initially at C3)
    const headGroup = svg.append("g").attr("class", "head-pointer");

    headGroup
      .append("rect")
      .attr("x", 450 - 30)
      .attr("y", 120 + 35)
      .attr("width", 60)
      .attr("height", 24)
      .attr("rx", 4)
      .attr("fill", "#18181b")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2);

    headGroup
      .append("text")
      .attr("x", 450)
      .attr("y", 120 + 52)
      .attr("text-anchor", "middle")
      .attr("fill", "#22c55e")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("font-family", "monospace")
      .text("HEAD");

    // File areas for three trees
    svg.append("g").attr("class", "working-files");
    svg.append("g").attr("class", "staging-files");
    svg.append("g").attr("class", "repo-commits");

    // Initial state - empty files
    renderFileState(svg, step);
  }, []);

  // Update visualization when step changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    renderFileState(svg, step);
  }, [step]);

  const renderFileState = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    currentStep: number
  ) => {
    // Clear existing files
    svg.select(".working-files").selectAll("*").remove();
    svg.select(".staging-files").selectAll("*").remove();
    svg.select(".repo-commits").selectAll("*").remove();

    if (currentStep === 0) {
      // Initial state: All clean, HEAD at C3
      addRepoCommit(svg, "C1: Initial", 0);
      addRepoCommit(svg, "C2: Feature", 1);
      addRepoCommit(svg, "C3: Update", 2);
    } else if (currentStep === 1) {
      // After reset --soft: HEAD moved to C2, C3 changes in staging
      addRepoCommit(svg, "C1: Initial", 0);
      addRepoCommit(svg, "C2: Feature", 1);

      // Files from C3 now in staging area
      addStagingFile(svg, "app.js (modified)", 0);
      addStagingFile(svg, "styles.css (new)", 1);

      // Show C3 disappearing
      svg
        .select(".commit-C3")
        .transition()
        .duration(800)
        .attr("fill", "#94a3b8")
        .attr("opacity", 0.3);

      svg
        .select(".c2-c3-link")
        .transition()
        .duration(800)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.3);

      // Move HEAD to C2
      svg
        .select(".head-pointer")
        .transition()
        .duration(1000)
        .attr("transform", "translate(-150, 0)");
    }
  };

  const addRepoCommit = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    text: string,
    index: number
  ) => {
    const g = svg.select(".repo-commits").append("g");

    g.append("rect")
      .attr("x", 670)
      .attr("y", 360 + index * 30)
      .attr("width", 280)
      .attr("height", 25)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 1)
      .attr("rx", 3);

    g.append("text")
      .attr("x", 680)
      .attr("y", 360 + index * 30 + 17)
      .attr("fill", "#064e3b")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(text);
  };

  const addStagingFile = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    text: string,
    index: number
  ) => {
    const g = svg.select(".staging-files").append("g");

    g.append("rect")
      .attr("x", 350)
      .attr("y", 360 + index * 30)
      .attr("width", 260)
      .attr("height", 25)
      .attr("fill", "#e9d5ff")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .style("opacity", 0)
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.append("text")
      .attr("x", 360)
      .attr("y", 360 + index * 30 + 17)
      .attr("fill", "#4c1d95")
      .style("font-size", "11px")
      .style("opacity", 0)
      .transition()
      .duration(600)
      .style("opacity", 1)
      .text(text);
  };

  const handleReset = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsAnimating(false);
  };

  const handleResetState = () => {
    setStep(0);
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.select(".commit-C3").attr("fill", "#8b5cf6").attr("opacity", 1);
      svg
        .select(".c2-c3-link")
        .attr("stroke-dasharray", "none")
        .attr("opacity", 1);
      svg.select(".head-pointer").attr("transform", "translate(0, 0)");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-7 h-7 text-purple-400" />
              Git Soft Reset
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Moves HEAD to previous commit, but preserves changes in Staging
              Area
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetState}
              disabled={isAnimating}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Reset Demo
            </button>
            <button
              onClick={handleReset}
              disabled={isAnimating || step === 1}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              git reset --soft HEAD~1
            </button>
          </div>
        </div>
      </div>

      {/* Diagram */}
      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 600"
          className="w-full"
          style={{ maxHeight: "600px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Explanation */}
      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Initial State:</strong> HEAD is at
              C3. All three trees are in sync.
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-green-400">
                After git reset --soft HEAD~1:
              </strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>HEAD moved back to C2 (C3 becomes unreachable)</li>
                <li className="text-purple-400">
                  <strong>Staging Area:</strong> Contains all changes from C3
                </li>
                <li>
                  <strong>Working Directory:</strong> Unchanged (clean)
                </li>
                <li className="text-yellow-400">
                  💡 Changes are ready to be committed again
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
