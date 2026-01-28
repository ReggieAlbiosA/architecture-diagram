"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { GitBranch } from "lucide-react";

export default function TrunkBasedPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <TrunkBasedDiagram />
    </div>
  );
}

function TrunkBasedDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 350;

    // Title
    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 35)
      .attr("fill", "#1e293b")
      .style("font-weight", "bold")
      .style("font-size", "20px")
      .text("Trunk-Based Development");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 60)
      .attr("fill", "#64748b")
      .style("font-size", "13px")
      .text(
        "Continuous integration to a single trunk/main branch - minimal branching"
      );

    // Main trunk line
    svg
      .append("line")
      .attr("x1", 150)
      .attr("y1", 180)
      .attr("x2", width - 50)
      .attr("y2", 180)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 6)
      .attr("opacity", 0.5);

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 185)
      .attr("fill", "#10b981")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text("trunk");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 202)
      .attr("fill", "#64748b")
      .style("font-size", "11px")
      .text("Always stable");

    // Short-lived branch lines (very short)
    svg
      .append("line")
      .attr("x1", 150)
      .attr("y1", 270)
      .attr("x2", width - 50)
      .attr("y2", 270)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.2);

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 275)
      .attr("fill", "#3b82f6")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text("short-lived");

    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 290)
      .attr("fill", "#64748b")
      .style("font-size", "10px")
      .text("< 1-2 days");

    // Dynamic layers
    svg.append("g").attr("class", "commits");
    svg.append("g").attr("class", "arrows");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "release-tags");

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
    svg.select(".release-tags").selectAll("*").remove();

    // Trunk commits
    addCommit(svg, 200, 180, "#10b981", "C1");
    addCommit(svg, 300, 180, "#10b981", "C2");

    if (currentStep >= 1) {
      // Short-lived branch
      addCommit(svg, 400, 270, "#3b82f6", "task");
      addArrow(svg, 300, 180, 400, 270, "#3b82f6");
      addLabel(svg, 350, 225, "Quick branch", "#3b82f6");
    }

    if (currentStep >= 2) {
      // Immediate merge back
      addCommit(svg, 500, 180, "#10b981", "M1");
      addArrow(svg, 400, 270, 500, 180, "#10b981");
      addLabel(svg, 450, 225, "Merge same day", "#10b981");
    }

    if (currentStep >= 3) {
      // More trunk commits
      addCommit(svg, 600, 180, "#10b981", "C3");
      addCommit(svg, 700, 180, "#10b981", "C4");
      addLabel(svg, 650, 160, "Continuous integration", "#10b981");
    }

    if (currentStep >= 4) {
      // Release tag
      addReleaseTag(svg, 700, 180, "v1.0");
      addLabel(svg, 700, 210, "Tag for release", "#f59e0b");
    }

    if (currentStep >= 5) {
      // Another quick branch
      addCommit(svg, 800, 270, "#3b82f6", "fix");
      addArrow(svg, 700, 180, 800, 270, "#3b82f6");
      addCommit(svg, 900, 180, "#10b981", "M2");
      addArrow(svg, 800, 270, 900, 180, "#10b981");
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

  const addReleaseTag = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string
  ) => {
    const g = svg.select(".release-tags").append("g");

    g.append("polygon")
      .attr(
        "points",
        `${x},${y + 25} ${x - 8},${y + 35} ${x},${y + 45} ${x + 8},${y + 35}`
      )
      .attr("fill", "#f59e0b")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    g.append("text")
      .attr("x", x)
      .attr("y", y + 38)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "9px")
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
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 border-b border-emerald-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-emerald-300" />
              Trunk-Based Development
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              High-velocity development with minimal branching and frequent
              integration
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetFlow}
              disabled={isAnimating}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Reset
            </button>
            <button
              onClick={prevStep}
              disabled={isAnimating || step === 0}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              disabled={isAnimating || step >= 5}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 350"
          className="w-full"
          style={{ maxHeight: "350px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {step === 0 && (
            <div>
              <strong className="text-white">Step 0:</strong> Single trunk
              branch where all developers integrate
            </div>
          )}
          {step === 1 && (
            <div>
              <strong className="text-blue-400">Step 1:</strong> Very
              short-lived branch (hours/1-2 days max)
            </div>
          )}
          {step === 2 && (
            <div>
              <strong className="text-emerald-400">Step 2:</strong> Quick merge
              back to trunk - same day integration
            </div>
          )}
          {step === 3 && (
            <div>
              <strong className="text-emerald-400">Step 3:</strong> Continuous
              integration - many small commits to trunk
            </div>
          )}
          {step === 4 && (
            <div>
              <strong className="text-yellow-400">Step 4:</strong> Tag trunk for
              releases rather than branching
            </div>
          )}
          {step === 5 && (
            <div>
              <strong className="text-blue-400">Step 5:</strong> Repeat:
              short-lived branches immediately merged
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
          <strong className="text-slate-300">Key Principles:</strong> Single
          trunk, short-lived branches (&lt;2 days), feature flags, continuous
          delivery
        </div>
      </div>
    </div>
  );
}
