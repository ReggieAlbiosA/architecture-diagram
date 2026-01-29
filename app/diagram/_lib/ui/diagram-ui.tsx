"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { useDiagram } from "../core/provider";

// ============================================================================
// Diagram Layout
// ============================================================================

interface DiagramLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DiagramLayout({ children, className }: DiagramLayoutProps) {
  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto p-6 lg:p-8",
        "flex flex-col gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Diagram Header
// ============================================================================

interface DiagramHeaderProps {
  className?: string;
}

export function DiagramHeader({ className }: DiagramHeaderProps) {
  const { config } = useDiagram();

  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {config.title}
        </h1>
        {config.badges && config.badges.length > 0 && (
          <div className="flex items-center gap-2">
            {config.badges.map((badge) => (
              <span
                key={badge.label}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full border",
                  badge.color,
                  badge.borderColor,
                )}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">{config.subtitle}</p>
    </header>
  );
}

// ============================================================================
// Diagram Card
// ============================================================================

interface DiagramCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DiagramCard({ children, className }: DiagramCardProps) {
  return (
    <Card
      className={cn(
        "w-full overflow-hidden",
        "bg-zinc-50 dark:bg-zinc-800/50",
        "border-zinc-200 dark:border-zinc-700",
        className,
      )}
    >
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

// ============================================================================
// Step Indicator
// ============================================================================

interface StepIndicatorProps {
  className?: string;
}

export function StepIndicator({ className }: StepIndicatorProps) {
  const { stepInfo, config, currentStep } = useDiagram();

  if (!stepInfo) return null;

  const totalSteps = config.steps.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress bar */}
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${stepInfo.progress}%` }}
        />
      </div>

      {/* Step info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {stepInfo.title}
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <p
          className="text-sm text-zinc-600 dark:text-zinc-400"
          dangerouslySetInnerHTML={{ __html: stepInfo.description }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Diagram Controls
// ============================================================================

interface DiagramControlsProps {
  className?: string;
}

export function DiagramControls({ className }: DiagramControlsProps) {
  const {
    config,
    runAnimation,
    isAnimating,
    isPaused,
    pause,
    resume,
    nextStep,
    prevStep,
    currentStep,
  } = useDiagram();

  const handlePlayPause = () => {
    if (isAnimating && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      runAnimation();
    }
  };

  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep === config.steps.length - 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        {/* Previous Step */}
        <Button
          onClick={prevStep}
          variant="outline"
          disabled={isAtStart || (isAnimating && !isPaused)}
          className="gap-2"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Play/Pause Button */}
        <Button onClick={handlePlayPause} className="gap-2 min-w-[140px]">
          {isAnimating && !isPaused ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {isPaused ? "Resume" : config.primaryAction.label}
            </>
          )}
        </Button>

        {/* Next Step */}
        <Button
          onClick={nextStep}
          variant="outline"
          disabled={isAtEnd || (isAnimating && !isPaused)}
          className="gap-2"
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Step indicator */}
      <StepIndicator />
    </div>
  );
}

// ============================================================================
// Diagram Renderer - Re-exported from technology-specific components
// ============================================================================

// For Git diagrams, use GitDiagramRenderer from git/_components/
// For Docker diagrams, use DockerDiagramRenderer from docker/_components/
// Import and use the appropriate renderer for your diagram type

// Backward compatibility export (for Git)
export { DiagramRenderer } from "../../git/_components/git-diagram-renderer";
