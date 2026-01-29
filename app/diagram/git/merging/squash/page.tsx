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

export const gitMergeSquashConfig: DiagramConfig = {
  id: "git-merge-squash",
  title: "Git Merge Squash",
  subtitle:
    "Visualizing how multiple commits are combined into a single commit on the main branch.",

  dimensions: {
    width: 700,
    height: 350,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  },

  colors: {
    main: "#8b5cf6", // Purple
    feature: "#3b82f6", // Blue
    squash: "#10b981", // Green
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
      id: "gather",
      title: "Step 1: Gathering Changes",
      description:
        "Git identifies all commits on the feature branch (C3, C4, C5) that need to be combined.",
      progress: 33,
      duration: 800,
      highlightNodes: ["C3", "C4", "C5"],
      highlightColor: "#fbbf24",
    },
    {
      id: "stage",
      title: "Step 2: Combining Changes",
      description:
        "The changes from C3, C4, and C5 are extracted and combined into a single set of changes.",
      progress: 66,
      duration: 1200,
      moveParticles: {
        fromNodes: ["C3", "C4", "C5"],
        toPosition: { x: 400, y: 250 },
      },
    },
    {
      id: "complete",
      title: "Step 3: Squash Commit Created",
      description:
        "A new commit <b>S1</b> is created on main containing all the combined changes. The original feature commits are no longer referenced.",
      progress: 100,
      duration: 800,
      addNodes: [
        { id: "S1", label: "S1", x: 400, y: 250, type: "squash", radius: 22 },
      ],
      addLinks: [{ source: "C2", target: "S1" }],
      fadeNodes: ["C3", "C4", "C5"],
      fadeLinks: ["C3", "C4", "C5"],
    },
  ],

  primaryAction: {
    label: "Squash Merge",
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

export default function GitMergeSquashPage() {
  return (
    <DiagramProvider config={gitMergeSquashConfig}>
      <GitMergeSquashDiagram />
    </DiagramProvider>
  );
}

function GitMergeSquashDiagram() {
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
