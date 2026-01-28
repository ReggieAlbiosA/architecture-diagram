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
    container: { x: 200, y: 250 },
    volume: { x: 500, y: 250 },
    bind: { x: 800, y: 250 },
    tmpfs: { x: 350, y: 400 },
  },
};

export default function ContainerStoragePage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerStorageDiagram />
    </div>
  );
}

function ContainerStorageDiagram() {
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

    // Host filesystem
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
      .attr("x", config.positions.host.x)
      .attr("y", config.positions.host.y)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Host Filesystem (/var/lib/docker)");

    // Container Layer (ephemeral)
    const containerG = svg.append("g");
    containerG
      .append("rect")
      .attr("x", config.positions.container.x - 90)
      .attr("y", config.positions.container.y - 60)
      .attr("width", 180)
      .attr("height", 120)
      .attr("fill", "#fee2e2")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    containerG
      .append("text")
      .attr("x", config.positions.container.x)
      .attr("y", config.positions.container.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#7f1d1d")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Container Layer");

    containerG
      .append("text")
      .attr("x", config.positions.container.x)
      .attr("y", config.positions.container.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#991b1b")
      .style("font-size", "11px")
      .text("(Ephemeral)");

    containerG
      .append("text")
      .attr("x", config.positions.container.x)
      .attr("y", config.positions.container.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#991b1b")
      .style("font-size", "10px")
      .text("Writable layer");

    containerG
      .append("text")
      .attr("x", config.positions.container.x)
      .attr("y", config.positions.container.y + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#991b1b")
      .style("font-size", "10px")
      .text("Lost on removal");

    // Volume (persistent)
    const volumeG = svg.append("g");
    volumeG
      .append("rect")
      .attr("x", config.positions.volume.x - 90)
      .attr("y", config.positions.volume.y - 60)
      .attr("width", 180)
      .attr("height", 120)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    volumeG
      .append("text")
      .attr("x", config.positions.volume.x)
      .attr("y", config.positions.volume.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#064e3b")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Docker Volume");

    volumeG
      .append("text")
      .attr("x", config.positions.volume.x)
      .attr("y", config.positions.volume.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#065f46")
      .style("font-size", "11px")
      .text("(Persistent)");

    volumeG
      .append("text")
      .attr("x", config.positions.volume.x)
      .attr("y", config.positions.volume.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#065f46")
      .style("font-size", "10px")
      .text("Managed by Docker");

    volumeG
      .append("text")
      .attr("x", config.positions.volume.x)
      .attr("y", config.positions.volume.y + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#065f46")
      .style("font-size", "10px")
      .text("Survives removal");

    // Bind Mount
    const bindG = svg.append("g");
    bindG
      .append("rect")
      .attr("x", config.positions.bind.x - 90)
      .attr("y", config.positions.bind.y - 60)
      .attr("width", 180)
      .attr("height", 120)
      .attr("fill", "#ddd6fe")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    bindG
      .append("text")
      .attr("x", config.positions.bind.x)
      .attr("y", config.positions.bind.y - 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#4c1d95")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Bind Mount");

    bindG
      .append("text")
      .attr("x", config.positions.bind.x)
      .attr("y", config.positions.bind.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#5b21b6")
      .style("font-size", "11px")
      .text("(Host Path)");

    bindG
      .append("text")
      .attr("x", config.positions.bind.x)
      .attr("y", config.positions.bind.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#5b21b6")
      .style("font-size", "10px")
      .text("Direct host mount");

    bindG
      .append("text")
      .attr("x", config.positions.bind.x)
      .attr("y", config.positions.bind.y + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#5b21b6")
      .style("font-size", "10px")
      .text("/host/path:/container");

    // tmpfs (memory)
    const tmpfsG = svg.append("g");
    tmpfsG
      .append("rect")
      .attr("x", config.positions.tmpfs.x - 90)
      .attr("y", config.positions.tmpfs.y - 40)
      .attr("width", 180)
      .attr("height", 80)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("rx", 8);

    tmpfsG
      .append("text")
      .attr("x", config.positions.tmpfs.x)
      .attr("y", config.positions.tmpfs.y - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#78350f")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("tmpfs");

    tmpfsG
      .append("text")
      .attr("x", config.positions.tmpfs.x)
      .attr("y", config.positions.tmpfs.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "10px")
      .text("In-memory only");

    tmpfsG
      .append("text")
      .attr("x", config.positions.tmpfs.x)
      .attr("y", config.positions.tmpfs.y + 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "10px")
      .text("Fast, not persisted");

    // Connection lines
    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 200).attr("y2", 190).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 500).attr("y2", 190).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 500).attr("y1", 110).attr("x2", 800).attr("y2", 190).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

    svg.append("line").attr("x1", 350).attr("y1", 110).attr("x2", 350).attr("y2", 360).attr("stroke", "#94a3b8").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("opacity", 0.4);

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

  const handleVolume = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    addLog("$ docker run -v mydata:/data nginx", "text-blue-400");

    const pos = config.positions;

    setTimeout(() => {
      addLog("Creating Docker volume: mydata", "text-green-400");

      createParticle(svg, pos.host, pos.volume, "#10b981", () => {
        addLog("Volume mounted at /data in container", "text-green-400");
        addLog("Data persists after container removal", "text-green-500");
        setIsAnimating(false);
      });
    }, 500);
  };

  const handleBind = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    addLog("$ docker run -v /host/config:/app/config nginx", "text-purple-400");

    const pos = config.positions;

    setTimeout(() => {
      addLog("Binding host path: /host/config", "text-purple-400");

      createParticle(svg, pos.host, pos.bind, "#8b5cf6", () => {
        addLog("Mounted at /app/config in container", "text-purple-400");
        addLog("Changes visible to both host and container", "text-yellow-400");
        setIsAnimating(false);
      });
    }, 500);
  };

  const handleTmpfs = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    addLog("$ docker run --tmpfs /tmp:rw,size=100m nginx", "text-yellow-400");

    const pos = config.positions;

    setTimeout(() => {
      addLog("Creating tmpfs mount in memory", "text-yellow-400");

      createParticle(svg, { x: pos.host.x - 150, y: pos.host.y }, pos.tmpfs, "#f59e0b", () => {
        addLog("Mounted at /tmp with 100MB limit", "text-yellow-400");
        addLog("Data only in RAM, very fast access", "text-green-400");
        addLog("Lost when container stops", "text-red-400");
        setIsAnimating(false);
      });
    }, 500);
  };

  const handleEphemeral = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    addLog("$ docker run nginx", "text-red-400");

    const pos = config.positions;

    setTimeout(() => {
      addLog("Using container's writable layer", "text-red-400");

      createParticle(svg, pos.host, pos.container, "#ef4444", () => {
        addLog("No persistent storage configured", "text-yellow-400");
        addLog("All data lost on 'docker rm'", "text-red-500");
        setIsAnimating(false);
      });
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Container Storage & Volumes
          </h1>
          <p className="text-slate-400 text-sm mt-1">Understanding data persistence in Docker containers.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button onClick={handleVolume} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Volume
          </button>
          <button onClick={handleBind} disabled={isAnimating} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Bind Mount
          </button>
          <button onClick={handleTmpfs} disabled={isAnimating} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            tmpfs
          </button>
          <button onClick={handleEphemeral} disabled={isAnimating} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Ephemeral
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
            <div className="text-slate-500">{"// Choose a storage option..."}</div>
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
