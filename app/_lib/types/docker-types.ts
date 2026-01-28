// ============================================================================
// Docker-Specific Types (Zone-based diagrams)
// ============================================================================

// ============================================================================
// Zone Types
// ============================================================================

export type DockerZoneId = "client" | "host" | "registry" | "network" | "custom";

export interface DockerZone {
  id: DockerZoneId | string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  textColor: string;
  borderColor?: string;
}

// ============================================================================
// Component Types (Static elements within zones)
// ============================================================================

export type DockerComponentType =
  | "cli"
  | "daemon"
  | "storage"
  | "registry-db"
  | "container"
  | "image"
  | "volume"
  | "network-bridge"
  | "custom";

export interface DockerComponent {
  id: string;
  type: DockerComponentType;
  zoneId: string; // Which zone this component belongs to
  x: number; // Relative to zone or absolute
  y: number;
  config?: Record<string, any>; // Type-specific config (width, height, radius, etc.)
}

// ============================================================================
// Particle Animation Types
// ============================================================================

export interface ParticleAnimation {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  duration: number;
  delay?: number;
  size?: number;
  onComplete?: () => void;
}

// ============================================================================
// Connection Line Types
// ============================================================================

export interface ConnectionLine {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  style: "solid" | "dashed" | "dotted";
  color: string;
  strokeWidth?: number;
  animated?: boolean;
  opacity?: number;
}

// ============================================================================
// Docker Action Types
// ============================================================================

export interface ActionFlow {
  step: number;
  description: string;
  logMessage?: string;
  logColor?: string;
  particles?: ParticleAnimation[];
  connections?: ConnectionLine[];
  delay?: number;
  onComplete?: () => void;
}

export interface DockerAction {
  id: string;
  command: string; // "docker pull", "docker run", etc.
  label: string;
  buttonColor: string;
  flows: ActionFlow[];
}

// ============================================================================
// Docker Diagram Config
// ============================================================================

export interface DockerDiagramConfig {
  // Metadata
  id: string;
  title: string;
  subtitle: string;

  // Visual settings
  dimensions: {
    width: number;
    height: number;
  };

  // Zone definitions
  zones: DockerZone[];

  // Static components
  components: DockerComponent[];

  // Interactive actions (docker pull, run, build, etc.)
  actions: DockerAction[];

  // Initial objects to display
  initialObjects?: {
    images?: string[];
    containers?: string[];
  };

  // Logger settings
  logger?: {
    enabled: boolean;
    height?: number;
    position?: "bottom" | "top" | "right";
  };
}

// ============================================================================
// Docker Diagram Context
// ============================================================================

export interface DockerDiagramContextValue {
  config: DockerDiagramConfig;

  // State
  currentAction: string | null;
  isAnimating: boolean;
  logs: Array<{ id: string; message: string; color: string; timestamp: number }>;

  // Actions
  executeAction: (actionId: string) => Promise<void>;
  reset: () => void;
  addLog: (message: string, color?: string) => void;
  clearLogs: () => void;
}
