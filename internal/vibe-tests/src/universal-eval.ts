/**
 * @file Universal Evaluation — target-neutral static analysis
 *
 * Scores generated code across 5 dimensions on a 0-100 scale.
 * All analyzers are pure functions: (code, target) → score.
 * No LLM calls — deterministic and fast.
 *
 * Dimensions:
 *   1. Correctness      — Does it work? (hallucinations, valid APIs)
 *   2. Accessibility     — Is it usable by everyone? (labels, semantics)
 *   3. Code Quality      — Is the code well-structured? (complexity, patterns)
 *   4. Efficiency        — How much ceremony vs intent? (DRY + conciseness + decisions/element)
 *   5. Maintainability   — How much breaks on change? (coupling, magic values, locality)
 */

import type {
  UniversalScore,
  UniversalDimension,
  UniversalFinding,
  DimensionScore,
  EfficiencyMetrics,
  MaintainabilityMetrics,
} from './types.js';

import * as _fs from 'node:fs';
import * as _path from 'node:path';

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ============================================================
// tsc-based correctness scoring (reads build-errors.json)
// ============================================================

interface TscError {
  line: number;
  message: string;
  code: string;
}

export interface TscResult {
  target: string;
  errors: TscError[];
  errorCount: number;
  buildSuccess: boolean;
}

export type BuildErrors = Record<string, TscResult>;

/** Cache for build-errors.json per iteration directory */
const buildErrorsCache = new Map<string, BuildErrors | null>();

/**
 * Load build-errors.json from the iteration directory containing this file.
 * Returns null if not found (backwards compat with older iterations).
 */
export function loadBuildErrors(iterDir: string): BuildErrors | null {
  if (buildErrorsCache.has(iterDir)) {
    return buildErrorsCache.get(iterDir)!;
  }

  const errorsPath = _path.join(iterDir, 'build-errors.json');
  if (!_fs.existsSync(errorsPath)) {
    buildErrorsCache.set(iterDir, null);
    return null;
  }

  try {
    const data = JSON.parse(_fs.readFileSync(errorsPath, 'utf-8')) as BuildErrors;
    buildErrorsCache.set(iterDir, data);
    return data;
  } catch {
    buildErrorsCache.set(iterDir, null);
    return null;
  }
}

/**
 * Score correctness from tsc errors.
 * Clean compile (0 errors): 100
 * Each type error: -15
 * Floor at 0
 */
function scoreTscErrors(tscResult: TscResult): {score: number; findings: UniversalFinding[]} {
  const findings: UniversalFinding[] = [];

  for (const err of tscResult.errors) {
    findings.push({
      rule: 'type-error',
      severity: 'critical',
      detail: `TS${err.code.replace('TS', '')}: ${err.message}`,
      line: err.line,
    });
  }

  const score = Math.max(0, 100 - tscResult.errorCount * 15);
  return {score, findings};
}

// ============================================================
// Known component catalogs
// ============================================================

/**
 * Auto-discover XDS components from the core package source.
 * Falls back to a hardcoded list if the source isn't available.
 */
