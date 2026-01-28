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
    pidNs: { x: 200, y: 200 },
    netNs: { x: 400, y: 200 },
    mntNs: { x: 600, y: 200 },
    utsNs: { x: 800, y: 200 },
    cpuCg: { x: 300, y: 380 },
    memCg: { x: 700, y: 380 },
  },
};

export default function ContainerIsolationPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerIsolationDiagram />
    </div>
  );
}

function ContainerIsolationDiagram() {
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

    // Host Kernel
    const hostGroup = svg.append("g");
    hostGroup
      .append("rect")
      .attr("x", 50)
      .attr("y", 50)
      .attr("width", 900)
      .attr("height", 60)
      .attr("fill", "#1e293b")
      .attr("rx", 8);

    hostGroup
      .append("text")
      .attr("x", config.positions.host.x)
      .attr("y", config.positions.host.y)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Linux Kernel (Host)");

    // Namespaces Section
    svg
      .append("rect")
      .attr("x", 50)
      .attr("y", 140)
      .attr("width", 900)
      .attr("height", 120)
      .attr("fill", "#eff6ff")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    svg
      .append("text")
      .attr("x", 70)
      .attr("y", 162)
      .attr("fill", "#1e40af")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .text("NAMESPACES (Process Isolation)");

    // PID Namespace
    const pidGroup = svg.append("g");
    pidGroup
      .append("rect")
      .attr("x", config.positions.pidNs.x - 70)
      .attr("y", config.positions.pidNs.y - 30)
      .attr("width", 140)
      .attr("height", 60)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 5);

    pidGroup
      .append("text")
      .attr("x", config.positions.pidNs.x)
      .attr("y", config.positions.pidNs.y - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("PID");

    pidGroup
      .append("text")
      .attr("x", config.positions.pidNs.x)
      .attr("y", config.positions.pidNs.y + 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "10px")
      .text("Process IDs");

    // NET Namespace
    const netGroup = svg.append("g");
    netGroup
      .append("rect")
      .attr("x", config.positions.netNs.x - 70)
      .attr("y", config.positions.netNs.y - 30)
      .attr("width", 140)
      .attr("height", 60)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 5);

    netGroup
      .append("text")
      .attr("x", config.positions.netNs.x)
      .attr("y", config.positions.netNs.y - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("NET");

    netGroup
      .append("text")
      .attr("x", config.positions.netNs.x)
      .attr("y", config.positions.netNs.y + 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "10px")
      .text("Network Stack");

    // MNT Namespace
    const mntGroup = svg.append("g");
    mntGroup
      .append("rect")
      .attr("x", config.positions.mntNs.x - 70)
      .attr("y", config.positions.mntNs.y - 30)
      .attr("width", 140)
      .attr("height", 60)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 5);

    mntGroup
      .append("text")
      .attr("x", config.positions.mntNs.x)
      .attr("y", config.positions.mntNs.y - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("MNT");

    mntGroup
      .append("text")
      .attr("x", config.positions.mntNs.x)
      .attr("y", config.positions.mntNs.y + 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "10px")
      .text("Mount Points");

    // UTS Namespace
    const utsGroup = svg.append("g");
    utsGroup
      .append("rect")
      .attr("x", config.positions.utsNs.x - 70)
      .attr("y", config.positions.utsNs.y - 30)
      .attr("width", 140)
      .attr("height", 60)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 5);

    utsGroup
      .append("text")
      .attr("x", config.positions.utsNs.x)
      .attr("y", config.positions.utsNs.y - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("UTS");

    utsGroup
      .append("text")
      .attr("x", config.positions.utsNs.x)
      .attr("y", config.positions.utsNs.y + 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "10px")
      .text("Hostname");

    // Cgroups Section
    svg
      .append("rect")
      .attr("x", 50)
      .attr("y", 300)
      .attr("width", 900)
      .attr("height", 140)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    svg
      .append("text")
      .attr("x", 70)
      .attr("y", 322)
      .attr("fill", "#78350f")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .text("CGROUPS (Resource Limits)");

    // CPU Cgroup
    const cpuGroup = svg.append("g");
    cpuGroup
      .append("rect")
      .attr("x", config.positions.cpuCg.x - 120)
      .attr("y", config.positions.cpuCg.y - 35)
      .attr("width", 240)
      .attr("height", 70)
      .attr("fill", "#fde68a")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("rx", 5);

    cpuGroup
      .append("text")
      .attr("x", config.positions.cpuCg.x)
      .attr("y", config.positions.cpuCg.y - 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#78350f")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("CPU Cgroup");

    cpuGroup
      .append("text")
      .attr("x", config.positions.cpuCg.x)
      .attr("y", config.positions.cpuCg.y + 6)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "10px")
      .text("--cpus=2 --cpu-shares=1024");

    // Memory Cgroup
    const memGroup = svg.append("g");
    memGroup
      .append("rect")
      .attr("x", config.positions.memCg.x - 120)
      .attr("y", config.positions.memCg.y - 35)
      .attr("width", 240)
      .attr("height", 70)
      .attr("fill", "#fde68a")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("rx", 5);

    memGroup
      .append("text")
      .attr("x", config.positions.memCg.x)
      .attr("y", config.positions.memCg.y - 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#78350f")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Memory Cgroup");

    memGroup
      .append("text")
      .attr("x", config.positions.memCg.x)
      .attr("y", config.positions.memCg.y + 6)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "10px")
      .text("--memory=1g --memory-swap=2g");

    // Connection lines from kernel
    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 200).attr("y2", 170).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 400).attr("y2", 170).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 600).attr("y2", 170).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 800).attr("y2", 170).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 300).attr("y2", 345).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 700).attr("y2", 345).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("g").attr("id", "particles");
  }, []);

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
      .attr("r", 6)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    p.transition()
      .duration(800)
      .ease(d3.easeLinear)
      .attr("cx", end.x)
      .attr("cy", end.y)
      .on("end", () => {
        p.remove();
        if (callback) callback();
      });
  };

  const handleNamespaces = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    addLog("$ docker run --rm nginx", "text-blue-400");

    const pos = config.positions;

    setTimeout(() => {
      addLog("Kernel: Creating namespaces...", "text-purple-400");

      createParticle(svg, pos.host, pos.pidNs, "#3b82f6", () => {
        addLog("PID namespace: Isolated process tree", "text-blue-400");
      });

      setTimeout(() => {
        createParticle(svg, pos.host, pos.netNs, "#3b82f6", () => {
          addLog("NET namespace: Private network stack", "text-blue-400");
        });
      }, 300);

      setTimeout(() => {
        createParticle(svg, pos.host, pos.mntNs, "#3b82f6", () => {
          addLog("MNT namespace: Isolated filesystem", "text-blue-400");
        });
      }, 600);

      setTimeout(() => {
        createParticle(svg, pos.host, pos.utsNs, "#3b82f6", () => {
          addLog("UTS namespace: Unique hostname", "text-blue-400");
          setTimeout(() => {
            addLog("Namespaces configured successfully", "text-green-500");
            setIsAnimating(false);
          }, 500);
        });
      }, 900);
    }, 500);
  };

  const handleCgroups = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    addLog("$ docker run --cpus=2 --memory=1g nginx", "text-yellow-400");

    const pos = config.positions;

    setTimeout(() => {
      addLog("Kernel: Configuring cgroups...", "text-purple-400");

      createParticle(svg, pos.host, pos.cpuCg, "#f59e0b", () => {
        addLog("CPU cgroup: Limited to 2 CPUs", "text-yellow-400");
      });

      setTimeout(() => {
        createParticle(svg, pos.host, pos.memCg, "#f59e0b", () => {
          addLog("Memory cgroup: Limited to 1GB RAM", "text-yellow-400");
          setTimeout(() => {
            addLog("Resource limits applied successfully", "text-green-500");
            setIsAnimating(false);
          }, 500);
        });
      }, 500);
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Container Isolation
          </h1>
          <p className="text-slate-400 text-sm mt-1">How namespaces and cgroups provide process isolation and resource limits.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button onClick={handleNamespaces} disabled={isAnimating} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm">
            Setup Namespaces
          </button>
          <button onClick={handleCgroups} disabled={isAnimating} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded shadow transition font-semibold text-sm">
            Apply Cgroups
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
            <div className="text-slate-500">{"// Linux kernel primitives for container isolation..."}</div>
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
