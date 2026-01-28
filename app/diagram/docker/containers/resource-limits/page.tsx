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
    cpu: { x: 250, y: 250 },
    memory: { x: 500, y: 250 },
    disk: { x: 750, y: 250 },
    container: { x: 500, y: 400 },
  },
};

export default function ResourceLimitsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ResourceLimitsDiagram />
    </div>
  );
}

function ResourceLimitsDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<{ id: number; message: string; color: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, color: string = "text-green-400") => {
    setLogs((prev) => [...prev, { id: logIdRef.current++, message, color }]);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const pos = config.positions;

    // Host resources
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
      .text("Host Resources");

    // CPU
    const cpuG = svg.append("g");
    cpuG
      .append("rect")
      .attr("x", pos.cpu.x - 90)
      .attr("y", pos.cpu.y - 60)
      .attr("width", 180)
      .attr("height", 120)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    cpuG
      .append("text")
      .attr("x", pos.cpu.x)
      .attr("y", pos.cpu.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("CPU");

    cpuG
      .append("text")
      .attr("x", pos.cpu.x)
      .attr("y", pos.cpu.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "11px")
      .text("--cpus=2");

    // CPU usage bar
    cpuG
      .append("rect")
      .attr("id", "cpu-bg")
      .attr("x", pos.cpu.x - 70)
      .attr("y", pos.cpu.y + 5)
      .attr("width", 140)
      .attr("height", 20)
      .attr("fill", "#e0f2fe")
      .attr("rx", 4);

    cpuG
      .append("rect")
      .attr("id", "cpu-bar")
      .attr("x", pos.cpu.x - 70)
      .attr("y", pos.cpu.y + 5)
      .attr("width", 0)
      .attr("height", 20)
      .attr("fill", "#3b82f6")
      .attr("rx", 4);

    cpuG
      .append("text")
      .attr("id", "cpu-text")
      .attr("x", pos.cpu.x)
      .attr("y", pos.cpu.y + 19)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text("0%");

    cpuG
      .append("text")
      .attr("x", pos.cpu.x)
      .attr("y", pos.cpu.y + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "10px")
      .text("cpu.shares: 2048");

    // Memory
    const memG = svg.append("g");
    memG
      .append("rect")
      .attr("x", pos.memory.x - 90)
      .attr("y", pos.memory.y - 60)
      .attr("width", 180)
      .attr("height", 120)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    memG
      .append("text")
      .attr("x", pos.memory.x)
      .attr("y", pos.memory.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Memory");

    memG
      .append("text")
      .attr("x", pos.memory.x)
      .attr("y", pos.memory.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "11px")
      .text("--memory=512m");

    // Memory usage bar
    memG
      .append("rect")
      .attr("id", "mem-bg")
      .attr("x", pos.memory.x - 70)
      .attr("y", pos.memory.y + 5)
      .attr("width", 140)
      .attr("height", 20)
      .attr("fill", "#d1fae5")
      .attr("rx", 4);

    memG
      .append("rect")
      .attr("id", "mem-bar")
      .attr("x", pos.memory.x - 70)
      .attr("y", pos.memory.y + 5)
      .attr("width", 0)
      .attr("height", 20)
      .attr("fill", "#10b981")
      .attr("rx", 4);

    memG
      .append("text")
      .attr("id", "mem-text")
      .attr("x", pos.memory.x)
      .attr("y", pos.memory.y + 19)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text("0 MB");

    memG
      .append("text")
      .attr("x", pos.memory.x)
      .attr("y", pos.memory.y + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "10px")
      .text("memory.limit: 512M");

    // Disk I/O
    const diskG = svg.append("g");
    diskG
      .append("rect")
      .attr("x", pos.disk.x - 90)
      .attr("y", pos.disk.y - 60)
      .attr("width", 180)
      .attr("height", 120)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    diskG
      .append("text")
      .attr("x", pos.disk.x)
      .attr("y", pos.disk.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Disk I/O");

    diskG
      .append("text")
      .attr("x", pos.disk.x)
      .attr("y", pos.disk.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "11px")
      .text("--device-write-bps");

    diskG
      .append("text")
      .attr("x", pos.disk.x)
      .attr("y", pos.disk.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#78350f")
      .style("font-size", "10px")
      .text("Read: 10MB/s");

    diskG
      .append("text")
      .attr("x", pos.disk.x)
      .attr("y", pos.disk.y + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#78350f")
      .style("font-size", "10px")
      .text("Write: 5MB/s");

    diskG
      .append("text")
      .attr("x", pos.disk.x)
      .attr("y", pos.disk.y + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "10px")
      .text("blkio.throttle");

    // Container
    const containerG = svg.append("g");
    containerG
      .append("rect")
      .attr("x", pos.container.x - 120)
      .attr("y", pos.container.y - 40)
      .attr("width", 240)
      .attr("height", 80)
      .attr("fill", "#fce7f3")
      .attr("stroke", "#ec4899")
      .attr("stroke-width", 3)
      .attr("rx", 8);

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#9f1239")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Container: web-app");

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#831843")
      .style("font-size", "10px")
      .text("cgroup: /docker/abc123");

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#831843")
      .style("font-size", "10px")
      .text("Resource limits enforced");

    // Connection lines
    svg
      .append("line")
      .attr("x1", pos.cpu.x)
      .attr("y1", 110)
      .attr("x2", pos.cpu.x)
      .attr("y2", 190)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", pos.memory.x)
      .attr("y1", 110)
      .attr("x2", pos.memory.x)
      .attr("y2", 190)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg
      .append("line")
      .attr("x1", pos.disk.x)
      .attr("y1", 110)
      .attr("x2", pos.disk.x)
      .attr("y2", 190)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.4);

    svg.append("g").attr("id", "particles");
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg
      .select("#cpu-bar")
      .transition()
      .duration(500)
      .attr("width", (cpuUsage / 100) * 140);

    svg.select("#cpu-text").text(`${cpuUsage}%`);
  }, [cpuUsage]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg
      .select("#mem-bar")
      .transition()
      .duration(500)
      .attr("width", (memUsage / 512) * 140);

    svg.select("#mem-text").text(`${memUsage} MB`);
  }, [memUsage]);

  const handleCPULimit = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker run --cpus=2 nginx", "text-blue-400");

    setTimeout(() => {
      addLog("Setting CPU limit to 2 cores", "text-purple-400");
      addLog("cgroup cpu.shares: 2048", "text-green-400");

      let usage = 0;
      const interval = setInterval(() => {
        usage += 10;
        setCpuUsage(usage);
        if (usage >= 80) {
          clearInterval(interval);
          addLog("CPU usage: 80% (capped at limit)", "text-yellow-400");
          setIsAnimating(false);
        }
      }, 100);
    }, 500);
  };

  const handleMemoryLimit = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker run --memory=512m nginx", "text-blue-400");

    setTimeout(() => {
      addLog("Setting memory limit to 512 MB", "text-purple-400");
      addLog("cgroup memory.limit_in_bytes: 512M", "text-green-400");

      let usage = 0;
      const interval = setInterval(() => {
        usage += 50;
        setMemUsage(usage);
        if (usage >= 450) {
          clearInterval(interval);
          addLog("Memory usage: 450 MB", "text-yellow-400");
          addLog("Container killed if exceeds 512 MB (OOM)", "text-red-400");
          setIsAnimating(false);
        }
      }, 100);
    }, 500);
  };

  const handleDiskIO = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker run --device-write-bps /dev/sda:5mb nginx", "text-blue-400");

    setTimeout(() => {
      addLog("Setting disk write limit to 5 MB/s", "text-purple-400");
      addLog("cgroup blkio.throttle.write_bps_device", "text-green-400");
      addLog("Write operations throttled beyond limit", "text-yellow-400");
      setIsAnimating(false);
    }, 800);
  };

  const handleOOM = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("$ docker run --memory=512m memory-hog", "text-red-400");

    setTimeout(() => {
      addLog("Container allocating memory...", "text-yellow-400");
      setMemUsage(512);
      setTimeout(() => {
        addLog("Memory limit exceeded!", "text-red-400");
        addLog("OOM Killer triggered", "text-red-500");
        addLog("Container killed (exit code 137)", "text-red-500");
        setTimeout(() => {
          setMemUsage(0);
          setIsAnimating(false);
        }, 1000);
      }, 800);
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Resource Limits
          </h1>
          <p className="text-slate-400 text-sm mt-1">Control CPU, memory, and I/O with cgroups.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button onClick={handleCPULimit} disabled={isAnimating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            CPU Limit
          </button>
          <button onClick={handleMemoryLimit} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Memory Limit
          </button>
          <button onClick={handleDiskIO} disabled={isAnimating} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Disk I/O
          </button>
          <button onClick={handleOOM} disabled={isAnimating} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            OOM Kill
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
            <div className="text-slate-500">{"// Set resource limits to control container usage..."}</div>
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