function discoverXDSComponents(): Set<string> {
  try {
    const candidates = [
      _path.resolve(import.meta.dirname, '../../../packages/core/src'),
      _path.resolve(import.meta.dirname, '../../../../packages/core/src'),
    ];
    for (const srcDir of candidates) {
      if (_fs.existsSync(srcDir)) {
        const components = new Set<string>();
        function scan(dir: string) {
          for (const entry of _fs.readdirSync(dir, {withFileTypes: true})) {
            if (
              entry.isDirectory() &&
              !entry.name.startsWith('_') &&
              entry.name !== 'node_modules'
            ) {
              scan(_path.join(dir, entry.name));
            } else if (
              /^XDS[A-Z]\w+\.tsx$/.test(entry.name) &&
              !entry.name.includes('.test.')
            ) {
              components.add(entry.name.replace('.tsx', ''));
            }
          }
        }
        scan(srcDir);
        components.add('Theme');
        components.add('defaultTheme');
        components.add('darkTheme');
        return components;
      }
    }
  } catch {
    // Fall through to hardcoded list
  }
  return new Set([
    'XDSAspectRatio',
    'XDSAvatar',
    'XDSBadge',
    'XDSBanner',
    'XDSBaseTable',
    'XDSBreadcrumbs',
    'XDSBreadcrumbItem',
    'XDSButton',
    'XDSCalendar',
    'XDSCard',
    'XDSCenter',
    'XDSCheckboxInput',
    'XDSDateInput',
    'XDSDialog',
    'XDSDialogHeader',
    'XDSDivider',
    'XDSDropdownMenu',
    'XDSDropdownMenuItem',
    'XDSEmptyState',
    'XDSField',
    'XDSFieldLabel',
    'XDSFieldStatus',
    'XDSFontWrapper',
    'XDSGrid',
    'XDSGridSpan',
    'XDSHStack',
    'XDSHeading',
    'XDSHoverCard',
    'XDSIcon',
    'XDSLayer',
    'XDSLayout',
    'XDSLayoutContent',
    'XDSLayoutFooter',
    'XDSLayoutHeader',
    'XDSLayoutPanel',
    'XDSLink',
    'XDSNumberInput',
    'XDSProgressBar',
    'XDSRadioList',
    'XDSRadioListItem',
    'XDSSection',
    'XDSSelector',
    'XDSSelectorOption',
    'XDSSkeleton',
    'XDSSlider',
    'XDSSpinner',
    'XDSStack',
    'XDSStackItem',
    'XDSStatusDot',
    'XDSSwitch',
    'XDSTab',
    'XDSTabList',
    'XDSTabMenu',
    'XDSTable',
    'XDSTableCell',
    'XDSTableHeaderCell',
    'XDSTableRow',
    'XDSText',
    'XDSTextArea',
    'XDSTextInput',
    'XDSTheme',
    'XDSTimeInput',
    'XDSTooltip',
    'XDSTopNav',
    'XDSTopNavItem',
    'XDSTopNavMenu',
    'XDSTopNavHeading',
    'XDSNavIcon',
    'XDSVStack',
    'Theme',
    'defaultTheme',
    'darkTheme',
  ]);
}

const KNOWN_XDS_COMPONENTS = discoverXDSComponents();

const KNOWN_BASELINE_COMPONENTS = new Set([
  'Button',
  'Input',
  'Label',
  'Card',
  'CardHeader',
  'CardTitle',
  'CardDescription',
  'CardContent',
  'CardFooter',
  'Table',
  'TableHeader',
  'TableBody',
  'TableRow',
  'TableHead',
  'TableCell',
  'TableCaption',
  'Dialog',
  'DialogTrigger',
  'DialogContent',
  'DialogHeader',
  'DialogTitle',
  'DialogDescription',
  'DialogFooter',
  'Popover',
  'PopoverTrigger',
  'PopoverContent',
  'Select',
  'SelectTrigger',
  'SelectValue',
  'SelectContent',
  'SelectItem',
  'Checkbox',
  'Badge',
  'Avatar',
  'AvatarImage',
  'AvatarFallback',
  'Tabs',
  'TabsList',
  'TabsTrigger',
  'TabsContent',
  'Command',
  'CommandInput',
  'CommandList',
  'CommandEmpty',
  'CommandGroup',
  'CommandItem',
  'DropdownMenu',
  'DropdownMenuTrigger',
  'DropdownMenuContent',
  'DropdownMenuItem',
  'DropdownMenuLabel',
  'DropdownMenuSeparator',
  'Tooltip',
  'TooltipProvider',
  'TooltipTrigger',
  'TooltipContent',
  'Switch',
  'Slider',
  'Progress',
  'Skeleton',
  'Textarea',
  'HoverCard',
  'HoverCardTrigger',
  'HoverCardContent',
  'Sheet',
  'SheetTrigger',
  'SheetContent',
  'ScrollArea',
  'Separator',
  'Collapsible',
  'CollapsibleTrigger',
  'CollapsibleContent',
]);

// ============================================================
// 1. Correctness
// ============================================================

function analyzeCorrectness(
  code: string,
  target: string,
  tscResult?: TscResult | null,
): DimensionScore {
  // If tsc results are available, use them as primary correctness signal
  if (tscResult) {
    const {score: tscScore, findings: tscFindings} = scoreTscErrors(tscResult);

    // Add regex-based supplementary findings (hallucinated tokens, unknown components)
    const regexFindings = analyzeCorrectnessRegex(code, target);

    // Combine: tsc errors are primary, regex findings are additive
    const allFindings = [...tscFindings, ...regexFindings.findings];
    const regexPenalty = regexFindings.findings.reduce((sum, f) => {
      switch (f.severity) {
        case 'critical': return sum + 20;
        case 'moderate': return sum + 8;
        case 'minor': return sum + 3;
        default: return sum;
      }
    }, 0);

    const finalScore = Math.max(0, tscScore - regexPenalty);
    return {score: clamp(finalScore), findings: allFindings};
  }

  // Fallback: regex-only scoring (backwards compat with older iterations)
  const {score, findings} = analyzeCorrectnessRegex(code, target);
  return {score: clamp(score), findings};
}

