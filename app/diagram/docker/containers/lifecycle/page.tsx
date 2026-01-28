"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import { SiDocker } from "react-icons/si";

interface Position {
  x: number;
  y: number;
}

const config = {
  width: 1000,
  height: 500,
  states: [
    { id: "created", label: "CREATED", x: 150, y: 150, color: "#93c5fd" },
    { id: "running", label: "RUNNING", x: 500, y: 150, color: "#86efac" },
    { id: "paused", label: "PAUSED", x: 850, y: 150, color: "#fcd34d" },
    { id: "stopped", label: "STOPPED", x: 500, y: 350, color: "#fca5a5" },
    { id: "removed", label: "REMOVED", x: 150, y: 350, color: "#cbd5e1" },
  ],
  transitions: [
    { from: "created", to: "running", label: "start", color: "#22c55e" },
    { from: "running", to: "paused", label: "pause", color: "#f59e0b" },
    { from: "paused", to: "running", label: "unpause", color: "#22c55e" },
    { from: "running", to: "stopped", label: "stop", color: "#ef4444" },
    { from: "stopped", to: "running", label: "restart", color: "#22c55e" },
    { from: "stopped", to: "removed", label: "remove", color: "#6b7280" },
    { from: "created", to: "removed", label: "remove", color: "#6b7280" },
  ],
};

export default function ContainerLifecyclePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerLifecycleDiagram />
    </div>
  );
}

function ContainerLifecycleDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentState, setCurrentState] = useState("created");
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, color: string = "text-green-400") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, message, color }]);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw transition lines
    config.transitions.forEach((transition) => {
      const fromState = config.states.find((s) => s.id === transition.from);
      const toState = config.states.find((s) => s.id === transition.to);

      if (!fromState || !toState) return;

      const isCurved = fromState.id === "paused" && toState.id === "running";
      const path = isCurved
        ? `M ${fromState.x} ${fromState.y} Q ${fromState.x + 175} ${fromState.y - 80} ${toState.x} ${toState.y}`
        : `M ${fromState.x} ${fromState.y} L ${toState.x} ${toState.y}`;

      svg
        .append("path")
        .attr("d", path)
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrow)")
        .attr("opacity", 0.3);

      // Label
      const midX = (fromState.x + toState.x) / 2;
      const midY = isCurved ? fromState.y - 50 : (fromState.y + toState.y) / 2;

      svg
        .append("text")
        .attr("x", midX)
        .attr("y", midY)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .text(transition.label);
    });

    // Arrow marker
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#94a3b8");

    // Draw state boxes
    config.states.forEach((state) => {
      const g = svg.append("g").attr("class", `state-${state.id}`);

      g.append("rect")
        .attr("x", state.x - 80)
        .attr("y", state.y - 40)
        .attr("width", 160)
        .attr("height", 80)
        .attr("rx", 10)
        .attr("fill", state.color)
        .attr("stroke", currentState === state.id ? "#1e40af" : "#94a3b8")
        .attr("stroke-width", currentState === state.id ? 4 : 2);

      g.append("text")
        .attr("x", state.x)
        .attr("y", state.y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#1f2937")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(state.label);
    });

    svg.append("g").attr("id", "particles");
  }, [currentState]);

  const createParticle = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    start: Position,
    end: Position,
    color: string,
    callback?: () => void
  ) => {
    const particleLayer = svg.select("#particles");
    const p = particleLayer
      .append("circle")
      .attr("cx", start.x)
      .attr("cy", start.y)
      .attr("r", 8)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    p.transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("cx", end.x)
      .attr("cy", end.y)
      .on("end", () => {
        p.remove();
        if (callback) callback();
      });
  };

  const handleTransition = (action: string) => {
    if (isAnimating) return;

    const transition = config.transitions.find(
      (t) => t.from === currentState && t.label === action
    );

    if (!transition) {
      addLog(`Cannot ${action} from ${currentState} state`, "text-red-400");
      return;
    }

    setIsAnimating(true);
    const svg = d3.select(svgRef.current!);

    const fromState = config.states.find((s) => s.id === transition.from)!;
    const toState = config.states.find((s) => s.id === transition.to)!;

    addLog(`$ docker ${action} <container>`, "text-blue-400");

    createParticle(
      svg,
      { x: fromState.x, y: fromState.y },
      { x: toState.x, y: toState.y },
      transition.color,
      () => {
        setCurrentState(toState.id);
        addLog(`Container ${toState.label.toLowerCase()}`, "text-green-500");
        setIsAnimating(false);
      }
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Container Lifecycle
          </h1>
          <p className="text-slate-400 text-sm mt-1">Understand container state transitions from creation to removal.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button onClick={() => handleTransition("start")} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            start
          </button>
          <button onClick={() => handleTransition("stop")} disabled={isAnimating} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            stop
          </button>
          <button onClick={() => handleTransition("pause")} disabled={isAnimating} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            pause
          </button>
          <button onClick={() => handleTransition("unpause")} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            unpause
          </button>
          <button onClick={() => handleTransition("restart")} disabled={isAnimating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            restart
          </button>
          <button onClick={() => handleTransition("remove")} disabled={isAnimating} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            remove
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-4">
        <div className="mb-4 text-center">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Current State: </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase">{currentState}</span>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="w-full"
          style={{ maxHeight: "420px" }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="bg-slate-900 p-3 border-t border-slate-700">
        <div className="font-mono text-xs md:text-sm h-28 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500">{"// Container in created state..."}</div>
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
