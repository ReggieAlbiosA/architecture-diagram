"use client";

import { DiagramProvider } from "../../../_lib/core/provider";
import {
  DiagramLayout,
  DiagramHeader,
  DiagramControls,
  DiagramCard,
  DiagramRenderer,
} from "../../../_lib/ui/diagram-ui";
import { DiagramConfig } from "../../../_lib/types";

export const gitConflictResolutionConfig: DiagramConfig = {
  id: "git-conflict-resolution",
  title: "Git Conflict Resolution",
  subtitle:
    "Visualizing the process of resolving merge conflicts and combining changes from both branches.",

  dimensions: {
    width: 700,
    height: 400,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  },

  colors: {
    main: "#8b5cf6", // Purple
    feature: "#3b82f6", // Blue
    squash: "#10b981", // Green
    merge: "#10b981", // Green for resolved
    highlight: "#fbbf24", // Yellow
    particle: "#ef4444", // Red for conflicts
  },

  branches: [
    {
      name: "main",
      color: "#8b5cf6",
      y: 250,
      startX: 80,
      endX: 620,
    },
    {
      name: "feature",
      color: "#3b82f6",
      y: 120,
      startX: 200,
      endX: 520,
    },
  ],

  initialNodes: [
    { id: "C1", label: "C1", x: 120, y: 250, type: "main" },
    { id: "C2", label: "C2", x: 240, y: 250, type: "main" },
    { id: "C3", label: "C3", x: 340, y: 250, type: "main" },
    { id: "F1", label: "F1", x: 300, y: 120, type: "feature" },
    { id: "F2", label: "F2", x: 500, y: 120, type: "feature" },
  ],

  initialLinks: [
    { source: "C1", target: "C2" },
    { source: "C2", target: "C3" },
    { source: "C2", target: "F1", curved: true },
    { source: "F1", target: "F2" },
  ],

  steps: [
    {
      id: "initial",
      title: "Initial Conflict State",
      description:
        "Merge conflict detected! C3 (main) and F2 (feature) both modified the same file. Git cannot automatically merge these changes.",
      progress: 0,
      duration: 0,
      highlightNodes: ["C3", "F2"],
      highlightColor: "#ef4444",
    },
    {
      id: "analyze",
      title: "Step 1: Analyzing Conflicts",
      description:
        "Examining the conflicting changes from both branches. C3 modified function X, F2 also modified function X differently.",
      progress: 25,
      duration: 800,
      highlightNodes: ["C3", "F2"],
      highlightColor: "#fbbf24",
    },
    {
      id: "choose-strategy",
      title: "Step 2: Choosing Resolution",
      description:
        "Developer chooses a resolution strategy: <b>Manual Merge</b> - intelligently combining changes from both C3 and F2 to preserve important updates from each branch.",
      progress: 50,
      duration: 1000,
      moveParticles: {
        fromNodes: ["C3", "F2"],
        toPosition: { x: 450, y: 185 },
      },
    },
    {
      id: "resolve",
      title: "Step 3: Resolving Conflicts",
      description:
        "Manually editing the conflicting file to combine the best changes from both branches. The resolved code includes improvements from C3 and new features from F2.",
      progress: 75,
      duration: 1200,
      highlightNodes: ["C3", "F2"],
      highlightColor: "#10b981",
    },
    {
      id: "complete",
      title: "Step 4: Resolution Complete",
      description:
        "Conflict resolved! A merge commit <b>M1</b> is created containing the manually merged code. Both branches' changes are preserved in the final result.",
      progress: 100,
      duration: 1000,
      addNodes: [
        { id: "M1", label: "M1", x: 560, y: 250, type: "merge", radius: 22 },
      ],
      addLinks: [
        { source: "C3", target: "M1" },
        { source: "F2", target: "M1", curved: true },
      ],
      highlightNodes: ["M1"],
      highlightColor: "#10b981",
    },
  ],

  primaryAction: {
    label: "Resolve & Merge",
    icon: "GitMerge",
  },

  badges: [
    {
      label: "main",
      color: "bg-purple-500/20",
      borderColor: "border-purple-500/50",
    },
    {
      label: "feature",
      color: "bg-blue-500/20",
      borderColor: "border-blue-500/50",
    },
    {
      label: "resolved",
      color: "bg-green-500/20",
      borderColor: "border-green-500/50",
    },
  ],
};

export default function GitConflictResolutionPage() {
  return (
    <DiagramProvider config={gitConflictResolutionConfig}>
      <GitConflictResolutionDiagram />
    </DiagramProvider>
  );
}

function GitConflictResolutionDiagram() {
  return (
    <DiagramLayout>
      <DiagramHeader />
      <DiagramCard>
        <DiagramRenderer />
      </DiagramCard>
      <DiagramControls />
    </DiagramLayout>
  );
}
