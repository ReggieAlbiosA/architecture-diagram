"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Button } from "@/components/shadcn-ui/button";
import { RotateCcw } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface Layer {
  id: string;
  name: string;
  shortName: string;
  yPct: number;
}

interface NodeData {
  id: string;
  layer: string;
  label: string;
  sub: string;
  xPct: number;
  w: number;
  h?: number;
  type?: string;
  desc: string;
  x?: number;
  y?: number;
}

interface LinkData {
  source: string;
  target: string;
  type?: string;
}

// ============================================================================
// Data
// ============================================================================

const layers: Layer[] = [
  { id: "storage", name: "Physical Storage Layer", shortName: "Storage", yPct: 90 },
  { id: "block", name: "Block Device Layer", shortName: "Block Dev", yPct: 75 },
  { id: "format", name: "Filesystem Format (ext4)", shortName: "Format", yPct: 60 },
  { id: "vfs", name: "Kernel - VFS Abstraction", shortName: "VFS", yPct: 45 },
  { id: "mount", name: "Mount Points", shortName: "Mounts", yPct: 30 },
  { id: "fhs", name: "Directory Hierarchy (FHS)", shortName: "FHS", yPct: 15 },
  { id: "user", name: "User & Applications", shortName: "User", yPct: 5 },
];

const nodes: NodeData[] = [
  // Physical
  {
    id: "hdd",
    layer: "storage",
    label: "HDD / SSD",
    sub: "Physical Hardware",
    xPct: 50,
    w: 200,
    desc: "The physical medium (Sector-based storage). NVMe, SSD, or Rotating Platter.",
  },

  // Block Devices
  {
    id: "sda",
    layer: "block",
    label: "/dev/sda",
    sub: "Raw Device",
    xPct: 35,
    w: 100,
    desc: "Kernel identifier for the first storage drive.",
  },
  {
    id: "sda1",
    layer: "block",
    label: "/dev/sda1",
    sub: "Partition 1",
    xPct: 30,
    w: 80,
    desc: "Partition containing the Operating System.",
  },
  {
    id: "sda2",
    layer: "block",
    label: "/dev/sda2",
    sub: "Partition 2",
    xPct: 45,
    w: 80,
    desc: "Partition for User Data.",
  },
  {
    id: "nvme",
    layer: "block",
    label: "/dev/nvme0n1",
    sub: "Fast Storage",
    xPct: 70,
    w: 120,
    desc: "Non-Volatile Memory Express device.",
  },

  // Format
  {
    id: "ext4_root",
    layer: "format",
    label: "ext4",
    sub: "Journaling FS",
    xPct: 30,
    w: 90,
    desc: "Extended Filesystem 4. The standard Linux robust filesystem.",
  },
  {
    id: "ext4_home",
    layer: "format",
    label: "ext4",
    sub: "Journaling FS",
    xPct: 45,
    w: 90,
    desc: "Separate filesystem format instance for user data.",
  },
  {
    id: "xfs",
    layer: "format",
    label: "XFS",
    sub: "High Perf",
    xPct: 70,
    w: 90,
    desc: "High-performance 64-bit journaling file system.",
  },

  // VFS (Visual Bridge)
  {
    id: "vfs_core",
    layer: "vfs",
    label: "VIRTUAL FILE SYSTEM (VFS)",
    sub: "Kernel Abstraction Layer",
    xPct: 50,
    w: 600,
    h: 60,
    type: "bridge",
    desc: "The 'Traffic Cop'. Allows the Kernel to treat all filesystems (ext4, ntfs, xfs, network) identically via a common API.",
  },

  // Mounts
  {
    id: "mnt_root",
    layer: "mount",
    label: "/",
    sub: "Root",
    xPct: 20,
    w: 80,
    desc: "The top of the hierarchy. All other filesystems attach here.",
  },
  {
    id: "mnt_home",
    layer: "mount",
    label: "/home",
    sub: "Mount Point",
    xPct: 50,
    w: 80,
    desc: "Partitions are 'mounted' onto this directory.",
  },
  {
    id: "mnt_var",
    layer: "mount",
    label: "/var",
    sub: "Mount Point",
    xPct: 75,
    w: 80,
    desc: "Variable data mount point.",
  },

  // FHS
  {
    id: "dir_bin",
    layer: "fhs",
    label: "/bin",
    sub: "Binaries",
    xPct: 15,
    w: 60,
    desc: "Essential command binaries (ls, cp).",
  },
  {
    id: "dir_etc",
    layer: "fhs",
    label: "/etc",
    sub: "Config",
    xPct: 25,
    w: 60,
    desc: "System configuration files.",
  },
  {
    id: "dir_home_u",
    layer: "fhs",
    label: "/home/user",
    sub: "User Data",
    xPct: 50,
    w: 100,
    desc: "Personal documents, Downloads, Configs.",
  },
  {
    id: "dir_lib",
    layer: "fhs",
    label: "/lib",
    sub: "Libraries",
    xPct: 65,
    w: 60,
    desc: "Shared library images.",
  },
  {
    id: "dir_var_log",
    layer: "fhs",
    label: "/var/log",
    sub: "Logs",
    xPct: 80,
    w: 70,
    desc: "System logs and dynamic data.",
  },

  // User
  {
    id: "user_cli",
    layer: "user",
    label: "Terminal / Shell",
    sub: "Bash / Zsh",
    xPct: 30,
    w: 140,
    desc: "User executes 'ls -la', 'mount', 'touch'. Calls System Calls.",
  },
  {
    id: "user_app",
    layer: "user",
    label: "Applications",
    sub: "GUI Apps",
    xPct: 70,
    w: 140,
    desc: "File Managers, Web Browsers accessing files transparently.",
  },
];

