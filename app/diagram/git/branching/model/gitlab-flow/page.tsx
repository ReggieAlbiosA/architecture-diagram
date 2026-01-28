"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { GitBranch } from "lucide-react";

export default function GitLabFlowPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitLabFlowDiagram />
    </div>
  );
}

function GitLabFlowDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 500;

    // Title
    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 35)
      .attr("fill", "#1e293b")
      .style("font-weight", "bold")
      .style("font-size", "20px")
      .text("GitLab Flow Model");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 60)
      .attr("fill", "#64748b")
      .style("font-size", "13px")
      .text("Environment branches with upstream-first approach");

    // Branch lines
    const branches = [
      { name: "main", y: 120, color: "#22c55e", label: "Production" },
      { name: "pre-production", y: 220, color: "#f59e0b", label: "Staging" },
      { name: "feature/*", y: 380, color: "#3b82f6", label: "Development" },
    ];

    branches.forEach((branch) => {
      svg
        .append("line")
        .attr("x1", 150)
        .attr("y1", branch.y)
        .attr("x2", width - 50)
        .attr("y2", branch.y)
        .attr("stroke", branch.color)
        .attr("stroke-width", branch.name.includes("*") ? 2 : 4)
        .attr("stroke-dasharray", branch.name.includes("*") ? "8,4" : "none")
        .attr("opacity", 0.3);

      svg
        .append("text")
        .attr("x", 20)
        .attr("y", branch.y + 5)
        .attr("fill", branch.color)
        .style("font-size", branch.name.includes("*") ? "13px" : "15px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(branch.name);

      svg
        .append("text")
        .attr("x", 20)
        .attr("y", branch.y + 22)
        .attr("fill", "#64748b")
        .style("font-size", "10px")
        .text(branch.label);
    });

    // Dynamic layers
    svg.append("g").attr("class", "commits");
    svg.append("g").attr("class", "arrows");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "env-labels");

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
    svg.select(".env-labels").selectAll("*").remove();

    // Base commits
    addCommit(svg, 200, 120, "#22c55e", "v1");
    addCommit(svg, 200, 220, "#f59e0b", "v1");

    if (currentStep >= 1) {
      // Feature branch
      addCommit(svg, 300, 380, "#3b82f6", "feat");
      addLabel(svg, 300, 415, "Feature branch", "#3b82f6");
    }

    if (currentStep >= 2) {
      // Feature commits
      addCommit(svg, 400, 380, "#3b82f6", "f1");
      addCommit(svg, 500, 380, "#3b82f6", "f2");
    }

    if (currentStep >= 3) {
      // Merge to main first (upstream-first)
      addCommit(svg, 600, 120, "#22c55e", "M");
      addArrow(svg, 500, 380, 600, 120, "#22c55e");
      addLabel(svg, 550, 250, "Merge to main first", "#22c55e");
      addEnvLabel(svg, 650, 105, "Deploy to prod", "#22c55e");
    }

    if (currentStep >= 4) {
      // Cherry-pick or merge to pre-prod
      addCommit(svg, 650, 220, "#f59e0b", "cp");
      addArrow(svg, 600, 120, 650, 220, "#f59e0b");
      addLabel(svg, 620, 165, "Cherry-pick", "#f59e0b");
      addEnvLabel(svg, 700, 205, "Deploy to staging", "#f59e0b");
    }

    if (currentStep >= 5) {
      // Next feature
      addCommit(svg, 750, 380, "#3b82f6", "new");
      addLabel(svg, 750, 360, "Next feature", "#3b82f6");
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
      .attr("r", 15)
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
    color: string
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

    g.append("path")
      .attr(
        "d",
        `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2}, ${x2} ${y2}`
      )
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", "5,5")
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

  const addEnvLabel = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    color: string
  ) => {
    const g = svg.select(".env-labels").append("g");

    g.append("rect")
      .attr("x", x - 45)
      .attr("y", y - 10)
      .attr("width", 90)
      .attr("height", 20)
      .attr("rx", 3)
      .attr("fill", color)
      .attr("opacity", 0.15)
      .style("opacity", 0)
      .transition()
      .duration(400)
      .style("opacity", 0.15);

    g.append("text")
      .attr("x", x)
      .attr("y", y + 4)
      .attr("text-anchor", "middle")
      .attr("fill", color)
      .style("font-size", "10px")
      .style("font-weight", "600")
      .text(text)
      .style("opacity", 0)
      .transition()
      .duration(400)
      .style("opacity", 1);
  };

  const nextStep = async () => {
    if (isAnimating || step >= 5) return;
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
      <div className="bg-gradient-to-r from-orange-900 to-amber-900 p-6 border-b border-orange-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-orange-300" />
              GitLab Flow Model
            </h1>
            <p className="text-orange-200 text-sm mt-1">
              Environment branches with upstream-first merging strategy
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetFlow}
              disabled={isAnimating}
              className="px-4 py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Reset
            </button>
            <button
              onClick={prevStep}
              disabled={isAnimating || step === 0}
              className="px-4 py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              disabled={isAnimating || step >= 5}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 500"
          className="w-full"
          style={{ maxHeight: "500px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Step 0:</strong> Main (production)
              and pre-production environment branches
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-blue-400">Step 1:</strong> Create feature
              branch for new work
            </div>
          )}
          {step === 2 && (
            <div>
              <strong className="text-blue-400">Step 2:</strong> Develop feature
              with commits
            </div>
          )}
          {step === 3 && (
            <div>
              <strong className="text-green-400">Step 3:</strong> Merge to main
              first (upstream-first), deploy to production
            </div>
          )}
          {step === 4 && (
            <div>
              <strong className="text-yellow-400">Step 4:</strong> Cherry-pick
              or merge down to pre-production for staging
            </div>
          )}
          {step === 5 && (
            <div>
              <strong className="text-blue-400">Step 5:</strong> Start next
              feature
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
          <strong className="text-slate-300">Key Principles:</strong>{" "}
          Upstream-first merging, environment branches, issue-driven development
        </div>
      </div>
    </div>
  );
}
