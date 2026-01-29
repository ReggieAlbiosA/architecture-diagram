"use client";

import * as React from "react";
import * as d3 from "d3";
import { useDiagram } from "../../_lib/core/provider";
import {
  generateLinkPath,
  getNodeColor,
  createArrowMarker,
  createParticleAnimation,
  createFlashEffect,
} from "../../_lib/utils/d3-helpers";

// ============================================================================
// Git Diagram Renderer - Renders Git-specific diagrams (nodes, links, branches)
// ============================================================================

interface GitDiagramRendererProps {
  className?: string;
}

export function GitDiagramRenderer({ className }: GitDiagramRendererProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const { config, nodes, links, branches, isAnimating, stepInfo } =
    useDiagram();

  const { width, height } = config.dimensions;

  // Render the diagram
  React.useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();

    // Create defs for markers
    const defs = svg.append("defs");
    createArrowMarker(defs, "arrow", "#9ca3af");
    createArrowMarker(defs, "arrow-faded", "#d1d5db");

    // Create groups for layering
    const branchGroup = svg.append("g").attr("class", "branches");
    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");
    const labelGroup = svg.append("g").attr("class", "labels");

    // Render branch lines
    branches
      .filter((b) => b.visible !== false)
      .forEach((branch) => {
        branchGroup
          .append("line")
          .attr("class", "branch-line")
          .attr("x1", branch.startX ?? 50)
          .attr("y1", branch.y)
          .attr("x2", branch.endX ?? width - 50)
          .attr("y2", branch.y)
          .attr("stroke", branch.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0.3);

        // Branch label
        labelGroup
          .append("text")
          .attr("class", "branch-label")
          .attr("x", branch.startX ?? 50)
          .attr("y", branch.y - 25)
          .attr("fill", branch.color)
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("font-family", "monospace")
          .text(branch.name);
      });

    // Create node map for link rendering
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Render links
    links.forEach((link) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);

      if (!sourceNode || !targetNode) return;

      const pathData = generateLinkPath(sourceNode, targetNode, link.curved);

      linkGroup
        .append("path")
        .attr("class", "link")
        .attr("d", pathData)
        .attr("fill", "none")
        .attr("stroke", link.dashed ? "#d1d5db" : "#9ca3af")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", link.dashed ? "5,5" : "none")
        .attr("opacity", link.opacity ?? 1)
        .attr("marker-end", `url(#${link.dashed ? "arrow-faded" : "arrow"})`);
    });

    // Render nodes
    nodes
      .filter((n) => !n.hidden)
      .forEach((node) => {
        const nodeColor = getNodeColor(node.type, config.colors);
        const radius = node.radius ?? 18;

        // Check if this node should be highlighted
        const isHighlighted = stepInfo?.highlightNodes?.includes(node.id);
        const isFaded = stepInfo?.fadeNodes?.includes(node.id);

        // Node circle
        const circle = nodeGroup
          .append("circle")
          .attr("class", "node")
          .attr("cx", node.x)
          .attr("cy", node.y)
          .attr("r", radius)
          .attr("fill", isFaded ? "#94a3b8" : nodeColor)
          .attr("stroke", "white")
          .attr("stroke-width", 3)
          .style("cursor", "pointer");

        // Add highlight effect
        if (isHighlighted && stepInfo?.highlightColor) {
          circle
            .attr("stroke", stepInfo.highlightColor)
            .attr("stroke-width", 4);
        }

        // Node label
        nodeGroup
          .append("text")
          .attr("class", "node-label")
          .attr("x", node.x)
          .attr("y", node.y)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("pointer-events", "none")
          .text(node.label);
      });

    // HEAD indicator - show on last node of main branch or squash node
    const headNode =
      nodes.find((n) => n.type === "squash") ??
      nodes.filter((n) => n.type === "main").pop();

    if (headNode) {
      const headGroup = labelGroup.append("g").attr("class", "head-indicator");

      headGroup
        .append("rect")
        .attr("x", headNode.x - 25)
        .attr("y", headNode.y + 30)
        .attr("width", 50)
        .attr("height", 22)
        .attr("rx", 4)
        .attr("fill", "#18181b")
        .attr("stroke", "#3f3f46")
        .attr("stroke-width", 1);

      headGroup
        .append("text")
        .attr("x", headNode.x)
        .attr("y", headNode.y + 45)
        .attr("text-anchor", "middle")
        .attr("fill", "#22c55e")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("font-family", "monospace")
        .text("HEAD");
    }
  }, [nodes, links, branches, config, stepInfo, width, height]);

  // Handle particle animations
  React.useEffect(() => {
    if (!svgRef.current || !isAnimating || !stepInfo?.moveParticles) return;

    const svg = d3.select(svgRef.current);
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const fromNodes = stepInfo.moveParticles.fromNodes
      .map((id) => nodeMap.get(id))
      .filter((n): n is NonNullable<typeof n> => n !== undefined);

    if (fromNodes.length > 0) {
      createParticleAnimation(
        svg,
        fromNodes,
        stepInfo.moveParticles.toPosition,
        stepInfo.duration,
        config.colors.particle ?? "#3b82f6",
      );
    }
  }, [isAnimating, stepInfo, nodes, config.colors.particle]);

  // Handle new node flash effect
  React.useEffect(() => {
    if (!svgRef.current || !stepInfo?.addNodes) return;

    const svg = d3.select(svgRef.current);

    stepInfo.addNodes.forEach((node) => {
      setTimeout(() => {
        createFlashEffect(
          svg,
          node.x,
          node.y,
          getNodeColor(node.type, config.colors),
        );
      }, 100);
    });
  }, [stepInfo?.addNodes, config.colors]);

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white dark:bg-zinc-900"
        style={{ minHeight: height }}
      />
    </div>
  );
}

// Re-export as DiagramRenderer for backward compatibility
export { GitDiagramRenderer as DiagramRenderer };
