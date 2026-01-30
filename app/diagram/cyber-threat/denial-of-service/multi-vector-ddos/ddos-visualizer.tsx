"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  RotateCcw,
  Skull,
  Bot,
  User,
  Server,
  Radio,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface Node {
  id: string;
  type: "attacker" | "target" | "user" | "bot";
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  state?: "clean" | "infected";
}

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  type: "infection" | "command" | "attack" | "user";
  speed: number;
  life: number;
}

interface PhaseConfig {
  label: string;
  description: string;
  buttonText: string;
  accent: string;
}

// ============================================================================
// Constants
// ============================================================================

const PHASES: Record<number, PhaseConfig> = {
  0: {
    label: "Idle",
    description:
      "System idle. Network traffic is normal. Legitimate users communicate with the target server.",
    buttonText: "Start Simulation",
    accent: "text-slate-400",
  },
  1: {
    label: "Botnet Formation",
    description:
      "The attacker scans for vulnerable devices and silently installs malware, recruiting them into a botnet.",
    buttonText: "Send C2 Command",
    accent: "text-purple-400",
  },
  2: {
    label: "Command & Control",
    description:
      "The C2 server broadcasts attack instructions — target IP, attack vectors, and intensity — to the sleeping botnet.",
    buttonText: "Launch Attack",
    accent: "text-purple-400",
  },
  3: {
    label: "Attack Launch",
    description:
      "Bots begin flooding the target with requests across multiple protocols. Traffic volume spikes dramatically.",
    buttonText: "Intensify",
    accent: "text-red-400",
  },
  4: {
    label: "Target Overwhelmed",
    description:
      "Server CPU and bandwidth are exhausted. Response times spike. Legitimate users begin experiencing failures.",
    buttonText: "Trigger Failure",
    accent: "text-orange-400",
  },
  5: {
    label: "Service Denied",
    description:
      "The server crashes or drops all connections. Legitimate users receive 503 errors. Service is completely offline.",
    buttonText: "Reset",
    accent: "text-red-500",
  },
};

const COLORS = {
  attacker: "#a855f7",
  botClean: "#3b82f6",
  botInfected: "#ef4444",
  user: "#22c55e",
  target: "#38bdf8",
  targetStressed: "#f97316",
  targetDown: "#991b1b",
};

const BOT_COUNT = 35;
const USER_COUNT = 6;

// ============================================================================
// Component
// ============================================================================

