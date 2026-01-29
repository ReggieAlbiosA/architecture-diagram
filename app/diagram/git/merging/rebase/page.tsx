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

export const gitMergeRebaseConfig: DiagramConfig = {
  id: "git-merge-rebase",
  title: "Git Merge Rebase",
  subtitle:
    "Visualizing how commits are replayed onto the main branch to create a linear history.",

  dimensions: {
    width: 700,
    height: 350,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  },

  colors: {
    main: "#8b5cf6", // Purple
    feature: "#3b82f6", // Blue
    squash: "#10b981", // Green (not used in rebase)
    rebase: "#10b981", // Green
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
      title: "Step 1: Identifying Commits",
      description:
        "Git identifies all commits on the feature branch (C3, C4, C5) that need to be replayed onto main.",
      progress: 25,
      duration: 800,
      highlightNodes: ["C3", "C4", "C5"],
      highlightColor: "#fbbf24",
    },
    {
      id: "replay-c3",
      title: "Step 2: Replaying C3",
      description:
        "The first commit <b>C3'</b> is replayed onto main with the same changes but a new commit hash.",
      progress: 50,
      duration: 1000,
      addNodes: [
        { id: "C3p", label: "C3'", x: 340, y: 250, type: "rebase", radius: 20 },
      ],
      addLinks: [{ source: "C2", target: "C3p" }],
      highlightNodes: ["C3p"],
      highlightColor: "#10b981",
    },
    {
      id: "replay-c4",
      title: "Step 3: Replaying C4",
      description:
        "The second commit <b>C4'</b> is replayed on top of C3' with the same changes but a new commit hash.",
      progress: 75,
      duration: 1000,
      addNodes: [
        { id: "C4p", label: "C4'", x: 440, y: 250, type: "rebase", radius: 20 },
      ],
      addLinks: [{ source: "C3p", target: "C4p" }],
      highlightNodes: ["C4p"],
      highlightColor: "#10b981",
    },
    {
      id: "complete",
      title: "Step 4: Rebase Complete",
      description:
        "The final commit <b>C5'</b> is replayed, creating a linear history on main. Each rebased commit preserves its original changes but has a new hash. The feature branch commits are no longer referenced.",
      progress: 100,
      duration: 1000,
      addNodes: [
        { id: "C5p", label: "C5'", x: 540, y: 250, type: "rebase", radius: 20 },
      ],
      addLinks: [{ source: "C4p", target: "C5p" }],
      fadeNodes: ["C3", "C4", "C5"],
      fadeLinks: ["C3", "C4", "C5"],
      highlightNodes: ["C5p"],
      highlightColor: "#10b981",
    },
  ],

  primaryAction: {
    label: "Rebase Merge",
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

export default function GitMergeRebasePage() {
  return (
    <DiagramProvider config={gitMergeRebaseConfig}>
      <GitMergeRebaseDiagram />
    </DiagramProvider>
  );
}

function GitMergeRebaseDiagram() {
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
