import {
  GitMerge,
  GitBranch,
  Cpu,
  Box,
  Layers,
  type LucideIcon,
  Shield,
  ShieldAlertIcon,
} from "lucide-react";
import { SiGit, SiDocker, SiLinux } from "react-icons/si";
import { IconType } from "react-icons/lib";

// Navigation configuration types
export interface NavigationLink {
  type: "link";
  label: string;
  href: string;
  icon?: LucideIcon | IconType;
}

export interface NavigationSection {
  type: "section";
  label: string;
  icon?: LucideIcon | IconType;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: NavigationItem[];
}

export type NavigationItem = NavigationLink | NavigationSection;

/**
 * Navigation configuration
 *
 * To add new navigation items:
 * 1. For a simple link, add: { type: "link", label: "...", href: "..." }
 * 2. For a section with children, add: { type: "section", label: "...", children: [...] }
 * 3. Sections can be nested infinitely deep
 * 4. Icons are optional and use lucide-react
 */
export const navigationConfig: NavigationItem[] = [
  // ============================================================================
  // Git Section
  // ============================================================================
  {
    type: "section",
    label: "Git",
    icon: SiGit,
    collapsible: true,
    defaultOpen: true,
    children: [
      {
        type: "section",
        label: "Architecture",
        icon: Layers,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Local",
            href: "/diagram/git/architecture/local",
          },
          {
            type: "link",
            label: "Remote",
            href: "/diagram/git/architecture/remote",
          },
        ],
      },
      {
        type: "section",
        label: "Branching",
        icon: GitBranch,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Branch Basics",
            href: "/diagram/git/branching/basics",
          },
          {
            type: "section",
            label: "Model",
            collapsible: true,
            defaultOpen: false,
            children: [
              {
                type: "link",
                label: "GitFlow",
                href: "/diagram/git/branching/model/gitflow",
              },
              {
                type: "link",
                label: "GitHub Flow",
                href: "/diagram/git/branching/model/github-flow",
              },
              {
                type: "link",
                label: "GitLab Flow",
                href: "/diagram/git/branching/model/gitlab-flow",
              },
              {
                type: "link",
                label: "Trunk-Based",
                href: "/diagram/git/branching/model/trunk-based",
              },
            ],
          },
          {
            type: "link",
            label: "Branch Protection",
            href: "/diagram/git/branching/protection",
          },
        ],
      },
      {
        type: "section",
        label: "Reset",
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Soft Reset",
            href: "/diagram/git/reset/soft",
          },
          {
            type: "link",
            label: "Mixed Reset",
            href: "/diagram/git/reset/mixed",
          },
          {
            type: "link",
            label: "Hard Reset",
            href: "/diagram/git/reset/hard",
          },
        ],
      },
      {
        type: "section",
        label: "Restore",
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Restore (Basic)",
            href: "/diagram/git/restore/basic",
          },
          {
            type: "link",
            label: "Restore --staged",
            href: "/diagram/git/restore/staged",
          },
          {
            type: "link",
            label: "Restore --source",
            href: "/diagram/git/restore/source",
          },
        ],
      },
      {
        type: "section",
        label: "Merging",
        icon: GitMerge,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Non Fast-Forward",
            href: "/diagram/git/merging/non-fast-forward-merge",
          },
          {
            type: "link",
            label: "Fast-Forward",
            href: "/diagram/git/merging/fast-forward-merge",
          },
          {
            type: "link",
            label: "Squash Merge",
            href: "/diagram/git/merging/squash",
          },
          {
            type: "link",
            label: "Rebase Merge",
            href: "/diagram/git/merging/rebase",
          },
          {
            type: "link",
            label: "Merge Conflicts",
            href: "/diagram/git/merging/conflicts",
          },
          {
            type: "link",
            label: "Conflict Resolution",
            href: "/diagram/git/merging/conflict-resolution",
          },
        ],
      },
    ],
  },
  // ============================================================================
  // Docker Section
  // ============================================================================
  {
    type: "section",
    label: "Docker",
    icon: SiDocker,
    collapsible: true,
    defaultOpen: false,
    children: [
      {
        type: "section",
        label: "Core Concepts",
        icon: Cpu,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Architecture",
            href: "/diagram/docker/core-concepts/architecture",
          },
          {
            type: "link",
            label: "Daemon & Client",
            href: "/diagram/docker/core-concepts/daemon-client",
          },
          {
            type: "link",
            label: "containerd",
            href: "/diagram/docker/core-concepts/containerd",
          },
          {
            type: "link",
            label: "runc",
            href: "/diagram/docker/core-concepts/runc",
          },
        ],
      },
      {
        type: "section",
        label: "Containers",
        icon: Box,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Container Basics",
            href: "/diagram/docker/containers/basics",
          },
          {
            type: "link",
            label: "Container Lifecycle",
            href: "/diagram/docker/containers/lifecycle",
          },
          {
            type: "link",
            label: "Isolation",
            href: "/diagram/docker/containers/isolation",
          },
          {
            type: "link",
            label: "Processes",
            href: "/diagram/docker/containers/processes",
          },
          {
            type: "link",
            label: "Resource Limits",
            href: "/diagram/docker/containers/resource-limits",
          },
          {
            type: "link",
            label: "Storage",
            href: "/diagram/docker/containers/storage",
          },
          {
            type: "link",
            label: "Networking",
            href: "/diagram/docker/containers/networking",
          },
        ],
      },
    ],
  },
  // ============================================================================
  // Linux Section
  // ============================================================================
  {
    type: "section",
    label: "Linux",
    icon: SiLinux,
    collapsible: true,
    defaultOpen: false,
    children: [
      {
        type: "link",
        label: "Filesystem",
        href: "/diagram/linux/filesystem",
      },
      {
        type: "link",
        label: "Filesystem Format",
        href: "/diagram/linux/filesystem-format",
      },
    ],
  },
  {
    type: "section",
    label: "Authentication",
    icon: Shield,
    collapsible: true,
    defaultOpen: false,
    children: [
      {
        type: "link",
        label: "Session Cookies",
        href: "/diagram/authentication/session-cookies",
      },
      {
        type: "link",
        label: "JWT",
        href: "/diagram/authentication/jwt",
      },
    ],
  },
  {
    type: "section",
    label: "Cyber Threat",
    icon: ShieldAlertIcon,
    collapsible: true,
    defaultOpen: false,
    children: [
      {
        type: "section",
        label: "Denial-of-Service",
        icon: Box,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            type: "link",
            label: "Multi-Vector DDoS",
            href: "/diagram/cyber-threat/denial-of-service/multi-vector-ddos",
          },
        ],
      },
    ],
  },
];
