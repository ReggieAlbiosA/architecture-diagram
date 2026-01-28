// ============================================================================
// Common Types - Shared across all diagram types
// ============================================================================

export interface BaseDimensions {
  width: number;
  height: number;
}

export interface BaseMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Badge {
  label: string;
  color: string;
  borderColor: string;
}

// Base config that all diagrams share
export interface BaseDiagramConfig {
  id: string;
  title: string;
  subtitle: string;
  dimensions: BaseDimensions;
}

// ============================================================================
// Re-export technology-specific types
// ============================================================================

export * from "./git-types";
export * from "./docker-types";

// ============================================================================
// Legacy type aliases for backward compatibility
// ============================================================================

// These will be removed after migration
export type {
  GitNodeType as NodeType,
  GitNode as DiagramNode,
  GitLink as DiagramLink,
  GitBranchConfig as BranchConfig,
  GitAnimationStep as AnimationStep,
  GitDiagramConfig as DiagramConfig,
  GitDiagramContextValue as DiagramContextValue,
} from "./git-types";