export function DdosVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const targetHealthRef = useRef(100);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [phase, setPhase] = useState(0);
  const [targetHealth, setTargetHealth] = useState(100);
  const phaseRef = useRef(0);

  // Keep ref in sync with state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---------- Topology ----------

  const buildTopology = useCallback((w: number, h: number) => {
    const nodes: Node[] = [];

    // Attacker
    nodes.push({
      id: "attacker",
      type: "attacker",
      x: w * 0.12,
      y: h * 0.18,
      vx: 0,
      vy: 0,
      r: 18,
      color: COLORS.attacker,
    });

    // Target
    nodes.push({
      id: "target",
      type: "target",
      x: w * 0.82,
      y: h * 0.5,
      vx: 0,
      vy: 0,
      r: 26,
      color: COLORS.target,
    });

    // Legitimate users
    for (let i = 0; i < USER_COUNT; i++) {
      const angle = ((Math.PI * 0.6) / (USER_COUNT - 1)) * i + Math.PI * 0.6;
      nodes.push({
        id: `user-${i}`,
        type: "user",
        x: w * 0.82 + Math.cos(angle) * w * 0.15,
        y: h * 0.5 + Math.sin(angle) * h * 0.3,
        vx: 0,
        vy: 0,
        r: 7,
        color: COLORS.user,
      });
    }

    // Bots — scattered left/center
    for (let i = 0; i < BOT_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / BOT_COUNT;
      const radius = 0.15 + Math.random() * 0.15;
      nodes.push({
        id: `bot-${i}`,
        type: "bot",
        state: "clean",
        x: w * 0.42 + Math.cos(angle) * w * radius,
        y: h * 0.52 + Math.sin(angle) * h * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 4,
        color: COLORS.botClean,
      });
    }

    return nodes;
  }, []);

  // ---------- Init & Resize ----------

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const w = container.clientWidth;
      const h = Math.min(w * 0.56, 520);
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      sizeRef.current = { w, h };

      nodesRef.current = buildTopology(w, h);
      particlesRef.current = [];
      targetHealthRef.current = 100;
      setTargetHealth(100);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [buildTopology]);

  // ---------- Render Loop ----------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const { w, h } = sizeRef.current;
      const dpr = devicePixelRatio;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const p = phaseRef.current;
      const nodes = nodesRef.current;
      const particles = particlesRef.current;
      frameRef.current++;

      // --- Drift bots gently ---
      for (const node of nodes) {
        if (node.type === "bot") {
          node.x += node.vx;
          node.y += node.vy;
          // Bounce off edges
          if (node.x < 30 || node.x > w - 30) node.vx *= -1;
          if (node.y < 30 || node.y > h - 30) node.vy *= -1;
        }
      }

      // --- Spawn traffic ---
      const target = nodes.find((n) => n.type === "target");
      if (target) {
        // Legitimate user traffic
        if (Math.random() < 0.03) {
          const users = nodes.filter((n) => n.type === "user");
          const u = users[Math.floor(Math.random() * users.length)];
          if (u) {
            particles.push({
              x: u.x,
              y: u.y,
              tx: target.x,
              ty: target.y,
              type: "user",
              speed: 1.8,
              life: 1,
            });
          }
        }

        // Attack traffic
        if (p >= 3 && p < 5) {
          const rate = p === 3 ? 0.08 : 0.35;
          const bots = nodes.filter(
            (n) => n.type === "bot" && n.state === "infected"
          );
          for (const bot of bots) {
            if (Math.random() < rate) {
              particles.push({
                x: bot.x,
                y: bot.y,
                tx: target.x + (Math.random() - 0.5) * 10,
                ty: target.y + (Math.random() - 0.5) * 10,
                type: "attack",
                speed: 3 + Math.random() * 2,
                life: 1,
              });
            }
          }
        }

        // Update health
        if (p === 3) {
          targetHealthRef.current = Math.max(
            50,
            targetHealthRef.current - 0.08
          );
        } else if (p === 4) {
          targetHealthRef.current = Math.max(0, targetHealthRef.current - 0.4);
        } else if (p === 5) {
          targetHealthRef.current = 0;
        } else if (p < 3) {
          targetHealthRef.current = Math.min(
            100,
            targetHealthRef.current + 0.3
          );
        }

        // Sync health to state at 10fps
        if (frameRef.current % 6 === 0) {
          setTargetHealth(Math.round(targetHealthRef.current));
        }

        // Shake target when overwhelmed
        if (p >= 4) {
          target.x =
            sizeRef.current.w * 0.82 + (Math.random() - 0.5) * (p === 5 ? 6 : 3);
          target.y =
            sizeRef.current.h * 0.5 + (Math.random() - 0.5) * (p === 5 ? 6 : 3);
        } else {
          target.x = sizeRef.current.w * 0.82;
          target.y = sizeRef.current.h * 0.5;
        }
      }

      // --- Update & draw particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        const dx = pt.tx - pt.x;
        const dy = pt.ty - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pt.speed) {
          particles.splice(i, 1);
          continue;
        }

        pt.x += (dx / dist) * pt.speed;
        pt.y += (dy / dist) * pt.speed;

        ctx.beginPath();
        const radius = pt.type === "user" ? 3 : 2;
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);

        if (pt.type === "infection" || pt.type === "command") {
          ctx.fillStyle = COLORS.attacker;
        } else if (pt.type === "attack") {
          ctx.fillStyle = COLORS.botInfected;
        } else {
          ctx.fillStyle = COLORS.user;
        }
        ctx.fill();

        // Attack trail
        if (pt.type === "attack") {
          const vx = (dx / dist) * pt.speed;
          const vy = (dy / dist) * pt.speed;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - vx * 3, pt.y - vy * 3);
          ctx.strokeStyle = "rgba(239,68,68,0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // --- Draw nodes ---
      for (const node of nodes) {
        ctx.beginPath();

        // Glow
        if (
          node.type === "attacker" ||
          node.type === "target" ||
          (node.type === "bot" && node.state === "infected")
        ) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur =
            node.type === "target" && p === 5 ? 30 : node.type === "bot" ? 6 : 15;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        let fill = node.color;
        if (node.type === "target") {
          if (p === 5) fill = COLORS.targetDown;
          else if (p === 4) fill = COLORS.targetStressed;
        }

        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Labels for attacker & target
        if (node.type === "attacker") {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("C2", node.x, node.y);
        }

        if (node.type === "target") {
          // Health bar
          const barW = 54;
          const barH = 5;
          const barX = node.x - barW / 2;
          const barY = node.y + node.r + 8;

          ctx.fillStyle = "rgba(51,65,85,0.6)";
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW, barH, 2);
          ctx.fill();

          const hp = targetHealthRef.current;
          const hpColor =
            hp > 60 ? "#22c55e" : hp > 20 ? "#f97316" : "#ef4444";
          ctx.fillStyle = hpColor;
          ctx.beginPath();
          ctx.roundRect(barX, barY, barW * (hp / 100), barH, 2);
          ctx.fill();

          ctx.fillStyle = "rgba(148,163,184,0.8)";
          ctx.font = "bold 9px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("SERVER", node.x, node.y - node.r - 6);
        }
      }

      // --- 503 overlay ---
      if (p === 5) {
        ctx.fillStyle = "rgba(153,27,27,0.15)";
        ctx.fillRect(0, 0, w, h);

        ctx.font = `bold ${Math.min(w * 0.1, 64)}px system-ui`;
        ctx.fillStyle = "rgba(239,68,68,0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("503", w * 0.82, h * 0.5 - 14);

        ctx.font = `bold ${Math.min(w * 0.025, 14)}px system-ui`;
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("SERVICE UNAVAILABLE", w * 0.82, h * 0.5 + 18);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ---------- Phase Logic ----------

  const executePhase = useCallback((nextPhase: number) => {
    const nodes = nodesRef.current;
    const particles = particlesRef.current;
    const attacker = nodes.find((n) => n.type === "attacker");
    const target = nodes.find((n) => n.type === "target");
    const bots = nodes.filter((n) => n.type === "bot");

    if (nextPhase === 1 && attacker) {
      // Infection: send particles to bots
      bots.forEach((bot, i) => {
        setTimeout(() => {
          particles.push({
            x: attacker.x,
            y: attacker.y,
            tx: bot.x,
            ty: bot.y,
            type: "infection",
            speed: 3,
            life: 1,
          });
          setTimeout(() => {
            bot.state = "infected";
            bot.color = COLORS.botInfected;
          }, 600);
        }, i * 40);
      });
    }

    if (nextPhase === 2 && attacker) {
      // C2 command: broadcast pulse from attacker to all infected bots
      bots
        .filter((b) => b.state === "infected")
        .forEach((bot, i) => {
          setTimeout(() => {
            particles.push({
              x: attacker.x,
              y: attacker.y,
              tx: bot.x,
              ty: bot.y,
              type: "command",
              speed: 4,
              life: 1,
            });
          }, i * 25);
        });
    }

    // Phases 3-5: traffic spawning handled in render loop
  }, []);

  const handleAdvance = () => {
    if (phase >= 5) {
      // Reset
      const { w, h } = sizeRef.current;
      nodesRef.current = buildTopology(w, h);
      particlesRef.current = [];
      targetHealthRef.current = 100;
      setTargetHealth(100);
      setPhase(0);
      return;
    }

    const next = phase + 1;
    setPhase(next);
    executePhase(next);
  };

  const handleReset = () => {
    const { w, h } = sizeRef.current;
    nodesRef.current = buildTopology(w, h);
    particlesRef.current = [];
    targetHealthRef.current = 100;
    setTargetHealth(100);
    setPhase(0);
  };

  const phaseConfig = PHASES[phase];

  return (
    <div className="w-full space-y-4">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky top-16 sm:top-20 z-10 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-sm py-3">
        {/* Phase badge */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${phaseConfig.accent}`}
          >
            <Radio className="h-3 w-3" />
            Phase {phase}: {phaseConfig.label}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 text-sm font-medium hover:shadow-md transition-all hover:-translate-y-0.5"
            aria-label="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleAdvance}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5"
          >
            {phaseConfig.buttonText}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas card */}
      <div className="bg-slate-950 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
        {/* Progress steps */}
        <div className="flex gap-1 px-4 pt-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                s <= phase ? "bg-blue-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="w-full px-2 pb-2 pt-2">
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg"
            style={{ display: "block" }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Skull className="h-3.5 w-3.5 text-purple-400" />
            <span>Attacker / C2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-red-400" />
            <span>Bot / Malicious</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-green-400" />
            <span>Legitimate User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-sky-400" />
            <span>Target Server</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-slate-500">
            <span>Health:</span>
            <span
              className={`font-mono font-bold ${
                targetHealth > 60
                  ? "text-green-400"
                  : targetHealth > 20
                    ? "text-orange-400"
                    : "text-red-400"
              }`}
            >
              {targetHealth}%
            </span>
          </div>
        </div>
      </div>

      {/* Phase description */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className={`font-semibold ${phaseConfig.accent}`}>
            {phaseConfig.label}:
          </span>{" "}
          {phaseConfig.description}
        </p>
      </div>
    </div>
  );
}