const links: LinkData[] = [
  { source: "hdd", target: "sda" },
  { source: "hdd", target: "nvme" },
  { source: "sda", target: "sda1" },
  { source: "sda", target: "sda2" },
  { source: "sda1", target: "ext4_root" },
  { source: "sda2", target: "ext4_home" },
  { source: "nvme", target: "xfs" },

  { source: "ext4_root", target: "vfs_core" },
  { source: "ext4_home", target: "vfs_core" },
  { source: "xfs", target: "vfs_core" },

  { source: "vfs_core", target: "mnt_root", type: "logical" },
  { source: "vfs_core", target: "mnt_home", type: "logical" },
  { source: "vfs_core", target: "mnt_var", type: "logical" },

  { source: "mnt_root", target: "dir_bin" },
  { source: "mnt_root", target: "dir_etc" },
  { source: "mnt_root", target: "dir_lib" },
  { source: "mnt_home", target: "dir_home_u" },
  { source: "mnt_var", target: "dir_var_log" },

  { source: "dir_bin", target: "user_cli" },
  { source: "dir_home_u", target: "user_cli" },
  { source: "dir_home_u", target: "user_app" },
  { source: "dir_var_log", target: "user_app" },
];

// Layer colors
const layerColors: Record<string, string> = {
  storage: "#94a3b8", // Slate 400
  block: "#475569", // Slate 600
  format: "#f59e0b", // Amber 500
  vfs: "#e11d48", // Rose 600
  mount: "#10b981", // Emerald 500
  fhs: "#8b5cf6", // Violet 500
  user: "#ec4899", // Pink 500
};

// ============================================================================
// Hook: track container dimensions
// ============================================================================

function useDimensions(ref: React.RefObject<HTMLDivElement | null>) {
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return dims;
}

// ============================================================================
// Component
// ============================================================================

