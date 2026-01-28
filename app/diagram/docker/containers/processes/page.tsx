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
  positions: {
    host: { x: 500, y: 80 },
    container1: { x: 250, y: 250 },
    container2: { x: 750, y: 250 },
    process1: { x: 250, y: 400 },
    process2: { x: 750, y: 400 },
  },
};

export default function ContainerProcessesPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerProcessesDiagram />
    </div>
  );
}

function ContainerProcessesDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, color: string = "text-green-400") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, message, color }]);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const pos = config.positions;

    // Host kernel
    svg
      .append("rect")
      .attr("x", 50)
      .attr("y", 50)
      .attr("width", 900)
      .attr("height", 60)
      .attr("fill", "#1e293b")
      .attr("rx", 8);

    svg
      .append("text")
      .attr("x", pos.host.x)
      .attr("y", pos.host.y)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Host Kernel (Shared)");

    // Container 1
    const container1G = svg.append("g");
    container1G
      .append("rect")
      .attr("x", pos.container1.x - 120)
      .attr("y", pos.container1.y - 60)
      .attr("width", 240)
      .attr("height", 120)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("rx", 8);

    container1G
      .append("text")
      .attr("x", pos.container1.x)
      .attr("y", pos.container1.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Container: web-app");

    container1G
      .append("text")
      .attr("x", pos.container1.x)
      .attr("y", pos.container1.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "11px")
      .text("PID Namespace: isolated");

    // Process tree in container 1
    const proc1Details = ["PID 1: node server.js", "PID 2: worker process", "PID 3: logger"];
    proc1Details.forEach((detail, i) => {
      container1G
        .append("text")
        .attr("x", pos.container1.x)
        .attr("y", pos.container1.y + 5 + i * 14)
        .attr("text-anchor", "middle")
        .attr("fill", "#1e3a8a")
        .style("font-size", "10px")
        .text(detail);
    });

    // Container 2
    const container2G = svg.append("g");
    container2G
      .append("rect")
      .attr("x", pos.container2.x - 120)
      .attr("y", pos.container2.y - 60)
      .attr("width", 240)
      .attr("height", 120)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("rx", 8);

    container2G
      .append("text")
      .attr("x", pos.container2.x)
      .attr("y", pos.container2.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Container: database");

    container2G
      .append("text")
      .attr("x", pos.container2.x)
      .attr("y", pos.container2.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "11px")
      .text("PID Namespace: isolated");

    // Process tree in container 2
    const proc2Details = ["PID 1: postgres", "PID 2: checkpointer", "PID 3: writer"];
    proc2Details.forEach((detail, i) => {
      container2G
        .append("text")
        .attr("x", pos.container2.x)
        .attr("y", pos.container2.y + 5 + i * 14)
        .attr("text-anchor", "middle")
        .attr("fill", "#064e3b")
        .style("font-size", "10px")
        .text(detail);
    });

    // Host process view
    const hostProcessG = svg.append("g");
    hostProcessG
      .append("rect")
      .attr("x", 150)
      .attr("y", 390)
      .attr("width", 700)
      .attr("height", 80)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("rx", 6);

    hostProcessG
      .append("text")
      .attr("x", 500)
      .attr("y", 410)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Host View (ps aux)");

    const hostProcs = [
      "PID 1234: node server.js (web-app)",
      "PID 1235: worker (web-app)",
      "PID 5678: postgres (database)",
    ];
    hostProcs.forEach((proc, i) => {
      hostProcessG
        .append("text")
        .attr("x", 500)
        .attr("y", 428 + i * 13)
        .attr("text-anchor", "middle")
        .attr("fill", "#78350f")
        .style("font-size", "9px")
        .text(proc);
    });

    // Connection lines
    svg
      .append("line")
      .attr("x1", pos.container1.x)
      .attr("y1", 110)
      .attr("x2", pos.container1.x)
      .attr("y2", 190)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", pos.container2.x)
      .attr("y1", 110)
      .attr("x2", pos.container2.x)
      .attr("y2", 190)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg.append("g").attr("id", "particles");
  }, []);

  const handlePIDNamespace = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker run -d --name web-app node:latest", "text-blue-400");

    setTimeout(() => {
      addLog("Creating PID namespace for container", "text-purple-400");
      addLog("Inside container: PID 1 is the main process", "text-green-400");
      addLog("From host: PID 1234 (different view)", "text-yellow-400");
      addLog("Process isolation achieved via namespaces", "text-cyan-400");
      setIsAnimating(false);
    }, 800);
  };

  const handleProcessTree = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker exec web-app ps aux", "text-blue-400");

    setTimeout(() => {
      addLog("PID 1: node server.js (container init)", "text-green-400");
      addLog("PID 2: worker process (child)", "text-green-400");
      addLog("PID 3: logger process (child)", "text-green-400");
      addLog("Container sees isolated process tree", "text-purple-400");
      setIsAnimating(false);
    }, 800);
  };

  const handleHostView = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ ps aux | grep node", "text-blue-400");

    setTimeout(() => {
      addLog("Host view shows real PIDs:", "text-yellow-400");
      addLog("PID 1234: node server.js (from web-app)", "text-cyan-400");
      addLog("PID 1235: worker process", "text-cyan-400");
      addLog("Host kernel manages all processes", "text-purple-400");
      setIsAnimating(false);
    }, 800);
  };

  const handleSignals = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker stop web-app", "text-red-400");

    setTimeout(() => {
      addLog("Sending SIGTERM to PID 1 (inside container)", "text-yellow-400");
      addLog("Container PID 1 receives signal", "text-orange-400");
      addLog("Graceful shutdown initiated", "text-green-400");
      addLog("After 10s, SIGKILL if not stopped", "text-red-400");
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Container Processes
          </h1>
          <p className="text-slate-400 text-sm mt-1">How containers isolate and manage processes.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button onClick={handlePIDNamespace} disabled={isAnimating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            PID Namespace
          </button>
          <button onClick={handleProcessTree} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Process Tree
          </button>
          <button onClick={handleHostView} disabled={isAnimating} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Host View
          </button>
          <button onClick={handleSignals} disabled={isAnimating} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Signals
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800 p-4">
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
            <div className="text-slate-500">{"// Explore process isolation in containers..."}</div>
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
