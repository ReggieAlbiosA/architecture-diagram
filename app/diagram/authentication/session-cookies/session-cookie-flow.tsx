"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Laptop,
  Server,
  Database,
  HardDrive,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface Component {
  id: string;
  label: string;
  sub: string;
  icon: typeof Laptop;
  x: number;
  y: number;
  color: string;
}

interface Step {
  id: number;
  title: string;
  desc: string;
  action: string;
}

// ============================================================================
// Data
// ============================================================================

const steps: Step[] = [
  {
    id: 0,
    title: "Architecture Overview",
    desc: "The system creates a trust boundary. The Client is untrusted. The Server, Session Store, and Database are within the trusted zone.",
    action: "idle",
  },
  {
    id: 1,
    title: "1. Login Request",
    desc: "User submits username & password via a POST request. This travels over HTTPS to the Web Server.",
    action: "login_request",
  },
  {
    id: 2,
    title: "2. Credential Validation",
    desc: "The Web Server checks the credentials against the Database. If valid, the server proceeds to create a session.",
    action: "validate_creds",
  },
  {
    id: 3,
    title: "3. Session Creation",
    desc: "The Server generates a unique Session ID (e.g., 'sess_123'). It stores the ID + User Data in the Session Store (Redis/Memory).",
    action: "create_session",
  },
  {
    id: 4,
    title: "4. Cookie Issuance",
    desc: "The Server responds with a 'Set-Cookie' header containing the Session ID. Attributes like 'HttpOnly' (no JS access) and 'Secure' (HTTPS only) are set for security.",
    action: "issue_cookie",
  },
  {
    id: 5,
    title: "5. Cookie Storage",
    desc: "The Browser saves the cookie. It is now automatically attached to subsequent requests to this domain.",
    action: "store_cookie",
  },
  {
    id: 6,
    title: "6. Authenticated Request",
    desc: "User requests a protected profile page. The Browser sends the GET request and automatically includes the 'Cookie: sess_123' header.",
    action: "auth_request",
  },
  {
    id: 7,
    title: "7. Session Validation",
    desc: "The Server extracts the Session ID from the cookie and checks the Session Store. If found and not expired, the user is authenticated.",
    action: "validate_session",
  },
  {
    id: 8,
    title: "8. Access Granted",
    desc: "The Server fetches the protected resource and returns the HTML/JSON to the client.",
    action: "success",
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function SessionCookieFlow() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = width < 768 ? 600 : 500;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const isMobile = width < 768;

    // Clear previous content
    svg.selectAll("*").remove();

    // Component positions
    const components: Component[] = [
      {
        id: "client",
        label: "Browser",
        sub: "Untrusted",
        icon: Laptop,
        x: 0,
        y: 0,
        color: "rgb(248, 250, 252)",
      },
      {
        id: "server",
        label: "Web Server",
        sub: "API Backend",
        icon: Server,
        x: 0,
        y: 0,
        color: "rgb(226, 232, 240)",
      },
      {
        id: "store",
        label: "Session Store",
        sub: "Redis/Mem",
        icon: HardDrive,
        x: 0,
        y: 0,
        color: "rgb(219, 234, 254)",
      },
      {
        id: "db",
        label: "Database",
        sub: "Users/Data",
        icon: Database,
        x: 0,
        y: 0,
        color: "rgb(219, 234, 254)",
      },
    ];

    // Calculate layout
    if (isMobile) {
      const cx = width / 2;
      const gap = height / 5;
      components[0].x = cx;
      components[0].y = 80;
      components[1].x = cx;
      components[1].y = 80 + gap * 1.5;
      components[2].x = cx - 80;
      components[2].y = 80 + gap * 3;
      components[3].x = cx + 80;
      components[3].y = 80 + gap * 3;
    } else {
      const cy = height / 2;
      const totalW = width - 80;
      const step = totalW / 5;
      components[0].x = 40 + step * 0.5;
      components[0].y = cy;
      components[1].x = 40 + step * 2.5;
      components[1].y = cy;
      components[2].x = 40 + step * 4;
      components[2].y = cy - 80;
      components[3].x = 40 + step * 4;
      components[3].y = cy + 80;
    }

    const layer = svg.append("g").attr("class", "diagram-layer");

    // Trust boundary
    if (!isMobile) {
      const boundaryX = (components[0].x + components[1].x) / 2;
      layer
        .append("line")
        .attr("x1", boundaryX)
        .attr("y1", 30)
        .attr("x2", boundaryX)
        .attr("y2", height - 30)
        .attr("stroke", "rgb(239, 68, 68)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.5);

      layer
        .append("text")
        .attr("x", boundaryX)
        .attr("y", 20)
        .attr("fill", "rgb(239, 68, 68)")
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .attr("class", "fill-red-500 dark:fill-red-400")
        .text("Trust Boundary");
    }

    // Draw connections
    const drawConnection = (from: Component, to: Component, id: string) => {
      layer
        .append("line")
        .attr("id", id)
        .attr("class", "connection")
        .attr("x1", from.x)
        .attr("y1", from.y)
        .attr("x2", to.x)
        .attr("y2", to.y)
        .attr("stroke", "rgb(148, 163, 184)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("class", "stroke-slate-400 dark:stroke-slate-600");
    };

    drawConnection(components[0], components[1], "link-client-server");
    drawConnection(components[1], components[2], "link-server-store");
    drawConnection(components[1], components[3], "link-server-db");

    // Draw nodes
    const nodeW = isMobile ? 110 : 130;
    const nodeH = 70;

    const nodes = layer
      .selectAll(".node-group")
      .data(components)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("transform", (d) => `translate(${d.x - nodeW / 2},${d.y - nodeH / 2})`);

    nodes
      .append("rect")
      .attr("width", nodeW)
      .attr("height", nodeH)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("class", "fill-white dark:fill-zinc-800 stroke-slate-300 dark:stroke-zinc-700")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 4px 6px rgb(0 0 0 / 0.05))");

    // Add icons (we'll use foreignObject to render Lucide icons)
    nodes
      .append("foreignObject")
      .attr("width", 24)
      .attr("height", 24)
      .attr("x", nodeW / 2 - 12)
      .attr("y", 16)
      .append("xhtml:div")
      .attr("class", "flex items-center justify-center")
      .html((d) => {
        const iconMap: Record<string, string> = {
          client: "💻",
          server: "⚙️",
          store: "🗄️",
          db: "💾",
        };
        return `<span class="text-lg">${iconMap[d.id]}</span>`;
      });

    nodes
      .append("text")
      .attr("x", nodeW / 2)
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("font-weight", 600)
      .attr("class", "fill-slate-900 dark:fill-white")
      .text((d) => d.label);

    nodes
      .append("text")
      .attr("x", nodeW / 2)
      .attr("y", 62)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("class", "fill-slate-500 dark:fill-slate-400")
      .text((d) => d.sub);

    // Cookie jar placeholder
    layer
      .append("rect")
      .attr("id", "client-cookie-jar")
      .attr("x", components[0].x - 40)
      .attr("y", components[0].y + 40)
      .attr("width", 80)
      .attr("height", 16)
      .attr("rx", 4)
      .attr("class", "fill-slate-100 dark:fill-zinc-700 stroke-slate-300 dark:stroke-zinc-600")
      .style("opacity", 0);

    // Process current step animations
    processStepAnimation(svg, components, currentStep);
  }, [dimensions, currentStep]);

  // Animation logic
  const processStepAnimation = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    components: Component[],
    stepIndex: number
  ) => {
    // Clear previous animations
    svg.selectAll(".packet, .temp-label, .session-marker").remove();
    svg.selectAll(".connection").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);

    // Update persistent states
    if (stepIndex >= 5) {
      svg
        .select("#client-cookie-jar")
        .style("opacity", 1)
        .attr("class", "fill-yellow-200 dark:fill-yellow-600 stroke-yellow-600 dark:stroke-yellow-400");
    }

    if (stepIndex >= 3) {
      const store = components[2];
      svg
        .append("rect")
        .attr("class", "session-marker")
        .attr("x", store.x + 25)
        .attr("y", store.y - 25)
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("class", "session-marker fill-blue-500");
    }

    const animatePacket = (
      from: Component,
      to: Component,
      color: string,
      label: string,
      callback?: () => void
    ) => {
      const packet = svg
        .append("circle")
        .attr("class", "packet")
        .attr("r", 8)
        .attr("cx", from.x)
        .attr("cy", from.y)
        .attr("class", `packet fill-[${color}] stroke-white dark:stroke-zinc-900`)
        .attr("stroke-width", 2);

      const text = svg
        .append("text")
        .attr("class", "temp-label")
        .attr("x", from.x)
        .attr("y", from.y - 15)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("font-weight", 700)
        .attr("class", "temp-label fill-slate-700 dark:fill-slate-300")
        .text(label);

      packet
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("cx", to.x)
        .attr("cy", to.y)
        .on("end", () => {
          packet.remove();
          text.remove();
          if (callback) callback();
        });

      text
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("x", to.x)
        .attr("y", to.y - 15);
    };

    const showFeedback = (comp: Component, message: string) => {
      const g = svg.append("g").attr("class", "temp-label");

      g.append("rect")
        .attr("x", comp.x - 50)
        .attr("y", comp.y - 55)
        .attr("width", 100)
        .attr("height", 24)
        .attr("rx", 4)
        .attr("class", "fill-green-500")
        .attr("opacity", 0)
        .transition()
        .duration(200)
        .attr("opacity", 1);

      g.append("text")
        .attr("x", comp.x)
        .attr("y", comp.y - 38)
        .attr("text-anchor", "middle")
        .attr("class", "fill-white")
        .attr("font-size", 10)
        .attr("font-weight", 700)
        .text(message);

      setTimeout(() => {
        g.transition().duration(500).attr("opacity", 0).remove();
      }, 1500);
    };

    const c = components;

    // Execute step-specific animations
    switch (steps[stepIndex].action) {
      case "idle":
        break;

      case "login_request":
        svg.select("#link-client-server").attr("stroke", "rgb(59, 130, 246)").attr("stroke-width", 3);
        animatePacket(c[0], c[1], "rgb(59, 130, 246)", "POST /login", () => {
          svg.select("#link-client-server").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);
        });
        break;

      case "validate_creds":
        svg.select("#link-server-db").attr("stroke", "rgb(100, 116, 139)").attr("stroke-width", 3);
        animatePacket(c[1], c[3], "rgb(100, 116, 139)", "Verify", () => {
          showFeedback(c[3], "Valid ✓");
          animatePacket(c[3], c[1], "rgb(16, 185, 129)", "OK", () => {
            svg.select("#link-server-db").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);
          });
        });
        break;

      case "create_session":
        svg.select("#link-server-store").attr("stroke", "rgb(59, 130, 246)").attr("stroke-width", 3);
        animatePacket(c[1], c[2], "rgb(59, 130, 246)", "Store sid:123", () => {
          svg
            .append("rect")
            .attr("class", "session-marker")
            .attr("x", c[2].x + 25)
            .attr("y", c[2].y - 25)
            .attr("width", 0)
            .attr("height", 0)
            .attr("class", "session-marker fill-blue-500")
            .transition()
            .attr("width", 12)
            .attr("height", 12)
            .attr("rx", 2);
          svg.select("#link-server-store").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);
        });
        break;

      case "issue_cookie":
        svg.select("#link-client-server").attr("stroke", "rgb(245, 158, 11)").attr("stroke-width", 3);
        animatePacket(c[1], c[0], "rgb(245, 158, 11)", "Set-Cookie", () => {
          svg.select("#link-client-server").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);
        });
        break;

      case "store_cookie":
        svg
          .select("#client-cookie-jar")
          .style("opacity", 1)
          .transition()
          .duration(1000)
          .attr("class", "fill-yellow-200 dark:fill-yellow-600 stroke-yellow-600 dark:stroke-yellow-400");
        break;

      case "auth_request":
        svg.select("#link-client-server").attr("stroke", "rgb(245, 158, 11)").attr("stroke-width", 3);
        animatePacket(c[0], c[1], "rgb(245, 158, 11)", "GET /profile", () => {
          svg.select("#link-client-server").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);
        });
        break;

      case "validate_session":
        svg.select("#link-server-store").attr("stroke", "rgb(245, 158, 11)").attr("stroke-width", 3);
        animatePacket(c[1], c[2], "rgb(245, 158, 11)", "Check sid", () => {
          showFeedback(c[2], "Found ✓");
          animatePacket(c[2], c[1], "rgb(16, 185, 129)", "User Data", () => {
            svg.select("#link-server-store").attr("stroke", "rgb(148, 163, 184)").attr("stroke-width", 2);
          });
        });
        break;

      case "success":
        showFeedback(c[1], "Authorized ✓");
        setTimeout(() => {
          animatePacket(c[1], c[0], "rgb(16, 185, 129)", "200 OK");
        }, 600);
        break;
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const step = steps[currentStep];

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-center gap-3 mb-6 sticky top-16 sm:top-20 z-10 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-sm py-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5"
          aria-label="Next step"
        >
          <span>Next Step</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          aria-label="Reset to beginning"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Visualization */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="relative p-4">
          <div className="absolute top-4 left-4 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 z-10">
            Step {currentStep}: {step.title}
          </div>
          <div ref={containerRef} className="w-full">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full"
              style={{ userSelect: "none" }}
            />
          </div>
        </div>

        {/* Explanation */}
        <div className="border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {step.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