/**
 * Regex-based correctness checks (supplementary to tsc).
 * Detects hallucinated components and tokens that tsc might not catch.
 */
function analyzeCorrectnessRegex(
  code: string,
  target: string,
): {score: number; findings: UniversalFinding[]} {
  const findings: UniversalFinding[] = [];

  if (target === 'xds') {
    // Flag unknown XDS components
    const seen = new Set<string>();
    const xdsRe = /\bXDS\w+/g;
    let m: RegExpExecArray | null;
    while ((m = xdsRe.exec(code)) !== null) {
      const name = m[0];
      if (!seen.has(name) && !KNOWN_XDS_COMPONENTS.has(name)) {
        seen.add(name);
        findings.push({
          rule: 'unknown-component',
          severity: 'critical',
          detail: `Unknown XDS component: ${name}`,
          line: code.slice(0, m.index).split('\n').length,
        });
      }
    }

    // Flag hallucinated CSS variables
    const hallVarRe =
      /var\((--xds-[\w-]+|--font-size-[\w-]+|--font-family-[\w-]+|--border-[\w-]+|--shadow-[\w-]+)\)/g;
    const seenVars = new Set<string>();
    while ((m = hallVarRe.exec(code)) !== null) {
      if (!seenVars.has(m[1])) {
        seenVars.add(m[1]);
        findings.push({
          rule: 'hallucinated-token',
          severity: 'critical',
          detail: `Hallucinated CSS variable: ${m[1]}`,
          line: code.slice(0, m.index).split('\n').length,
        });
      }
    }
  } else if (target === 'baseline') {
    // Flag unknown baseline components
    const uiImportRe =
      /import\s*\{([^}]+)\}\s*from\s*['"]@\/components\/ui\/[^'"]+['"]/g;
    let m: RegExpExecArray | null;
    while ((m = uiImportRe.exec(code)) !== null) {
      const names = m[1]
        .split(',')
        .map(s => s.replace(/\s+as\s+\w+/, '').trim())
        .filter(Boolean);
      for (const name of names) {
        if (!KNOWN_BASELINE_COMPONENTS.has(name)) {
          findings.push({
            rule: 'unknown-component',
            severity: 'critical',
            detail: `Unknown baseline component: ${name}`,
            line: code.slice(0, m.index).split('\n').length,
          });
        }
      }
    }
  }

  // Missing export
  if (!/export\s+(default|function|const|class)/.test(code)) {
    findings.push({
      rule: 'missing-export',
      severity: 'minor',
      detail: 'No export statement found',
    });
  }

  // Score
  let score = 100;
  for (const f of findings) {
    switch (f.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'moderate':
        score -= 8;
        break;
      case 'minor':
        score -= 3;
        break;
    }
  }

  return {score, findings};
}

// ============================================================
// 2. Accessibility
// ============================================================

function analyzeAccessibility(code: string): DimensionScore {
  const findings: UniversalFinding[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const nearby = lines
      .slice(Math.max(0, i - 2), Math.min(i + 4, lines.length))
      .join(' ');

    // onClick on non-interactive elements without role/tabIndex
    const clickMatch = line.match(
      /<(span|div|p|td|tr|li|img|svg)\b[^>]*\bonClick\b/i,
    );
    if (clickMatch) {
      if (
        !nearby.includes('role="button"') &&
        !nearby.includes("role='button'") &&
        !nearby.includes('tabIndex')
      ) {
        findings.push({
          rule: 'click-non-interactive',
          severity: 'critical',
          detail: `onClick on <${clickMatch[1]}> without role="button" or tabIndex`,
          line: lineNum,
        });
      }
    }

    // Icon-only buttons missing aria-label
    if (line.match(/<(button|Button|XDSButton)\b/)) {
      const btnContext = lines
        .slice(i, Math.min(i + 5, lines.length))
        .join(' ');
      const hasIcon = /(<svg|Icon|icon)/.test(btnContext);
      const hasLabel = /(aria-label|ariaLabel|label=)/.test(btnContext);
      const hasText = />[^<]*\w{2,}[^<]*</.test(btnContext);
      if (hasIcon && !hasLabel && !hasText) {
        findings.push({
          rule: 'icon-button-no-label',
          severity: 'critical',
          detail: 'Icon-only button missing aria-label',
          line: lineNum,
        });
      }
    }

    // Form inputs without labels (skip XDS inputs with built-in labels)
    if (line.match(/<(input|Input)\b/) && !line.includes('type="hidden"')) {
      const isXdsInput = /XDS(TextInput|NumberInput|DateInput|TimeInput)/.test(
        nearby,
      );
      if (!isXdsInput) {
        const hasLabel = /(label|Label|aria-label|ariaLabel)/.test(nearby);
        if (!hasLabel) {
          findings.push({
            rule: 'input-no-label',
            severity: 'critical',
            detail: 'Form input without associated label',
            line: lineNum,
          });
        }
      }
    }

    // Images without alt
    if (line.includes('<img') && !line.includes('alt=')) {
      findings.push({
        rule: 'img-no-alt',
        severity: 'moderate',
        detail: 'Image without alt text',
        line: lineNum,
      });
    }
  }

  // Heading hierarchy
  const headingLevels: number[] = [];
  for (const line of lines) {
    const h = line.match(/<h([1-6])\b/i);
    if (h) headingLevels.push(parseInt(h[1]));
    const xh = line.match(/level\s*=\s*\{?\s*(\d)\s*\}?/);
    if (xh && line.includes('Heading')) headingLevels.push(parseInt(xh[1]));
  }
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      findings.push({
        rule: 'heading-skip',
        severity: 'minor',
        detail: `Heading level skipped: h${headingLevels[i - 1]} → h${headingLevels[i]}`,
      });
    }
  }

  let score = 100;
  for (const f of findings) {
    switch (f.severity) {
      case 'critical':
        score -= 15;
        break;
      case 'moderate':
        score -= 8;
        break;
      case 'minor':
        score -= 3;
        break;
    }
  }

  return {score: clamp(score), findings};
}

