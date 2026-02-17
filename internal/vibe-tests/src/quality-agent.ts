/**
 * @file Quality Assessment Agent
 * @description Evaluates generated code for accessibility, design system adherence, and code quality
 */

import fs from 'fs';
import path from 'path';
import type {QualityAssessment} from './types.js';

interface ComponentA11yInfo {
  component: string;
  builtIn: string[];
  keyboard: string[];
  developerMust: string[];
  notes: string[];
}

interface A11yManifest {
  source: string;
  generatedAt: string;
  version: string;
  components: Record<string, ComponentA11yInfo>;
}

const MANIFESTS_DIR = path.join(import.meta.dirname, '..', 'a11y-manifests');

/**
 * Load accessibility manifest for a target
 */
function loadA11yManifest(target: 'xds' | 'baseline'): A11yManifest | null {
  const manifestPath = path.join(MANIFESTS_DIR, `${target}.json`);
  if (!fs.existsSync(manifestPath)) {
    console.warn(`A11y manifest not found: ${manifestPath}`);
    console.warn('Run: yarn generate-a11y-manifest');
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Extract component names from code to find relevant a11y info
 */
function extractComponentNames(
  code: string,
  target: 'xds' | 'baseline',
): string[] {
  const components: string[] = [];

  if (target === 'xds') {
    // Match XDS component imports and usages
    const xdsPattern = /XDS\w+/g;
    const matches = code.match(xdsPattern) || [];
    components.push(...new Set(matches.map(m => m.replace(/^XDS/, ''))));
  } else {
    // Match shadcn component imports
    const importPattern = /from\s+["']@\/components\/ui\/(\w+)["']/g;
    let match;
    while ((match = importPattern.exec(code)) !== null) {
      components.push(match[1].charAt(0).toUpperCase() + match[1].slice(1));
    }
    // Also match common component names in JSX
    const jsxPattern =
      /<(Button|Input|Card|Dialog|Select|Checkbox|Switch|Tabs|Badge|Avatar|Progress|Table|Tooltip|Popover|DropdownMenu)\b/g;
    while ((match = jsxPattern.exec(code)) !== null) {
      if (!components.includes(match[1])) {
        components.push(match[1]);
      }
    }
  }

  return components;
}

/**
 * Generate accessibility context from manifest
 */
function generateA11yContext(
  manifest: A11yManifest,
  componentNames: string[],
  target: 'xds' | 'baseline',
): string {
  const lines: string[] = [];
  const targetName = target === 'xds' ? 'XDS' : 'shadcn/Radix';

  lines.push(`## Built-in Accessibility (${targetName})`);
  lines.push('');
  lines.push(`**Source:** ${manifest.source}`);
  lines.push(`**Generated:** ${manifest.generatedAt}`);
  lines.push('');
  lines.push(
    'IMPORTANT: Do NOT flag accessibility issues that are already handled by the component library.',
  );
  lines.push("Only flag issues that are the developer's responsibility.");
  lines.push('');

  // Add info for detected components
  const relevantComponents = componentNames
    .map(name => {
      // Try exact match first, then case-insensitive
      return (
        manifest.components[name] ||
        Object.values(manifest.components).find(
          c => c.component.toLowerCase() === name.toLowerCase(),
        )
      );
    })
    .filter(Boolean) as ComponentA11yInfo[];

  if (relevantComponents.length > 0) {
    lines.push('### Components used in this code:');
    lines.push('');

    for (const comp of relevantComponents) {
      lines.push(`**${comp.component}:**`);
      if (comp.builtIn.length > 0) {
        lines.push(
          "- Built-in (don't flag): " + comp.builtIn.slice(0, 3).join('; '),
        );
      }
      if (comp.developerMust.length > 0) {
        lines.push(
          '- Developer must provide: ' + comp.developerMust.join('; '),
        );
      }
      lines.push('');
    }
  }

  // Add general guidance
  lines.push('### General developer responsibilities (always check):');
  lines.push('- aria-label for icon-only buttons');
  lines.push('- aria-live regions for dynamic content updates');
  lines.push('- Proper heading hierarchy');
  lines.push(
    '- Keyboard-accessible custom interactive elements (not using library components)',
  );
  lines.push('- Focus management for modals and dynamic content');
  lines.push('');

  return lines.join('\n');
}

/**
 * Persona prompt for the quality assessment agent
 */
export const QUALITY_AGENT_PERSONA = `You are a senior frontend engineer specializing in accessibility and design system compliance.

Your role is to review React components and provide objective, actionable feedback. You focus on:

1. **Accessibility** - WCAG compliance, keyboard navigation, screen reader support
2. **Design System Adherence** - Proper component usage, token usage, pattern consistency
3. **Code Quality** - State management, event handling, TypeScript correctness

## Review Guidelines

- Be thorough but fair - only flag genuine problems, not stylistic preferences
- Prioritize issues by severity (critical > moderate > minor)
- Provide specific, actionable recommendations
- Reference line numbers when possible
- Don't flag issues that are acceptable trade-offs (e.g., native HTML when no component exists)
- CRITICAL: Do NOT flag accessibility features that are built into the design system components

## Scoring

- **good**: No critical issues, few moderate issues, code follows best practices
- **needs-work**: Some moderate issues or patterns that could be improved
- **poor**: Critical issues present that would affect users or maintainability`;

/**
 * Generate the prompt for quality assessment
 */
export function generateQualityAssessmentPrompt(
  code: string,
  target: 'xds' | 'baseline',
  promptDescription: string,
): string {
  // Load accessibility manifest
  const manifest = loadA11yManifest(target);
  const componentNames = extractComponentNames(code, target);
  const a11yContext = manifest
    ? generateA11yContext(manifest, componentNames, target)
    : '';

  const designSystemContext =
    target === 'xds'
      ? `
## Design System Context (XDS)

The code should use:
- XDS components (XDSButton, XDSTextInput, XDSCard, etc.)
- StyleX for styling with CSS variable tokens (var(--spacing-*), var(--color-*))
- XDSTextInput should use \`status\` prop for validation errors (not manual border styling)
- Interactive elements should use Button components, not clickable divs/spans
- Layout should use XDSVStack, XDSHStack, XDSStackItem when appropriate

### Typography Requirements
- **XDSHeading** for all heading text (h1-h6), with \`level\` prop for semantic level and \`variant="editorial"\` for display-scale headings
- **XDSText** for all non-heading text, with \`type\` prop: \`body\`, \`large\`, \`label\`, \`supporting\`, or \`code\`
- **XDSFontWrapper** is a global provider that styles native HTML elements with proper typography — raw HTML is acceptable for prose/markdown content rendered within it
- For structured UI (cards, forms, dashboards), prefer XDSHeading/XDSText over raw HTML for access to props like \`weight\`, \`maxLines\`, \`variant\`, \`hasTabularNumbers\`
- Never hardcode fontSize, fontWeight, lineHeight, or fontFamily — use the component type system or design tokens
- Valid typography tokens: \`--text-*\` (sizes), \`--font-weight-*\` (weights), \`--leading-*\` (line heights), \`--font-body\`, \`--font-code\`, \`--font-heading\` (font families)
- Common hallucinated tokens to flag: \`--font-size-*\`, \`--font-family-*\`, \`--xds-font-*\` (these don't exist)`
      : `
## Design System Context (shadcn/Tailwind)

The code should use:
- shadcn components (Button, Input, Card, Dialog, etc.)
- Tailwind utility classes with semantic tokens (text-muted-foreground, bg-destructive, etc.)
- cn() utility for conditional class composition
- Proper component patterns (e.g., Dialog with DialogTrigger, DialogContent)`;

  return `${QUALITY_AGENT_PERSONA}

${designSystemContext}

${a11yContext}

## Component to Review

The following component was generated in response to: "${promptDescription}"

\`\`\`tsx
${code}
\`\`\`

## Your Task

Review this code and provide a quality assessment. Return your findings as a JSON object with this structure:

\`\`\`json
{
  "accessibility": {
    "issues": [
      {
        "severity": "critical|moderate|minor",
        "element": "<element name or description>",
        "issue": "<description of the issue>",
        "recommendation": "<how to fix it>",
        "lineNumber": <optional line number>
      }
    ],
    "score": "good|needs-work|poor"
  },
  "designSystemAdherence": {
    "issues": [
      {
        "severity": "critical|moderate|minor",
        "category": "component-usage|token-usage|pattern-violation|typography-violation",
        "issue": "<description of the issue>",
        "recommendation": "<how to fix it>",
        "codeSnippet": "<optional relevant code>"
      }
    ],
    "score": "good|needs-work|poor"
  },
  "codeQuality": {
    "issues": [
      {
        "severity": "critical|moderate|minor",
        "category": "state-management|event-handling|typescript|performance",
        "issue": "<description of the issue>",
        "recommendation": "<how to fix it>",
        "codeSnippet": "<optional relevant code>"
      }
    ],
    "score": "good|needs-work|poor"
  },
  "overallScore": "good|needs-work|poor",
  "summary": "<2-3 sentence summary of the review>"
}
\`\`\`

Only return the JSON object, no additional text.`;
}

/**
 * Parse the quality assessment response from the agent
 */
export function parseQualityAssessment(
  response: string,
): QualityAssessment | null {
  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : response.trim();

    const assessment = JSON.parse(jsonStr) as QualityAssessment;

    // Validate structure
    if (
      !assessment.accessibility ||
      !assessment.designSystemAdherence ||
      !assessment.codeQuality ||
      !assessment.overallScore
    ) {
      console.error('Invalid quality assessment structure');
      return null;
    }

    return assessment;
  } catch (error) {
    console.error('Failed to parse quality assessment:', error);
    return null;
  }
}

/**
 * Format severity with icon
 */
function severityIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'moderate':
      return '🟡';
    case 'minor':
      return '⚪';
    default:
      return '•';
  }
}

