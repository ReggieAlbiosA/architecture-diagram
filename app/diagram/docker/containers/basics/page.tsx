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
    image: { x: 150, y: 200 },
    container: { x: 500, y: 200 },
    process: { x: 850, y: 200 },
  },
};

export default function ContainerBasicsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 flex flex-col gap-6">
      <ContainerBasicsDiagram />
    </div>
  );
}

function ContainerBasicsDiagram() {
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

    // Image
    const imageG = svg.append("g");
    imageG
      .append("rect")
      .attr("x", pos.image.x - 100)
      .attr("y", pos.image.y - 80)
      .attr("width", 200)
      .attr("height", 160)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("rx", 10);

    imageG
      .append("text")
      .attr("x", pos.image.x)
      .attr("y", pos.image.y - 50)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Image");

    imageG
      .append("text")
      .attr("x", pos.image.x)
      .attr("y", pos.image.y - 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e40af")
      .style("font-size", "12px")
      .text("nginx:latest");

    // Image layers
    for (let i = 0; i < 3; i++) {
      imageG
        .append("rect")
        .attr("x", pos.image.x - 80)
        .attr("y", pos.image.y - 10 + i * 15)
        .attr("width", 160)
        .attr("height", 12)
        .attr("fill", "#60a5fa")
        .attr("opacity", 0.7 - i * 0.15)
        .attr("rx", 2);

      imageG
        .append("text")
        .attr("x", pos.image.x)
        .attr("y", pos.image.y + i * 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#1e3a8a")
        .style("font-size", "9px")
        .text(["Base OS", "Dependencies", "App Code"][i]);
    }

    imageG
      .append("text")
      .attr("x", pos.image.x)
      .attr("y", pos.image.y + 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#3730a3")
      .style("font-size", "11px")
      .text("Read-only");

    // Container
    const containerG = svg.append("g");
    containerG
      .append("rect")
      .attr("x", pos.container.x - 100)
      .attr("y", pos.container.y - 80)
      .attr("width", 200)
      .attr("height", 160)
      .attr("fill", "#d1fae5")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("rx", 10);

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y - 50)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Container");

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y - 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#047857")
      .style("font-size", "12px")
      .text("my-nginx");

    // Container layers (image + writable)
    for (let i = 0; i < 3; i++) {
      containerG
        .append("rect")
        .attr("x", pos.container.x - 80)
        .attr("y", pos.container.y - 10 + i * 15)
        .attr("width", 160)
        .attr("height", 12)
        .attr("fill", "#60a5fa")
        .attr("opacity", 0.5 - i * 0.1)
        .attr("rx", 2);
    }

    // Writable layer
    containerG
      .append("rect")
      .attr("x", pos.container.x - 80)
      .attr("y", pos.container.y + 35)
      .attr("width", 160)
      .attr("height", 12)
      .attr("fill", "#34d399")
      .attr("rx", 2);

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y + 44)
      .attr("text-anchor", "middle")
      .attr("fill", "#064e3b")
      .style("font-size", "9px")
      .text("Writable Layer");

    containerG
      .append("text")
      .attr("x", pos.container.x)
      .attr("y", pos.container.y + 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#065f46")
      .style("font-size", "11px")
      .text("Isolated");

    // Process
    const processG = svg.append("g");
    processG
      .append("rect")
      .attr("x", pos.process.x - 100)
      .attr("y", pos.process.y - 80)
      .attr("width", 200)
      .attr("height", 160)
      .attr("fill", "#fef3c7")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3)
      .attr("rx", 10);

    processG
      .append("text")
      .attr("x", pos.process.x)
      .attr("y", pos.process.y - 50)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Process");

    processG
      .append("text")
      .attr("x", pos.process.x)
      .attr("y", pos.process.y - 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "12px")
      .text("PID 1");

    // Process details
    const processDetails = ["nginx master", "worker 1", "worker 2", "worker 3"];
    processDetails.forEach((detail, i) => {
      processG
        .append("text")
        .attr("x", pos.process.x)
        .attr("y", pos.process.y - 5 + i * 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#78350f")
        .style("font-size", "10px")
        .text(detail);
    });

    processG
      .append("text")
      .attr("x", pos.process.x)
      .attr("y", pos.process.y + 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#92400e")
      .style("font-size", "11px")
      .text("Running");

    // Arrows
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#64748b");

    svg
      .append("line")
      .attr("x1", pos.image.x + 100)
      .attr("y1", pos.image.y)
      .attr("x2", pos.container.x - 100)
      .attr("y2", pos.container.y)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    svg
      .append("text")
      .attr("x", (pos.image.x + pos.container.x) / 2)
      .attr("y", pos.image.y - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .text("docker run");

    svg
      .append("line")
      .attr("x1", pos.container.x + 100)
      .attr("y1", pos.container.y)
      .attr("x2", pos.process.x - 100)
      .attr("y2", pos.process.y)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    svg
      .append("text")
      .attr("x", (pos.container.x + pos.process.x) / 2)
      .attr("y", pos.container.y - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .text("starts");

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
      .attr("r", 8)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    p.transition()
      .duration(1200)
      .ease(d3.easeLinear)
      .attr("cx", end.x)
      .attr("cy", end.y)
      .on("end", () => {
        p.remove();
        if (callback) callback();
      });
  };

  const handleRunContainer = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const svg = d3.select(svgRef.current!);
    const pos = config.positions;

    addLog("$ docker run -d --name my-nginx nginx:latest", "text-blue-400");

    setTimeout(() => {
      addLog("Pulling image nginx:latest...", "text-purple-400");

      setTimeout(() => {
        addLog("Image layers downloaded", "text-green-400");
        addLog("Creating container from image...", "text-yellow-400");

        createParticle(svg, pos.image, pos.container, "#10b981", () => {
          addLog("Container created: my-nginx", "text-green-400");
          addLog("Starting container process...", "text-yellow-400");

          createParticle(svg, pos.container, pos.process, "#f59e0b", () => {
            addLog("Container running with PID 1", "text-green-500");
            addLog("nginx master process started", "text-green-400");
            setIsAnimating(false);
          });
        });
      }, 800);
    }, 500);
  };

  const handleExplain = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("Container Basics:", "text-blue-400");
    setTimeout(() => {
      addLog("• Image: Template with application code & dependencies", "text-purple-400");
      setTimeout(() => {
        addLog("• Container: Running instance of an image", "text-green-400");
        setTimeout(() => {
          addLog("• Process: Isolated process running inside container", "text-yellow-400");
          setTimeout(() => {
            addLog("• Containers share the host kernel but are isolated", "text-cyan-400");
            setIsAnimating(false);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
      <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SiDocker className="w-8 h-8 text-blue-400" />
            Container Basics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Understanding images, containers, and processes.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button onClick={handleRunContainer} disabled={isAnimating} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            docker run
          </button>
          <button onClick={handleExplain} disabled={isAnimating} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold">
            Explain
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
            <div className="text-slate-500">{"// Run a container to see the basics..."}</div>
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
