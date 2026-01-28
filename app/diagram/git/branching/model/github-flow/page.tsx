"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { GitBranch } from "lucide-react";

export default function GitHubFlowPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <GitHubFlowDiagram />
    </div>
  );
}

function GitHubFlowDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 400;

    // Title
    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 35)
      .attr("fill", "#1e293b")
      .style("font-weight", "bold")
      .style("font-size", "20px")
      .text("GitHub Flow Model");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 60)
      .attr("fill", "#64748b")
      .style("font-size", "13px")
      .text("Simple, lightweight flow - anything in main is deployable");

    // Main branch line
    svg
      .append("line")
      .attr("x1", 150)
      .attr("y1", 150)
      .attr("x2", width - 50)
      .attr("y2", 150)
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 4)
      .attr("opacity", 0.4);

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 155)
      .attr("fill", "#22c55e")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text("main");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 175)
      .attr("fill", "#64748b")
      .style("font-size", "11px")
      .text("Always deployable");

    // Feature branch line (temporary)
    svg
      .append("line")
      .attr("x1", 150)
      .attr("y1", 280)
      .attr("x2", width - 50)
      .attr("y2", 280)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4")
      .attr("opacity", 0.3);

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 285)
      .attr("fill", "#3b82f6")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text("feature");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 302)
      .attr("fill", "#64748b")
      .style("font-size", "11px")
      .text("Short-lived");

    // Dynamic layers
    svg.append("g").attr("class", "commits");
    svg.append("g").attr("class", "arrows");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "pr-boxes");

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
    svg.select(".pr-boxes").selectAll("*").remove();

    // Base commits
    addCommit(svg, 200, 150, "#22c55e", "C1");
    addCommit(svg, 350, 150, "#22c55e", "C2");

    if (currentStep >= 1) {
      // Branch from main
      addCommit(svg, 450, 280, "#3b82f6", "feat");
      addArrow(svg, 350, 150, 450, 280, "#3b82f6");
      addLabel(svg, 400, 215, "Create feature branch", "#3b82f6");
    }

    if (currentStep >= 2) {
      // Feature commits
      addCommit(svg, 550, 280, "#3b82f6", "f1");
      addCommit(svg, 650, 280, "#3b82f6", "f2");
      addLabel(svg, 600, 315, "Develop feature", "#3b82f6");
    }

    if (currentStep >= 3) {
      // Pull Request
      addPRBox(svg, 720, 210, "Pull Request", "#8b5cf6");
      addLabel(svg, 720, 250, "Code review & CI", "#8b5cf6");
    }

    if (currentStep >= 4) {
      // Merge to main
      addCommit(svg, 850, 150, "#22c55e", "M");
      addArrow(svg, 650, 280, 850, 150, "#22c55e");
      addLabel(svg, 750, 120, "Merge & Deploy", "#22c55e");
    }

    if (currentStep >= 5) {
      // Next feature
      addCommit(svg, 950, 280, "#3b82f6", "new");
      addArrow(svg, 850, 150, 950, 280, "#3b82f6");
      addLabel(svg, 900, 215, "Next feature", "#3b82f6");
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
      .style("font-size", "11px")
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
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(text)
      .style("opacity", 0)
      .transition()
      .duration(400)
      .style("opacity", 1);
  };

  const addPRBox = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    color: string
  ) => {
    const g = svg.select(".pr-boxes").append("g");

    g.append("rect")
      .attr("x", x - 60)
      .attr("y", y - 15)
      .attr("width", 120)
      .attr("height", 30)
      .attr("rx", 4)
      .attr("fill", color)
      .attr("opacity", 0.2)
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 0.9);

    g.append("text")
      .attr("x", x)
      .attr("y", y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", color)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(text)
      .style("opacity", 0)
      .transition()
      .duration(500)
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
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-6 border-b border-green-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-green-300" />
              GitHub Flow Model
            </h1>
            <p className="text-green-200 text-sm mt-1">
              Simplified workflow: branch, commit, pull request, merge, deploy
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetFlow}
              disabled={isAnimating}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white 
              rounded shadow transition font-semibold text-sm"
            >
              Reset
            </button>
            <button
              onClick={prevStep}
              disabled={isAnimating || step === 0}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white 
              rounded shadow transition font-semibold text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              disabled={isAnimating || step >= 5}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white 
              rounded shadow transition font-semibold text-sm"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 400"
          className="w-full"
          style={{ maxHeight: "400px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Step 0:</strong> Main branch is
              always in deployable state
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-blue-400">Step 1:</strong> Create feature
              branch from main for new work
            </div>
          )}
          {step === 2 && (
            <div>
              <strong className="text-blue-400">Step 2:</strong> Commit changes
              regularly to feature branch
            </div>
          )}
          {step === 3 && (
            <div>
              <strong className="text-purple-400">Step 3:</strong> Open Pull
              Request for code review and CI checks
            </div>
          )}
          {step === 4 && (
            <div>
              <strong className="text-green-400">Step 4:</strong> Merge to main
              and deploy immediately
            </div>
          )}
          {step === 5 && (
            <div>
              <strong className="text-blue-400">Step 5:</strong> Repeat: create
              next feature branch from main
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
          <strong className="text-slate-300">Key Principles:</strong> Single
          main branch, short-lived feature branches, continuous deployment
        </div>
      </div>
    </div>
  );
}
