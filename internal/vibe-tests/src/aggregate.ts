#!/usr/bin/env node
/**
 * @file Aggregate results from interactive vibe test runs
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests aggregate --iteration abc123
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  TestResult,
  Evaluation,
  ResultTier,
  EscapeHatch,
  GapSuggestion,
  EscapeHatchType,
  JobBreakdown,
  InputTokenBreakdown,
  QualityAssessment,
  QualityScore,
} from './types.js';
import {writeJson, getResultsDir} from './utils.js';

/**
 * Doc file sizes in characters (for input token estimation)
 * ~4 chars per token is a reasonable estimate
 */
const DOC_SIZES: Record<string, number> = {
  'AGENTS.md': 691,
  'principles.md': 1131,
  'tokens.md': 3586,
  'Button.md': 1347,
  'Theme.md': 1355,
  'CheckboxInput.md': 1920,
  'Text.md': 2172,
  'Avatar.md': 2280,
  'Calendar.md': 2989,
  'Field.md': 3010,
  'TextInput.md': 3026,
  'Skeleton.md': 3096,
  'Icon.md': 3560,
  'TextArea.md': 3637,
  'Layer.md': 4867,
  'Container.md': 6263,
  'Layout.md': 6632,
  'Stack.md': 7007,
  'XDSLayout.md': 8284,
};

/** Base prompt overhead (task instructions, persona, etc.) in characters */
const PROMPT_OVERHEAD_CHARS = 1500;

/**
 * Estimate input tokens based on docs read
 */
function estimateInputTokens(
  docsRead: string[] | undefined,
): InputTokenBreakdown {
  const breakdown: InputTokenBreakdown = {
    agentsMd: 0,
    designDocs: 0,
    componentDocs: 0,
    promptOverhead: Math.round(PROMPT_OVERHEAD_CHARS / 4),
    total: 0,
  };

  if (!docsRead || docsRead.length === 0) {
    // Default: assume AGENTS.md was read
    breakdown.agentsMd = Math.round((DOC_SIZES['AGENTS.md'] || 700) / 4);
  } else {
    for (const doc of docsRead) {
      const size = DOC_SIZES[doc] || 2000; // Default 2000 chars for unknown docs
      const tokens = Math.round(size / 4);

      if (doc === 'AGENTS.md') {
        breakdown.agentsMd += tokens;
      } else if (doc === 'principles.md' || doc === 'tokens.md') {
        breakdown.designDocs += tokens;
      } else {
        breakdown.componentDocs += tokens;
      }
    }
  }

  breakdown.total =
    breakdown.agentsMd +
    breakdown.designDocs +
    breakdown.componentDocs +
    breakdown.promptOverhead;
  return breakdown;
}

/**
 * Analyze code to break down tokens by job type
 * @param code The generated code to analyze
 * @param target The target design system ('xds' | 'baseline')
 */
function analyzeJobBreakdown(
  code: string,
  target: string = 'xds',
): JobBreakdown {
  const jobs = {
    componentRouting: 0,
    componentConfig: 0,
    supplementalStyling: 0,
    contentAuthoring: 0,
    businessLogic: 0,
    boilerplate: 0,
  };

  const lines = code.split('\n');
  let inStyles = false;

  for (const line of lines) {
    const stripped = line.trim();
    const chars = line.length + 1; // +1 for newline

    // Imports
    if (stripped.startsWith('import')) {
      if (target === 'xds' || target === 'xds-tailwind') {
        // XDS/XDS+Tailwind: imports from @xds/core are component routing
        if (line.includes('XDS') || line.includes('@xds')) {
          jobs.componentRouting += chars;
        } else {
          jobs.boilerplate += chars;
        }
      } else {
        // baseline: imports from @/components/ui are component routing
        if (
          line.includes('@/components/ui') ||
          line.includes('components/ui')
        ) {
          jobs.componentRouting += chars;
        } else if (
          line.includes('@/lib/utils') ||
          line.includes('class-variance-authority') ||
          line.includes('clsx')
        ) {
          // cn() utility imports - part of styling system
          jobs.componentConfig += chars;
        } else {
          jobs.boilerplate += chars;
        }
      }
      continue;
    }

    // StyleX styles block - XDS (pure) only, this is supplemental styling
    // For xds-tailwind, StyleX should not appear (Tailwind replaces it)
    if (target === 'xds') {
      if (line.includes('stylex.create')) {
        inStyles = true;
      }
      if (inStyles) {
        jobs.supplementalStyling += chars;
        if (stripped === '});') {
          inStyles = false;
        }
        continue;
      }
    }

    // For baseline/xds-tailwind: inline style objects are supplemental (escape hatch)
    if (
      (target === 'baseline' || target === 'xds-tailwind') &&
      line.includes('style={{')
    ) {
      jobs.supplementalStyling += chars;
      continue;
    }

    // Type definitions
    if (stripped.startsWith('type ') || stripped.startsWith('interface ')) {
      jobs.boilerplate += chars;
      continue;
    }

    // Function signature
    if (
      stripped.includes('function') &&
      (stripped.includes('export') || stripped.startsWith('function'))
    ) {
      jobs.boilerplate += chars;
      continue;
    }

    // JSX with components and props
    if (target === 'xds' || target === 'xds-tailwind') {
      // XDS component patterns
      const propPatterns = [
        'label=',
        'value=',
        'onChange=',
        'variant=',
        'disabled=',
        'loading=',
        'onClick=',
        'placeholder=',
        'isRequired',
        'header=',
        'content=',
        'theme=',
      ];
      if (
        line.includes('<XDS') ||
        line.includes('</XDS') ||
        (stripped && propPatterns.some(p => line.includes(p)))
      ) {
        jobs.componentConfig += chars;
        continue;
      }
    } else {
      // baseline component patterns
      // In baseline, className with Tailwind IS styling (not component config)
      // Only component props count as config
      const baselineComponents = [
        '<Button',
        '</Button>',
        '<Card',
        '</Card>',
        '<Input',
        '</Input>',
        '<Table',
        '</Table>',
        '<Dialog',
        '</Dialog>',
        '<Popover',
        '</Popover>',
        '<Select',
        '</Select>',
        '<Checkbox',
        '</Checkbox>',
        '<Badge',
        '</Badge>',
        '<Avatar',
        '</Avatar>',
        '<Tabs',
        '</Tabs>',
        '<Command',
        '</Command>',
        '<DropdownMenu',
        '</DropdownMenu>',
      ];
      const baselinePropPatterns = [
        'variant=',
        'size=',
        'disabled=',
        'onClick=',
        'onChange=',
        'onValueChange=',
        'onCheckedChange=',
        'placeholder=',
        'asChild',
        'defaultValue=',
        'value=',
        // Note: className is NOT included - that's styling, not config
      ];
      if (
        baselineComponents.some(c => line.includes(c)) ||
        (stripped && baselinePropPatterns.some(p => line.includes(p)))
      ) {
        jobs.componentConfig += chars;
        continue;
      }

      // For baseline: className with Tailwind fills gaps that component props don't cover
      // This is analogous to StyleX in XDS - supplemental styling
      if (line.includes('className=')) {
        jobs.supplementalStyling += chars;
        continue;
      }
    }

    // JSX structure (html elements)
    if (/<\/?[a-z]/.test(line)) {
      if (
        (target === 'xds' || target === 'xds-tailwind') &&
        line.includes('XDS')
      ) {
        // Already handled above
      } else {
        jobs.contentAuthoring += chars;
        continue;
      }
    }

    // State, handlers, logic
    const logicPatterns = [
      'useState',
      'useRef',
      'useEffect',
      'useCallback',
      'const ',
      'let ',
      'if ',
      'if(',
      'try ',
      'catch ',
      'await ',
      'async ',
      '.then',
      '.catch',
      'xhr.',
      'formData',
      'setIs',
      'setProgress',
      'handle',
    ];
    if (logicPatterns.some(p => line.includes(p))) {
      if (line.includes('return (') || line.includes('return <')) {
        jobs.contentAuthoring += chars;
      } else {
        jobs.businessLogic += chars;
      }
      continue;
    }

    // Closing braces and returns
    if (
      ['}', '});', ');', '};', 'return (', '} catch', '} finally'].includes(
        stripped,
      )
    ) {
      jobs.businessLogic += chars;
      continue;
    }

    // Default: content authoring
    if (stripped) {
      jobs.contentAuthoring += chars;
    }
  }

  const total = Object.values(jobs).reduce((a, b) => a + b, 0);

  return {
    ...jobs,
    total,
  };
}

/** Escape hatch types that indicate anti-patterns (break theming/system) */
const ANTI_PATTERN_HATCHES: EscapeHatchType[] = [
  'hardcoded_color',
  'hardcoded_spacing',
  'inline_style', // Should use StyleX instead
  'a11y_click_handler', // Accessibility issue: use button instead
  'hardcoded_typography', // Should use XDSText/XDSHeading type system
];

interface TierCounts {
  gold: number;
  green: number;
  yellow: number;
  red: number;
}

/** Individual test progression through degradation turns */
interface TestProgression {
  promptId: string;
  category: string;
  prompt: string;
  turns: {depth: number; tier: ResultTier; success: boolean}[];
}

interface AggregateResult {
  iterationId: string;
  totalTests: number;
  successCount: number;
  successRate: number;
  // Tiered results
  tiers: TierCounts;
  tierRate: Record<ResultTier, number>;
  byCategory: Record<
    string,
    {
      success: number;
      total: number;
      rate: number;
      tiers: TierCounts;
      avgDurationMs: number;
    }
  >;
  byPersona: Record<string, {success: number; total: number; rate: number}>;
  // Degradation curve (only present if trajectory depths vary)
  byTrajectoryDepth?: Record<
    number,
    {success: number; total: number; rate: number; tiers: TierCounts}
  >;
  degradationCliff?: number; // First depth where success rate drops below 80%
  // Individual test progressions for line graph visualization
  testProgressions?: TestProgression[];
  criticalIssues: Record<string, number>;
  acceptableEscapeHatches: Record<string, number>;
  antiPatterns: Record<string, number>;
  // Gap analysis
  gaps: GapSuggestion[];
  // Timing and token metrics
  totalDurationMs: number;
  avgDurationMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  // Job breakdown stats (tokens by job type)
  jobStats?: {
    total: JobBreakdown;
    byCategory: Record<string, JobBreakdown>;
    percentages: {
      componentRouting: number;
      componentConfig: number;
      supplementalStyling: number;
      contentAuthoring: number;
      businessLogic: number;
      boilerplate: number;
    };
  };
  // Full token usage breakdown (input + output)
  tokenUsage?: {
    input: {
      total: InputTokenBreakdown;
      byCategory: Record<string, InputTokenBreakdown>;
    };
    output: {
      total: JobBreakdown;
      byCategory: Record<string, JobBreakdown>;
    };
    grandTotal: number;
  };
  // Quality assessment results (from quality agent)
  quality?: {
    assessed: number;
    byScore: Record<QualityScore, number>;
    accessibility: {
      byScore: Record<QualityScore, number>;
      totalIssues: number;
      criticalIssues: number;
    };
    designSystem: {
      byScore: Record<QualityScore, number>;
      totalIssues: number;
      criticalIssues: number;
    };
    codeQuality: {
      byScore: Record<QualityScore, number>;
      totalIssues: number;
      criticalIssues: number;
    };
  };
}

