"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { RotateCcw } from "lucide-react";

export default function GitRestoreStagedPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitRestoreStagedDiagram />
    </div>
  );
}

function GitRestoreStagedDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw zones
    const zones = [
      { id: "working", label: "WORKING DIRECTORY", x: 20, y: 50, w: 280, h: 400, color: "#fef3c7", text: "#78350f" },
      { id: "staging", label: "STAGING AREA (INDEX)", x: 340, y: 50, w: 280, h: 400, color: "#ddd6fe", text: "#4c1d95" },
      { id: "repository", label: "LOCAL REPOSITORY", x: 660, y: 50, w: 300, h: 400, color: "#d1fae5", text: "#064e3b" },
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
    const workingGroup = svg.append("g").attr("transform", "translate(160, 150)");
    workingGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#fbbf24").attr("rx", 4);
    workingGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "#78350f").style("font-size", "11px").text("Files");

    const stagingGroup = svg.append("g").attr("transform", "translate(480, 150)");
    stagingGroup.append("rect").attr("x", -40).attr("y", -25).attr("width", 80).attr("height", 50).attr("fill", "#8b5cf6").attr("stroke", "#6d28d9").attr("stroke-width", 2).attr("rx", 4);
    stagingGroup.append("text").attr("text-anchor", "middle").attr("dy", 5).attr("fill", "white").style("font-size", "11px").text("Index");

    const repoGroup = svg.append("g").attr("transform", "translate(810, 150)");
    repoGroup.append("ellipse").attr("cx", 0).attr("cy", -20).attr("rx", 35).attr("ry", 8).attr("fill", "#10b981");
    repoGroup.append("rect").attr("x", -35).attr("y", -20).attr("width", 70).attr("height", 40).attr("fill", "#10b981");
    repoGroup.append("ellipse").attr("cx", 0).attr("cy", 20).attr("rx", 35).attr("ry", 8).attr("fill", "#059669");

    // Labels
    svg.append("text").attr("x", 160).attr("y", 230).attr("text-anchor", "middle").attr("fill", "#78350f").style("font-size", "12px").style("font-weight", "600").text("Modified Files");
    svg.append("text").attr("x", 480).attr("y", 230).attr("text-anchor", "middle").attr("fill", "#4c1d95").style("font-size", "12px").style("font-weight", "600").text("Staged Changes");
    svg.append("text").attr("x", 810).attr("y", 230).attr("text-anchor", "middle").attr("fill", "#064e3b").style("font-size", "12px").style("font-weight", "600").text("Commit History");

    svg.append("rect").attr("x", 60).attr("y", 250).attr("width", 200).attr("height", 180).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg.append("rect").attr("x", 380).attr("y", 250).attr("width", 200).attr("height", 180).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);
    svg.append("rect").attr("x", 710).attr("y", 250).attr("width", 200).attr("height", 180).attr("fill", "white").attr("stroke", "#cbd5e1").attr("rx", 5);

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
      // Initial: File staged
      addWorkingFile(svg, "styles.css (modified)", 0);
      addStagingFile(svg, "styles.css (v2.0)", 0, true);
      addRepoFile(svg, "styles.css (v1.0)", 0);

    } else if (currentStep === 1) {
      // After restore --staged: Unstaged
      addWorkingFile(svg, "styles.css (modified)", 0);
      addStagingFile(svg, "styles.css (v1.0)", 0, false);
      addRepoFile(svg, "styles.css (v1.0)", 0);

      // Arrow from repo to staging
      const conn = svg.select(".connections");
      conn.append("defs")
        .append("marker")
        .attr("id", "arrow-unstage")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 9)
        .attr("refY", 3)
        .attr("orient", "auto")
        .append("polygon")
        .attr("points", "0 0, 10 3, 0 6")
        .attr("fill", "#f59e0b");

      conn.append("path")
        .attr("d", "M 710 300 L 580 300")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 4)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrow-unstage)")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);

      conn.append("text")
        .attr("x", 645)
        .attr("y", 290)
        .attr("text-anchor", "middle")
        .attr("fill", "#f59e0b")
        .style("font-size", "12px")
   
        .style("font-weight", "600")
        .text("UNSTAGE")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);
    }
  };

  const addRepoFile = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, text: string, index: number) => {
    const g = svg.select(".repo-files").append("g");
    g.append("rect")
      .attr("x", 720)
      .attr("y", 265 + index * 30)
      .attr("width", 180)
      .attr("height", 24)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 1)
      .attr("rx", 3);
    g.append("text")
      .attr("x", 730)
      .attr("y", 265 + index * 30 + 16)
      .attr("fill", "#064e3b")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(text);
  };

  const addStagingFile = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, text: string, index: number, highlighted: boolean) => {
    const g = svg.select(".staging-files").append("g");
    g.append("rect")
      .attr("x", 390)
      .attr("y", 265 + index * 30)
      .attr("width", 180)
      .attr("height", 24)
      .attr("fill", highlighted ? "#e9d5ff" : "#f3e8ff")
      .attr("stroke", highlighted ? "#8b5cf6" : "#c4b5fd")
      .attr("stroke-width", highlighted ? 2 : 1)
      .attr("rx", 3);
    g.append("text")
      .attr("x", 400)
      .attr("y", 265 + index * 30 + 16)
      .attr("fill", "#4c1d95")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("font-weight", highlighted ? "600" : "400")
      .text(text + (highlighted ? " 📦" : ""));
  };

  const addWorkingFile = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, text: string, index: number) => {
    const g = svg.select(".working-files").append("g");
    g.append("rect")
      .attr("x", 70)
      .attr("y", 265 + index * 30)
      .attr("width", 180)
      .attr("height", 24)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 1)
      .attr("rx", 3);
    g.append("text")
      .attr("x", 80)
      .attr("y", 265 + index * 30 + 16)
      .attr("fill", "#78350f")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(text);
  };

  const handleRestore = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStep(1);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnimating(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-7 h-7 text-purple-400" />
              Git Restore --staged
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Unstage files (move from Staging Area back to Working Directory state)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(0)}
              disabled={isAnimating}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Reset Demo
            </button>
            <button
              onClick={handleRestore}
              disabled={isAnimating || step === 1}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              git restore --staged styles.css
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 500"
          className="w-full"
          style={{ maxHeight: "500px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Initial State:</strong> styles.css (v2.0) is staged and ready to be committed (📦).
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-green-400">After git restore --staged styles.css:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Staging Area <strong>reset to match HEAD</strong> (repository)</li>
                <li className="text-yellow-400"><strong>Working Directory unchanged</strong> - your edits are safe!</li>
                <li>File is now &quot;modified but unstaged&quot;</li>
                <li className="text-blue-400">💡 Equivalent to old: git reset HEAD &lt;file&gt;</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