export function FilesystemFormatStack() {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dims = useDimensions(svgContainerRef);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: { label: string; desc: string };
  }>({
    show: false,
    x: 0,
    y: 0,
    content: { label: "", desc: "" },
  });

  const animateStack = useCallback(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const svg = d3.select(svgRef.current);
    const nodeSelection = svg.selectAll<SVGGElement, NodeData>(".node-wrapper");
    const linkSelection = svg.selectAll<SVGPathElement, LinkData>(".link");

    // Reset
    nodeSelection.style("opacity", 0);
    linkSelection
      .attr("stroke-dashoffset", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .style("opacity", 0.5);

    const delayPerLayer = 800;

    // Order of layers bottom to top
    const layerOrder = [
      "storage",
      "block",
      "format",
      "vfs",
      "mount",
      "fhs",
      "user",
    ];

    layerOrder.forEach((layerId, index) => {
      const timeOffset = index * delayPerLayer;

      // Animate Nodes in this layer
      nodeSelection
        .filter((d) => d.layer === layerId)
        .attr("transform", (d) => `translate(${d.x}, ${d.y}) scale(0.5)`)
        .transition()
        .delay(timeOffset)
        .duration(600)
        .ease(d3.easeBackOut)
        .style("opacity", 1)
        .attr("transform", (d) => `translate(${d.x}, ${d.y}) scale(1)`);

      // Animate links FROM this layer
      if (index < layerOrder.length - 1) {
        const nodesInLayer = nodes
          .filter((n) => n.layer === layerId)
          .map((n) => n.id);

        linkSelection
          .filter((l) => nodesInLayer.includes(l.source))
          .transition()
          .delay(timeOffset + 400)
          .duration(600)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0);
      }
    });
  }, []);

  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container || dims.width === 0 || dims.height === 0) return;

    // Clear previous render
    d3.select(container).select("svg").remove();

    const width = dims.width;
    const height = dims.height;

    // Responsive scale factor — reference width is 900px
    const isMobile = width < 500;
    const isSmall = width < 768;
    const widthScale = Math.min(1, width / 900);
    const nodeHeight = isMobile ? 36 : 50;
    const bridgeHeight = isMobile ? 40 : 60;

    // Responsive font sizes
    const labelFontSize = isMobile ? "10px" : isSmall ? "12px" : "14px";
    const subFontSize = isMobile ? "8px" : isSmall ? "9px" : "11px";
    const layerLabelFontSize = isMobile ? "7px" : isSmall ? "9px" : "11px";

    // Left margin for layer labels
    const labelAreaWidth = isMobile ? 0 : isSmall ? 80 : Math.min(200, width * 0.2);

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svgRef.current = svg.node();

    // Gradients
    const defs = svg.append("defs");

    const vfsGradient = defs
      .append("linearGradient")
      .attr("id", "vfsGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    vfsGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#334155");
    vfsGradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#475569");
    vfsGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#334155");

    const g = svg.append("g");

    // Scales — node area starts after label area
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const xScale = d3.scaleLinear().domain([0, 100]).range([labelAreaWidth, width]);

    // Draw Layer Labels
    layers.forEach((layer) => {
      if (layer.yPct > 10) {
        g.append("line")
          .attr("x1", labelAreaWidth + 10)
          .attr("y1", yScale(layer.yPct) - (isMobile ? 25 : 40))
          .attr("x2", width - 10)
          .attr("y2", yScale(layer.yPct) - (isMobile ? 25 : 40))
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5");
      }

      // On mobile, place labels above the separator line
      if (isMobile) {
        g.append("text")
          .attr("class", "layer-label")
          .attr("x", width / 2)
          .attr("y", yScale(layer.yPct) - 28)
          .attr("fill", "#64748b")
          .attr("font-size", layerLabelFontSize)
          .attr("text-transform", "uppercase")
          .attr("letter-spacing", "0.5px")
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .attr("font-family", "'Ubuntu', sans-serif")
          .text(layer.shortName)
          .style("opacity", 0)
          .transition()
          .delay(100)
          .duration(1000)
          .style("opacity", 0.6);
      } else {
        g.append("text")
          .attr("class", "layer-label")
          .attr("x", labelAreaWidth - 10)
          .attr("y", yScale(layer.yPct))
          .attr("fill", "#64748b")
          .attr("font-size", layerLabelFontSize)
          .attr("text-transform", "uppercase")
          .attr("letter-spacing", "1px")
          .attr("text-anchor", "end")
          .attr("font-weight", "bold")
          .attr("font-family", "'Ubuntu', sans-serif")
          .text(isSmall ? layer.shortName : layer.name)
          .style("opacity", 0)
          .transition()
          .delay(100)
          .duration(1000)
          .style("opacity", 1);
      }
    });

    // Calculate node positions with scaled widths
    const nodeMap: Record<string, NodeData> = {};
    nodes.forEach((n) => {
      n.x = xScale(n.xPct);
      n.y = yScale(layers.find((l) => l.id === n.layer)!.yPct);
      nodeMap[n.id] = n;
    });

    // Draw Links
    const linkGroup = g.append("g").attr("class", "link-group");

    const linkGen = d3
      .linkVertical<any, { x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y);

    const scaledNodeHeight = nodeHeight / 2;
    const scaledBridgeHeight = bridgeHeight / 2;

    const linkSelection = linkGroup
      .selectAll<SVGPathElement, LinkData>("path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", isMobile ? 1 : 2)
      .attr("opacity", 0.5)
      .attr("d", (d) => {
        const source = nodeMap[d.source];
        const target = nodeMap[d.target];

        const sx = source.x!;
        const sy = source.y! - scaledNodeHeight;
        const tx = target.x!;
        const ty = target.type === "bridge" ? target.y! + scaledBridgeHeight : target.y! + scaledNodeHeight;

        return linkGen({
          source: { x: sx, y: sy },
          target: { x: tx, y: ty },
        });
      })
      .attr("stroke-dasharray", function () {
        return (
          (this as SVGPathElement).getTotalLength() +
          " " +
          (this as SVGPathElement).getTotalLength()
        );
      })
      .attr("stroke-dashoffset", function () {
        return (this as SVGPathElement).getTotalLength();
      });

    // Draw Nodes
    const nodeGroup = g.append("g").attr("class", "node-group");

    const nodeSelection = nodeGroup
      .selectAll<SVGGElement, NodeData>("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-wrapper")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("opacity", 0)
      .style("cursor", "pointer");

    // Rectangles — scale widths relative to container
    nodeSelection
      .append("rect")
      .attr("class", "node-rect")
      .attr("width", (d) => d.w * widthScale)
      .attr("height", (d) => (d.type === "bridge" ? bridgeHeight : nodeHeight))
      .attr("x", (d) => -(d.w * widthScale) / 2)
      .attr("y", (d) => (d.type === "bridge" ? bridgeHeight : nodeHeight) / -2)
      .attr("rx", (d) => (d.type === "bridge" ? 4 : 6))
      .attr("ry", (d) => (d.type === "bridge" ? 4 : 6))
      .attr("fill", (d) =>
        d.type === "bridge" ? "url(#vfsGradient)" : "#1e293b"
      )
      .attr("stroke", (d) => layerColors[d.layer] || "#475569")
      .attr("stroke-width", isMobile ? 1 : 2);

    // Labels
    nodeSelection
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-family", "'Ubuntu Mono', monospace")
      .attr("font-weight", "700")
      .attr("fill", "#f8fafc")
      .attr("font-size", labelFontSize)
      .attr("pointer-events", "none")
      .attr("dy", isMobile ? -3 : -5)
      .text((d) => {
        // Truncate long labels on mobile
        if (isMobile && d.label.length > 12) {
          return d.label.slice(0, 11) + "\u2026";
        }
        return d.label;
      });

    // Sub-labels — hide on very small screens
    if (!isMobile) {
      nodeSelection
        .append("text")
        .attr("class", "node-sub")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-family", "'Ubuntu Mono', monospace")
        .attr("font-weight", "400")
        .attr("fill", "#94a3b8")
        .attr("font-size", subFontSize)
        .attr("pointer-events", "none")
        .attr("dy", 12)
        .text((d) => d.sub);
    }

    // Hover / touch effects
    nodeSelection
      .on("mouseenter", function (event, d) {
        d3.select(this).select("rect").attr("fill", "#334155");

        // Highlight connected links
        d3.selectAll<SVGPathElement, LinkData>(".link").attr(
          "stroke",
          (l: LinkData) => {
            if (l.source === d.id || l.target === d.id) {
              return "#38bdf8";
            }
            return "#334155";
          }
        );

        setTooltip({
          show: true,
          x: event.pageX,
          y: event.pageY,
          content: { label: d.label, desc: d.desc },
        });
      })
      .on("mousemove", function (event) {
        setTooltip((prev) => ({
          ...prev,
          x: event.pageX,
          y: event.pageY,
        }));
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .select("rect")
          .attr("fill", d.type === "bridge" ? "url(#vfsGradient)" : "#1e293b");

        d3.selectAll<SVGPathElement, LinkData>(".link").attr(
          "stroke",
          "#334155"
        );

        setTooltip((prev) => ({ ...prev, show: false }));
      });

    // Initial animation
    setTimeout(() => animateStack(), 100);

    return () => {
      d3.select(container).select("svg").remove();
    };
  }, [animateStack, dims]);

  return (
    <>
      <div className="flex flex-col w-full max-w-7xl h-[calc(100dvh-8rem)] lg:h-[85vh] gap-2 sm:gap-4">
        {/* Header Card */}
        <div className="bg-slate-800 dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-700 dark:border-slate-600 shadow-lg shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-sky-400 font-bold text-base sm:text-lg md:text-xl mb-1 sm:mb-2">
                Linux Filesystem Stack
              </h1>
              <p className="text-slate-300 dark:text-slate-400 text-xs sm:text-sm truncate">
                An architectural view from physical hardware up to user space.
              </p>
            </div>
            <Button
              onClick={animateStack}
              variant="default"
              className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs sm:text-sm gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Replay
            </Button>
          </div>
        </div>

        {/* Diagram Container */}
        <div
          ref={svgContainerRef}
          className="flex-1 min-h-0 bg-slate-900 dark:bg-black rounded-xl border border-slate-700 dark:border-slate-600 shadow-2xl overflow-hidden"
        />
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed pointer-events-none z-50 max-w-[200px] sm:max-w-xs"
          style={{
            left: Math.min(tooltip.x + 15, (typeof window !== "undefined" ? window.innerWidth : 400) - 220),
            top: tooltip.y - 15,
          }}
        >
          <div className="bg-slate-900/95 dark:bg-black/95 border border-sky-400 rounded p-2 sm:p-3 shadow-lg">
            <h3 className="text-sky-400 font-bold text-xs sm:text-sm mb-1 pb-1 border-b border-slate-700">
              {tooltip.content.label}
            </h3>
            <p className="text-slate-200 dark:text-slate-300 text-[10px] sm:text-xs font-mono leading-relaxed">
              {tooltip.content.desc}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
