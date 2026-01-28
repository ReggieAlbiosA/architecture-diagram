"use client";

import { DiagramProvider } from "../../../../_lib/core/provider";
import {
  DiagramLayout,
  DiagramHeader,
  DiagramControls,
  DiagramCard,
  DiagramRenderer,
} from "../../../../_lib/ui/diagram-ui";
import { DiagramConfig } from "../../../../_lib/types";

export const gitFastForwardMergeConfig: DiagramConfig = {
  id: "git-fast-forward-merge",
  title: "Git Fast-Forward Merge",
  subtitle:
    "Visualizing how the main branch pointer simply moves forward when there are no diverging commits.",

  dimensions: {
    width: 700,
    height: 350,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  },

  colors: {
    main: "#8b5cf6", // Purple
    feature: "#3b82f6", // Blue
    squash: "#10b981", // Green (not used)
    highlight: "#fbbf24", // Yellow
    particle: "#3b82f6", // Blue
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
    { id: "C3", label: "C3", x: 340, y: 120, type: "feature" },
    { id: "C4", label: "C4", x: 440, y: 120, type: "feature" },
    { id: "C5", label: "C5", x: 540, y: 120, type: "feature" },
  ],

  initialLinks: [
    { source: "C1", target: "C2" },
    { source: "C2", target: "C3", curved: true },
    { source: "C3", target: "C4" },
    { source: "C4", target: "C5" },
  ],

  steps: [
    {
      id: "initial",
      title: "Initial State",
      description:
        "Main branch is at <b>C2</b> (purple), and feature branch (blue) has moved ahead with 3 new commits (C3, C4, C5). Importantly, <b>main has not moved</b> since the feature branch was created.",
      progress: 0,
      duration: 0,
    },
    {
      id: "detect",
      title: "Step 1: Detecting Fast-Forward",
      description:
        "Git detects that main hasn't changed since branching. There are no diverging commits - the feature branch is simply ahead of main.",
      progress: 33,
      duration: 800,
      highlightNodes: ["C2"],
      highlightColor: "#fbbf24",
    },
    {
      id: "move-pointer",
      title: "Step 2: Moving Main Pointer",
      description:
        "Since there's no divergence, Git simply moves the <b>main branch pointer</b> forward to point to C5. No merge commit is needed.",
      progress: 66,
      duration: 1000,
      moveParticles: {
        fromNodes: ["C2"],
        toPosition: { x: 540, y: 120 },
      },
      highlightNodes: ["C5"],
      highlightColor: "#8b5cf6",
    },
    {
      id: "complete",
      title: "Step 3: Fast-Forward Complete",
      description:
        "The commits C3, C4, and C5 change color to purple, now part of main. <b>No merge commit was created</b> - main simply caught up to feature. The result is a clean, linear history.",
      progress: 100,
      duration: 1000,
      updateNodes: [
        { id: "C3", type: "main" },
        { id: "C4", type: "main" },
        { id: "C5", type: "main" },
      ],
      updateLinks: [{ source: "C2", target: "C3", curved: false }],
    },
  ],

  primaryAction: {
    label: "Fast-Forward",
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
  ],
};

export default function GitFastForwardMergePage() {
  return (
    <DiagramProvider config={gitFastForwardMergeConfig}>
      <GitFastForwardMergeDiagram />
    </DiagramProvider>
  );
}

function GitFastForwardMergeDiagram() {
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
