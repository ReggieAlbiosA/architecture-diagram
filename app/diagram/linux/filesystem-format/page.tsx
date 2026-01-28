import type { Metadata } from "next";
import { FilesystemFormatStack } from "./filesystem-format-stack";

export const metadata: Metadata = {
  title: "Linux Filesystem Architecture Stack",
  description:
    "Interactive visualization of the Linux filesystem architecture from physical hardware through the Virtual File System (VFS) to user applications. Explore the layers including block devices, ext4, XFS, mount points, and the Filesystem Hierarchy Standard (FHS).",
  keywords: [
    "Linux filesystem architecture",
    "VFS",
    "Virtual File System",
    "ext4",
    "XFS",
    "block devices",
    "mount points",
    "FHS",
    "filesystem layers",
    "kernel filesystem",
    "Linux storage stack",
  ],
};

export default function FilesystemFormatPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 lg:p-6">
      <FilesystemFormatStack />
    </div>
  );
}
