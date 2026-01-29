import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import {
  GitBranch,
  GitMerge,
  Layers,
  Box,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react";
import { SiGit, SiDocker, SiLinux } from "react-icons/si";

export const metadata: Metadata = {
  title: "Architecture Graph",
  description:
    "Interactive, animated architecture diagrams for common system designs. Explore Git, Docker, and Linux internals through curated visualizations.",
};

const sections = [
  {
    title: "Git",
    icon: SiGit,
    color: "text-[#F05032]",
    bg: "bg-[#F05032]/10",
    border: "border-[#F05032]/20",
    hoverBorder: "hover:border-[#F05032]/50",
    description:
      "Version control internals — branching models, merge strategies, reset modes, and architecture.",
    href: "/git/architecture/local",
    topics: [
      {
        label: "Architecture",
        count: 2,
        icon: Layers,
        href: "/git/architecture/local",
      },
      {
        label: "Branching",
        count: 6,
        icon: GitBranch,
        href: "/git/branching/basics",
      },
      { label: "Reset", count: 3, icon: GitMerge, href: "/git/reset/soft" },
      {
        label: "Restore",
        count: 3,
        icon: GitMerge,
        href: "/git/restore/basic",
      },
      {
        label: "Merging",
        count: 6,
        icon: GitMerge,
        href: "/git/merging/squash",
      },
    ],
    diagramCount: 20,
  },
  {
    title: "Docker",
    icon: SiDocker,
    color: "text-[#2496ED]",
    bg: "bg-[#2496ED]/10",
    border: "border-[#2496ED]/20",
    hoverBorder: "hover:border-[#2496ED]/50",
    description:
      "Container platform internals — daemon architecture, containerd, runc, container lifecycle, and isolation.",
    href: "/docker/core-concepts/architecture",
    topics: [
      {
        label: "Core Concepts",
        count: 4,
        icon: Cpu,
        href: "/docker/core-concepts/architecture",
      },
      {
        label: "Containers",
        count: 7,
        icon: Box,
        href: "/docker/containers/basics",
      },
    ],
    diagramCount: 11,
  },
  {
    title: "Linux",
    icon: SiLinux,
    color: "text-[#FCC624]",
    bg: "bg-[#FCC624]/10",
    border: "border-[#FCC624]/20",
    hoverBorder: "hover:border-[#FCC624]/50",
    description:
      "Filesystem internals — the FHS directory hierarchy and the storage stack from hardware to userspace.",
    href: "/linux/filesystem",
    topics: [
      {
        label: "Filesystem",
        count: 1,
        icon: HardDrive,
        href: "/linux/filesystem",
      },
      {
        label: "Filesystem Format",
        count: 1,
        icon: Layers,
        href: "/linux/filesystem-format",
      },
    ],
    diagramCount: 2,
  },
];

export default function HomePage() {
  const totalDiagrams = sections.reduce((sum, s) => sum + s.diagramCount, 0);

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="flex items-center gap-2 mb-6">
          <Network className="h-8 w-8 text-zinc-900 dark:text-white" />
          <h1 className="text-[clamp(1rem,5vw,2.6rem)] font-bold text-zinc-900 dark:text-white tracking-tight">
            Architecture Graph
          </h1>
        </div>
        <p className="text-center  text-[clamp(.7rem,4vw,1.5rem)] text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Interactive, animated diagrams for common system architectures. Click,
          explore, and understand how things work.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
          <span className="font-mono">{totalDiagrams} diagrams</span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="font-mono">{sections.length} topics</span>
        </div>
      </div>

      {/* Section Cards */}
      <div className="flex-1 px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href as Route}
              className={`group flex flex-col rounded-xl border ${section.border} ${section.hoverBorder} bg-white dark:bg-zinc-900 p-6 transition-all duration-200 hover:shadow-lg dark:hover:shadow-zinc-800/30`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.bg}`}
                >
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {section.title}
                  </h2>
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                    {section.diagramCount} diagram
                    {section.diagramCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                {section.description}
              </p>

              {/* Topics */}
              <div className="mt-auto space-y-2">
                {section.topics.map((topic) => (
                  <div
                    key={topic.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <topic.icon className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span>{topic.label}</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
                      {topic.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span
                  className={`text-sm font-medium ${section.color} group-hover:underline`}
                >
                  Explore {section.title} diagrams &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
