import * as d3 from "d3";
import type { DiagramNode } from "../types";

// ============================================================================
// Path Generators
// ============================================================================

/**
 * Generate a path between two nodes
 * Automatically curves if nodes are at different Y positions
 */
export function generateLinkPath(
  sourceNode: DiagramNode,
  targetNode: DiagramNode,
  curved?: boolean
): string {
  const sx = sourceNode.x;
  const sy = sourceNode.y;
  const tx = targetNode.x;
  const ty = targetNode.y;

  // Auto-detect if should be curved
  const shouldCurve = curved ?? sy !== ty;

  if (shouldCurve) {
    // Bezier curve for branch connections
    const midX = (sx + tx) / 2;
    return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
  }

  // Straight line
  return `M ${sx} ${sy} L ${tx} ${ty}`;
}

// ============================================================================
// Color Helpers
// ============================================================================

export function getNodeColor(
  type: DiagramNode["type"],
  colors: Record<string, string>
): string {
  switch (type) {
    case "main":
      return colors.main || "#8b5cf6";
    case "feature":
      return colors.feature || "#3b82f6";
    case "squash":
      return colors.squash || "#10b981";
    case "merge":
      return colors.merge || "#10b981";
    case "rebase":
      return colors.rebase || "#f59e0b";
    case "stash":
      return colors.stash || "#6b7280";
    default:
      return "#6b7280";
  }
}

// ============================================================================
// Animation Helpers
// ============================================================================

export function createParticleAnimation(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  fromNodes: DiagramNode[],
  toPosition: { x: number; y: number },
  duration: number,
  particleColor: string
) {
  const particles = svg
    .selectAll(".particle")
    .data(fromNodes)
    .enter()
    .append("circle")
    .attr("class", "particle")
    .attr("cx", (d: DiagramNode) => d.x)
    .attr("cy", (d: DiagramNode) => d.y)
    .attr("r", 8)
    .attr("fill", "white")
    .attr("stroke", particleColor)
    .attr("stroke-width", 2)
    .style("opacity", 1);

  particles
    .transition()
    .duration(duration)
    .ease(d3.easeCubicIn)
    .attr("cx", toPosition.x)
    .attr("cy", toPosition.y)
    .style("opacity", 0)
    .remove();

  return particles;
}

export function createFlashEffect(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string
) {
  const flash = svg
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 25)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .style("opacity", 1);

  flash
    .transition()
    .duration(500)
    .attr("r", 50)
    .style("opacity", 0)
    .remove();

  return flash;
}

// ============================================================================
// Arrow Marker Definition
// ============================================================================

export function createArrowMarker(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string = "arrow",
  color: string = "#9ca3af"
) {
  defs
    .append("marker")
    .attr("id", id)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", color);
}
