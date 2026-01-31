/**
 * @file Core types for the vibeability test harness
 * @position internal/vibe-tests/src/types.ts
 */

export interface Turn {
  type: 'probe' | 'filler' | 'distractor' | 'recovery';
  prompt: string;
  response: string;
  evaluation?: Evaluation;
}

export type EscapeHatchType =
  | 'hallucination'
  | 'wrong_component'
  | 'redundant_css'
  | 'supplemental_css'
  | 'wrapper_div'
  | 'inline_style' // Anti-pattern: should use StyleX instead
  | 'hardcoded_color' // Anti-pattern: breaks theming
  | 'hardcoded_spacing' // Anti-pattern: breaks spacing system
  | 'hardcoded_size' // Acceptable: explicit sizes are often needed
  | 'custom_animation' // Gap: missing animation support
  | 'layout_workaround'; // Gap: missing layout primitive

export type EscapeHatchSeverity = 'critical' | 'acceptable';

/**
 * Result quality tiers:
 * - gold: Pure XDS, no escape hatches needed
 * - green: Correct components, only acceptable escape hatches
 * - yellow: Minor issues (e.g., missing optional components)
 * - red: Critical failures (hallucinations, wrong components)
 */
export type ResultTier = 'gold' | 'green' | 'yellow' | 'red';

export interface EscapeHatch {
  type: EscapeHatchType;
  severity: EscapeHatchSeverity;
  detail: string;
  codeSnippet: string;
  /** What capability gap does this escape hatch represent? */
  gap?: string;
}

/** Suggestion for new component or API to cover escape hatch gaps */
export interface GapSuggestion {
  type: 'new_component' | 'new_prop' | 'new_variant' | 'documentation';
  component?: string;
  suggestion: string;
  evidence: string[];
  frequency: number;
  effort: EffortEstimate;
}

export interface Evaluation {
  success: boolean;
  /** Quality tier: gold (pure XDS), green (acceptable hatches), yellow (minor issues), red (critical) */
  tier?: ResultTier;
  componentsUsed: string[];
  componentsExpected: string[];
  /** Escape hatches can be strings (simple descriptions) or structured objects */
  escapeHatches: (string | EscapeHatch)[];
  /** Count of acceptable escape hatches (for scoring) */
  escapeHatchCount?: number;
  failureMode: string | null;
  confusionSignals: string[];
}

export interface TestResult {
  id: string;
  timestamp: string;
  systemVersion: string;
  model: string;
  persona: string;
  promptCategory: string;
  trajectoryDepth: number;
  prompt: string;
  response: string;
  evaluation: Evaluation;
  fullConversation: Turn[];
  contextWindowUsage: number;
  // Timing and usage metrics
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
}

export type RefinementTarget =
  | 'skill_doc'
  | 'component_api'
  | 'component_naming'
  | 'examples';

export type EffortEstimate = 'trivial' | 'moderate' | 'significant';

export interface Refinement {
  target: RefinementTarget;
  component: string | null;
  suggestion: string;
  evidence: string[];
  confidence: number;
  effortEstimate: EffortEstimate;
}

export interface AggregateMetrics {
  overallSuccessRate: number;
  byCategory: Record<string, number>;
  byPersona: Record<string, number>;
  degradationCliff: number;
}

export interface Iteration {
  id: string;
  parentIteration: string | null;
  skillDocHash: string;
  refinementsApplied: Refinement[];
  aggregateMetrics: AggregateMetrics;
  analystSummary: string;
  nextRefinements: Refinement[];
  promptsRun: string[];
  promptsTotal: number;
}

export type PromptComplexity = 'simple' | 'moderate' | 'complex';

export interface TestPrompt {
  id: string;
  category: string;
  prompt: string;
  expectedComponents: string[];
  complexity: PromptComplexity;
}

export interface TestSet {
  name: string;
  prompts: TestPrompt[];
  holdout?: TestPrompt[];
  fillerPrompts?: string[];
  distractorPrompts?: string[];
  recoveryContext?: string;
}

export type Protocol = 'one-shot' | 'degradation' | 'persona-comparison';

export type PersonaType = 'naive' | 'experienced' | 'adversarial';

export interface RunConfig {
  protocol: Protocol;
  persona: PersonaType;
  model: string;
  skillDocPath: string;
  sample?: number;
  holdout?: boolean;
}

export interface AnalysisResult {
  patterns: string[];
  refinements: Refinement[];
  summary: string;
}
