"use client";

import { Button } from "@/components/shadcn-ui/button";
import { cn } from "@/lib/utils";

export interface DockerAction {
  id: string;
  label: string;
  color: "purple" | "blue" | "green" | "amber" | "red";
  onClick: () => void;
  disabled?: boolean;
}

interface ActionButtonsProps {
  actions: DockerAction[];
  className?: string;
}

const colorClasses = {
  purple: "bg-purple-600 hover:bg-purple-700",
  blue: "bg-blue-600 hover:bg-blue-700",
  green: "bg-green-600 hover:bg-green-700",
  amber: "bg-amber-600 hover:bg-amber-700",
  red: "bg-red-600 hover:bg-red-700",
};

export function ActionButtons({ actions, className }: ActionButtonsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {actions.map((action) => (
        <Button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "px-4 py-2 text-white rounded shadow transition font-semibold text-sm",
            colorClasses[action.color]
          )}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
