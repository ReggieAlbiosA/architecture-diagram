import type { DockerDiagramConfig } from "../../../_lib/types/docker-types";
import { DOCKER_ZONES, COMPONENT_POSITIONS } from "../../_config/zones";
import { dockerColors } from "../../_config/colors";
import { DOCKER_DEFAULTS } from "../../_config/defaults";

export const dockerArchitectureConfig: DockerDiagramConfig = {
  id: "docker-engine-architecture",
  title: "Docker Engine Architecture",
  subtitle: "Visualize how Client, Host, and Registry interact.",

  dimensions: DOCKER_DEFAULTS.dimensions,

  zones: DOCKER_ZONES,

  components: [
    {
      id: "cli-terminal",
      type: "cli",
      zoneId: "client",
      x: 40,
      y: 100,
      config: { width: 160, height: 100 },
    },
    {
      id: "daemon-core",
      type: "daemon",
      zoneId: "host",
      x: COMPONENT_POSITIONS.daemon.x,
      y: COMPONENT_POSITIONS.daemon.y,
      config: { radius: 30 },
    },
    {
      id: "image-storage",
      type: "storage",
      zoneId: "host",
      x: 280,
      y: 220,
      config: { label: "Images Cache", width: 200, height: 200 },
    },
    {
      id: "container-area",
      type: "storage",
      zoneId: "host",
      x: 500,
      y: 220,
      config: { label: "Running Containers", width: 200, height: 200 },
    },
    {
      id: "registry-db",
      type: "registry-db",
      zoneId: "registry",
      x: COMPONENT_POSITIONS.registry.x,
      y: COMPONENT_POSITIONS.registry.y,
      config: {},
    },
  ],

  actions: [
    // ============================================================================
    // docker pull nginx
    // ============================================================================
    {
      id: "pull",
      command: "docker pull nginx",
      label: "docker pull",
      buttonColor: "purple",
      flows: [
        {
          step: 1,
          description: "CLI sends request to Daemon",
          logMessage: "Command sent: docker pull nginx",
          logColor: "purple",
          connections: [
            {
              id: "pull-c1",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              style: "dashed",
              color: dockerColors.connection,
            },
          ],
          particles: [
            {
              id: "pull-p1",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              color: dockerColors.dataFlow,
              duration: 1000,
            },
          ],
        },
        {
          step: 2,
          description: "Daemon requests image from Registry",
          logMessage:
            "Daemon: Image not found locally. Connecting to Registry...",
          logColor: "yellow",
          delay: 1000,
          connections: [
            {
              id: "pull-c2",
              from: COMPONENT_POSITIONS.daemon,
              to: COMPONENT_POSITIONS.registry,
              style: "dashed",
              color: dockerColors.registryFlow,
            },
          ],
          particles: [
            {
              id: "pull-p2",
              from: COMPONENT_POSITIONS.daemon,
              to: COMPONENT_POSITIONS.registry,
              color: dockerColors.registryFlow,
              duration: 1000,
              delay: 1000,
            },
          ],
        },
        {
          step: 3,
          description: "Registry returns image to Daemon",
          logMessage: "Registry: Locating image layer...",
          logColor: "purple",
          delay: 2000,
          particles: [
            {
              id: "pull-p3",
              from: COMPONENT_POSITIONS.registry,
              to: COMPONENT_POSITIONS.daemon,
              color: dockerColors.registryFlow,
              duration: 1000,
              delay: 2000,
            },
          ],
        },
        {
          step: 4,
          description: "Daemon saves image to storage",
          logMessage: "Success: Image saved to Host storage.",
          logColor: "green",
          delay: 3000,
          particles: [
            {
              id: "pull-p4",
              from: COMPONENT_POSITIONS.daemon,
              to: COMPONENT_POSITIONS.imageArea,
              color: dockerColors.success,
              duration: 500,
              delay: 3000,
            },
          ],
        },
      ],
    },

    // ============================================================================
    // docker run -d nginx
    // ============================================================================
    {
      id: "run",
      command: "docker run -d nginx",
      label: "docker run",
      buttonColor: "blue",
      flows: [
        {
          step: 1,
          description: "CLI sends run request to Daemon",
          logMessage: "Command sent: docker run -d nginx",
          logColor: "blue",
          connections: [
            {
              id: "run-c1",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              style: "dashed",
              color: dockerColors.connection,
            },
          ],
          particles: [
            {
              id: "run-p1",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              color: dockerColors.dataFlow,
              duration: 800,
            },
          ],
        },
        {
          step: 2,
          description: "Daemon checks image cache",
          logMessage: "Daemon: Analyzing request.",
          logColor: "text",
          delay: 800,
          connections: [
            {
              id: "run-c2",
              from: COMPONENT_POSITIONS.daemon,
              to: {
                x: COMPONENT_POSITIONS.imageArea.x,
                y: COMPONENT_POSITIONS.imageArea.y - 80,
              },
              style: "dashed",
              color: dockerColors.success,
            },
          ],
        },
        {
          step: 3,
          description: "Image found, creating container",
          logMessage: "Daemon: Image found locally.",
          logColor: "text",
          delay: 1600,
        },
        {
          step: 4,
          description: "Container started successfully",
          logMessage: "Daemon: Container started.",
          logColor: "green",
          delay: 2400,
          particles: [
            {
              id: "run-p2",
              from: COMPONENT_POSITIONS.daemon,
              to: COMPONENT_POSITIONS.containerArea,
              color: dockerColors.dataFlow,
              duration: 800,
              delay: 2400,
            },
          ],
        },
      ],
    },

    // ============================================================================
    // docker build . -t my-app
    // ============================================================================
    {
      id: "build",
      command: "docker build . -t my-app",
      label: "docker build",
      buttonColor: "green",
      flows: [
        {
          step: 1,
          description: "CLI uploads build context to Daemon",
          logMessage: "Command sent: docker build . -t my-app",
          logColor: "green",
          connections: [
            {
              id: "build-c1",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              style: "dashed",
              color: dockerColors.connection,
            },
          ],
          // Multiple particles to simulate file upload
          particles: [
            {
              id: "build-p1",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              color: "#64748b",
              duration: 800,
              delay: 0,
            },
            {
              id: "build-p2",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              color: "#64748b",
              duration: 1000,
              delay: 100,
            },
            {
              id: "build-p3",
              from: COMPONENT_POSITIONS.cli,
              to: COMPONENT_POSITIONS.daemon,
              color: "#64748b",
              duration: 1200,
              delay: 200,
            },
          ],
        },
        {
          step: 2,
          description: "Daemon building layers from Dockerfile",
          logMessage: "Daemon: Building layers from Dockerfile...",
          logColor: "yellow",
          delay: 1400,
        },
        {
          step: 3,
          description: "Build complete, saving image",
          logMessage: "Success: Image built and tagged.",
          logColor: "green",
          delay: 2900,
          particles: [
            {
              id: "build-p4",
              from: COMPONENT_POSITIONS.daemon,
              to: COMPONENT_POSITIONS.imageArea,
              color: dockerColors.success,
              duration: 600,
              delay: 2900,
            },
          ],
        },
      ],
    },
  ],

  initialObjects: {
    images: ["ubuntu:20.04"],
    containers: [],
  },

  logger: {
    enabled: true,
    height: 128,
    position: "bottom",
  },
};
