// ============================================================================
// Docker Color Palette - Shared across all Docker diagrams
// ============================================================================

export const dockerColors = {
  // Zone colors
  client: "#1e293b",      // slate-800 - Docker Client zone
  host: "#eff6ff",        // blue-50 - Docker Host zone
  registry: "#f3e8ff",    // purple-50 - Registry zone

  // Component colors
  daemon: "#3b82f6",      // blue-500 - Docker daemon core
  terminal: "#0f172a",    // slate-900 - CLI terminal

  // Particle/animation colors
  dataFlow: "#3b82f6",    // blue-500 - Default data flow
  registryFlow: "#a855f7", // purple-500 - Registry operations
  success: "#22c55e",     // green-500 - Success operations
  warning: "#f59e0b",     // amber-500 - Build/warning operations
  error: "#ef4444",       // red-500 - Error states

  // Object colors (images, containers)
  image: {
    bg: "#dcfce7",        // green-100
    border: "#86efac",    // green-300
    text: "#14532d",      // green-900
  },
  container: {
    bg: "#e0f2fe",        // blue-100
    border: "#bae6fd",    // blue-200
    text: "#0c4a6e",      // blue-900
    running: "#22c55e",   // green-500 - Running indicator
    stopped: "#ef4444",   // red-500 - Stopped indicator
  },

  // Connection/line colors
  connection: "#94a3b8",  // slate-400 - Network connections

  // Logger colors (Tailwind classes)
  logger: {
    bg: "bg-slate-900",
    text: "text-green-400",
    border: "border-slate-700",
    purple: "text-purple-400",
    blue: "text-blue-400",
    green: "text-green-500",
    yellow: "text-yellow-400",
    red: "text-red-400",
    gray: "text-slate-500",
  },
} as const;

// Helper to get zone color by ID
export function getZoneColor(zoneId: string): { bg: string; text: string } {
  switch (zoneId) {
    case "client":
      return { bg: dockerColors.client, text: "#fff" };
    case "host":
      return { bg: dockerColors.host, text: "#334155" };
    case "registry":
      return { bg: dockerColors.registry, text: "#581c87" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
}