/**
 * Generate a summary of quality issues for display
 */
export function summarizeQualityIssues(
  assessment: QualityAssessment,
  options: {verbose?: boolean} = {},
): string {
  const lines: string[] = [];
  const {verbose = false} = options;

  lines.push(`Quality Assessment: ${assessment.overallScore.toUpperCase()}`);
  lines.push('');

  // Accessibility section
  const a11yIssues = assessment.accessibility.issues;
  if (a11yIssues.length > 0) {
    const critical = a11yIssues.filter(i => i.severity === 'critical').length;
    lines.push(
      `  Accessibility: ${assessment.accessibility.score} (${a11yIssues.length} issues, ${critical} critical)`,
    );
    if (verbose || assessment.accessibility.score !== 'good') {
      for (const issue of a11yIssues) {
        lines.push(`    ${severityIcon(issue.severity)} ${issue.issue}`);
        if (verbose && issue.recommendation) {
          lines.push(`      → ${issue.recommendation}`);
        }
      }
    }
  } else {
    lines.push(`  Accessibility: ${assessment.accessibility.score}`);
  }

  lines.push('');

  // Design System section
  const dsIssues = assessment.designSystemAdherence.issues;
  if (dsIssues.length > 0) {
    const critical = dsIssues.filter(i => i.severity === 'critical').length;
    lines.push(
      `  Design System: ${assessment.designSystemAdherence.score} (${dsIssues.length} issues, ${critical} critical)`,
    );
    if (verbose || assessment.designSystemAdherence.score !== 'good') {
      for (const issue of dsIssues) {
        lines.push(`    ${severityIcon(issue.severity)} ${issue.issue}`);
        if (verbose && issue.recommendation) {
          lines.push(`      → ${issue.recommendation}`);
        }
      }
    }
  } else {
    lines.push(`  Design System: ${assessment.designSystemAdherence.score}`);
  }

  lines.push('');

  // Code Quality section
  const cqIssues = assessment.codeQuality.issues;
  if (cqIssues.length > 0) {
    const critical = cqIssues.filter(i => i.severity === 'critical').length;
    lines.push(
      `  Code Quality: ${assessment.codeQuality.score} (${cqIssues.length} issues, ${critical} critical)`,
    );
    if (verbose || assessment.codeQuality.score !== 'good') {
      for (const issue of cqIssues) {
        lines.push(`    ${severityIcon(issue.severity)} ${issue.issue}`);
        if (verbose && issue.recommendation) {
          lines.push(`      → ${issue.recommendation}`);
        }
      }
    }
  } else {
    lines.push(`  Code Quality: ${assessment.codeQuality.score}`);
  }

  lines.push('');
  lines.push(`  ${assessment.summary}`);

  return lines.join('\n');
}
