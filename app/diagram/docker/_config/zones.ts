// ============================================================================
// Docker Zone Definitions
// ============================================================================

import type { DockerZone } from "../../_lib/types/docker-types";
import { dockerColors } from "./colors";

export const DOCKER_ZONES: DockerZone[] = [
  {
    id: "client",
    label: "DOCKER CLIENT",
    x: 20,
    y: 50,
    width: 200,
    height: 400,
    color: dockerColors.client,
    textColor: "#fff",
    borderColor: "#cbd5e1",
  },
  {
    id: "host",
    label: "DOCKER HOST (DAEMON)",
    x: 260,
    y: 50,
    width: 460,
    height: 400,
    color: dockerColors.host,
    textColor: "#334155",
    borderColor: "#cbd5e1",
  },
  {
    id: "registry",
    label: "REGISTRY (HUB)",
    x: 760,
    y: 50,
    width: 220,
    height: 400,
    color: dockerColors.registry,
    textColor: "#581c87",
    borderColor: "#cbd5e1",
  },
];

// Component positions (used in architecture config)
export const COMPONENT_POSITIONS = {
  cli: { x: 120, y: 150 },
  daemon: { x: 490, y: 120 },
  registry: { x: 870, y: 150 },
  imageArea: { x: 380, y: 320 },
  containerArea: { x: 600, y: 320 },
} as const;