/** Normalize escape hatch to object format (handles string or object) */
function normalizeEscapeHatch(h: string | EscapeHatch): EscapeHatch {
  if (typeof h === 'string') {
    // String escape hatches are treated as acceptable with undefined type
    return {
      type: 'supplemental_css', // Default type for string descriptions
      severity: 'acceptable',
      detail: h,
      codeSnippet: h,
    };
  }
  return h;
}

/** Calculate the tier for a single result */
function calculateTier(evaluation: Evaluation): ResultTier {
  // If the evaluation explicitly marks this as a failure, respect that
  // This is important for degradation tests where subagents evaluate in-context
  if (evaluation.success === false) {
    // Check if there's a failure mode indicating severity
    if (
      evaluation.failureMode === 'complete_context_loss' ||
      evaluation.failureMode === 'hallucination'
    ) {
      return 'red';
    }
    // Context drift or other failures are yellow (degraded but not critical)
    return 'yellow';
  }

  const normalizedHatches = evaluation.escapeHatches.map(normalizeEscapeHatch);

  const criticalHatches = normalizedHatches.filter(
    h => h.severity === 'critical',
  );
  const antiPatternHatches = normalizedHatches.filter(h =>
    ANTI_PATTERN_HATCHES.includes(h.type),
  );

  // Red: Critical failures
  if (criticalHatches.length > 0) {
    return 'red';
  }

  // Yellow: Anti-patterns that break theming/system
  if (antiPatternHatches.length > 0) {
    return 'yellow';
  }

  // Gold: Pure XDS, no escape hatches
  if (normalizedHatches.length === 0) {
    return 'gold';
  }

  // Green: Success with acceptable escape hatches only
  return 'green';
}

