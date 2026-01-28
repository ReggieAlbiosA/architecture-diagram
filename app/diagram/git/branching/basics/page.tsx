"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { GitBranch, Plus, Trash2, ArrowLeftRight } from "lucide-react";

export default function BranchBasicsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <BranchBasicsDiagram />
    </div>
  );
}

function BranchBasicsDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentBranch, setCurrentBranch] = useState("main");
  const [branches, setBranches] = useState<string[]>(["main"]);
  const [commits, setCommits] = useState<
    { branch: string; x: number; y: number; id: string }[]
  >([
    { branch: "main", x: 200, y: 200, id: "C1" },
    { branch: "main", x: 350, y: 200, id: "C2" },
  ]);

  useEffect(() => {
    if (!svgRef.current) return;
    renderDiagram();
  }, [branches, currentBranch, commits]);

  const renderDiagram = () => {
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
      .text("Git Branch Operations");

    // Draw branch lanes
    const branchYPositions: { [key: string]: number } = {
      main: 200,
      feature: 300,
      bugfix: 400,
    };

    branches.forEach((branch, idx) => {
      const y = branchYPositions[branch] || 200 + idx * 100;
      const color =
        branch === "main"
          ? "#22c55e"
          : branch === "feature"
          ? "#3b82f6"
          : "#f59e0b";
      const isActive = branch === currentBranch;

      // Branch line
      svg
        .append("line")
        .attr("x1", 150)
        .attr("y1", y)
        .attr("x2", width - 50)
        .attr("y2", y)
        .attr("stroke", color)
        .attr("stroke-width", isActive ? 4 : 2)
        .attr("opacity", isActive ? 0.6 : 0.3);

      // Branch label
      const labelG = svg.append("g");

      labelG
        .append("rect")
        .attr("x", 20)
        .attr("y", y - 20)
        .attr("width", 110)
        .attr("height", 32)
        .attr("rx", 6)
        .attr("fill", isActive ? color : "#f1f5f9")
        .attr("stroke", color)
        .attr("stroke-width", 2);

      labelG
        .append("text")
        .attr("x", 75)
        .attr("y", y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", isActive ? "white" : color)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(branch);

      if (isActive) {
        labelG
          .append("text")
          .attr("x", 135)
          .attr("y", y + 5)
          .attr("fill", color)
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text("✓");
      }
    });

    // Draw commits
    commits.forEach((commit) => {
      const y = branchYPositions[commit.branch] || 200;
      const color =
        commit.branch === "main"
          ? "#22c55e"
          : commit.branch === "feature"
          ? "#3b82f6"
          : "#f59e0b";

      svg
        .append("circle")
        .attr("cx", commit.x)
        .attr("cy", y)
        .attr("r", 18)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 3);

      svg
        .append("text")
        .attr("x", commit.x)
        .attr("y", y + 6)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(commit.id);
    });

    // HEAD pointer
    const headCommit = commits[commits.length - 1];
    const headY = branchYPositions[currentBranch] || 200;

    svg
      .append("rect")
      .attr("x", headCommit.x - 35)
      .attr("y", headY + 30)
      .attr("width", 70)
      .attr("height", 26)
      .attr("rx", 4)
      .attr("fill", "#18181b")
      .attr("stroke", "#fbbf24")
      .attr("stroke-width", 2);

    svg
      .append("text")
      .attr("x", headCommit.x)
      .attr("y", headY + 48)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("font-family", "monospace")
      .text("HEAD");
  };

  const createBranch = (branchName: string) => {
    if (!branches.includes(branchName)) {
      setBranches([...branches, branchName]);
    }
  };

  const switchBranch = (branchName: string) => {
    if (branches.includes(branchName)) {
      setCurrentBranch(branchName);
    }
  };

  const deleteBranch = (branchName: string) => {
    if (branchName !== "main" && branchName !== currentBranch) {
      setBranches(branches.filter((b) => b !== branchName));
      setCommits(commits.filter((c) => c.branch !== branchName));
    }
  };

  const addCommit = () => {
    const lastCommit = commits[commits.length - 1];
    const newCommit = {
      branch: currentBranch,
      x: lastCommit.x + 150,
      y: lastCommit.y,
      id: `C${commits.length + 1}`,
    };
    setCommits([...commits, newCommit]);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-6 border-b border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-blue-300" />
              Git Branch Basics
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Learn fundamental branch operations: create, switch, list, and
              delete
            </p>
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

      <div className="bg-slate-900 p-6 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-6">
          {/* Left column - Branch operations */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Branch Operations
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => createBranch("feature")}
                  disabled={branches.includes("feature")}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 
                  disabled:cursor-not-allowed text-white rounded shadow transition font-semibold 
                  text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create feature
                </button>
                <button
                  onClick={() => createBranch("bugfix")}
                  disabled={branches.includes("bugfix")}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 
                  disabled:cursor-not-allowed text-white rounded shadow transition font-semibold 
                  text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create bugfix
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => switchBranch("main")}
                  disabled={currentBranch === "main"}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 
                  disabled:cursor-not-allowed text-white rounded shadow transition font-semibold 
                  text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Switch to main
                </button>
                {branches.includes("feature") && (
                  <button
                    onClick={() => switchBranch("feature")}
                    disabled={currentBranch === "feature"}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 
                    disabled:cursor-not-allowed text-white rounded shadow transition font-semibold 
                    text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Switch to feature
                  </button>
                )}
              </div>

              <button
                onClick={addCommit}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded 
                shadow transition font-semibold text-sm"
              >
                📝 Make Commit on {currentBranch}
              </button>

              <div className="flex gap-2">
                {branches.includes("feature") &&
                  currentBranch !== "feature" && (
                    <button
                      onClick={() => deleteBranch("feature")}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded 
                    shadow transition font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete feature
                    </button>
                  )}
                {branches.includes("bugfix") && currentBranch !== "bugfix" && (
                  <button
                    onClick={() => deleteBranch("bugfix")}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded 
                    shadow transition font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete bugfix
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Command reference */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              📖 Common Commands
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-green-400">git branch feature</div>
                <div className="text-slate-400 text-xs mt-1">
                  Create new branch
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-blue-400">git switch feature</div>
                <div className="text-slate-400 text-xs mt-1">
                  Switch to branch (modern)
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-blue-400">git checkout feature</div>
                <div className="text-slate-400 text-xs mt-1">
                  Switch to branch (legacy)
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-yellow-400">git branch -a</div>
                <div className="text-slate-400 text-xs mt-1">
                  List all branches
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-red-400">git branch -d feature</div>
                <div className="text-slate-400 text-xs mt-1">
                  Delete merged branch
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
          <strong className="text-slate-300">Current Branch:</strong>{" "}
          {currentBranch} |
          <strong className="text-slate-300 ml-3">All Branches:</strong>{" "}
          {branches.join(", ")}
        </div>
      </div>
    </div>
  );
}
