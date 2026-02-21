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
  | 'layout_workaround' // Gap: missing layout primitive
  | 'a11y_click_handler' // Anti-pattern: onClick on non-interactive element
  | 'hardcoded_typography' // Anti-pattern: raw fontSize/fontWeight/lineHeight/fontFamily instead of tokens
  | 'hallucinated_typography_token'; // Hallucination: invalid CSS variable like --font-size-*, --font-family-*

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

/** Job breakdown for output token analysis */
export interface JobBreakdown {
  componentRouting: number;
  componentConfig: number;
  supplementalStyling: number;
  contentAuthoring: number;
  businessLogic: number;
  boilerplate: number;
  total: number;
}

/** Input token breakdown by doc type */
export interface InputTokenBreakdown {
  /** AGENTS.md - always read */
  agentsMd: number;
  /** principles.md, tokens.md - styling/design guidance */
  designDocs: number;
  /** Component-specific docs (Button.md, TextInput.md, etc.) */
  componentDocs: number;
  /** Prompt and instructions */
  promptOverhead: number;
  /** Total estimated input tokens */
  total: number;
}

/** Full token usage breakdown */
export interface TokenUsageBreakdown {
  input: InputTokenBreakdown;
  output: JobBreakdown;
  total: number;
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
  // Optional job breakdown
  jobBreakdown?: JobBreakdown;
  // Docs that were read (for input token tracking)
  docsRead?: string[];
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
  /** Follow-up prompts for iterative degradation testing */
  followUps?: string[];
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

// ============================================================
// Quality Assessment Types
// ============================================================

export type QualityScore = 'good' | 'needs-work' | 'poor';

export interface AccessibilityIssue {
  severity: 'critical' | 'moderate' | 'minor';
  element: string;
  issue: string;
  recommendation: string;
  lineNumber?: number;
}

export interface DesignSystemIssue {
  severity: 'critical' | 'moderate' | 'minor';
  category:
    | 'component-usage'
    | 'token-usage'
    | 'pattern-violation'
    | 'typography-violation';
  issue: string;
  recommendation: string;
  codeSnippet?: string;
}

export interface CodeQualityIssue {
  severity: 'critical' | 'moderate' | 'minor';
  category:
    | 'state-management'
    | 'event-handling'
    | 'typescript'
    | 'performance';
  issue: string;
  recommendation: string;
  codeSnippet?: string;
}

export interface QualityAssessment {
  accessibility: {
    issues: AccessibilityIssue[];
    score: QualityScore;
  };
  designSystemAdherence: {
    issues: DesignSystemIssue[];
    score: QualityScore;
  };
  codeQuality: {
    issues: CodeQualityIssue[];
    score: QualityScore;
  };
  overallScore: QualityScore;
  summary: string;
}

// ============================================================
// Universal Evaluation Types (target-neutral)
// ============================================================

/**
 * The 5 dimensions measured by universal evaluation.
 * All scored 0-100, all framework-agnostic.
 *
 * 1. Correctness     — Does it work? (hallucinations, valid APIs)
 * 2. Accessibility    — Is it usable by everyone? (labels, semantics)
 * 3. Code Quality     — Is the code well-structured? (complexity, patterns)
 * 4. Efficiency       — How much ceremony vs intent? (merges DRY + conciseness)
 * 5. Maintainability  — How much breaks on change? (coupling, magic values, locality)
 */
export type UniversalDimension =
  | 'correctness'
  | 'accessibility'
  | 'codeQuality'
  | 'efficiency'
  | 'maintainability';

export interface UniversalFinding {
  rule: string;
  severity?: 'critical' | 'moderate' | 'minor';
  detail: string;
  line?: number;
  count?: number;
  example?: string;
}

/** Efficiency sub-metrics */
export interface EfficiencyMetrics {
  totalLines: number;
  codeLines: number;
  stylingLines: number;
  boilerplateLines: number;
  logicLines: number;
  /** Ratio of styling to total code (lower = more efficient) */
  stylingRatio: number;
  /** Ratio of boilerplate (imports + types) to total code */
  boilerplateRatio: number;
  /** Estimated styling decisions per UI element */
  decisionsPerElement: number;
  /** Count of unique UI elements rendered */
  elementCount: number;
  /** Count of styling decisions (props, classes, style properties) */
  stylingDecisionCount: number;
  /** Duplicate code ratio (0-1, lower = more DRY) */
  duplicateRatio: number;
}

/** Maintainability sub-metrics */
export interface MaintainabilityMetrics {
  /** Ratio of semantic tokens to total styling values (0-1, higher = better) */
  semanticRatio: number;
  /** Count of magic values (hardcoded colors, spacing, typography) */
  magicValueCount: number;
  /** Count of semantic references (tokens, variables, scale values) */
  semanticValueCount: number;
  /** Average distance (lines) between state declaration and furthest usage */
  avgStateSpread: number;
  /** Whether dark mode is supported */
  darkModeSupport: boolean;
}

export interface DimensionScore<M = undefined> {
  score: number;
  findings: UniversalFinding[];
  metrics?: M;
}

export interface UniversalScore {
  correctness: DimensionScore;
  accessibility: DimensionScore;
  codeQuality: DimensionScore;
  efficiency: DimensionScore<EfficiencyMetrics>;
  maintainability: DimensionScore<MaintainabilityMetrics>;
}

export interface UniversalAggregate {
  averages: Record<UniversalDimension, number>;
  overall: number;
  byPrompt: Record<string, UniversalScore>;
  byCategory: Record<string, Record<UniversalDimension, number>>;
  darkModeRate: number;
}

export interface UniversalComparison {
  xds: UniversalAggregate;
  baseline: UniversalAggregate;
  winners: Record<UniversalDimension, 'xds' | 'baseline' | 'tie'>;
  byPrompt: Record<
    string,
    {
      xds: UniversalScore;
      baseline: UniversalScore;
      winner: 'xds' | 'baseline' | 'tie';
    }
  >;
}