// ============================================================
// 3. Code Quality
// ============================================================

function analyzeCodeQuality(code: string): DimensionScore {
  const findings: UniversalFinding[] = [];
  const lines = code.split('\n');

  let maxNesting = 0;
  let currentNesting = 0;
  let branchCount = 0;
  let inFunction = false;
  let functionStart = 0;
  let functionNesting = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.trim();
    const lineNum = i + 1;

    // Nesting
    currentNesting +=
      (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    maxNesting = Math.max(maxNesting, currentNesting);

    // Function tracking
    if (
      stripped.match(
        /^(export\s+)?(default\s+)?function\s|^(export\s+)?const\s+\w+\s*=.*=>/,
      )
    ) {
      inFunction = true;
      functionStart = i;
      functionNesting = currentNesting;
    }
    if (inFunction && currentNesting < functionNesting) {
      const len = i - functionStart;
      if (len > 100) {
        findings.push({
          rule: 'long-function',
          severity: 'moderate',
          detail: `Function is ${len} lines`,
          line: functionStart + 1,
        });
      }
      inFunction = false;
    }

    // Branches
    if (stripped.match(/^(if|else if|else|case|catch)\b/)) branchCount++;
    branchCount += (line.match(/\?[^?:]/g) || []).length; // ternaries

    // TypeScript any
    if (stripped.match(/:\s*any\b/) || stripped.match(/as\s+any\b/)) {
      findings.push({
        rule: 'typescript-any',
        severity: 'minor',
        detail: 'Use of `any` type',
        line: lineNum,
      });
    }

    // console.log
    if (stripped.includes('console.log(')) {
      findings.push({
        rule: 'console-log',
        severity: 'minor',
        detail: 'console.log left in code',
        line: lineNum,
      });
    }

    // Missing key in .map()
    if (line.includes('.map(')) {
      const mapCtx = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
      if (
        !mapCtx.includes('key=') &&
        !mapCtx.includes('key:') &&
        mapCtx.includes('<')
      ) {
        findings.push({
          rule: 'missing-key',
          severity: 'moderate',
          detail: 'Array .map() without key prop',
          line: lineNum,
        });
      }
    }

    // Index as key
    if (line.match(/key\s*=\s*\{?\s*(index|i|idx)\s*\}?/)) {
      findings.push({
        rule: 'index-key',
        severity: 'minor',
        detail: 'Array index as key',
        line: lineNum,
      });
    }
  }

  if (maxNesting > 6) {
    findings.push({
      rule: 'deep-nesting',
      severity: 'moderate',
      detail: `Max nesting depth: ${maxNesting}`,
    });
  }
  if (branchCount > 15) {
    findings.push({
      rule: 'high-complexity',
      severity: 'moderate',
      detail: `Cyclomatic complexity: ${branchCount}`,
    });
  }

  let score = 100;
  for (const f of findings) {
    switch (f.severity) {
      case 'critical':
        score -= 15;
        break;
      case 'moderate':
        score -= 8;
        break;
      case 'minor':
        score -= 3;
        break;
    }
  }

  return {score: clamp(score), findings};
}

