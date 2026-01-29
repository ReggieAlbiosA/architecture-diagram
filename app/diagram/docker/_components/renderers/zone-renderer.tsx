import * as d3 from "d3";
import type { DockerZone } from "../../../_lib/types/docker-types";
import { COMPONENT_POSITIONS } from "../../_config/zones";
import { dockerColors } from "../../_config/colors";

/**
 * Render Docker zones (Client, Host, Registry)
 * These are the background zones - rendered first (bottom layer)
 */
export function renderZones(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  zones: DockerZone[],
): void {
  const zonesGroup = svg.select("#zones");

  const zoneGroups = zonesGroup
    .selectAll(".zone")
    .data(zones)
    .enter()
    .append("g")
    .attr("class", "zone");

  // Zone backgrounds
  zoneGroups
    .append("rect")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("width", (d) => d.width)
    .attr("height", (d) => d.height)
    .attr("rx", 10)
    .attr("fill", (d) => d.color)
    .attr("stroke", (d) => d.borderColor || "#cbd5e1")
    .attr("stroke-width", 1);

  // Zone labels
  zoneGroups
    .append("text")
    .attr("x", (d) => d.x + d.width / 2)
    .attr("y", (d) => d.y + 30)
    .attr("text-anchor", "middle")
    .style("fill", (d) => d.textColor)
    .style("font-weight", "bold")
    .style("font-family", "monospace")
    .style("font-size", "14px")
    .text((d) => d.label);
}

/**
 * Render static components within zones
 * These go in the static-components group (above zones, below connections)
 */
export function renderStaticComponents(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
): void {
  // Get or create the static-components group
  let staticGroup = svg.select<SVGGElement>("#static-components");
  if (staticGroup.empty()) {
    staticGroup = svg.append("g").attr("id", "static-components");
  }

  // 1. Client CLI Terminal
  const clientGroup = staticGroup
    .append("g")
    .attr("transform", "translate(40, 100)");

  clientGroup
    .append("rect")
    .attr("width", 160)
    .attr("height", 100)
    .attr("fill", dockerColors.terminal)
    .attr("rx", 4);

  clientGroup
    .append("text")
    .attr("x", 10)
    .attr("y", 20)
    .text("$ docker_")
    .attr("fill", "#22c55e")
    .style("font-family", "monospace")
    .style("font-size", "12px");

  // 2. Docker Daemon (The Brain)
  const daemonGroup = staticGroup
    .append("g")
    .attr(
      "transform",
      `translate(${COMPONENT_POSITIONS.daemon.x}, ${COMPONENT_POSITIONS.daemon.y})`,
    );

  daemonGroup
    .append("circle")
    .attr("r", 30)
    .attr("fill", dockerColors.daemon)
    .attr("class", "daemon-core");

  daemonGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", 5)
    .attr("fill", "white")
    .style("font-size", "10px")
    .text("dockerd");

  daemonGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", 45)
    .attr("fill", "#475569")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Daemon");

  // 3. Storage Areas in Host
  // Images Area
  staticGroup
    .append("rect")
    .attr("x", 280)
    .attr("y", 220)
    .attr("width", 200)
    .attr("height", 200)
    .attr("fill", "white")
    .attr("stroke", "#cbd5e1")
    .attr("rx", 5);

  staticGroup
    .append("text")
    .attr("x", 380)
    .attr("y", 240)
    .attr("text-anchor", "middle")
    .attr("fill", "#6b7280")
    .style("font-size", "12px")
    .text("Images Cache");

  // Containers Area
  staticGroup
    .append("rect")
    .attr("x", 500)
    .attr("y", 220)
    .attr("width", 200)
    .attr("height", 200)
    .attr("fill", "white")
    .attr("stroke", "#cbd5e1")
    .attr("rx", 5);

  staticGroup
    .append("text")
    .attr("x", 600)
    .attr("y", 240)
    .attr("text-anchor", "middle")
    .attr("fill", "#6b7280")
    .style("font-size", "12px")
    .text("Running Containers");

  // 4. Registry Area (Database/Cloud icon)
  const regX = COMPONENT_POSITIONS.registry.x;
  const regY = COMPONENT_POSITIONS.registry.y;

  // Simple database stack visualization
  const stackG = staticGroup
    .append("g")
    .attr("transform", `translate(${regX}, ${regY})`);

  stackG
    .append("ellipse")
    .attr("cx", 0)
    .attr("cy", -10)
    .attr("rx", 20)
    .attr("ry", 6)
    .attr("fill", "#a855f7");

  stackG
    .append("rect")
    .attr("x", -20)
    .attr("y", -10)
    .attr("width", 40)
    .attr("height", 20)
    .attr("fill", "#a855f7");

  stackG
    .append("ellipse")
    .attr("cx", 0)
    .attr("cy", 10)
    .attr("rx", 20)
    .attr("ry", 6)
    .attr("fill", "#d8b4fe");
}

/**
 * Add an image block to the storage area
 * These go in the objects group (top layer)
 */
export function addImageBlock(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  name: string,
  index: number,
): void {
  // Limit visible items to prevent overflow
  const visibleIndex = index % 4;

  const objectsGroup = svg.select("#objects");
  const g = objectsGroup.append("g").attr("class", "image-item");

  g.append("rect")
    .attr("x", 290)
    .attr("y", 260 + visibleIndex * 35)
    .attr("width", 180)
    .attr("height", 28)
    .attr("fill", dockerColors.image.bg)
    .attr("stroke", dockerColors.image.border)
    .attr("stroke-width", 2)
    .attr("rx", 4)
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1);

  g.append("text")
    .attr("x", 300)
    .attr("y", 278 + visibleIndex * 35)
    .text(name)
    .style("font-size", "11px")
    .style("font-weight", "500")
    .style("fill", dockerColors.image.text)
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1);
}

/**
 * Add a container block to the container area
 * These go in the objects group (top layer)
 */
export function addContainerBlock(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  name: string,
  index: number,
): void {
  // Limit visible items to prevent overflow
  const visibleIndex = index % 4;

  const objectsGroup = svg.select("#objects");
  const g = objectsGroup.append("g").attr("class", "container-item");

  g.append("rect")
    .attr("x", 510)
    .attr("y", 260 + visibleIndex * 35)
    .attr("width", 180)
    .attr("height", 28)
    .attr("fill", dockerColors.container.bg)
    .attr("stroke", dockerColors.container.border)
    .attr("stroke-width", 2)
    .attr("rx", 4)
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1);

  g.append("text")
    .attr("x", 520)
    .attr("y", 278 + visibleIndex * 35)
    .text(name)
    .style("font-size", "11px")
    .style("font-weight", "500")
    .style("fill", dockerColors.container.text)
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1);

  // Running indicator
  g.append("circle")
    .attr("cx", 680)
    .attr("cy", 274 + visibleIndex * 35)
    .attr("r", 4)
    .attr("fill", dockerColors.container.running)
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1);
}
