import type { Metadata } from "next";
import { FilesystemTree } from "./filesystem-tree";

export const metadata: Metadata = {
  title: "Ubuntu Filesystem Architecture",
  description:
    "Interactive tree map of the Ubuntu/Linux filesystem hierarchy based on the Filesystem Hierarchy Standard (FHS). Explore directories like /bin, /etc, /home, /usr, /var and understand their purpose.",
  keywords: [
    "Linux filesystem",
    "Ubuntu filesystem",
    "FHS",
    "Filesystem Hierarchy Standard",
    "Linux directories",
    "/etc",
    "/usr",
    "/var",
    "/home",
    "Linux architecture",
  ],
};

export default function FilesystemPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 lg:p-6">
      <FilesystemTree />
    </div>
  );
}
