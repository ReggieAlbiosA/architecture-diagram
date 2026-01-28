// ============================================================================
// Git Color Palette - Shared across all Git diagrams
// ============================================================================

export const gitColors = {
  // Branch colors
  main: "#8b5cf6", // Purple - main/master branch
  feature: "#3b82f6", // Blue - feature branches
  develop: "#06b6d4", // Cyan - develop branch
  hotfix: "#ef4444", // Red - hotfix branches
  release: "#f59e0b", // Amber - release branches

  // Node/commit type colors
  squash: "#10b981", // Green - squash commits
  merge: "#10b981", // Green - merge commits
  rebase: "#f59e0b", // Amber - rebased commits
  stash: "#6b7280", // Gray - stashed changes
  conflict: "#ef4444", // Red - conflict markers
  resolved: "#10b981", // Green - resolved conflicts

  // Visual effects
  particle: "#3b82f6", // Blue - particle animations
  highlight: "#fbbf24", // Yellow - highlighted elements
  fade: "#9ca3af", // Gray - faded elements

  // Badge backgrounds (Tailwind classes)
  badges: {
    main: {
      bg: "bg-purple-500/20",
      border: "border-purple-500/50",
    },
    feature: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/50",
    },
    develop: {
      bg: "bg-cyan-500/20",
      border: "border-cyan-500/50",
    },
    hotfix: {
      bg: "bg-red-500/20",
      border: "border-red-500/50",
    },
    release: {
      bg: "bg-amber-500/20",
      border: "border-amber-500/50",
    },
  },
} as const;

// Helper function to get color by node type
export function getNodeColor(type: string): string {
  switch (type) {
    case "main":
      return gitColors.main;
    case "feature":
      return gitColors.feature;
    case "squash":
      return gitColors.squash;
    case "merge":
      return gitColors.merge;
    case "rebase":
      return gitColors.rebase;
    case "stash":
      return gitColors.stash;
    default:
      return gitColors.main;
  }
}
