import * as d3 from "d3";
import type { ConnectionLine } from "../../../_lib/types/docker-types";

/**
 * Draw an animated connection line between two points
 */
export function drawConnection(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  connection: ConnectionLine,
): d3.Selection<SVGLineElement, unknown, null, undefined> {
  const {
    id,
    from,
    to,
    color,
    style = "dashed",
    strokeWidth = 2,
    opacity = 1,
  } = connection;

  const line = svg
    .select("#connections")
    .append("line")
    .attr("id", id)
    .attr("x1", from.x)
    .attr("y1", from.y)
    .attr("x2", from.x) // Start at 'from' position
    .attr("y2", from.y)
    .attr("stroke", color)
    .attr("stroke-width", strokeWidth)
    .attr(
      "stroke-dasharray",
      style === "dashed" ? "5,5" : style === "dotted" ? "2,2" : "none",
    )
    .attr("opacity", opacity);

  // Animate to 'to' position
  line.transition().duration(500).attr("x2", to.x).attr("y2", to.y);

  return line;
}

/**
 * Remove all connection lines with animation
 */
export function clearConnections(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
): void {
  svg
    .select("#connections")
    .selectAll("line")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .remove();
}
