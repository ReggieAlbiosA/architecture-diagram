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

export const gitMergeConflictsConfig: DiagramConfig = {
  id: "git-merge-conflicts",
  title: "Git Merge Conflicts",
  subtitle:
    "Visualizing what happens when both branches modify the same code and conflicts must be resolved.",

  dimensions: {
    width: 700,
    height: 400,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  },

  colors: {
    main: "#8b5cf6", // Purple
    feature: "#3b82f6", // Blue
    squash: "#10b981", // Green (not used)
    merge: "#f59e0b", // Orange
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
    { id: "F2", label: "F2", x: 400, y: 120, type: "feature" },
    { id: "F3", label: "F3", x: 500, y: 120, type: "feature" },
  ],

  initialLinks: [
    { source: "C1", target: "C2" },
    { source: "C2", target: "C3" },
    { source: "C2", target: "F1", curved: true },
    { source: "F1", target: "F2" },
    { source: "F2", target: "F3" },
  ],

  steps: [
    {
      id: "initial",
      title: "Initial State",
      description:
        "Main and feature branches have <b>diverged</b> from C2. Main has C3, and feature has F1, F2, F3. Both branches modified the same file areas.",
      progress: 0,
      duration: 0,
    },
    {
      id: "attempt-merge",
      title: "Step 1: Attempting Merge",
      description:
        "Git attempts to merge feature into main by comparing C3 and F3. It needs to reconcile changes from both branches.",
      progress: 25,
      duration: 800,
      highlightNodes: ["C3", "F3"],
      highlightColor: "#fbbf24",
    },
    {
      id: "detect-conflict",
      title: "Step 2: Conflict Detected",
      description:
        "Git detects that both branches modified the same code! <b>Automatic merge failed.</b> The conflicting areas are marked in red and must be manually resolved.",
      progress: 50,
      duration: 1000,
      highlightNodes: ["C3", "F3"],
      highlightColor: "#ef4444",
      moveParticles: {
        fromNodes: ["C3", "F3"],
        toPosition: { x: 450, y: 185 },
      },
    },
    {
      id: "resolve",
      title: "Step 3: Resolving Conflicts",
      description:
        "Developer manually edits the conflicting files, choosing which changes to keep from each branch. The resolved code combines the best of both changes.",
      progress: 75,
      duration: 1200,
      highlightNodes: ["C3", "F3"],
      highlightColor: "#10b981",
    },
    {
      id: "complete",
      title: "Step 4: Merge Commit Created",
      description:
        "After resolving conflicts, a merge commit <b>M1</b> is created with two parents (C3 and F3). The merge commit contains the manually resolved code.",
      progress: 100,
      duration: 1000,
      addNodes: [
        { id: "M1", label: "M1", x: 560, y: 250, type: "merge", radius: 22 },
      ],
      addLinks: [
        { source: "C3", target: "M1" },
        { source: "F3", target: "M1", curved: true },
      ],
      highlightNodes: ["M1"],
      highlightColor: "#f59e0b",
    },
  ],

  primaryAction: {
    label: "Resolve Conflicts",
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
      label: "conflict",
      color: "bg-red-500/20",
      borderColor: "border-red-500/50",
    },
  ],
};

export default function GitMergeConflictsPage() {
  return (
    <DiagramProvider config={gitMergeConflictsConfig}>
      <GitMergeConflictsDiagram />
    </DiagramProvider>
  );
}

function GitMergeConflictsDiagram() {
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
