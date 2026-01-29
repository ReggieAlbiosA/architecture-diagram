// ============================================================================
// Git-Specific Types (Node-based diagrams)
// ============================================================================

// ============================================================================
// Node Types
// ============================================================================

export type GitNodeType = "main" | "feature" | "squash" | "merge" | "rebase" | "stash";

export interface GitNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: GitNodeType;
  radius?: number; // Default: 18
  hidden?: boolean; // For animation states
}

// ============================================================================
// Link Types
// ============================================================================

export interface GitLink {
  source: string; // Node ID
  target: string; // Node ID
  curved?: boolean; // Auto-detect if source.y !== target.y
  dashed?: boolean; // For ghost/old links
  opacity?: number; // For fading effects
}

// ============================================================================
// Branch Types
// ============================================================================

export interface GitBranchConfig {
  name: string;
  color: string;
  y: number; // Y position for the branch line
  startX?: number; // Where the branch line starts
  endX?: number; // Where the branch line ends
  visible?: boolean; // Can be hidden during animations
}

// ============================================================================
// Animation Step Types
// ============================================================================

export interface GitAnimationStep {
  id: string;
  title: string;
  description: string; // HTML allowed for bold, etc.
  progress: number; // 0-100 for progress bar
  duration: number; // ms

  // State changes for this step
  highlightNodes?: string[]; // Node IDs to highlight
  highlightColor?: string; // Highlight stroke color
  fadeNodes?: string[]; // Node IDs to fade/gray out
  fadeLinks?: string[]; // Link targets to fade
  addNodes?: GitNode[]; // New nodes to add
  addLinks?: GitLink[]; // New links to add
  moveParticles?: {
    // Particle animation
    fromNodes: string[];
    toPosition: { x: number; y: number };
  };
  updateBranches?: Partial<GitBranchConfig>[]; // Branch visibility changes
  updateNodes?: Array<{ id: string; type: GitNodeType }>; // Update node types
  updateLinks?: Array<{ source: string; target: string; curved?: boolean }>; // Update link properties
}

// ============================================================================
// Git Diagram Config
// ============================================================================

export interface GitDiagramConfig {
  // Metadata
  id: string;
  title: string;
  subtitle: string;

  // Visual settings
  dimensions: {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
  };

  // Color palette
  colors: {
    main: string;
    feature: string;
    squash: string;
    merge?: string;
    rebase?: string;
    particle?: string;
    highlight?: string;
  };

  // Branch definitions
  branches: GitBranchConfig[];

  // Initial state
  initialNodes: GitNode[];
  initialLinks: GitLink[];

  // Animation configuration
  steps: GitAnimationStep[];

  // Action button config
  primaryAction: {
    label: string;
    icon?: string; // Lucide icon name
  };

  // Badges/tags to show
  badges?: Array<{
    label: string;
    color: string;
    borderColor: string;
  }>;
}

// ============================================================================
// Git Diagram Context
// ============================================================================

export interface GitDiagramContextValue {
  config: GitDiagramConfig;

  // State
  nodes: GitNode[];
  links: GitLink[];
  branches: GitBranchConfig[];
  currentStep: number;
  isAnimating: boolean;
  isComplete: boolean;
  isPaused: boolean;

  // Actions
  runAnimation: () => Promise<void>;
  reset: () => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  pause: () => void;
  resume: () => Promise<void>;

  // Current step info
  stepInfo: GitAnimationStep | null;
}
