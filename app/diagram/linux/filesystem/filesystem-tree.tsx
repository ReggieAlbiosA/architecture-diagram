"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";

// ============================================================================
// Types
// ============================================================================

interface FilesystemNode {
  name: string;
  description: string;
  usage: string;
  children?: FilesystemNode[];
}

// ============================================================================
// Data
// ============================================================================

const filesystemData: FilesystemNode = {
  name: "/",
  description:
    "The Root directory. The single starting point of the filesystem hierarchy. All storage is mounted under this single tree.",
  usage: "System Origin",
  children: [
    {
      name: "bin",
      description:
        "Essential command binaries that need to be available in single user mode; for all users (e.g., cat, ls, cp).",
      usage: "Basic Commands",
    },
    {
      name: "boot",
      description:
        "Boot loader files (e.g., kernels, initrd). This directory contains everything required for the boot process.",
      usage: "System Boot",
    },
    {
      name: "dev",
      description:
        "Device files. In Linux, everything is a file, including hardware devices like hard drives (sda), terminals (tty), and null devices.",
      usage: "Hardware Interfaces",
    },
    {
      name: "etc",
      description:
        "Host-specific system-wide configuration files. Contains config files required by all programs to function correctly.",
      usage: "Configuration",
    },
    {
      name: "home",
      description:
        "Users' home directories. Contains saved files, personal settings, etc. (e.g., /home/alice).",
      usage: "User Data",
    },
    {
      name: "lib",
      description:
        "Essential shared libraries and kernel modules needed to boot the system and run the commands in /bin and /sbin.",
      usage: "Shared Libraries",
    },
    {
      name: "media",
      description:
        "Mount point for removable media such as CD-ROMs, USB sticks, and floppy disks.",
      usage: "Removable Storage",
    },
    {
      name: "mnt",
      description:
        "Temporarily mounted filesystems. Administrators use this to mount filesystems manually for temporary access.",
      usage: "Temp Mounts",
    },
    {
      name: "opt",
      description:
        "Optional application software packages. Designed for monolithic software distributions (e.g. Chrome, Zoom).",
      usage: "Add-on Software",
    },
    {
      name: "proc",
      description:
        "Virtual filesystem providing process and kernel information as files. Does not exist on disk, generated on the fly.",
      usage: "System Info",
    },
    {
      name: "root",
      description:
        "Home directory for the root user (superuser). Distinct from /home to ensure access even if /home usually resides on another drive.",
      usage: "Superuser Home",
    },
    {
      name: "run",
      description:
        "Run-time variable data. Information about the running system since the last boot (e.g., logged-in users, running daemons).",
      usage: "Runtime Data",
    },
    {
      name: "sbin",
      description:
        "Essential system binaries. Commands used for system administration (e.g., fsck, reboot, ifconfig).",
      usage: "Admin Binaries",
    },
    {
      name: "srv",
      description:
        "Data for services provided by this system. Specifically data that scripts or protocol servers serve.",
      usage: "Service Data",
    },
    {
      name: "sys",
      description:
        "Contains information about devices, drivers, and some kernel features. Similar to /proc but structured differently.",
      usage: "Kernel Objects",
    },
    {
      name: "tmp",
      description:
        "Temporary files. Often cleared at reboot. Any user can create files here.",
      usage: "Temporary Files",
    },
    {
      name: "usr",
      description:
        "Secondary hierarchy. Contains the majority of (multi-)user utilities and applications.",
      usage: "User Programs",
      children: [
        {
          name: "usr/bin",
          description:
            "Non-essential command binaries (not needed in single user mode).",
          usage: "User Binaries",
        },
        {
          name: "usr/lib",
          description: "Libraries for the binaries in /usr/bin and /usr/sbin.",
          usage: "User Libraries",
        },
        {
          name: "usr/local",
          description:
            "Tertiary hierarchy for local data, specific to this host.",
          usage: "Local Software",
        },
      ],
    },
    {
      name: "var",
      description:
        "Variable files. Content that is expected to grow, such as logs, spool files, and temporary e-mail files.",
      usage: "Logs & Spools",
      children: [
        {
          name: "var/log",
          description: "Contains log files (syslog, auth.log, etc.).",
          usage: "System Logs",
        },
        {
          name: "var/www",
          description: "Common place for web server files.",
          usage: "Web Root",
        },
      ],
    },
  ],
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

export function FilesystemTree() {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{
    name: string;
    description: string;
    usage: string;
  }>({
    name: "/",
    description: filesystemData.description,
    usage: filesystemData.usage,
  });
  const [fadeIn, setFadeIn] = useState(true);
  const dims = useDimensions(svgContainerRef);

  const handleNodeClick = useCallback(
    (d: d3.HierarchyPointNode<FilesystemNode>) => {
      setFadeIn(false);
      setTimeout(() => {
        let displayName = d.data.name;
        if (displayName !== "/") {
          displayName = "/" + displayName;
        }
        setSelected({
          name: displayName,
          description: d.data.description,
          usage: d.data.usage,
        });
        setFadeIn(true);
      }, 200);
    },
    [],
  );

  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container || dims.width === 0 || dims.height === 0) return;

    // Clear previous render
    d3.select(container).select("svg").remove();

    const width = dims.width;
    const height = dims.height;

    // Responsive sizing
    const isMobile = width < 500;
    const isSmall = width < 768;
    const margin = isMobile
      ? { top: 30, right: 30, bottom: 30, left: 40 }
      : isSmall
        ? { top: 40, right: 80, bottom: 40, left: 70 }
        : { top: 60, right: 140, bottom: 60, left: 120 };

    const circleRadius = isMobile ? 5 : isSmall ? 7 : 10;
    const circleRadiusHover = isMobile ? 8 : isSmall ? 11 : 15;
    const fontSize = isMobile ? "9px" : isSmall ? "11px" : "13px";
    const labelOffset = isMobile ? 10 : isSmall ? 14 : 18;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(filesystemData);
    const treeLayout = d3
      .tree<FilesystemNode>()
      .size([innerHeight, innerWidth])
      .separation((a, b) => (a.parent === b.parent ? (isMobile ? 1 : 1.2) : (isMobile ? 1.1 : 1.4)));
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // Links
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#AEA79F")
      .attr("stroke-width", isMobile ? 1 : 2)
      .attr("stroke-opacity", 0.6)
      .attr("d", (d) => {
        return `M${d.source.y},${d.source.x}C${(d.source.y + d.target.y) / 2},${d.source.x} ${(d.source.y + d.target.y) / 2},${d.target.x} ${d.target.y},${d.target.x}`;
      })
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);

    // Nodes
    const node = g
      .selectAll<SVGGElement, d3.HierarchyPointNode<FilesystemNode>>(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", (d) => `node ${d.data.name === "/" ? "node--active" : ""}`)
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        // Update visual selection
        g.selectAll(".node circle")
          .attr("fill", "#fff")
          .attr("stroke", "#77216F")
          .attr("stroke-width", isMobile ? 2 : 3);

        d3.select(this)
          .select("circle")
          .attr("fill", "#E95420")
          .attr("stroke", "#77216F")
          .attr("stroke-width", isMobile ? 3 : 4);

        // Click animation
        d3.select(this)
          .select("circle")
          .transition()
          .duration(100)
          .attr("r", circleRadiusHover)
          .transition()
          .duration(100)
          .attr("r", circleRadius);

        handleNodeClick(d);
      });

    // Circles
    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => (d.data.name === "/" ? "#E95420" : "#fff"))
      .attr("stroke", "#77216F")
      .attr("stroke-width", (d) => (d.data.name === "/" ? (isMobile ? 3 : 4) : (isMobile ? 2 : 3)))
      .transition()
      .duration(800)
      .ease(d3.easeBackOut)
      .delay((_, i) => i * 30)
      .attr("r", circleRadius);

    // Hover effects
    node
      .on("mouseenter", function (_, d) {
        if (
          d3.select(this).select("circle").attr("fill") !== "rgb(233, 84, 32)"
        ) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            .attr("fill", "#E95420")
            .attr("stroke", "#E95420");
        }
      })
      .on("mouseleave", function (_, d) {
        const circle = d3.select(this).select("circle");
        // Don't reset if this is the active node
        if (circle.attr("stroke-width") !== (isMobile ? "3" : "4")) {
          circle
            .transition()
            .duration(200)
            .attr("fill", "#fff")
            .attr("stroke", "#77216F");
        }
      });

    // Labels
    const isDarkMode = document.documentElement.classList.contains("dark");
    node
      .append("text")
      .attr("dy", "0.35em")
      .attr("x", (d) => (d.children ? -labelOffset : labelOffset))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .attr("font-family", "'JetBrains Mono', 'Ubuntu Mono', monospace")
      .attr("font-size", fontSize)
      .attr("font-weight", "600")
      .attr("fill", isDarkMode ? "#e4e4e7" : "#333")
      .attr("pointer-events", "none")
      .attr("paint-order", "stroke")
      .attr("stroke", isDarkMode ? "#18181b" : "#fff")
      .attr("stroke-width", isMobile ? 2 : 4)
      .attr("stroke-linejoin", "round")
      .text((d) => d.data.name)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 30 + 400)
      .style("opacity", 1);

    return () => {
      d3.select(container).select("svg").remove();
    };
  }, [handleNodeClick, dims]);

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xl h-[calc(100dvh-8rem)] lg:h-[85vh]">
      {/* Left: Interactive Graph */}
      <div
        ref={svgContainerRef}
        className="relative w-full lg:w-2/3 flex-[3] lg:flex-none lg:h-full min-h-0 bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-zinc-200 dark:border-zinc-700">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-[#77216F] dark:text-[#E95420]">
            Ubuntu Filesystem
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            Interactive Tree Map (Click nodes)
          </p>
        </div>
      </div>

      {/* Right: Info Panel */}
      <div className="w-full lg:w-1/3 flex-[2] lg:flex-none lg:h-full min-h-0 bg-[#77216F] text-white p-3 sm:p-4 md:p-6 flex flex-col justify-center items-start shadow-xl z-20 overflow-y-auto">
        <div
          className="space-y-2 sm:space-y-3 md:space-y-4 transition-all duration-200 w-full"
          style={{
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <div className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-[#E95420] rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase mb-1 sm:mb-2">
            Selected Directory
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-mono font-bold break-all">
            {selected.name}
          </h2>
          <div className="h-1 w-16 sm:w-20 bg-[#E95420] rounded" />
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-100">
            {selected.description}
          </p>

          <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 bg-black/20 p-2.5 sm:p-3 md:p-4 rounded-lg border-l-4 border-[#E95420]">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase opacity-75 mb-1">
              Key Usage
            </h3>
            <p className="text-xs sm:text-sm font-mono">{selected.usage}</p>
          </div>

          <div className="mt-2 sm:mt-4 text-[10px] sm:text-xs opacity-50">
            *Based on Filesystem Hierarchy Standard (FHS)
          </div>
        </div>
      </div>
    </div>
  );
}
