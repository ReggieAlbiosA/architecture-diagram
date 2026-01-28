// ============================================================================
// Docker Diagram Defaults
// ============================================================================

export const DOCKER_DEFAULTS = {
  // Diagram dimensions
  dimensions: {
    width: 1000,
    height: 500,
  },

  // Animation speeds (ms)
  animation: {
    particleSpeed: 1000,     // Particle travel time
    connectionSpeed: 500,    // Connection line draw time
    flashDuration: 500,      // Flash effect duration
    logDelay: 100,           // Delay between log messages
  },

  // Particle settings
  particle: {
    radius: 6,
    strokeWidth: 2,
  },

  // Connection line settings
  connection: {
    strokeWidth: 2,
    dashArray: "5,5",
  },

  // Logger settings
  logger: {
    enabled: true,
    height: 128, // h-32 = 128px
    maxEntries: 50,
  },
} as const;
