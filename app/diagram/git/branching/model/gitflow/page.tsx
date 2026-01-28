"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { GitBranch } from "lucide-react";

export default function GitFlowPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitFlowDiagram />
    </div>
  );
}

function GitFlowDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 600;

    // Title
    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 35)
      .attr("fill", "#1e293b")
      .style("font-weight", "bold")
      .style("font-size", "20px")
      .text("GitFlow Branching Model");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 60)
      .attr("fill", "#64748b")
      .style("font-size", "13px")
      .text(
        "A strict branching model with dedicated branches for features, releases, and hotfixes"
      );

    // Branch lines (permanent)
    const branches = [
      { name: "master/main", y: 150, color: "#ef4444", label: "Production" },
      { name: "develop", y: 250, color: "#8b5cf6", label: "Integration" },
      { name: "feature/*", y: 350, color: "#3b82f6", label: "New Features" },
      { name: "release/*", y: 450, color: "#f59e0b", label: "Release Prep" },
      { name: "hotfix/*", y: 550, color: "#ec4899", label: "Emergency Fixes" },
    ];

    branches.forEach((branch) => {
      // Branch line
      svg
        .append("line")
        .attr("x1", 150)
        .attr("y1", branch.y)
        .attr("x2", width - 50)
        .attr("y2", branch.y)
        .attr("stroke", branch.color)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", branch.name.includes("*") ? "8,4" : "none")
        .attr("opacity", 0.3);

      // Branch label
      svg
        .append("text")
        .attr("x", 20)
        .attr("y", branch.y + 5)
        .attr("fill", branch.color)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(branch.name);

      // Description
      svg
        .append("text")
        .attr("x", 20)
        .attr("y", branch.y + 22)
        .attr("fill", "#64748b")
        .style("font-size", "11px")
        .text(branch.label);
    });

    // Dynamic layers
    svg.append("g").attr("class", "commits");
    svg.append("g").attr("class", "arrows");
    svg.append("g").attr("class", "labels");

    renderWorkflow(svg, step);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    renderWorkflow(svg, step);
  }, [step]);

  const renderWorkflow = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    currentStep: number
  ) => {
    svg.select(".commits").selectAll("*").remove();
    svg.select(".arrows").selectAll("*").remove();
    svg.select(".labels").selectAll("*").remove();

    // Base commits always visible
    addCommit(svg, 200, 150, "#ef4444", "v1.0");
    addCommit(svg, 200, 250, "#8b5cf6", "dev");

    if (currentStep >= 1) {
      // Feature branch created
      addCommit(svg, 300, 350, "#3b82f6", "feat");
      addArrow(svg, 200, 250, 300, 350, "#3b82f6", "branch");
      addLabel(svg, 250, 330, "Feature branch created", "#3b82f6");
    }

    if (currentStep >= 2) {
      // Feature commits
      addCommit(svg, 400, 350, "#3b82f6", "f1");
      addCommit(svg, 500, 350, "#3b82f6", "f2");
    }

    if (currentStep >= 3) {
      // Merge feature to develop
      addCommit(svg, 550, 250, "#8b5cf6", "merge");
      addArrow(svg, 500, 350, 550, 250, "#3b82f6", "merge");
      addLabel(svg, 530, 290, "Merge to develop", "#8b5cf6");
    }

    if (currentStep >= 4) {
      // Release branch
      addCommit(svg, 650, 450, "#f59e0b", "rc");
      addArrow(svg, 550, 250, 650, 450, "#f59e0b", "branch");
      addLabel(svg, 600, 360, "Release branch", "#f59e0b");
    }

    if (currentStep >= 5) {
      // Release to master
      addCommit(svg, 750, 150, "#ef4444", "v2.0");
      addArrow(svg, 650, 450, 750, 150, "#f59e0b", "merge");
      // Also merge back to develop
      addCommit(svg, 750, 250, "#8b5cf6", "v2.0");
      addArrow(svg, 650, 450, 750, 250, "#f59e0b", "merge");
      addLabel(svg, 700, 100, "Release to production", "#ef4444");
    }

    if (currentStep >= 6) {
      // Hotfix branch
      addCommit(svg, 850, 550, "#ec4899", "hot");
      addArrow(svg, 750, 150, 850, 550, "#ec4899", "branch");
      addLabel(svg, 800, 360, "Emergency hotfix", "#ec4899");
    }

    if (currentStep >= 7) {
      // Hotfix to master
      addCommit(svg, 950, 150, "#ef4444", "v2.1");
      addArrow(svg, 850, 550, 950, 150, "#ec4899", "merge");
      // Also to develop
      addCommit(svg, 950, 250, "#8b5cf6", "fix");
      addArrow(svg, 850, 550, 950, 250, "#ec4899", "merge");
      addLabel(svg, 900, 100, "Hotfix deployed", "#ef4444");
    }
  };

  const addCommit = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number,
    color: string,
    label: string
  ) => {
    const g = svg.select(".commits").append("g");

    g.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 16)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("opacity", 0)
      .transition()
      .duration(400)
      .style("opacity", 1);

    g.append("text")
      .attr("x", x)
      .attr("y", y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", "600")
      .text(label)
      .style("opacity", 0)
      .transition()
      .duration(400)
      .style("opacity", 1);
  };

  const addArrow = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    type: "branch" | "merge"
  ) => {
    const g = svg.select(".arrows");

    const id = `arrow-${Math.random()}`;
    g.append("defs")
      .append("marker")
      .attr("id", id)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("refX", 7)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("polygon")
      .attr("points", "0 0, 8 3, 0 6")
      .attr("fill", color);

    const dasharray = type === "branch" ? "5,5" : "none";

    g.append("path")
      .attr(
        "d",
        `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2}, ${x2} ${y2}`
      )
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", dasharray)
      .attr("marker-end", `url(#${id})`)
      .attr("opacity", 0.6)
      .style("opacity", 0)
      .transition()
      .duration(600)
      .style("opacity", 0.6);
  };

  const addLabel = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    color: string
  ) => {
    svg
      .select(".labels")
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("fill", color)
      .style("font-size", "11px")
      .style("font-weight", "600")
      .text(text)
      .style("opacity", 0)
      .transition()
      .duration(400)
      .style("opacity", 1);
  };

  const nextStep = async () => {
    if (isAnimating || step >= 7) return;
    setIsAnimating(true);
    setStep(step + 1);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsAnimating(false);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const resetFlow = () => {
    setStep(0);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 border-b border-purple-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-purple-300" />
              GitFlow Model
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              Structured workflow with dedicated branches for development,
              releases, and hotfixes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetFlow}
              disabled={isAnimating}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Reset
            </button>
            <button
              onClick={prevStep}
              disabled={isAnimating || step === 0}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              disabled={isAnimating || step >= 7}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 600"
          className="w-full"
          style={{ maxHeight: "600px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Step 0:</strong> Initial state with
              master (production) and develop branches
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-blue-400">Step 1:</strong> Feature branch
              created from develop for new functionality
            </div>
          )}
          {step === 2 && (
            <div>
              <strong className="text-blue-400">Step 2:</strong> Multiple
              commits made on feature branch
            </div>
          )}
          {step === 3 && (
            <div>
              <strong className="text-purple-400">Step 3:</strong> Feature
              merged back into develop (integration branch)
            </div>
          )}
          {step === 4 && (
            <div>
              <strong className="text-yellow-400">Step 4:</strong> Release
              branch created from develop for release preparation
            </div>
          )}
          {step === 5 && (
            <div>
              <strong className="text-red-400">Step 5:</strong> Release merged
              to master (production) and back to develop
            </div>
          )}
          {step === 6 && (
            <div>
              <strong className="text-pink-400">Step 6:</strong> Hotfix branch
              created from master for emergency fix
            </div>
          )}
          {step === 7 && (
            <div>
              <strong className="text-pink-400">Step 7:</strong> Hotfix merged
              to master and develop, deployed immediately
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
          <strong className="text-slate-300">Key Principles:</strong> Parallel
          development tracks, dedicated release branches, emergency hotfix
          support
        </div>
      </div>
    </div>
  );
}
