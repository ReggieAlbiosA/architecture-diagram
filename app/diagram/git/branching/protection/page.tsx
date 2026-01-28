"use client";

import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  Shield,
  Lock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function BranchProtectionPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <BranchProtectionDiagram />
    </div>
  );
}

function BranchProtectionDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [requireReview, setRequireReview] = useState(false);
  const [requireChecks, setRequireChecks] = useState(false);
  const [restrictPush, setRestrictPush] = useState(false);
  const [attemptType, setAttemptType] = useState<
    "none" | "direct" | "pr-no-review" | "pr-approved"
  >("none");

  useEffect(() => {
    if (!svgRef.current) return;
    renderDiagram();
  }, [
    protectionEnabled,
    requireReview,
    requireChecks,
    restrictPush,
    attemptType,
  ]);

  const renderDiagram = () => {
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
      .text("Branch Protection Rules");

    // Main branch visualization
    svg
      .append("rect")
      .attr("x", 50)
      .attr("y", 80)
      .attr("width", 1100)
      .attr("height", 120)
      .attr("rx", 10)
      .attr("fill", protectionEnabled ? "#dcfce7" : "#f1f5f9")
      .attr("stroke", protectionEnabled ? "#22c55e" : "#cbd5e1")
      .attr("stroke-width", 3);

    // Shield icon
    const shieldG = svg.append("g").attr("transform", "translate(100, 140)");
    shieldG
      .append("circle")
      .attr("r", 35)
      .attr("fill", protectionEnabled ? "#22c55e" : "#94a3b8")
      .attr("opacity", 0.2);

    shieldG
      .append("text")
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "40px")
      .text(protectionEnabled ? "🛡️" : "🔓");

    // Branch name
    svg
      .append("text")
      .attr("x", 180)
      .attr("y", 125)
      .attr("fill", protectionEnabled ? "#166534" : "#64748b")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .text("main");

    svg
      .append("text")
      .attr("x", 180)
      .attr("y", 150)
      .attr("fill", protectionEnabled ? "#16a34a" : "#94a3b8")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(protectionEnabled ? "Protected Branch" : "Unprotected Branch");

    // Protection rules (right side)
    const rulesX = 350;
    const rulesY = 100;

    if (protectionEnabled) {
      const rules = [
        {
          text: "Require pull request reviews",
          enabled: requireReview,
          icon: "👥",
        },
        {
          text: "Require status checks to pass",
          enabled: requireChecks,
          icon: "✓",
        },
        { text: "Restrict who can push", enabled: restrictPush, icon: "🔒" },
      ];

      rules.forEach((rule, idx) => {
        const y = rulesY + idx * 30;
        const color = rule.enabled ? "#22c55e" : "#94a3b8";

        svg
          .append("text")
          .attr("x", rulesX)
          .attr("y", y)
          .attr("fill", color)
          .style("font-size", "14px")
          .style("font-weight", rule.enabled ? "600" : "400")
          .text(`${rule.icon} ${rule.text}`);
      });
    }

    // Workflow section
    svg
      .append("text")
      .attr("x", 50)
      .attr("y", 240)
      .attr("fill", "#1e293b")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Workflow Scenarios");

    // Developer
    svg
      .append("rect")
      .attr("x", 50)
      .attr("y", 270)
      .attr("width", 150)
      .attr("height", 280)
      .attr("rx", 8)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    svg
      .append("text")
      .attr("x", 125)
      .attr("y", 300)
      .attr("text-anchor", "middle")
      .style("font-size", "40px")
      .text("👨‍💻");

    svg
      .append("text")
      .attr("x", 125)
      .attr("y", 335)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Developer");

    // Action buttons visualization
    const actions = [
      { label: "Direct Push", y: 370, type: "direct" as const },
      { label: "PR (No Review)", y: 420, type: "pr-no-review" as const },
      { label: "PR (Approved)", y: 470, type: "pr-approved" as const },
    ];

    actions.forEach((action) => {
      const isSelected = attemptType === action.type;
      svg
        .append("rect")
        .attr("x", 60)
        .attr("y", action.y)
        .attr("width", 130)
        .attr("height", 35)
        .attr("rx", 4)
        .attr("fill", isSelected ? "#3b82f6" : "#f1f5f9")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", isSelected ? 2 : 1)
        .style("cursor", "pointer");

      svg
        .append("text")
        .attr("x", 125)
        .attr("y", action.y + 23)
        .attr("text-anchor", "middle")
        .attr("fill", isSelected ? "white" : "#1e40af")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(action.label);
    });

    // Result visualization
    if (attemptType !== "none") {
      const resultX = 250;
      let success = false;
      let message = "";
      let details: string[] = [];

      if (attemptType === "direct") {
        success = !protectionEnabled || !restrictPush;
        message = success ? "Direct Push Allowed" : "Direct Push Blocked";
        details = success
          ? ["✓ No protection enabled"]
          : ["✗ Branch is protected", "✗ Direct push restricted"];
      } else if (attemptType === "pr-no-review") {
        success = !protectionEnabled || !requireReview;
        message = success ? "PR Merge Allowed" : "PR Merge Blocked";
        details = success
          ? ["✓ No review required"]
          : ["✗ Review required", "✗ No approvals yet"];
      } else if (attemptType === "pr-approved") {
        const checksPass = !requireChecks;
        success = !protectionEnabled || checksPass || Math.random() > 0.5;
        message = success ? "PR Merge Allowed ✓" : "PR Merge Blocked";
        details = success
          ? ["✓ Reviews approved", "✓ All checks passed"]
          : ["✓ Reviews approved", "✗ Status checks failing"];
      }

      // Arrow
      svg
        .append("path")
        .attr("d", `M 200 ${390} L ${resultX - 20} ${390}`)
        .attr("stroke", success ? "#22c55e" : "#ef4444")
        .attr("stroke-width", 3)
        .attr("marker-end", `url(#arrow-${success ? "success" : "fail"})`);

      svg
        .append("defs")
        .append("marker")
        .attr("id", `arrow-${success ? "success" : "fail"}`)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 9)
        .attr("refY", 3)
        .attr("orient", "auto")
        .append("polygon")
        .attr("points", "0 0, 10 3, 0 6")
        .attr("fill", success ? "#22c55e" : "#ef4444");

      // Result box
      svg
        .append("rect")
        .attr("x", resultX)
        .attr("y", 300)
        .attr("width", 320)
        .attr("height", 200)
        .attr("rx", 8)
        .attr("fill", success ? "#dcfce7" : "#fee2e2")
        .attr("stroke", success ? "#22c55e" : "#ef4444")
        .attr("stroke-width", 3);

      svg
        .append("text")
        .attr("x", resultX + 160)
        .attr("y", 335)
        .attr("text-anchor", "middle")
        .style("font-size", "60px")
        .text(success ? "✅" : "❌");

      svg
        .append("text")
        .attr("x", resultX + 160)
        .attr("y", 370)
        .attr("text-anchor", "middle")
        .attr("fill", success ? "#166534" : "#991b1b")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(message);

      details.forEach((detail, idx) => {
        svg
          .append("text")
          .attr("x", resultX + 20)
          .attr("y", 400 + idx * 25)
          .attr("fill", detail.startsWith("✓") ? "#166534" : "#991b1b")
          .style("font-size", "13px")
          .style("font-weight", "500")
          .text(detail);
      });

      // Main branch status
      svg
        .append("rect")
        .attr("x", 620)
        .attr("y", 300)
        .attr("width", 250)
        .attr("height", 200)
        .attr("rx", 8)
        .attr("fill", "#f0fdf4")
        .attr("stroke", "#22c55e")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      svg
        .append("text")
        .attr("x", 745)
        .attr("y", 335)
        .attr("text-anchor", "middle")
        .attr("fill", "#166534")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("main branch");

      svg
        .append("text")
        .attr("x", 745)
        .attr("y", 370)
        .attr("text-anchor", "middle")
        .attr("fill", "#16a34a")
        .style("font-size", "14px")
        .text(success ? "✓ Updated" : "⚠ Protected");

      if (success) {
        svg
          .append("text")
          .attr("x", 745)
          .attr("y", 410)
          .attr("text-anchor", "middle")
          .style("font-size", "50px")
          .text("🎉");
      } else {
        svg
          .append("text")
          .attr("x", 745)
          .attr("y", 410)
          .attr("text-anchor", "middle")
          .style("font-size", "50px")
          .text("🔐");
      }
    }
  };

  const simulateAction = (
    type: "none" | "direct" | "pr-no-review" | "pr-approved"
  ) => {
    setAttemptType(type);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-6 border-b border-green-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-7 h-7 text-green-300" />
              Branch Protection Rules
            </h1>
            <p className="text-green-200 text-sm mt-1">
              Enforce code quality and review processes with branch protection
            </p>
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

      <div className="bg-slate-900 p-6 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-6">
          {/* Left - Protection settings */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Protection Settings
            </h3>
            <div className="space-y-3">
              <label
                className="flex items-center gap-3 p-3 bg-slate-800 rounded border 
              border-slate-700 cursor-pointer hover:bg-slate-750"
              >
                <input
                  type="checkbox"
                  checked={protectionEnabled}
                  onChange={(e) => {
                    setProtectionEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setRequireReview(false);
                      setRequireChecks(false);
                      setRestrictPush(false);
                    }
                  }}
                  className="w-5 h-5"
                />
                <div>
                  <div className="text-white font-semibold">
                    Enable Branch Protection
                  </div>
                  <div className="text-slate-400 text-xs">
                    Protect main branch from unwanted changes
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 bg-slate-800 rounded border 
              border-slate-700 ${
                !protectionEnabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-slate-750"
              }`}
              >
                <input
                  type="checkbox"
                  checked={requireReview}
                  onChange={(e) => setRequireReview(e.target.checked)}
                  disabled={!protectionEnabled}
                  className="w-5 h-5"
                />
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Require Pull Request Reviews
                  </div>
                  <div className="text-slate-400 text-xs">
                    At least 1 approval required
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 bg-slate-800 rounded border 
              border-slate-700 ${
                !protectionEnabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-slate-750"
              }`}
              >
                <input
                  type="checkbox"
                  checked={requireChecks}
                  onChange={(e) => setRequireChecks(e.target.checked)}
                  disabled={!protectionEnabled}
                  className="w-5 h-5"
                />
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Require Status Checks
                  </div>
                  <div className="text-slate-400 text-xs">
                    CI/CD must pass before merge
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 bg-slate-800 rounded border 
              border-slate-700 ${
                !protectionEnabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-slate-750"
              }`}
              >
                <input
                  type="checkbox"
                  checked={restrictPush}
                  onChange={(e) => setRestrictPush(e.target.checked)}
                  disabled={!protectionEnabled}
                  className="w-5 h-5"
                />
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Restrict Direct Pushes
                  </div>
                  <div className="text-slate-400 text-xs">
                    Only admins can push directly
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Right - Test scenarios */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Test Scenarios
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => simulateAction("direct")}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded shadow 
                transition font-semibold text-sm text-left"
              >
                <div className="font-bold">🚀 Try Direct Push</div>
                <div className="text-xs opacity-90">git push origin main</div>
              </button>

              <button
                onClick={() => simulateAction("pr-no-review")}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded 
                shadow transition font-semibold text-sm text-left"
              >
                <div className="font-bold">📝 Merge PR (No Review)</div>
                <div className="text-xs opacity-90">
                  Pull request without approvals
                </div>
              </button>

              <button
                onClick={() => simulateAction("pr-approved")}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded 
                shadow transition font-semibold text-sm text-left"
              >
                <div className="font-bold">✅ Merge PR (Approved)</div>
                <div className="text-xs opacity-90">
                  Pull request with approvals
                </div>
              </button>

              <button
                onClick={() => simulateAction("none")}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded 
                shadow transition font-semibold text-sm"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700">
              <div className="text-xs text-slate-400">
                <strong className="text-slate-300">💡 Tip:</strong> Branch
                protection prevents accidental changes to important branches and
                enforces code review workflows.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