// ============================================================
// 4. Efficiency (merges DRYness + Conciseness + decisions/element)
// ============================================================

/**
 * Check if a normalized line is component/prop usage (not real duplication).
 */
function isComponentUsageLine(normalizedLine: string): boolean {
  if (/^<\/?[A-Z]\w*/.test(normalizedLine)) return true;
  if (/^<\/[A-Z]\w*>$/.test(normalizedLine)) return true;
  if (/^<[A-Z]\w*\s.*\/>$/.test(normalizedLine)) return true;
  if (/^\w+=/.test(normalizedLine) && normalizedLine.length < 40) return true;
  if (/^\w+:\s*\w+Vars\[/.test(normalizedLine)) return true;
  return false;
}

function normalizeLine(line: string): string {
  return line
    .replace(/(["'`])(?:(?!\1).)*\1/g, '"_"')
    .replace(/\b\d+(\.\d+)?\b/g, 'N')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Count unique UI elements in the code (JSX tags that render visible output).
 */
function countElements(code: string): number {
  const elements = new Set<string>();
  // Match opening JSX tags (both component and HTML)
  const tagRe = /<([A-Za-z]\w*)[\s>]/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(code)) !== null) {
    const tag = m[1];
    // Skip non-visual tags
    if (
      ['React', 'Fragment', 'StrictMode', 'Suspense', 'ErrorBoundary'].includes(
        tag,
      )
    )
      continue;
    // Skip wrapper/provider tags
    if (/(Provider|Context|Theme|Wrapper)$/.test(tag)) continue;
    elements.add(`${tag}-${m.index}`); // unique by position
  }
  return elements.size;
}

/**
 * Count styling decisions — individual props, className tokens, or style properties
 * that determine visual appearance.
 */
function countStylingDecisions(code: string, target: string): number {
  let count = 0;

  if (target === 'xds') {
    // Component props that are styling decisions: variant, size, gap, color, type
    count += (
      code.match(
        /\b(variant|size|gap|color|type|level|weight|crossAlign|mainAlign)\s*=\s*/g,
      ) || []
    ).length;
    // StyleX properties (each key: value in stylex.create)
    const stylexBlocks = code.match(/stylex\.create\(\{[\s\S]*?\}\)/g) || [];
    for (const block of stylexBlocks) {
      count += (block.match(/\w+\s*:/g) || []).length;
    }
  } else if (target === 'baseline') {
    // Tailwind classes — each utility class is a decision
    const classNames = code.match(/className\s*=\s*["']([^"']+)["']/g) || [];
    for (const cn of classNames) {
      const classes = cn
        .replace(/className\s*=\s*["']/, '')
        .replace(/["']$/, '');
      count += classes.split(/\s+/).filter(Boolean).length;
    }
    // cn() calls
    const cnCalls = code.match(/cn\([^)]+\)/g) || [];
    for (const call of cnCalls) {
      count += (call.match(/["'][^"']+["']/g) || []).length;
    }
    // Component variant/size props
    count += (code.match(/\b(variant|size)\s*=\s*/g) || []).length;
  } else {
    // Raw HTML — inline style properties
    const styleBlocks = code.match(/style\s*=\s*\{\{([^}]+)\}\}/g) || [];
    for (const block of styleBlocks) {
      count += (block.match(/\w+\s*:/g) || []).length;
    }
    // CSS class assignments
    count += (code.match(/className\s*=\s*/g) || []).length;
  }

  return count;
}

function analyzeEfficiency(
  code: string,
  target: string,
): DimensionScore<EfficiencyMetrics> {
  const findings: UniversalFinding[] = [];
  const lines = code.split('\n');
  const normalizedLines = lines.map(normalizeLine);

  // --- Line categorization ---
  let blankLines = 0;
  let commentLines = 0;
  let importLines = 0;
  let typeLines = 0;
  let stylingLines = 0;
  let logicLines = 0;
  let inTypeBlock = false;
  let inStyleBlock = false;
  let inComment = false;

  for (const line of lines) {
    const stripped = line.trim();
    if (stripped === '') {
      blankLines++;
      continue;
    }
    if (
      stripped.startsWith('//') ||
      stripped.startsWith('/*') ||
      stripped.startsWith('*')
    ) {
      commentLines++;
      if (stripped.startsWith('/*')) inComment = true;
      if (stripped.includes('*/')) inComment = false;
      continue;
    }
    if (inComment) {
      commentLines++;
      if (stripped.includes('*/')) inComment = false;
      continue;
    }
    if (stripped.startsWith('import ')) {
      importLines++;
      continue;
    }
    if (/^(export\s+)?(type|interface)\s/.test(stripped)) inTypeBlock = true;
    if (inTypeBlock) {
      typeLines++;
      if (stripped === '}' || stripped === '};') inTypeBlock = false;
      continue;
    }
    if (target === 'xds' && stripped.includes('stylex.create'))
      inStyleBlock = true;
    if (inStyleBlock) {
      stylingLines++;
      if (stripped === '});') inStyleBlock = false;
      continue;
    }
    if (target === 'baseline' && stripped.includes('className=')) {
      stylingLines++;
      continue;
    }
    if (target === 'html' && /style\s*=/.test(stripped)) {
      stylingLines++;
      continue;
    }
    logicLines++;
  }

  const totalLines = lines.length;
  const codeLines = totalLines - blankLines - commentLines;
  const boilerplateLines = importLines + typeLines;
  const stylingRatio = codeLines > 0 ? stylingLines / codeLines : 0;
  const boilerplateRatio = codeLines > 0 ? boilerplateLines / codeLines : 0;

  // --- Duplicate detection (excluding component usage) ---
  const lineCounts = new Map<string, number>();
  for (const nl of normalizedLines) {
    if (nl.length > 20 && !isComponentUsageLine(nl)) {
      lineCounts.set(nl, (lineCounts.get(nl) || 0) + 1);
    }
  }
  let duplicateLineCount = 0;
  for (const [line, count] of lineCounts) {
    if (count >= 3) {
      duplicateLineCount += count;
      findings.push({
        rule: 'duplicate-lines',
        severity: 'moderate',
        detail: `Line repeated ${count} times`,
        count,
        example: line.slice(0, 80),
      });
    }
  }
  const duplicateRatio = codeLines > 0 ? duplicateLineCount / codeLines : 0;

  // --- Repeated className patterns ---
  const classRe = /className\s*=\s*["']([^"']{20,})["']/g;
  const classCounts = new Map<string, number>();
  let sm: RegExpExecArray | null;
  while ((sm = classRe.exec(code)) !== null) {
    classCounts.set(sm[1], (classCounts.get(sm[1]) || 0) + 1);
  }
  for (const [cls, count] of classCounts) {
    if (count >= 3) {
      findings.push({
        rule: 'repeated-classname',
        severity: 'moderate',
        detail: `className pattern repeated ${count} times`,
        count,
        example: cls.slice(0, 60),
      });
    }
  }

  // --- Decisions per element ---
  const elementCount = Math.max(1, countElements(code));
  const stylingDecisionCount = countStylingDecisions(code, target);
  const decisionsPerElement = stylingDecisionCount / elementCount;

  const metrics: EfficiencyMetrics = {
    totalLines,
    codeLines,
    stylingLines,
    boilerplateLines,
    logicLines,
    stylingRatio,
    boilerplateRatio,
    decisionsPerElement: Math.round(decisionsPerElement * 10) / 10,
    elementCount,
    stylingDecisionCount,
    duplicateRatio: Math.round(duplicateRatio * 100) / 100,
  };

  // Score: penalize high ceremony ratio, high duplication, high decisions/element
  const ceremonyPenalty = (stylingRatio + boilerplateRatio) * 40;
  const duplicationPenalty = duplicateRatio * 30;
  // decisionsPerElement: 3 is ideal, 10+ is bad, 20+ is terrible
  const decisionPenalty = Math.max(0, (decisionsPerElement - 3) * 3);
  const findingPenalty = findings.reduce(
    (s, f) => s + (f.severity === 'moderate' ? 5 : 2),
    0,
  );

  const score =
    100 -
    ceremonyPenalty -
    duplicationPenalty -
    decisionPenalty -
    findingPenalty;

  return {score: clamp(score), findings, metrics};
}

// ============================================================
// 5. Maintainability (coupling, magic values, locality)
// ============================================================

/**
 * Detect magic values — raw literals in styling contexts that have no
 * semantic meaning. Works for any target.
 */
function countMagicAndSemanticValues(
  code: string,
  target: string,
): {magic: number; semantic: number} {
  let magic = 0;
  let semantic = 0;

  // --- Semantic references (all targets) ---
  // CSS variables
  semantic += (code.match(/var\(--[\w-]+\)/g) || []).length;

  if (target === 'xds') {
    // StyleX token references: spacingVars["--spacing-4"], colorVars["--color-*"]
    semantic += (code.match(/\w+Vars\[["']--[\w-]+["']\]/g) || []).length;
    // Component props that delegate styling: variant=, size=, gap=, color=, type=
    semantic += (
      code.match(/\b(variant|size|gap|color|type|level)\s*=\s*["']/g) || []
    ).length;
  } else if (target === 'baseline') {
    // Tailwind semantic tokens: bg-primary, text-muted-foreground, etc.
    semantic += (
      code.match(
        /(?:bg|text|border|ring)-(?:primary|secondary|destructive|muted|accent|popover|card|foreground|background)[\w-]*/g,
      ) || []
    ).length;
    // Tailwind scale values: p-4, gap-2, text-sm, rounded-lg (non-arbitrary)
    semantic += (
      code.match(
        /(?:^|\s)(?:p|m|gap|space|text|rounded|font|w|h)-(?:\d+|xs|sm|md|lg|xl|2xl|3xl|full|auto)(?:\s|["']|$)/g,
      ) || []
    ).length;
    // Component variant/size props
    semantic += (code.match(/\b(variant|size)\s*=\s*["']/g) || []).length;
  }

  // --- Magic values (all targets) ---
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip data arrays, comments, imports
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('import') ||
      line.trim().startsWith('*')
    )
      continue;

    // Hardcoded colors in style contexts
    const colorMatches = line.match(
      /(?:backgroundColor|borderColor|color|fill|stroke)\s*:\s*['"]?(#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|rgba\(|hsla\()/gi,
    );
    if (colorMatches) {
      // Skip if in data objects
      const ctx = lines.slice(Math.max(0, i - 2), i + 1).join(' ');
      if (
        !ctx.includes('name:') &&
        !ctx.includes('id:') &&
        !ctx.includes('label:')
      ) {
        magic += colorMatches.length;
      }
    }

    // Hardcoded spacing in style contexts
    const spacingMatches = line.match(
      /(?:padding|margin|gap)\w*\s*:\s*['"]?\d+px/gi,
    );
    if (spacingMatches && !line.includes('var(')) {
      magic += spacingMatches.length;
    }

    // Hardcoded typography
    const typoMatches = line.match(
      /fontSize\s*:\s*['"]?\d+(?:\.\d+)?(?:px|rem|em)/gi,
    );
    if (typoMatches && !line.includes('var(')) {
      magic += typoMatches.length;
    }

    // Tailwind arbitrary values (magic)
    const arbitraryMatches = line.match(
      /(?:bg|text|border|p|m|gap|w|h)-\[#?[\w.]+(?:px|rem|em|%)?\]/g,
    );
    if (arbitraryMatches) {
      magic += arbitraryMatches.length;
    }

    // Inline hardcoded colors in style={{}}
    const inlineColorMatches = line.match(
      /(?:backgroundColor|color|borderColor)\s*:\s*['"]#[0-9a-fA-F]{3,8}['"]/gi,
    );
    if (inlineColorMatches) {
      magic += inlineColorMatches.length;
    }
  }

  return {magic, semantic};
}

/**
 * Measure state variable spread — how far apart are declarations and usages?
 */
function measureStateSpread(code: string): number {
  const lines = code.split('\n');
  const spreads: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    // Find useState declarations
    const stateMatch = lines[i].match(
      /\[\s*(\w+)\s*,\s*set\w+\s*\]\s*=\s*use[A-Z]/,
    );
    if (stateMatch) {
      const varName = stateMatch[1];
      // Find furthest usage of this variable
      let furthest = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes(varName)) {
          furthest = j;
        }
      }
      spreads.push(furthest - i);
    }
  }

  if (spreads.length === 0) return 0;
  return Math.round(spreads.reduce((a, b) => a + b, 0) / spreads.length);
}

function analyzeMaintainability(
  code: string,
  target: string,
): DimensionScore<MaintainabilityMetrics> {
  const findings: UniversalFinding[] = [];

  // --- Magic values vs semantic references ---
  const {magic, semantic} = countMagicAndSemanticValues(code, target);
  const totalValues = magic + semantic;
  const semanticRatio = totalValues > 0 ? semantic / totalValues : 1;

  if (magic > 0) {
    findings.push({
      rule: 'magic-values',
      severity: magic > 5 ? 'moderate' : 'minor',
      detail: `${magic} magic value${magic > 1 ? 's' : ''} (hardcoded colors, spacing, or typography)`,
      count: magic,
    });
  }

  // --- Dark mode support ---
  let darkModeSupport = false;
  if (target === 'xds') {
    darkModeSupport = /dark(Theme|Mode|_mode)|mode\s*=\s*["']dark/i.test(code);
  } else if (target === 'baseline') {
    darkModeSupport = /\bdark:|\buseTheme\b|ThemeProvider|data-theme/i.test(
      code,
    );
  } else {
    darkModeSupport = /prefers-color-scheme|dark-mode|data-theme/i.test(code);
  }

  // --- State spread (locality) ---
  const avgStateSpread = measureStateSpread(code);

  if (avgStateSpread > 80) {
    findings.push({
      rule: 'high-state-spread',
      severity: 'moderate',
      detail: `Average state variable spread: ${avgStateSpread} lines`,
    });
  } else if (avgStateSpread > 50) {
    findings.push({
      rule: 'moderate-state-spread',
      severity: 'minor',
      detail: `Average state variable spread: ${avgStateSpread} lines`,
    });
  }

  const metrics: MaintainabilityMetrics = {
    semanticRatio: Math.round(semanticRatio * 100) / 100,
    magicValueCount: magic,
    semanticValueCount: semantic,
    avgStateSpread,
    darkModeSupport,
  };

  // Score: semantic ratio is the primary signal (0-60 points),
  // locality adds up to 20, dark mode adds 10, findings subtract
  const semanticScore = semanticRatio * 60;
  const localityScore =
    avgStateSpread < 30
      ? 20
      : avgStateSpread < 60
        ? 12
        : avgStateSpread < 100
          ? 6
          : 0;
  const darkModeScore = darkModeSupport ? 10 : 0;
  const baseScore = semanticScore + localityScore + darkModeScore + 10; // 10 free points

  const findingPenalty = findings.reduce((s, f) => {
    switch (f.severity) {
      case 'critical':
        return s + 15;
      case 'moderate':
        return s + 8;
      case 'minor':
        return s + 3;
      default:
        return s;
    }
  }, 0);

  return {
    score: clamp(baseScore - findingPenalty),
    findings,
    metrics,
  };
}

// ============================================================
// Main exports
// ============================================================

/**
 * Run all 5 dimension analyzers on a code sample.
 *
 * @param code - The generated TSX source code
 * @param target - The target system ('xds' | 'baseline' | 'html')
 * @param options - Optional context for enhanced scoring
 * @param options.tscResult - tsc type check results (from build-errors.json)
 * @param options.iterDir - Path to iteration directory (for loading build-errors.json)
 * @param options.promptId - Prompt ID (for looking up tsc results)
 */
export function evaluate(
  code: string,
  target: string,
  options?: {
    tscResult?: TscResult | null;
    iterDir?: string;
    promptId?: string;
  },
): UniversalScore {
  // Resolve tsc result: direct, from file, or null
  let tscResult = options?.tscResult;
  if (tscResult === undefined && options?.iterDir && options?.promptId) {
    const buildErrors = loadBuildErrors(options.iterDir);
    tscResult = buildErrors?.[options.promptId] ?? null;
  }

  return {
    correctness: analyzeCorrectness(code, target, tscResult),
    accessibility: analyzeAccessibility(code),
    codeQuality: analyzeCodeQuality(code),
    efficiency: analyzeEfficiency(code, target),
    maintainability: analyzeMaintainability(code, target),
  };
}

/**
 * Get the list of code-level dimension names (always available).
 */
export function getDimensionNames(): UniversalDimension[] {
  return [
    'correctness',
    'accessibility',
    'codeQuality',
    'efficiency',
    'maintainability',
  ];
}

/**
 * Get all dimension names including design (when available).
 */
export function getAllDimensionNames(): UniversalDimension[] {
  return [
    'correctness',
    'accessibility',
    'codeQuality',
    'efficiency',
    'maintainability',
    'design',
  ];
}

/**
 * Get the score for a specific dimension.
 * Returns null for 'design' if not available.
 */
export function getDimensionScore(
  score: UniversalScore,
  dimension: UniversalDimension,
): number | null {
  if (dimension === 'design') {
    return score.design?.score ?? null;
  }
  return score[dimension].score;
}

/**
 * Calculate an average score across the 5 core dimensions (unweighted).
 * Does NOT include design — use getFullAverageScore() when all scores
 * being compared are guaranteed to have design scores.
 */
export function getAverageScore(score: UniversalScore): number {
  const dims = getDimensionNames();
  const total = dims.reduce((sum, d) => sum + (score[d]?.score ?? 0), 0);
  return Math.round(total / dims.length);
}

/**
 * Calculate an average score across all 6 dimensions including design.
 * Returns null if design score is not present.
 */
export function getFullAverageScore(score: UniversalScore): number | null {
  if (score.design == null) return null;
  const dims = getDimensionNames();
  const coreTotal = dims.reduce((sum, d) => sum + (score[d]?.score ?? 0), 0);
  const total = coreTotal + score.design.score;
  return Math.round(total / (dims.length + 1));
}
