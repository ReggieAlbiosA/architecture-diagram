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

export const gitNonFastForwardMergeConfig: DiagramConfig = {
  id: "git-non-fast-forward-merge",
  title: "Git Non-Fast-Forward Merge",
  subtitle:
    "Visualizing how a merge commit with two parents preserves branch history.",

  dimensions: {
    width: 700,
    height: 350,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  },

  colors: {
    main: "#8b5cf6", // Purple
    feature: "#3b82f6", // Blue
    squash: "#10b981", // Green (not used)
    merge: "#f59e0b", // Orange
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
    { id: "C3", label: "C3", x: 300, y: 120, type: "feature" },
    { id: "C4", label: "C4", x: 400, y: 120, type: "feature" },
    { id: "C5", label: "C5", x: 500, y: 120, type: "feature" },
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
        "We have a <b>main</b> branch (purple) and a <b>feature</b> branch (blue) with 3 commits (C3, C4, C5) that diverged from C2.",
      progress: 0,
      duration: 0,
    },
    {
      id: "identify",
      title: "Step 1: Identifying Branches",
      description:
        "Git identifies both branches that need to be merged. The feature branch has commits C3, C4, C5 and main is at C2.",
      progress: 33,
      duration: 800,
      highlightNodes: ["C2", "C5"],
      highlightColor: "#fbbf24",
    },
    {
      id: "prepare",
      title: "Step 2: Preparing Merge",
      description:
        "Git prepares to create a merge commit that will have <b>two parents</b>: one from main (C2) and one from feature (C5).",
      progress: 66,
      duration: 1000,
      highlightNodes: ["C2", "C5"],
      highlightColor: "#f59e0b",
    },
    {
      id: "complete",
      title: "Step 3: Merge Commit Created",
      description:
        "A new merge commit <b>M1</b> is created on main with two parents. It preserves the entire branch history - all feature commits (C3, C4, C5) remain in the history, and the merge commit ties them together.",
      progress: 100,
      duration: 1200,
      addNodes: [
        { id: "M1", label: "M1", x: 560, y: 250, type: "merge", radius: 22 },
      ],
      addLinks: [
        { source: "C2", target: "M1" },
        { source: "C5", target: "M1", curved: true },
      ],
      highlightNodes: ["M1"],
      highlightColor: "#f59e0b",
    },
  ],

  primaryAction: {
    label: "Non-FF Merge",
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

export default function GitNonFastForwardMergePage() {
  return (
    <DiagramProvider config={gitNonFastForwardMergeConfig}>
      <GitNonFastForwardMergeDiagram />
    </DiagramProvider>
  );
}

function GitNonFastForwardMergeDiagram() {
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