/** Analyze escape hatches to generate gap suggestions */
function analyzeGaps(results: TestResult[]): GapSuggestion[] {
  const gapMap = new Map<
    string,
    {count: number; examples: string[]; hatches: EscapeHatch[]}
  >();

  for (const result of results) {
    for (const rawHatch of result.evaluation.escapeHatches) {
      const hatch = normalizeEscapeHatch(rawHatch);
      // Group by gap description or type
      const key = hatch.gap || hatch.type;
      if (!gapMap.has(key)) {
        gapMap.set(key, {count: 0, examples: [], hatches: []});
      }
      const entry = gapMap.get(key)!;
      entry.count++;
      entry.hatches.push(hatch);
      if (entry.examples.length < 3) {
        entry.examples.push(hatch.codeSnippet);
      }
    }
  }

  const suggestions: GapSuggestion[] = [];

  for (const [key, data] of gapMap) {
    // Generate suggestions based on escape hatch type
    const hatchType = data.hatches[0].type;

    if (hatchType === 'supplemental_css' || hatchType === 'layout_workaround') {
      suggestions.push({
        type: 'new_prop',
        suggestion: `Add prop or variant to cover: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: data.count >= 3 ? 'moderate' : 'trivial',
      });
    } else if (hatchType === 'hardcoded_color') {
      suggestions.push({
        type: 'new_variant',
        component: 'theme/tokens',
        suggestion: `Add semantic color token for: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'trivial',
      });
    } else if (
      hatchType === 'hardcoded_spacing' ||
      hatchType === 'hardcoded_size'
    ) {
      suggestions.push({
        type: 'new_prop',
        suggestion: `Add spacing/size prop to cover: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'trivial',
      });
    } else if (hatchType === 'custom_animation') {
      suggestions.push({
        type: 'new_component',
        suggestion: `Add animation utility or component for: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'moderate',
      });
    } else if (hatchType === 'wrapper_div' && data.count >= 3) {
      suggestions.push({
        type: 'new_component',
        suggestion: `Consider layout component to reduce wrapper divs: ${key}`,
        evidence: data.examples,
        frequency: data.count,
        effort: 'significant',
      });
    }
  }

  // Sort by frequency (highest first)
  return suggestions.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Extract XDS components used from code imports
 */
function extractComponentsFromCode(code: string): string[] {
  const components: string[] = [];
  // Match imports from @xds/core or @xds/core/*
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@xds\/core[^'"]*['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const imports = match[1].split(',').map(s => s.trim());
    for (const imp of imports) {
      // Handle "Foo as Bar" syntax
      const name = imp.split(/\s+as\s+/)[0].trim();
      if (name.startsWith('XDS')) {
        components.push(name);
      }
    }
  }
  return [...new Set(components)];
}

/**
 * Detect escape hatches in code
 * @param code The generated code to analyze
 * @param target The target design system ('xds' | 'baseline')
 */
function detectEscapeHatches(
  code: string,
  target: string = 'xds',
): EscapeHatch[] {
  const hatches: EscapeHatch[] = [];

  // Check for hardcoded colors (hex, rgb, hsl in StyleX style definitions)
  // Only flag colors in stylex.create() blocks, not in data objects
  // Dynamic data colors (like user-defined label colors) are acceptable
  if (target === 'xds' || target === 'xds-tailwind') {
    // Match colors specifically in style property contexts (after colon with property name)
    // Skip if the color is a variable reference (like label.color) or data property
    const hardcodedColorRegex =
      /(?:backgroundColor|borderColor|color|fill|stroke)\s*:\s*['"]?(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)|rgba\([^)]+\)|hsla\([^)]+\))['"]?/gi;
    let match;
    while ((match = hardcodedColorRegex.exec(code)) !== null) {
      // Skip if it looks like it's in a data array (preceded by id, name, etc.)
      const context = code.slice(Math.max(0, match.index - 50), match.index);
      if (
        context.includes('name:') ||
        context.includes('id:') ||
        context.includes('label:')
      ) {
        continue; // Skip data objects
      }
      hatches.push({
        type: 'hardcoded_color',
        severity: 'acceptable',
        detail: 'Hardcoded color value instead of CSS variable',
        codeSnippet: match[0],
      });
    }
  }

  // Check for hardcoded spacing (px values in padding, margin, gap)
  // Skip for baseline since Tailwind classes handle this differently
  // For xds-tailwind, flag hardcoded spacing (should use Tailwind utilities instead)
  // Note: width/height are dimension constraints, not spacing - they're acceptable
  if (target === 'xds' || target === 'xds-tailwind') {
    // Only match true spacing properties, not dimensions
    const hardcodedSpacingRegex =
      /(?:padding|margin|gap|paddingTop|paddingBottom|paddingLeft|paddingRight|paddingBlock|paddingInline|marginTop|marginBottom|marginLeft|marginRight|marginBlock|marginInline|rowGap|columnGap)\s*:\s*['"]?\d+px['"]?/gi;
    let match;
    while ((match = hardcodedSpacingRegex.exec(code)) !== null) {
      // Skip if it's inside a var() or uses spacing tokens
      if (!match[0].includes('var(')) {
        hatches.push({
          type: 'hardcoded_spacing',
          severity: 'acceptable',
          detail: 'Hardcoded spacing value instead of spacing token',
          codeSnippet: match[0],
        });
      }
    }
  }

  // Check for inline style props (not StyleX/Tailwind)
  // Skip inline styles that only use variable references (dynamic data values)
  const inlineStyleRegex = /style\s*=\s*\{\{([^}]+)\}\}/g;
  let match;
  while ((match = inlineStyleRegex.exec(code)) !== null) {
    const styleContent = match[1];
    // Check if the style only contains variable references (no literals)
    // Pattern like "backgroundColor: item.color" or "color: data.value" is OK
    const hasOnlyVariableRefs = /^\s*\w+:\s*[\w.]+\s*$/.test(styleContent);
    if (hasOnlyVariableRefs) {
      // Skip - this is a legitimate dynamic data value
      continue;
    }
    hatches.push({
      type: 'inline_style',
      severity: 'acceptable',
      detail:
        target === 'xds'
          ? 'Inline style object instead of StyleX'
          : target === 'xds-tailwind'
            ? 'Inline style object instead of Tailwind className'
            : 'Inline style object instead of Tailwind',
      codeSnippet: match[0],
    });
  }

  // Check for wrapper divs (plain divs that could use layout components)
  const wrapperDivRegex = /<div\s+(?:className|style)/g;
  while ((match = wrapperDivRegex.exec(code)) !== null) {
    hatches.push({
      type: 'wrapper_div',
      severity: 'acceptable',
      detail:
        target === 'xds' || target === 'xds-tailwind'
          ? 'Wrapper div that could potentially use XDS layout components'
          : 'Wrapper div (common in Tailwind patterns)',
      codeSnippet: match[0],
    });
  }

  // Check for accessibility issues: onClick on non-interactive elements
  // Elements like <span>, <div>, <p>, <td> with onClick should use <button> instead
  const a11yClickRegex =
    /<(span|div|p|td|tr|li|label|img|svg)\b[^>]*\bonClick\b/gi;
  while ((match = a11yClickRegex.exec(code)) !== null) {
    // Skip if it has role="button" or tabIndex (attempts at a11y fix)
    const elementContext = code.slice(match.index, match.index + 200);
    if (
      elementContext.includes('role="button"') ||
      elementContext.includes("role='button'") ||
      elementContext.includes('tabIndex')
    ) {
      continue; // Has some a11y attributes, less severe
    }
    hatches.push({
      type: 'a11y_click_handler',
      severity: 'acceptable', // Still acceptable but flagged as anti-pattern
      detail: `onClick on <${match[1]}> should use Button component for accessibility`,
      codeSnippet: match[0].slice(0, 60),
    });
  }

  // Check for hallucinated props - target-specific
  if (target === 'xds' || target === 'xds-tailwind') {
    // XDS-specific hallucination checks
    const hallucinatedProps = [
      {pattern: /variant\s*=\s*["']outline["']/g, prop: 'variant="outline"'},
      {
        pattern: /size\s*=\s*["'](?:xs|xxl|xxxl)["']/g,
        prop: 'invalid size prop',
      },
    ];
    for (const {pattern, prop} of hallucinatedProps) {
      if (pattern.test(code)) {
        hatches.push({
          type: 'hallucination',
          severity: 'critical',
          detail: `Potentially hallucinated prop: ${prop}`,
          codeSnippet: prop,
        });
      }
    }
  }
  // baseline has different valid patterns, so no hallucination checks for now

  // Check for StyleX with valid CSS variables (this is acceptable - supplemental_css)
  // Only relevant for XDS
  if (target === 'xds') {
    const stylexBlockRegex = /stylex\.create\(\{[\s\S]*?\}\)/g;
    while ((match = stylexBlockRegex.exec(code)) !== null) {
      // Only flag if it has significant styling (not just layout)
      const block = match[0];
      if (
        block.includes('backgroundColor') ||
        block.includes('borderColor') ||
        block.includes('color:')
      ) {
        // Check if using CSS variables
        if (block.includes('var(--')) {
          hatches.push({
            type: 'supplemental_css',
            severity: 'acceptable',
            detail: 'StyleX styling using CSS variables',
            codeSnippet: block.slice(0, 100) + '...',
          });
        }
      }
    }
  }

  // Check for hardcoded typography values (fontSize, fontWeight, lineHeight, fontFamily)
  // These should use XDSText/XDSHeading type system or design tokens
  if (target === 'xds' || target === 'xds-tailwind') {
    // Hardcoded fontSize (raw px/rem/em values, not via var(--text-*))
    const hardcodedFontSizeRegex =
      /fontSize\s*:\s*['"]?\d+(?:\.\d+)?(?:px|rem|em)['"]?/gi;
    while ((match = hardcodedFontSizeRegex.exec(code)) !== null) {
      if (!match[0].includes('var(')) {
        hatches.push({
          type: 'hardcoded_typography',
          severity: 'acceptable',
          detail:
            'Hardcoded fontSize instead of using XDSText/XDSHeading type system or --text-* tokens',
          codeSnippet: match[0],
        });
      }
    }

    // Hardcoded fontWeight (raw numeric values, not via var(--font-weight-*))
    const hardcodedFontWeightRegex =
      /fontWeight\s*:\s*['"]?(?:100|200|300|400|500|600|700|800|900)['"]?/gi;
    while ((match = hardcodedFontWeightRegex.exec(code)) !== null) {
      if (!match[0].includes('var(')) {
        hatches.push({
          type: 'hardcoded_typography',
          severity: 'acceptable',
          detail:
            'Hardcoded fontWeight instead of using XDSText weight prop or --font-weight-* tokens',
          codeSnippet: match[0],
        });
      }
    }

    // Hardcoded lineHeight (raw numeric/px/rem values, not via var(--leading-*))
    const hardcodedLineHeightRegex =
      /lineHeight\s*:\s*['"]?\d+(?:\.\d+)?(?:px|rem|em)?['"]?/gi;
    while ((match = hardcodedLineHeightRegex.exec(code)) !== null) {
      if (!match[0].includes('var(')) {
        hatches.push({
          type: 'hardcoded_typography',
          severity: 'acceptable',
          detail:
            'Hardcoded lineHeight instead of using XDSText/XDSHeading type system or --leading-* tokens',
          codeSnippet: match[0],
        });
      }
    }

    // Hardcoded fontFamily (raw font stack instead of var(--font-*))
    const hardcodedFontFamilyRegex =
      /fontFamily\s*:\s*['"][^'"]*(?:sans-serif|serif|monospace|Arial|Helvetica|Roboto|Geist)[^'"]*['"]/gi;
    while ((match = hardcodedFontFamilyRegex.exec(code)) !== null) {
      if (!match[0].includes('var(')) {
        hatches.push({
          type: 'hardcoded_typography',
          severity: 'acceptable',
          detail:
            'Hardcoded fontFamily instead of using --font-family-body, --font-family-heading, or --font-family-code tokens',
          codeSnippet: match[0],
        });
      }
    }

    // Hallucinated typography CSS variables
    const hallucinatedTypographyTokenRegex =
      /var\(\s*--(?:font-size-\w+|font-family-\w+|xds-font-\w+|xds-text-\w+|xds-heading-\w+|text-size-\w+|line-height-\w+)\s*\)/gi;
    while ((match = hallucinatedTypographyTokenRegex.exec(code)) !== null) {
      hatches.push({
        type: 'hallucinated_typography_token',
        severity: 'critical',
        detail:
          'Hallucinated typography CSS variable. Valid tokens: --text-*, --font-family-body, --font-family-code, --font-family-heading, --font-weight-*, --leading-*',
        codeSnippet: match[0],
      });
    }

    // Note: Raw HTML heading/paragraph elements (<h1>-<h6>, <p>) are acceptable
    // in XDS because global typography styles handle them correctly.
    // We still prefer XDSHeading/XDSText for structured UI (props like weight,
    // maxLines, variant) but don't flag raw HTML as an escape hatch.
  }

  return hatches;
}

/**
 * Load results from individual result files (.tsx code files)
 * Evaluates code externally instead of relying on self-evaluation
 */
function loadResults(resultsDir: string): (TestResult & {target?: string})[] {
  const individualResultsDir = path.join(resultsDir, 'results');
  const tasksDir = path.join(resultsDir, 'tasks');
  const manifestPath = path.join(resultsDir, 'manifest.json');
  const results: (TestResult & {target?: string})[] = [];

  if (!fs.existsSync(individualResultsDir)) {
    throw new Error(`No results directory found at ${individualResultsDir}`);
  }

  // Try to load .tsx files first (new natural prompt format)
  let files = fs
    .readdirSync(individualResultsDir)
    .filter(f => f.endsWith('.tsx'));

  // Fall back to .json files if no .tsx files found
  if (files.length === 0) {
    files = fs
      .readdirSync(individualResultsDir)
      .filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      throw new Error(`No result files found in ${individualResultsDir}`);
    }

    // Process JSON files (legacy format or degradation arrays)
    for (const file of files) {
      try {
        const resultPath = path.join(individualResultsDir, file);
        const content = fs.readFileSync(resultPath, 'utf-8');
        const parsed = JSON.parse(content);

        // Handle degradation results stored as arrays
        const resultEntries: TestResult[] = Array.isArray(parsed)
          ? parsed
          : [parsed];

        for (const result of resultEntries) {
          // Infer timing from file timestamps if durationMs is 0 or missing
          if (!result.durationMs || result.durationMs === 0) {
            const taskPath = path.join(tasksDir, file);
            if (fs.existsSync(taskPath)) {
              const taskStat = fs.statSync(taskPath);
              const resultStat = fs.statSync(resultPath);
              const inferredDurationMs = resultStat.mtimeMs - taskStat.mtimeMs;
              if (inferredDurationMs > 0) {
                result.durationMs = Math.round(inferredDurationMs);
              }
            }
          }

          results.push(result);
        }
      } catch (e) {
        console.warn(`Warning: Failed to parse ${file}: ${e}`);
      }
    }

    return results;
  }

  // Load manifest for iteration info
  let manifest: {
    iterationId: string;
    config: {persona: string; target?: string};
  } | null = null;
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      console.warn('Warning: Could not parse manifest.json');
    }
  }

  // Process .tsx files (new format - external evaluation)
  for (const file of files) {
    try {
      const promptId = file.replace('.tsx', '');
      const resultPath = path.join(individualResultsDir, file);
      const taskPath = path.join(tasksDir, `${promptId}.json`);

      // Read the generated code
      const code = fs.readFileSync(resultPath, 'utf-8');

      // Load task metadata
      let task: {
        promptId: string;
        category: string;
        prompt: string;
        expectedComponents: string[];
        persona: string;
        target?: string;
      } | null = null;
      if (fs.existsSync(taskPath)) {
        task = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
      }

      // Load docs read from corresponding .json result file
      let docsRead: string[] | undefined;
      const jsonResultPath = path.join(
        individualResultsDir,
        `${promptId}.json`,
      );
      if (fs.existsSync(jsonResultPath)) {
        try {
          const jsonResult = JSON.parse(
            fs.readFileSync(jsonResultPath, 'utf-8'),
          );
          docsRead = jsonResult.docsRead;
        } catch {
          // Ignore parse errors, docsRead will remain undefined
        }
      }

      // External evaluation: extract components and detect escape hatches
      const componentsUsed = extractComponentsFromCode(code);
      const escapeHatches = detectEscapeHatches(code, task?.target || 'xds');

      // Determine success based on critical escape hatches
      const hasCritical = escapeHatches.some(h => h.severity === 'critical');
      const success = !hasCritical;

      // Infer timing from file timestamps
      let durationMs = 0;
      if (fs.existsSync(taskPath)) {
        const taskStat = fs.statSync(taskPath);
        const resultStat = fs.statSync(resultPath);
        const inferredDurationMs = resultStat.mtimeMs - taskStat.mtimeMs;
        if (inferredDurationMs > 0) {
          durationMs = Math.round(inferredDurationMs);
        }
      }

      const result: TestResult & {target?: string} = {
        id: `${manifest?.iterationId || 'unknown'}-${promptId}`,
        timestamp: new Date().toISOString(),
        systemVersion: 'claude-code-interactive',
        model: 'claude-code-interactive',
        persona: task?.persona || manifest?.config?.persona || 'naive',
        promptCategory: task?.category || 'unknown',
        trajectoryDepth: 0,
        prompt: task?.prompt || promptId,
        response: code,
        evaluation: {
          success,
          componentsUsed,
          componentsExpected: task?.expectedComponents || [],
          escapeHatches,
          failureMode: hasCritical ? 'Critical escape hatches detected' : null,
          confusionSignals: [],
        },
        fullConversation: [],
        contextWindowUsage: 0,
        durationMs,
        inputTokens: 0,
        outputTokens: 0,
        docsRead,
        target: task?.target || manifest?.config?.target || 'xds',
      };

      results.push(result);
    } catch (e) {
      console.warn(`Warning: Failed to process ${file}: ${e}`);
    }
  }

  return results;
}

/**
 * Load quality assessments from .quality.json files
 */
function loadQualityAssessments(
  resultsDir: string,
): Map<string, QualityAssessment> {
  const individualResultsDir = path.join(resultsDir, 'results');
  const assessments = new Map<string, QualityAssessment>();

  if (!fs.existsSync(individualResultsDir)) {
    return assessments;
  }

  const files = fs
    .readdirSync(individualResultsDir)
    .filter(f => f.endsWith('.quality.json'));

  for (const file of files) {
    try {
      const promptId = file.replace('.quality.json', '');
      const assessmentPath = path.join(individualResultsDir, file);
      const content = fs.readFileSync(assessmentPath, 'utf-8');
      const assessment = JSON.parse(content) as QualityAssessment;
      assessments.set(promptId, assessment);
    } catch (e) {
      console.warn(`Warning: Failed to parse quality assessment ${file}: ${e}`);
    }
  }

  return assessments;
}

function aggregate(iterationId: string): AggregateResult {
  const resultsDir = path.join(getResultsDir(), iterationId);

  const results = loadResults(resultsDir);

  if (results.length === 0) {
    throw new Error('No results to aggregate');
  }

  const byCategory: Record<
    string,
    {success: number; total: number; tiers: TierCounts; durationMs: number}
  > = {};
  const byPersona: Record<string, {success: number; total: number}> = {};
  const byTrajectoryDepth: Record<
    number,
    {success: number; total: number; tiers: TierCounts}
  > = {};
  // Track individual test progressions for degradation line graph
  const progressionMap = new Map<
    string,
    {
      category: string;
      prompt: string;
      turns: {depth: number; tier: ResultTier; success: boolean}[];
    }
  >();
  const criticalIssues: Record<string, number> = {};
  const acceptableEscapeHatches: Record<string, number> = {};
  const antiPatterns: Record<string, number> = {};
  const tiers: TierCounts = {gold: 0, green: 0, yellow: 0, red: 0};

  let successCount = 0;
  let totalDurationMs = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const result of results) {
    // Calculate tier for this result
    const tier = calculateTier(result.evaluation);
    tiers[tier]++;

    // Overall success (gold, green, yellow all count as success)
    if (tier !== 'red') {
      successCount++;
    }

    // Timing and tokens
    totalDurationMs += result.durationMs || 0;
    totalInputTokens += result.inputTokens || 0;
    totalOutputTokens += result.outputTokens || 0;

    // By category
    if (!byCategory[result.promptCategory]) {
      byCategory[result.promptCategory] = {
        success: 0,
        total: 0,
        tiers: {gold: 0, green: 0, yellow: 0, red: 0},
        durationMs: 0,
      };
    }
    byCategory[result.promptCategory].total++;
    byCategory[result.promptCategory].tiers[tier]++;
    byCategory[result.promptCategory].durationMs += result.durationMs || 0;
    if (tier !== 'red') {
      byCategory[result.promptCategory].success++;
    }

    // By persona
    if (!byPersona[result.persona]) {
      byPersona[result.persona] = {success: 0, total: 0};
    }
    byPersona[result.persona].total++;
    if (tier !== 'red') {
      byPersona[result.persona].success++;
    }

    // By trajectory depth (for degradation curve analysis)
    const depth = result.trajectoryDepth ?? 0;
    if (!byTrajectoryDepth[depth]) {
      byTrajectoryDepth[depth] = {
        success: 0,
        total: 0,
        tiers: {gold: 0, green: 0, yellow: 0, red: 0},
      };
    }
    byTrajectoryDepth[depth].total++;
    byTrajectoryDepth[depth].tiers[tier]++;
    if (tier !== 'red') {
      byTrajectoryDepth[depth].success++;
    }

    // Track individual test progressions (for degradation line graph)
    // Extract base prompt ID - remove iteration prefix and depth suffix if present
    // Format: iterationId-promptId or iterationId-promptId-depthN
    const idParts = result.id.split('-');
    // Remove first part (iteration) and reconstruct, checking for depth suffix
    const basePromptId = idParts
      .slice(1)
      .filter(p => !p.match(/^depth\d+$/))
      .join('-');
    if (!progressionMap.has(basePromptId)) {
      progressionMap.set(basePromptId, {
        category: result.promptCategory,
        prompt: result.prompt,
        turns: [],
      });
    }
    progressionMap.get(basePromptId)!.turns.push({
      depth,
      tier,
      success: tier !== 'red',
    });

    // Escape hatches
    for (const rawHatch of result.evaluation.escapeHatches) {
      const hatch = normalizeEscapeHatch(rawHatch);
      if (hatch.severity === 'critical') {
        criticalIssues[hatch.type] = (criticalIssues[hatch.type] || 0) + 1;
      } else if (ANTI_PATTERN_HATCHES.includes(hatch.type)) {
        antiPatterns[hatch.type] = (antiPatterns[hatch.type] || 0) + 1;
      } else {
        acceptableEscapeHatches[hatch.type] =
          (acceptableEscapeHatches[hatch.type] || 0) + 1;
      }
    }
  }

  // Calculate rates
  const byCategoryWithRates: Record<
    string,
    {
      success: number;
      total: number;
      rate: number;
      tiers: TierCounts;
      avgDurationMs: number;
    }
  > = {};
  for (const [cat, stats] of Object.entries(byCategory)) {
    byCategoryWithRates[cat] = {
      ...stats,
      rate: Math.round((stats.success / stats.total) * 100),
      avgDurationMs: Math.round(stats.durationMs / stats.total),
    };
  }

  const byPersonaWithRates: Record<
    string,
    {success: number; total: number; rate: number}
  > = {};
  for (const [persona, stats] of Object.entries(byPersona)) {
    byPersonaWithRates[persona] = {
      ...stats,
      rate: Math.round((stats.success / stats.total) * 100),
    };
  }

  // Calculate tier rates
  const tierRate: Record<ResultTier, number> = {
    gold: Math.round((tiers.gold / results.length) * 100),
    green: Math.round((tiers.green / results.length) * 100),
    yellow: Math.round((tiers.yellow / results.length) * 100),
    red: Math.round((tiers.red / results.length) * 100),
  };

  // Calculate trajectory depth rates and degradation cliff
  const depths = Object.keys(byTrajectoryDepth)
    .map(Number)
    .sort((a, b) => a - b);
  const hasDegradationData =
    depths.length > 1 || (depths.length === 1 && depths[0] !== 0);

  let byTrajectoryDepthWithRates:
    | Record<
        number,
        {success: number; total: number; rate: number; tiers: TierCounts}
      >
    | undefined;
  let degradationCliff: number | undefined;

  if (hasDegradationData) {
    byTrajectoryDepthWithRates = {};
    for (const [depthStr, stats] of Object.entries(byTrajectoryDepth)) {
      const depth = Number(depthStr);
      const rate = Math.round((stats.success / stats.total) * 100);
      byTrajectoryDepthWithRates[depth] = {
        ...stats,
        rate,
      };
      // Find degradation cliff (first depth where rate drops below 80%)
      if (degradationCliff === undefined && rate < 80 && depth > 0) {
        degradationCliff = depth;
      }
    }
  }

  // Build test progressions array (only include tests with multiple turns)
  const testProgressions: TestProgression[] = [];
  for (const [promptId, data] of progressionMap) {
    if (data.turns.length > 1) {
      // Sort turns by depth
      data.turns.sort((a, b) => a.depth - b.depth);
      testProgressions.push({
        promptId,
        category: data.category,
        prompt: data.prompt,
        turns: data.turns,
      });
    }
  }

  // Analyze gaps and generate suggestions
  const gaps = analyzeGaps(results);

  // Analyze job breakdown for each result
  const jobsByCategory: Record<string, JobBreakdown> = {};
  const totalJobs: JobBreakdown = {
    componentRouting: 0,
    componentConfig: 0,
    supplementalStyling: 0,
    contentAuthoring: 0,
    businessLogic: 0,
    boilerplate: 0,
    total: 0,
  };

  // Input token tracking
  const inputByCategory: Record<string, InputTokenBreakdown> = {};
  const totalInput: InputTokenBreakdown = {
    agentsMd: 0,
    designDocs: 0,
    componentDocs: 0,
    promptOverhead: 0,
    total: 0,
  };

  for (const result of results) {
    const breakdown = analyzeJobBreakdown(
      result.response,
      result.target || 'xds',
    );

    // Accumulate output totals
    totalJobs.componentRouting += breakdown.componentRouting;
    totalJobs.componentConfig += breakdown.componentConfig;
    totalJobs.supplementalStyling += breakdown.supplementalStyling;
    totalJobs.contentAuthoring += breakdown.contentAuthoring;
    totalJobs.businessLogic += breakdown.businessLogic;
    totalJobs.boilerplate += breakdown.boilerplate;
    totalJobs.total += breakdown.total;

    // Accumulate output by category
    if (!jobsByCategory[result.promptCategory]) {
      jobsByCategory[result.promptCategory] = {
        componentRouting: 0,
        componentConfig: 0,
        supplementalStyling: 0,
        contentAuthoring: 0,
        businessLogic: 0,
        boilerplate: 0,
        total: 0,
      };
    }
    const catJobs = jobsByCategory[result.promptCategory];
    catJobs.componentRouting += breakdown.componentRouting;
    catJobs.componentConfig += breakdown.componentConfig;
    catJobs.supplementalStyling += breakdown.supplementalStyling;
    catJobs.contentAuthoring += breakdown.contentAuthoring;
    catJobs.businessLogic += breakdown.businessLogic;
    catJobs.boilerplate += breakdown.boilerplate;
    catJobs.total += breakdown.total;

    // Estimate input tokens based on docs read
    const inputBreakdown = estimateInputTokens(result.docsRead);
    totalInput.agentsMd += inputBreakdown.agentsMd;
    totalInput.designDocs += inputBreakdown.designDocs;
    totalInput.componentDocs += inputBreakdown.componentDocs;
    totalInput.promptOverhead += inputBreakdown.promptOverhead;
    totalInput.total += inputBreakdown.total;

    // Accumulate input by category
    if (!inputByCategory[result.promptCategory]) {
      inputByCategory[result.promptCategory] = {
        agentsMd: 0,
        designDocs: 0,
        componentDocs: 0,
        promptOverhead: 0,
        total: 0,
      };
    }
    const catInput = inputByCategory[result.promptCategory];
    catInput.agentsMd += inputBreakdown.agentsMd;
    catInput.designDocs += inputBreakdown.designDocs;
    catInput.componentDocs += inputBreakdown.componentDocs;
    catInput.promptOverhead += inputBreakdown.promptOverhead;
    catInput.total += inputBreakdown.total;
  }

  // Calculate percentages
  const jobPercentages =
    totalJobs.total > 0
      ? {
          componentRouting: Math.round(
            (totalJobs.componentRouting / totalJobs.total) * 100,
          ),
          componentConfig: Math.round(
            (totalJobs.componentConfig / totalJobs.total) * 100,
          ),
          supplementalStyling: Math.round(
            (totalJobs.supplementalStyling / totalJobs.total) * 100,
          ),
          contentAuthoring: Math.round(
            (totalJobs.contentAuthoring / totalJobs.total) * 100,
          ),
          businessLogic: Math.round(
            (totalJobs.businessLogic / totalJobs.total) * 100,
          ),
          boilerplate: Math.round(
            (totalJobs.boilerplate / totalJobs.total) * 100,
          ),
        }
      : undefined;

  const jobStats = jobPercentages
    ? {
        total: totalJobs,
        byCategory: jobsByCategory,
        percentages: jobPercentages,
      }
    : undefined;

  // Calculate output tokens from job breakdown (chars / 4)
  const outputTokens = Math.round(totalJobs.total / 4);
  const grandTotal = totalInput.total + outputTokens;

  // Full token usage breakdown
  const tokenUsage = {
    input: {
      total: totalInput,
      byCategory: inputByCategory,
    },
    output: {
      total: totalJobs,
      byCategory: jobsByCategory,
    },
    grandTotal,
  };

  // Load and aggregate quality assessments
  const qualityAssessments = loadQualityAssessments(resultsDir);
  let quality:
    | {
        assessed: number;
        byScore: Record<QualityScore, number>;
        accessibility: {
          byScore: Record<QualityScore, number>;
          totalIssues: number;
          criticalIssues: number;
        };
        designSystem: {
          byScore: Record<QualityScore, number>;
          totalIssues: number;
          criticalIssues: number;
        };
        codeQuality: {
          byScore: Record<QualityScore, number>;
          totalIssues: number;
          criticalIssues: number;
        };
      }
    | undefined;

  if (qualityAssessments.size > 0) {
    const byScore: Record<QualityScore, number> = {
      good: 0,
      'needs-work': 0,
      poor: 0,
    };
    const accessibility = {
      byScore: {good: 0, 'needs-work': 0, poor: 0} as Record<
        QualityScore,
        number
      >,
      totalIssues: 0,
      criticalIssues: 0,
    };
    const designSystem = {
      byScore: {good: 0, 'needs-work': 0, poor: 0} as Record<
        QualityScore,
        number
      >,
      totalIssues: 0,
      criticalIssues: 0,
    };
    const codeQuality = {
      byScore: {good: 0, 'needs-work': 0, poor: 0} as Record<
        QualityScore,
        number
      >,
      totalIssues: 0,
      criticalIssues: 0,
    };

    for (const assessment of qualityAssessments.values()) {
      byScore[assessment.overallScore]++;

      accessibility.byScore[assessment.accessibility.score]++;
      accessibility.totalIssues += assessment.accessibility.issues.length;
      accessibility.criticalIssues += assessment.accessibility.issues.filter(
        i => i.severity === 'critical',
      ).length;

      designSystem.byScore[assessment.designSystemAdherence.score]++;
      designSystem.totalIssues +=
        assessment.designSystemAdherence.issues.length;
      designSystem.criticalIssues +=
        assessment.designSystemAdherence.issues.filter(
          i => i.severity === 'critical',
        ).length;

      codeQuality.byScore[assessment.codeQuality.score]++;
      codeQuality.totalIssues += assessment.codeQuality.issues.length;
      codeQuality.criticalIssues += assessment.codeQuality.issues.filter(
        i => i.severity === 'critical',
      ).length;
    }

    quality = {
      assessed: qualityAssessments.size,
      byScore,
      accessibility,
      designSystem,
      codeQuality,
    };
  }

  return {
    iterationId,
    totalTests: results.length,
    successCount,
    successRate: Math.round((successCount / results.length) * 100),
    tiers,
    tierRate,
    byCategory: byCategoryWithRates,
    byPersona: byPersonaWithRates,
    byTrajectoryDepth: byTrajectoryDepthWithRates,
    degradationCliff,
    testProgressions:
      testProgressions.length > 0 ? testProgressions : undefined,
    criticalIssues,
    acceptableEscapeHatches,
    antiPatterns,
    gaps,
    totalDurationMs,
    avgDurationMs: Math.round(totalDurationMs / results.length),
    totalInputTokens,
    totalOutputTokens,
    jobStats,
    tokenUsage,
    quality,
  };
}

function printReport(agg: AggregateResult): void {
  console.log(`\n📊 Vibe Test Results - Iteration ${agg.iterationId}`);
  console.log(`${'='.repeat(50)}`);
  console.log(
    `\nOverall: ${agg.successRate}% success (${agg.successCount}/${agg.totalTests})`,
  );

  // Tiered breakdown
  console.log(`\n🏆 Quality Tiers:`);
  console.log(
    `  🥇 Gold (pure DS):       ${agg.tiers.gold} (${agg.tierRate.gold}%)`,
  );
  console.log(
    `  🟢 Green (acceptable):  ${agg.tiers.green} (${agg.tierRate.green}%)`,
  );
  console.log(
    `  🟡 Yellow (anti-pattern): ${agg.tiers.yellow} (${agg.tierRate.yellow}%)`,
  );
  console.log(
    `  🔴 Red (critical):      ${agg.tiers.red} (${agg.tierRate.red}%)`,
  );

  // Timing and token stats
  if (agg.totalDurationMs > 0 || agg.totalInputTokens > 0) {
    console.log(`\n⏱️  Performance:`);
    if (agg.totalDurationMs > 0) {
      const totalSecs = (agg.totalDurationMs / 1000).toFixed(1);
      const avgSecs = (agg.avgDurationMs / 1000).toFixed(1);
      console.log(`  Total time: ${totalSecs}s (avg ${avgSecs}s per test)`);
    }
    if (agg.totalInputTokens > 0 || agg.totalOutputTokens > 0) {
      const totalTokens = agg.totalInputTokens + agg.totalOutputTokens;
      console.log(
        `  Tokens: ${totalTokens.toLocaleString()} total (${agg.totalInputTokens.toLocaleString()} in / ${agg.totalOutputTokens.toLocaleString()} out)`,
      );
    }
  }

  console.log(`\nBy Category:`);
  for (const [cat, stats] of Object.entries(agg.byCategory)) {
    const tierBar = `🥇${stats.tiers.gold} 🟢${stats.tiers.green} 🟡${stats.tiers.yellow} 🔴${stats.tiers.red}`;
    const avgTime =
      stats.avgDurationMs > 0
        ? ` ⏱️${(stats.avgDurationMs / 1000).toFixed(1)}s`
        : '';
    console.log(
      `  ${cat.padEnd(25)} ${stats.rate}% (${stats.success}/${stats.total}) [${tierBar}]${avgTime}`,
    );
  }

  // Full token usage breakdown (if present)
  if (agg.tokenUsage) {
    const tu = agg.tokenUsage;
    console.log(`\n📊 Token Usage Breakdown:`);
    console.log(`  ┌─────────────────────────────────────────────────┐`);
    console.log(`  │ INPUT TOKENS (estimated from doc reading)       │`);
    console.log(`  ├─────────────────────────────────────────────────┤`);
    console.log(
      `  │   Agent docs:        ${String(tu.input.total.agentsMd).padStart(6)} tokens             │`,
    );
    console.log(
      `  │   Design docs:      ${String(tu.input.total.designDocs).padStart(6)} tokens             │`,
    );
    console.log(
      `  │   Component docs:   ${String(tu.input.total.componentDocs).padStart(6)} tokens             │`,
    );
    console.log(
      `  │   Prompt overhead:  ${String(tu.input.total.promptOverhead).padStart(6)} tokens             │`,
    );
    console.log(`  │   ─────────────────────────────                 │`);
    console.log(
      `  │   Input subtotal:   ${String(tu.input.total.total).padStart(6)} tokens             │`,
    );
    console.log(`  ├─────────────────────────────────────────────────┤`);
    console.log(`  │ OUTPUT TOKENS (from job breakdown)              │`);
    console.log(`  ├─────────────────────────────────────────────────┤`);
    if (agg.jobStats) {
      const p = agg.jobStats.percentages;
      const outputTokens = Math.round(tu.output.total.total / 4);
      console.log(
        `  │   Library imports:       ${String(p.componentRouting).padStart(3)}%  (~${Math.round(tu.output.total.componentRouting / 4)} tokens) │`,
      );
      console.log(
        `  │   Component config:      ${String(p.componentConfig).padStart(3)}%  (~${Math.round(tu.output.total.componentConfig / 4)} tokens) │`,
      );
      console.log(
        `  │   Supplemental styling:  ${String(p.supplementalStyling).padStart(3)}%  (~${Math.round(tu.output.total.supplementalStyling / 4)} tokens) │`,
      );
      console.log(
        `  │   Content authoring:     ${String(p.contentAuthoring).padStart(3)}%  (~${Math.round(tu.output.total.contentAuthoring / 4)} tokens) │`,
      );
      console.log(
        `  │   Business logic:        ${String(p.businessLogic).padStart(3)}%  (~${Math.round(tu.output.total.businessLogic / 4)} tokens) │`,
      );
      console.log(
        `  │   Boilerplate:           ${String(p.boilerplate).padStart(3)}%  (~${Math.round(tu.output.total.boilerplate / 4)} tokens) │`,
      );
      console.log(`  │   ─────────────────────────────                 │`);
      console.log(
        `  │   Output subtotal:  ${String(outputTokens).padStart(6)} tokens             │`,
      );
    }
    console.log(`  ├─────────────────────────────────────────────────┤`);
    console.log(
      `  │ TOTAL:              ${String(tu.grandTotal).padStart(6)} tokens             │`,
    );
    console.log(`  └─────────────────────────────────────────────────┘`);
  } else if (agg.jobStats) {
    // Fallback: just show job breakdown if no full token usage
    console.log(`\n🔧 Job Breakdown (output token distribution):`);
    const p = agg.jobStats.percentages;
    console.log(
      `  Library imports:       ${String(p.componentRouting).padStart(3)}%`,
    );
    console.log(
      `  Component config:      ${String(p.componentConfig).padStart(3)}%`,
    );
    console.log(
      `  Supplemental styling:  ${String(p.supplementalStyling).padStart(3)}%`,
    );
    console.log(
      `  Content authoring:     ${String(p.contentAuthoring).padStart(3)}%`,
    );
    console.log(
      `  Business logic:        ${String(p.businessLogic).padStart(3)}%`,
    );
    console.log(
      `  Boilerplate:           ${String(p.boilerplate).padStart(3)}%`,
    );
    console.log(
      `  Total chars: ${agg.jobStats.total.total} (~${Math.round(agg.jobStats.total.total / 4)} tokens)`,
    );
  }

  // Degradation curve (if present)
  if (agg.byTrajectoryDepth && Object.keys(agg.byTrajectoryDepth).length > 0) {
    console.log(`\n📉 Degradation Curve (success rate by conversation depth):`);
    const depths = Object.keys(agg.byTrajectoryDepth)
      .map(Number)
      .sort((a, b) => a - b);
    for (const depth of depths) {
      const stats = agg.byTrajectoryDepth[depth];
      const bar = '█'.repeat(Math.round(stats.rate / 5));
      const tierBar = `🥇${stats.tiers.gold} 🟢${stats.tiers.green} 🟡${stats.tiers.yellow} 🔴${stats.tiers.red}`;
      console.log(
        `  Turn ${String(depth).padStart(2)}: ${bar.padEnd(20)} ${stats.rate}% (${stats.success}/${stats.total}) [${tierBar}]`,
      );
    }
    if (agg.degradationCliff !== undefined) {
      console.log(
        `  ⚠️  Degradation cliff at turn ${agg.degradationCliff} (success dropped below 80%)`,
      );
    } else {
      console.log(
        `  ✓ No degradation cliff detected (maintained ≥80% throughout)`,
      );
    }
  }

  if (Object.keys(agg.criticalIssues).length > 0) {
    console.log(`\n❌ Critical Issues (break functionality):`);
    for (const [type, count] of Object.entries(agg.criticalIssues)) {
      console.log(`  - ${type}: ${count}`);
    }
  }

  if (Object.keys(agg.antiPatterns).length > 0) {
    console.log(`\n⚠️  Anti-Patterns (break theming):`);
    for (const [type, count] of Object.entries(agg.antiPatterns)) {
      console.log(`  - ${type}: ${count}`);
    }
  }

  // Quality assessment results (if present)
  if (agg.quality) {
    const q = agg.quality;
    console.log(`\n🔬 Quality Assessment (${q.assessed} assessed):`);
    console.log(`  Overall Scores:`);
    console.log(
      `    ✓ Good: ${q.byScore.good}  ⚠ Needs Work: ${q.byScore['needs-work']}  ✗ Poor: ${q.byScore.poor}`,
    );
    console.log(`  By Category:`);
    console.log(
      `    Accessibility:  ${q.accessibility.totalIssues} issues (${q.accessibility.criticalIssues} critical)`,
    );
    console.log(
      `    Design System:  ${q.designSystem.totalIssues} issues (${q.designSystem.criticalIssues} critical)`,
    );
    console.log(
      `    Code Quality:   ${q.codeQuality.totalIssues} issues (${q.codeQuality.criticalIssues} critical)`,
    );
  }

  if (Object.keys(agg.acceptableEscapeHatches).length > 0) {
    console.log(`\n✓ Acceptable Escape Hatches:`);
    for (const [type, count] of Object.entries(agg.acceptableEscapeHatches)) {
      console.log(`  - ${type}: ${count}`);
    }
  }

  if (agg.gaps.length > 0) {
    console.log(`\n💡 Gap Suggestions (component/API improvements):`);
    for (const gap of agg.gaps.slice(0, 5)) {
      const typeIcon =
        gap.type === 'new_component'
          ? '📦'
          : gap.type === 'new_prop'
            ? '🔧'
            : gap.type === 'new_variant'
              ? '🎨'
              : '📝';
      console.log(
        `  ${typeIcon} [${gap.effort}] ${gap.suggestion} (seen ${gap.frequency}x)`,
      );
    }
  }

  if (Object.keys(agg.byPersona).length > 1) {
    console.log(`\nBy Persona:`);
    for (const [persona, stats] of Object.entries(agg.byPersona)) {
      console.log(
        `  ${persona.padEnd(15)} ${stats.rate}% (${stats.success}/${stats.total})`,
      );
    }
  }

  console.log(`\n`);
}

function generateHtmlReport(
  iterationId: string,
  agg: AggregateResult,
  results: (TestResult & {target?: string})[],
): string {
  const escapeHtml = (str: string | undefined) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const categoryRows = Object.entries(agg.byCategory)
    .map(
      ([cat, stats]) => `
      <tr>
        <td>${escapeHtml(cat)}</td>
        <td>
          <div class="tier-bar">
            <span class="tier gold" style="width: ${(stats.tiers.gold / stats.total) * 100}%"></span>
            <span class="tier green" style="width: ${(stats.tiers.green / stats.total) * 100}%"></span>
            <span class="tier yellow" style="width: ${(stats.tiers.yellow / stats.total) * 100}%"></span>
            <span class="tier red" style="width: ${(stats.tiers.red / stats.total) * 100}%"></span>
          </div>
        </td>
        <td>${stats.rate}%</td>
        <td>${stats.success}/${stats.total}</td>
        <td class="tier-counts">
          <span class="tier-label gold">${stats.tiers.gold}</span>
          <span class="tier-label green">${stats.tiers.green}</span>
          <span class="tier-label yellow">${stats.tiers.yellow}</span>
          <span class="tier-label red">${stats.tiers.red}</span>
        </td>
        <td>${stats.avgDurationMs > 0 ? (stats.avgDurationMs / 1000).toFixed(1) + 's' : '-'}</td>
      </tr>
    `,
    )
    .join('');

  const criticalRows = Object.entries(agg.criticalIssues)
    .map(
      ([type, count]) =>
        `<li><strong>${escapeHtml(type)}</strong>: ${count}</li>`,
    )
    .join('');

  const antiPatternRows = Object.entries(agg.antiPatterns)
    .map(
      ([type, count]) =>
        `<li><strong>${escapeHtml(type)}</strong>: ${count}</li>`,
    )
    .join('');

  const acceptableRows = Object.entries(agg.acceptableEscapeHatches)
    .map(([type, count]) => `<li>${escapeHtml(type)}: ${count}</li>`)
    .join('');

  const gapRows = agg.gaps
    .map(gap => {
      const typeLabel =
        gap.type === 'new_component'
          ? 'New Component'
          : gap.type === 'new_prop'
            ? 'New Prop'
            : gap.type === 'new_variant'
              ? 'New Variant'
              : 'Documentation';
      return `
      <tr>
        <td><span class="badge gap-type">${typeLabel}</span></td>
        <td>${escapeHtml(gap.suggestion)}</td>
        <td>${gap.frequency}x</td>
        <td><span class="badge effort-${gap.effort}">${gap.effort}</span></td>
      </tr>
    `;
    })
    .join('');

  // Generate degradation line graph data if available
  let degradationGraphHtml = '';
  if (agg.testProgressions && agg.testProgressions.length > 0) {
    // Map tier to numeric value for graphing (higher = better)
    const tierToValue = (tier: ResultTier): number => {
      switch (tier) {
        case 'gold':
          return 100;
        case 'green':
          return 75;
        case 'yellow':
          return 50;
        case 'red':
          return 0;
      }
    };

    const tierToColor = (tier: ResultTier): string => {
      switch (tier) {
        case 'gold':
          return '#f59e0b';
        case 'green':
          return '#22c55e';
        case 'yellow':
          return '#eab308';
        case 'red':
          return '#ef4444';
      }
    };

    // Get all unique depths and sort them
    const allDepths = new Set<number>();
    for (const prog of agg.testProgressions) {
      for (const turn of prog.turns) {
        allDepths.add(turn.depth);
      }
    }
    const depths = Array.from(allDepths).sort((a, b) => a - b);

    // SVG dimensions
    const svgWidth = 800;
    const svgHeight = 400;
    const padding = {top: 40, right: 120, bottom: 60, left: 60};
    const graphWidth = svgWidth - padding.left - padding.right;
    const graphHeight = svgHeight - padding.top - padding.bottom;

    // X scale
    const xStep = graphWidth / (depths.length - 1 || 1);
    const xPos = (depthIndex: number) => padding.left + depthIndex * xStep;

    // Y scale (0-100)
    const yPos = (value: number) =>
      padding.top + graphHeight - (value / 100) * graphHeight;

    // Generate unique colors for each test
    const colors = [
      '#6366f1',
      '#ec4899',
      '#14b8a6',
      '#f97316',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f43f5e',
      '#0ea5e9',
      '#a855f7',
    ];

    // Build SVG paths and legends
    let paths = '';
    let legends = '';
    let legendY = padding.top;

    agg.testProgressions.forEach((prog, idx) => {
      const color = colors[idx % colors.length];
      const points: string[] = [];

      for (const turn of prog.turns) {
        const depthIndex = depths.indexOf(turn.depth);
        if (depthIndex !== -1) {
          const x = xPos(depthIndex);
          const y = yPos(tierToValue(turn.tier));
          points.push(`${x},${y}`);
        }
      }

      if (points.length > 1) {
        paths += `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.7" />`;
        // Add dots at each point
        for (const turn of prog.turns) {
          const depthIndex = depths.indexOf(turn.depth);
          if (depthIndex !== -1) {
            const x = xPos(depthIndex);
            const y = yPos(tierToValue(turn.tier));
            paths += `<circle cx="${x}" cy="${y}" r="4" fill="${tierToColor(turn.tier)}" stroke="${color}" stroke-width="1" />`;
          }
        }
      }

      // Legend entry
      legends += `
        <g transform="translate(${svgWidth - padding.right + 10}, ${legendY})">
          <line x1="0" y1="0" x2="20" y2="0" stroke="${color}" stroke-width="2" />
          <text x="25" y="4" font-size="11" fill="#333">${escapeHtml(prog.promptId.slice(0, 15))}</text>
        </g>
      `;
      legendY += 20;
    });

    // Build X axis labels
    let xAxisLabels = '';
    depths.forEach((depth, idx) => {
      const x = xPos(idx);
      xAxisLabels += `
        <text x="${x}" y="${svgHeight - padding.bottom + 20}" text-anchor="middle" font-size="12" fill="#666">Turn ${depth}</text>
      `;
    });

    // Build Y axis labels and gridlines
    let yAxisContent = '';
    const yTicks = [0, 25, 50, 75, 100];
    const yLabels: Record<number, string> = {
      0: 'Red',
      25: '',
      50: 'Yellow',
      75: 'Green',
      100: 'Gold',
    };
    yTicks.forEach(tick => {
      const y = yPos(tick);
      yAxisContent += `
        <line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-dasharray="4" />
        <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#666">${yLabels[tick] || ''}</text>
      `;
    });

    degradationGraphHtml = `
  <div class="card">
    <h2>📉 Degradation Progression</h2>
    <p style="color: #666; font-size: 0.9em;">Each line shows a test's quality tier across conversation turns (probe points at turns 0, 6, 8, 10).</p>
    <svg width="${svgWidth}" height="${svgHeight}" style="max-width: 100%; height: auto;">
      <!-- Grid and axes -->
      ${yAxisContent}
      <line x1="${padding.left}" y1="${svgHeight - padding.bottom}" x2="${svgWidth - padding.right}" y2="${svgHeight - padding.bottom}" stroke="#333" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${svgHeight - padding.bottom}" stroke="#333" />
      ${xAxisLabels}
      <!-- Data lines -->
      ${paths}
      <!-- Legend -->
      ${legends}
    </svg>
    ${
      agg.degradationCliff !== undefined
        ? `<p style="color: #dc2626; margin-top: 12px;">⚠️ Degradation cliff detected at turn ${agg.degradationCliff} (aggregate success dropped below 80%)</p>`
        : `<p style="color: #16a34a; margin-top: 12px;">✓ No degradation cliff detected (maintained ≥80% success throughout)</p>`
    }
  </div>
    `;
  }

  const testRows = results
    .map(r => {
      const tier = calculateTier(r.evaluation);
      const tierClass = `tier-${tier}`;
      const tierIcon =
        tier === 'gold'
          ? '🥇'
          : tier === 'green'
            ? '🟢'
            : tier === 'yellow'
              ? '🟡'
              : '🔴';
      const escapeHatchBadges = r.evaluation.escapeHatches
        .map(rawH => {
          const h = normalizeEscapeHatch(rawH);
          const isAntiPattern = ANTI_PATTERN_HATCHES.includes(h.type);
          const badgeClass =
            h.severity === 'critical'
              ? 'critical'
              : isAntiPattern
                ? 'anti-pattern'
                : 'acceptable';
          return `<span class="badge ${badgeClass}">${escapeHtml(h.type)}</span>`;
        })
        .join(' ');
      const durationStr = r.durationMs
        ? `${(r.durationMs / 1000).toFixed(1)}s`
        : '-';

      // Calculate per-test token breakdown
      const jobBreakdown = analyzeJobBreakdown(r.response, r.target || 'xds');
      const inputBreakdown = estimateInputTokens(r.docsRead);
      const outputTokens = Math.round(jobBreakdown.total / 4);
      const totalTokens = inputBreakdown.total + outputTokens;

      // Build token breakdown tooltip content
      const tokenDetails = `Input: ${inputBreakdown.total} (AGENTS: ${inputBreakdown.agentsMd}, Design: ${inputBreakdown.designDocs}, Components: ${inputBreakdown.componentDocs})&#10;Output: ${outputTokens} (Routing: ${Math.round(jobBreakdown.componentRouting / 4)}, Config: ${Math.round(jobBreakdown.componentConfig / 4)}, Styling: ${Math.round(jobBreakdown.supplementalStyling / 4)}, Content: ${Math.round(jobBreakdown.contentAuthoring / 4)}, Logic: ${Math.round(jobBreakdown.businessLogic / 4)}, Boilerplate: ${Math.round(jobBreakdown.boilerplate / 4)})`;

      // Docs read badges
      const docsReadBadges = r.docsRead
        ? r.docsRead
            .map(
              d =>
                `<span class="badge doc-badge">${escapeHtml(d.replace('.md', ''))}</span>`,
            )
            .join(' ')
        : '-';

      return `
      <tr class="${tierClass}">
        <td><span class="tier-icon">${tierIcon}</span></td>
        <td>${escapeHtml(r.promptCategory)}</td>
        <td class="prompt-cell">${escapeHtml(r.prompt)}</td>
        <td>${escapeHatchBadges || '-'}</td>
        <td>${durationStr}</td>
        <td title="${tokenDetails}" style="cursor: help;">${totalTokens} <span style="color: #666; font-size: 0.8em;">(${inputBreakdown.total}/${outputTokens})</span></td>
        <td class="docs-cell">${docsReadBadges}</td>
        <td>
          <button class="toggle-code" onclick="toggleCode('${r.id}')">View Code</button>
          <pre class="code-block" id="code-${r.id}" style="display:none"><code>${escapeHtml(r.response)}</code></pre>
        </td>
      </tr>
    `;
    })
    .join('');

  const totalSecs = agg.totalDurationMs
    ? (agg.totalDurationMs / 1000).toFixed(1)
    : '-';
  // Use tokenUsage.grandTotal (calculated from docs read + job breakdown) instead of raw totals
  const totalTokens =
    agg.tokenUsage?.grandTotal ?? agg.totalInputTokens + agg.totalOutputTokens;

  // Generate token usage breakdown HTML
  let tokenUsageHtml = '';
  if (agg.tokenUsage) {
    const tu = agg.tokenUsage;
    const outputTokens = Math.round(tu.output.total.total / 4);
    const jobRows = agg.jobStats
      ? `
      <tr>
        <td><strong>Library Imports</strong><br><span class="job-desc">Import statements for design system components</span></td>
        <td>${agg.jobStats.percentages.componentRouting}%</td>
        <td>~${Math.round(tu.output.total.componentRouting / 4)}</td>
      </tr>
      <tr>
        <td><strong>Component Config</strong><br><span class="job-desc">Props and attributes on components</span></td>
        <td>${agg.jobStats.percentages.componentConfig}%</td>
        <td>~${Math.round(tu.output.total.componentConfig / 4)}</td>
      </tr>
      <tr>
        <td><strong>Supplemental Styling</strong><br><span class="job-desc">StyleX blocks for layout/spacing gaps</span></td>
        <td>${agg.jobStats.percentages.supplementalStyling}%</td>
        <td>~${Math.round(tu.output.total.supplementalStyling / 4)}</td>
      </tr>
      <tr>
        <td><strong>Content Authoring</strong><br><span class="job-desc">HTML structure, JSX elements, copy</span></td>
        <td>${agg.jobStats.percentages.contentAuthoring}%</td>
        <td>~${Math.round(tu.output.total.contentAuthoring / 4)}</td>
      </tr>
      <tr>
        <td><strong>Business Logic</strong><br><span class="job-desc">useState, handlers, API calls, conditionals</span></td>
        <td>${agg.jobStats.percentages.businessLogic}%</td>
        <td>~${Math.round(tu.output.total.businessLogic / 4)}</td>
      </tr>
      <tr>
        <td><strong>Boilerplate</strong><br><span class="job-desc">Type definitions, imports, exports</span></td>
        <td>${agg.jobStats.percentages.boilerplate}%</td>
        <td>~${Math.round(tu.output.total.boilerplate / 4)}</td>
      </tr>
    `
      : '';

    // Input token descriptions
    const inputRows = `
      <tr>
        <td><strong>Agent Docs</strong><br><span class="job-desc">Component catalog and design system guidance</span></td>
        <td>${tu.input.total.agentsMd}</td>
      </tr>
      <tr>
        <td><strong>Design docs</strong><br><span class="job-desc">principles.md, tokens.md - styling patterns</span></td>
        <td>${tu.input.total.designDocs}</td>
      </tr>
      <tr>
        <td><strong>Component docs</strong><br><span class="job-desc">Button.md, TextInput.md, etc.</span></td>
        <td>${tu.input.total.componentDocs}</td>
      </tr>
      <tr>
        <td><strong>Prompt overhead</strong><br><span class="job-desc">Task instructions and persona</span></td>
        <td>${tu.input.total.promptOverhead}</td>
      </tr>
      <tr style="font-weight: bold; border-top: 2px solid #333;"><td>Input Subtotal</td><td>${tu.input.total.total}</td></tr>
    `;

    tokenUsageHtml = `
  <div class="card">
    <h2>📊 Token Usage Breakdown</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h3 style="margin-top: 0;">Input Tokens (estimated)</h3>
        <table>
          <thead><tr><th>Source</th><th>Tokens</th></tr></thead>
          <tbody>
            ${inputRows}
          </tbody>
        </table>
      </div>
      <div>
        <h3 style="margin-top: 0;">Output Tokens (by job)</h3>
        <table>
          <thead><tr><th>Job</th><th>%</th><th>Tokens</th></tr></thead>
          <tbody>
            ${jobRows}
            <tr style="font-weight: bold; border-top: 2px solid #333;"><td>Output Subtotal</td><td>100%</td><td>${outputTokens}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div style="text-align: center; margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px;">
      <span style="font-size: 1.2em; font-weight: bold;">Total: ${tu.grandTotal.toLocaleString()} tokens</span>
      <span style="color: #666; margin-left: 12px;">(${tu.input.total.total} input + ${outputTokens} output)</span>
    </div>
  </div>
    `;
  }

  // Generate quality assessment HTML if present
  let qualityHtml = '';
  if (agg.quality) {
    const q = agg.quality;
    const scoreBar = (good: number, needsWork: number, poor: number) => {
      const total = good + needsWork + poor;
      if (total === 0) return '';
      return `
        <div class="score-bar">
          <span class="score good" style="width: ${(good / total) * 100}%"></span>
          <span class="score needs-work" style="width: ${(needsWork / total) * 100}%"></span>
          <span class="score poor" style="width: ${(poor / total) * 100}%"></span>
        </div>
      `;
    };

    qualityHtml = `
  <div class="card">
    <h2>🔬 Quality Assessment</h2>
    <p style="color: #666; font-size: 0.9em;">${q.assessed} of ${agg.totalTests} tests assessed by quality agent.</p>

    <div class="quality-grid">
      <div class="quality-stat">
        <div class="quality-label">Overall</div>
        ${scoreBar(q.byScore.good, q.byScore['needs-work'], q.byScore.poor)}
        <div class="quality-counts">
          <span class="score-label good">✓ ${q.byScore.good} Good</span>
          <span class="score-label needs-work">⚠ ${q.byScore['needs-work']} Needs Work</span>
          <span class="score-label poor">✗ ${q.byScore.poor} Poor</span>
        </div>
      </div>
    </div>

    <table style="margin-top: 16px;">
      <thead>
        <tr><th>Category</th><th>Good</th><th>Needs Work</th><th>Poor</th><th>Issues</th><th>Critical</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>♿ Accessibility</td>
          <td style="color: #16a34a;">${q.accessibility.byScore.good}</td>
          <td style="color: #ca8a04;">${q.accessibility.byScore['needs-work']}</td>
          <td style="color: #dc2626;">${q.accessibility.byScore.poor}</td>
          <td>${q.accessibility.totalIssues}</td>
          <td style="color: ${q.accessibility.criticalIssues > 0 ? '#dc2626' : '#666'};">${q.accessibility.criticalIssues}</td>
        </tr>
        <tr>
          <td>🎨 Design System</td>
          <td style="color: #16a34a;">${q.designSystem.byScore.good}</td>
          <td style="color: #ca8a04;">${q.designSystem.byScore['needs-work']}</td>
          <td style="color: #dc2626;">${q.designSystem.byScore.poor}</td>
          <td>${q.designSystem.totalIssues}</td>
          <td style="color: ${q.designSystem.criticalIssues > 0 ? '#dc2626' : '#666'};">${q.designSystem.criticalIssues}</td>
        </tr>
        <tr>
          <td>🔧 Code Quality</td>
          <td style="color: #16a34a;">${q.codeQuality.byScore.good}</td>
          <td style="color: #ca8a04;">${q.codeQuality.byScore['needs-work']}</td>
          <td style="color: #dc2626;">${q.codeQuality.byScore.poor}</td>
          <td>${q.codeQuality.totalIssues}</td>
          <td style="color: ${q.codeQuality.criticalIssues > 0 ? '#dc2626' : '#666'};">${q.codeQuality.criticalIssues}</td>
        </tr>
      </tbody>
    </table>
  </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vibe Test Results - ${escapeHtml(iterationId)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1, h2, h3 { color: #333; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-box {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .stat-value { font-size: 1.8em; font-weight: bold; color: #333; }
    .stat-label { color: #666; font-size: 0.85em; }
    .tier-stats { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .tier-stat { text-align: center; padding: 12px 16px; border-radius: 6px; }
    .tier-stat.gold { background: #fef3c7; }
    .tier-stat.green { background: #dcfce7; }
    .tier-stat.yellow { background: #fef9c3; }
    .tier-stat.red { background: #fee2e2; }
    .tier-stat .value { font-size: 1.5em; font-weight: bold; }
    .tier-stat .label { font-size: 0.8em; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .tier-bar {
      display: flex;
      width: 100px;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .tier-bar .tier { height: 100%; }
    .tier-bar .tier.gold { background: #f59e0b; }
    .tier-bar .tier.green { background: #22c55e; }
    .tier-bar .tier.yellow { background: #eab308; }
    .tier-bar .tier.red { background: #ef4444; }
    .tier-counts { white-space: nowrap; }
    .tier-label { display: inline-block; width: 20px; text-align: center; font-size: 0.8em; padding: 2px 4px; border-radius: 4px; margin: 0 1px; }
    .tier-label.gold { background: #fef3c7; }
    .tier-label.green { background: #dcfce7; }
    .tier-label.yellow { background: #fef9c3; }
    .tier-label.red { background: #fee2e2; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75em;
      margin: 2px;
    }
    .badge.critical { background: #fee2e2; color: #dc2626; }
    .badge.anti-pattern { background: #fef9c3; color: #ca8a04; }
    .badge.acceptable { background: #e0f2fe; color: #0369a1; }
    .badge.doc-badge { background: #f3f4f6; color: #374151; font-size: 0.75em; }
    .badge.gap-type { background: #e0e7ff; color: #4338ca; }
    .badge.effort-trivial { background: #dcfce7; color: #16a34a; }
    .badge.effort-moderate { background: #fef3c7; color: #d97706; }
    .badge.effort-significant { background: #fee2e2; color: #dc2626; }
    .docs-cell { max-width: 200px; }
    .job-desc { font-size: 0.8em; color: #666; font-weight: normal; }
    .quality-grid { display: flex; gap: 16px; flex-wrap: wrap; }
    .quality-stat { flex: 1; min-width: 200px; }
    .quality-label { font-weight: 600; margin-bottom: 8px; }
    .score-bar { display: flex; width: 100%; height: 12px; border-radius: 6px; overflow: hidden; background: #e5e7eb; }
    .score-bar .score { height: 100%; }
    .score-bar .score.good { background: #22c55e; }
    .score-bar .score.needs-work { background: #eab308; }
    .score-bar .score.poor { background: #ef4444; }
    .quality-counts { margin-top: 8px; font-size: 0.85em; }
    .score-label { margin-right: 12px; }
    .score-label.good { color: #16a34a; }
    .score-label.needs-work { color: #ca8a04; }
    .score-label.poor { color: #dc2626; }
    tr.tier-gold { background: #fffbeb; }
    tr.tier-green { background: #f0fdf4; }
    tr.tier-yellow { background: #fefce8; }
    tr.tier-red { background: #fef2f2; }
    .tier-icon { font-size: 1.2em; }
    .prompt-cell { max-width: 300px; }
    .toggle-code {
      background: #e5e7eb;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .toggle-code:hover { background: #d1d5db; }
    .code-block {
      margin-top: 8px;
      padding: 12px;
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 6px;
      overflow-x: auto;
      max-height: 400px;
      font-size: 0.85em;
    }
    .issues-list { list-style: none; padding: 0; }
    .issues-list li { padding: 4px 0; }
    .issues-list.critical li { color: #dc2626; }
    .issues-list.anti-pattern li { color: #ca8a04; }
    .timestamp { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Vibe Test Results</h1>
  <p class="timestamp">Iteration: ${escapeHtml(iterationId)} | Generated: ${new Date().toISOString()}</p>

  <div class="card">
    <h2>Quality Tiers</h2>
    <div class="tier-stats">
      <div class="tier-stat gold">
        <div class="value">${agg.tiers.gold}</div>
        <div class="label">🥇 Gold (${agg.tierRate.gold}%)</div>
      </div>
      <div class="tier-stat green">
        <div class="value">${agg.tiers.green}</div>
        <div class="label">🟢 Green (${agg.tierRate.green}%)</div>
      </div>
      <div class="tier-stat yellow">
        <div class="value">${agg.tiers.yellow}</div>
        <div class="label">🟡 Yellow (${agg.tierRate.yellow}%)</div>
      </div>
      <div class="tier-stat red">
        <div class="value">${agg.tiers.red}</div>
        <div class="label">🔴 Red (${agg.tierRate.red}%)</div>
      </div>
    </div>
    <p style="text-align: center; color: #666; margin-top: 12px; font-size: 0.85em;">
      Gold = Pure design system | Green = Acceptable escape hatches | Yellow = Anti-patterns (break theming) | Red = Critical failures
    </p>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value" style="color: ${agg.successRate >= 80 ? '#22c55e' : agg.successRate >= 50 ? '#eab308' : '#ef4444'}">${agg.successRate}%</div>
      <div class="stat-label">Success Rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${agg.totalTests}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${totalSecs}s</div>
      <div class="stat-label">Total Time</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${totalTokens.toLocaleString()}</div>
      <div class="stat-label">Total Tokens</div>
    </div>
  </div>

  <div class="card">
    <h2>Results by Category</h2>
    <table>
      <thead>
        <tr><th>Category</th><th>Tiers</th><th>Rate</th><th>Count</th><th>Breakdown</th><th>Avg Time</th></tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </div>

  ${tokenUsageHtml}

  ${qualityHtml}

  ${degradationGraphHtml}

  ${
    criticalRows
      ? `
  <div class="card">
    <h2>❌ Critical Issues (break functionality)</h2>
    <ul class="issues-list critical">${criticalRows}</ul>
  </div>
  `
      : ''
  }

  ${
    antiPatternRows
      ? `
  <div class="card">
    <h2>⚠️ Anti-Patterns (break theming)</h2>
    <p style="color: #666; font-size: 0.9em;">These patterns use hardcoded values instead of CSS variables, breaking theme support.</p>
    <ul class="issues-list anti-pattern">${antiPatternRows}</ul>
  </div>
  `
      : ''
  }

  ${
    acceptableRows
      ? `
  <div class="card">
    <h2>✓ Acceptable Escape Hatches</h2>
    <ul class="issues-list">${acceptableRows}</ul>
  </div>
  `
      : ''
  }

  ${
    gapRows
      ? `
  <div class="card">
    <h2>💡 Gap Suggestions</h2>
    <p style="color: #666; font-size: 0.9em;">Component or API improvements to reduce escape hatches.</p>
    <table>
      <thead>
        <tr><th>Type</th><th>Suggestion</th><th>Frequency</th><th>Effort</th></tr>
      </thead>
      <tbody>${gapRows}</tbody>
    </table>
  </div>
  `
      : ''
  }

  <div class="card">
    <h2>Individual Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Tier</th>
          <th>Category</th>
          <th>Prompt</th>
          <th>Escape Hatches</th>
          <th>Time</th>
          <th>Tokens (in/out)</th>
          <th>Docs Read</th>
          <th>Response</th>
        </tr>
      </thead>
      <tbody>${testRows}</tbody>
    </table>
  </div>

  <script>
    function toggleCode(id) {
      const el = document.getElementById('code-' + id);
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  </script>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const iterationIndex = args.indexOf('--iteration');
  const jsonMode = args.includes('--json');
  const ciMode = args.includes('--ci');

  if (iterationIndex === -1 || !args[iterationIndex + 1]) {
    console.error(
      'Usage: aggregate --iteration <iteration-id> [--json] [--ci]',
    );
    process.exit(1);
  }

  const iterationId = args[iterationIndex + 1];
  const resultsDir = path.join(getResultsDir(), iterationId);

  try {
    // Read results for HTML report (uses individual files or runs.jsonl)
    const results = loadResults(resultsDir);

    const agg = aggregate(iterationId);

    // JSON mode: output only JSON to stdout
    if (jsonMode) {
      console.log(JSON.stringify(agg, null, 2));
      return;
    }

    // CI mode: output GitHub Actions format
    if (ciMode) {
      // Write to GITHUB_OUTPUT if available
      const githubOutput = process.env.GITHUB_OUTPUT;
      const lines = [
        `iteration_id=${agg.iterationId}`,
        `success_rate=${agg.successRate}`,
        `total_tests=${agg.totalTests}`,
        `gold=${agg.tiers.gold}`,
        `green=${agg.tiers.green}`,
        `yellow=${agg.tiers.yellow}`,
        `red=${agg.tiers.red}`,
      ];

      if (githubOutput) {
        fs.appendFileSync(githubOutput, lines.join('\n') + '\n');
      }

      // Also print to stdout for logging
      console.log('::group::Vibe Test Results');
      printReport(agg);
      console.log('::endgroup::');

      // Set job summary if available
      const summaryPath = process.env.GITHUB_STEP_SUMMARY;
      if (summaryPath) {
        const summary = `## Vibe Test Results

| Metric | Value |
|--------|-------|
| Success Rate | ${agg.successRate}% |
| Total Tests | ${agg.totalTests} |
| 🥇 Gold | ${agg.tiers.gold} (${agg.tierRate.gold}%) |
| 🟢 Green | ${agg.tiers.green} (${agg.tierRate.green}%) |
| 🟡 Yellow | ${agg.tiers.yellow} (${agg.tierRate.yellow}%) |
| 🔴 Red | ${agg.tiers.red} (${agg.tierRate.red}%) |
`;
        fs.appendFileSync(summaryPath, summary);
      }
    } else {
      printReport(agg);
    }

    // Save aggregated results
    writeJson(path.join(resultsDir, 'aggregate.json'), agg);
    console.log(`Saved: ${path.join(resultsDir, 'aggregate.json')}`);

    // Generate HTML report
    const htmlReport = generateHtmlReport(iterationId, agg, results);
    const htmlPath = path.join(resultsDir, 'report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`HTML Report: ${htmlPath}`);

    if (!ciMode) {
      console.log(`\nOpen in browser: file://${htmlPath}`);
    }

    // Exit with error if there are critical failures (for CI)
    if (ciMode && agg.tiers.red > 0) {
      console.log(`::error::${agg.tiers.red} critical failures detected`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main().catch(console.error);
