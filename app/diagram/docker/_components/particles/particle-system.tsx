import * as d3 from "d3";
import type { ParticleAnimation } from "../../../../_lib/types/docker-types";

/**
 * Create and animate a particle from one position to another
 */
export function animateParticle(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  particle: ParticleAnimation,
): void {
  const {
    from,
    to,
    color,
    duration,
    delay = 0,
    size = 6,
    onComplete,
  } = particle;

  const particleElement = svg
    .select("#particles")
    .append("circle")
    .attr("cx", from.x)
    .attr("cy", from.y)
    .attr("r", size)
    .attr("fill", color)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0);

  // Fade in, move, fade out
  particleElement
    .transition()
    .delay(delay)
    .duration(200)
    .style("opacity", 1)
    .transition()
    .duration(duration)
    .ease(d3.easeLinear)
    .attr("cx", to.x)
    .attr("cy", to.y)
    .transition()
    .duration(200)
    .style("opacity", 0)
    .on("end", () => {
      particleElement.remove();
      if (onComplete) onComplete();
    });
}

/**
 * Create multiple particles for visual effect (file upload simulation)
 */
export function animateMultipleParticles(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  from: { x: number; y: number },
  to: { x: number; y: number },
  count: number,
  color: string,
  baseDuration: number,
  staggerDelay: number = 100,
): Promise<void> {
  return new Promise((resolve) => {
    let completed = 0;

    for (let i = 0; i < count; i++) {
      animateParticle(svg, {
        id: `particle-${i}`,
        from,
        to,
        color,
        duration: baseDuration + i * 200,
        delay: i * staggerDelay,
        onComplete: () => {
          completed++;
          if (completed === count) resolve();
        },
      });
    }
  });
}
