"use client";

import * as React from "react";
import type {
  DiagramConfig,
  DiagramContextValue,
  DiagramNode,
  DiagramLink,
  BranchConfig,
  AnimationStep,
} from "../types";

// ============================================================================
// Context
// ============================================================================

const DiagramContext = React.createContext<DiagramContextValue | null>(null);

export function useDiagram() {
  const context = React.useContext(DiagramContext);
  if (!context) {
    throw new Error("useDiagram must be used within a DiagramProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface DiagramProviderProps {
  config: DiagramConfig;
  children: React.ReactNode;
}

export function DiagramProvider({ config, children }: DiagramProviderProps) {
  // State
  const [nodes, setNodes] = React.useState<DiagramNode[]>(config.initialNodes);
  const [links, setLinks] = React.useState<DiagramLink[]>(config.initialLinks);
  const [branches, setBranches] = React.useState<BranchConfig[]>(config.branches);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const animationRef = React.useRef<{ shouldStop: boolean }>({ shouldStop: false });

  // Get current step info
  const stepInfo: AnimationStep | null = React.useMemo(() => {
    return config.steps[currentStep] ?? null;
  }, [config.steps, currentStep]);

  // Reset to initial state
  const reset = React.useCallback(() => {
    animationRef.current.shouldStop = true;
    setNodes(config.initialNodes);
    setLinks(config.initialLinks);
    setBranches(config.branches);
    setCurrentStep(0);
    setIsAnimating(false);
    setIsComplete(false);
    setIsPaused(false);
  }, [config]);

  // Apply a single step's changes
  const applyStepChanges = React.useCallback((step: AnimationStep) => {
    if (step.addNodes) {
      setNodes((prev) => [...prev, ...step.addNodes!]);
    }

    if (step.addLinks) {
      setLinks((prev) => [...prev, ...step.addLinks!]);
    }

    if (step.fadeNodes) {
      setNodes((prev) =>
        prev.map((node) =>
          step.fadeNodes!.includes(node.id) ? { ...node, hidden: true } : node
        )
      );
    }

    if (step.fadeLinks) {
      setLinks((prev) =>
        prev.map((link) =>
          step.fadeLinks!.includes(link.target)
            ? { ...link, dashed: true, opacity: 0.3 }
            : link
        )
      );
    }
  }, []);

  // Rebuild state up to a specific step
  const rebuildToStep = React.useCallback((targetStep: number) => {
    setNodes(config.initialNodes);
    setLinks(config.initialLinks);
    setBranches(config.branches);

    for (let i = 0; i <= targetStep; i++) {
      const step = config.steps[i];
      if (!step) continue;
      applyStepChanges(step);
    }
  }, [config, applyStepChanges]);

  // Navigate to next step
  const nextStep = React.useCallback(() => {
    if (currentStep < config.steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      const step = config.steps[newStep];
      if (step) {
        applyStepChanges(step);
      }
      if (newStep === config.steps.length - 1) {
        setIsComplete(true);
      }
    }
  }, [currentStep, config.steps, applyStepChanges]);

  // Navigate to previous step
  const prevStep = React.useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      rebuildToStep(newStep);
      setIsComplete(false);
    }
  }, [currentStep, rebuildToStep]);

  // Go to specific step (for manual navigation)
  const goToStep = React.useCallback((step: number) => {
    if (step >= 0 && step < config.steps.length) {
      setCurrentStep(step);
      rebuildToStep(step);
      setIsComplete(step === config.steps.length - 1);
    }
  }, [config.steps.length, rebuildToStep]);

  // Pause animation
  const pause = React.useCallback(() => {
    setIsPaused(true);
    animationRef.current.shouldStop = true;
  }, []);

  // Resume animation
  const resume = React.useCallback(async () => {
    if (!isPaused || isAnimating) return;

    setIsPaused(false);
    setIsAnimating(true);
    animationRef.current.shouldStop = false;

    for (let i = currentStep + 1; i < config.steps.length; i++) {
      if (animationRef.current.shouldStop) {
        setIsAnimating(false);
        return;
      }

      const step = config.steps[i];
      if (!step) continue;

      setCurrentStep(i);
      applyStepChanges(step);

      if (step.duration > 0) {
        await new Promise((resolve) => setTimeout(resolve, step.duration));
      }
    }

    setIsAnimating(false);
    setIsComplete(true);
  }, [isPaused, isAnimating, currentStep, config.steps, applyStepChanges]);

  // Run animation sequence
  const runAnimation = React.useCallback(async () => {
    if (isAnimating) return;

    // Reset if complete, otherwise start from beginning
    if (isComplete) {
      reset();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setIsAnimating(true);
    setIsPaused(false);
    animationRef.current.shouldStop = false;

    const startStep = isComplete ? 0 : currentStep;

    for (let i = startStep; i < config.steps.length; i++) {
      if (animationRef.current.shouldStop) {
        setIsAnimating(false);
        return;
      }

      const step = config.steps[i];
      if (!step) continue;

      setCurrentStep(i);
      applyStepChanges(step);

      // Wait for step duration
      if (step.duration > 0) {
        await new Promise((resolve) => setTimeout(resolve, step.duration));
      }
    }

    setIsAnimating(false);
    setIsComplete(true);
  }, [config.steps, isAnimating, isComplete, currentStep, reset, applyStepChanges]);

  // Context value
  const value: DiagramContextValue = React.useMemo(
    () => ({
      config,
      nodes,
      links,
      branches,
      currentStep,
      isAnimating,
      isComplete,
      isPaused,
      runAnimation,
      reset,
      goToStep,
      nextStep,
      prevStep,
      pause,
      resume,
      stepInfo,
    }),
    [
      config,
      nodes,
      links,
      branches,
      currentStep,
      isAnimating,
      isComplete,
      isPaused,
      runAnimation,
      reset,
      goToStep,
      nextStep,
      prevStep,
      pause,
      resume,
      stepInfo,
    ]
  );

  return (
    <DiagramContext.Provider value={value}>{children}</DiagramContext.Provider>
  );
}
