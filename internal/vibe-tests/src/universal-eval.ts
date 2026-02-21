/**
 * @file Universal evaluation engine for XDS vibe tests.
 *
 * Scores generated code across 6 dimensions (0-100 each) using pure static
 * analysis — no LLM calls, no network, no AST parser dependencies.
 *
 * The same rubric is applied to both "xds" and "baseline" targets so the
 * comparison is symmetric and fair.
 */

import type {
  UniversalScore,
  UniversalDimension,
  UniversalFinding,
  ConcisenessMetrics,
  DimensionScore,
} from './types.js';

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

export function evaluate(code: string, target: string): UniversalScore {
  return {
    accessibility: analyzeAccessibility(code),
    codeQuality: analyzeCodeQuality(code),
    repetition: analyzeRepetition(code),
    conciseness: analyzeConciseness(code, target),
    themeAdherence: analyzeThemeAdherence(code, target),
    correctness: analyzeCorrectness(code, target),
  };
}

export function getDimensionNames(): UniversalDimension[] {
  return [
    'accessibility',
    'codeQuality',
    'repetition',
    'conciseness',
    'themeAdherence',
    'correctness',
  ];
}

export function getDimensionScore(
  score: UniversalScore,
  dimension: UniversalDimension,
): number {
  return score[dimension].score;
}

export function getAverageScore(score: UniversalScore): number {
  const dims = getDimensionNames();
  const total = dims.reduce((sum, d) => sum + score[d].score, 0);
  return Math.round((total / dims.length) * 100) / 100;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function penalize(
  base: number,
  findings: UniversalFinding[],
): number {
  let penalty = 0;
  for (const f of findings) {
    const count = f.count ?? 1;
    switch (f.severity) {
      case 'critical':
        penalty += 15 * count;
        break;
      case 'moderate':
        penalty += 8 * count;
        break;
      case 'minor':
        penalty += 3 * count;
        break;
    }
  }
  return clamp(base - penalty);
}

// ────────────────────────────────────────────────────────────
// 1. Accessibility
// ────────────────────────────────────────────────────────────

function analyzeAccessibility(code: string): DimensionScore {
  const findings: UniversalFinding[] = [];
  const lines = code.split('\n');

  // onClick on non-interactive elements
  const nonInteractive = /\b(span|div|p|td|tr|li|img|svg)\b/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/onClick/.test(line)) {
      // Check if the element is non-interactive
      const tagMatch = line.match(/<(\w+)\s/);
      if (tagMatch && nonInteractive.test(tagMatch[1])) {
        // Check surrounding lines for role or tabIndex
        const context = lines.slice(Math.max(0, i - 1), i + 3).join(' ');
        if (!/role\s*=/.test(context) && !/tabIndex/.test(context)) {
          findings.push({
            rule: 'click-non-interactive',
            severity: 'critical',
            detail: `onClick on <${tagMatch[1]}> without role or tabIndex`,
            line: i + 1,
          });
        }
      }
    }
  }

  // Icon-only buttons
  const iconBtnRe = /<(button|Button|XDSButton)\b([^>]*?)\/?>([^<]*)</g;
  let m: RegExpExecArray | null;
  while ((m = iconBtnRe.exec(code)) !== null) {
    const attrs = m[2];
    const textContent = m[3].trim();
    const hasIcon =
      /icon/i.test(attrs) || /Icon/.test(attrs);
    if (hasIcon && !textContent) {
      if (
        !/aria-label/.test(attrs) &&
        !/label\s*=/.test(attrs)
      ) {
        const lineNum = code.slice(0, m.index).split('\n').length;
        findings.push({
          rule: 'icon-only-button',
          severity: 'critical',
          detail: `Icon-only <${m[1]}> without aria-label`,
          line: lineNum,
        });
      }
    }
  }

  // Form inputs without labels (skip XDS inputs with built-in labels)
  const builtInLabelInputs = /XDS(TextInput|NumberInput|DateInput|TimeInput)/;
  const inputRe = /<(input|Input)\b([^>]*?)\/?>/g;
  while ((m = inputRe.exec(code)) !== null) {
    const attrs = m[2];
    if (/type\s*=\s*["']hidden["']/.test(attrs)) continue;
    // Check context for label
    const pos = m.index;
    const contextStart = Math.max(0, pos - 200);
    const contextEnd = Math.min(code.length, pos + 200);
    const context = code.slice(contextStart, contextEnd);
    if (
      !/label/i.test(context) &&
      !/Label/.test(context) &&
      !/aria-label/.test(context)
    ) {
      const lineNum = code.slice(0, pos).split('\n').length;
      findings.push({
        rule: 'input-no-label',
        severity: 'critical',
        detail: `<${m[1]}> without associated label or aria-label`,
        line: lineNum,
      });
    }
  }

  // Check for XDS inputs that DON'T need labels (skip them — they have built-in labels)
  // Already skipped by only matching <input|Input>

  // Images without alt
  const imgRe = /<img\b([^>]*?)\/?>/g;
  while ((m = imgRe.exec(code)) !== null) {
    if (!/alt\s*=/.test(m[1])) {
      const lineNum = code.slice(0, m.index).split('\n').length;
      findings.push({
        rule: 'img-no-alt',
        severity: 'moderate',
        detail: '<img> without alt text',
        line: lineNum,
      });
    }
  }

  // Textarea without label (skip XDSTextArea)
  const textareaRe = /<(textarea|Textarea)\b([^>]*?)\/?>/gi;
  while ((m = textareaRe.exec(code)) !== null) {
    if (/XDSTextArea/.test(code.slice(Math.max(0, m.index - 5), m.index + m[0].length + 5))) continue;
    const pos = m.index;
    const contextStart = Math.max(0, pos - 200);
    const contextEnd = Math.min(code.length, pos + 200);
    const context = code.slice(contextStart, contextEnd);
    if (
      !/label/i.test(context) &&
      !/Label/.test(context) &&
      !/aria-label/.test(context)
    ) {
      const lineNum = code.slice(0, pos).split('\n').length;
      findings.push({
        rule: 'textarea-no-label',
        severity: 'moderate',
        detail: '<textarea> without associated label',
        line: lineNum,
      });
    }
  }

  // Heading hierarchy
  const headingLevels: number[] = [];
  const htmlHeadingRe = /<h([1-6])\b/g;
  while ((m = htmlHeadingRe.exec(code)) !== null) {
    headingLevels.push(parseInt(m[1], 10));
  }
  const xdsHeadingRe = /<XDSHeading[^>]*level\s*=\s*\{?\s*(\d)/g;
  while ((m = xdsHeadingRe.exec(code)) !== null) {
    headingLevels.push(parseInt(m[1], 10));
  }
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      findings.push({
        rule: 'heading-skip',
        severity: 'minor',
        detail: `Heading level skips from h${headingLevels[i - 1]} to h${headingLevels[i]}`,
      });
    }
  }

  return { score: penalize(100, findings), findings };
}

// ────────────────────────────────────────────────────────────
// 2. Code Quality
// ────────────────────────────────────────────────────────────

function analyzeCodeQuality(code: string): DimensionScore {
  const findings: UniversalFinding[] = [];
  const lines = code.split('\n');

  // Nesting depth
  let depth = 0;
  let maxDepth = 0;
  for (const line of lines) {
    for (const ch of line) {
      if (ch === '{') depth++;
      if (ch === '}') depth = Math.max(0, depth - 1);
    }
    if (depth > maxDepth) maxDepth = depth;
  }
  if (maxDepth > 6) {
    findings.push({
      rule: 'deep-nesting',
      severity: 'moderate',
      detail: `Maximum nesting depth ${maxDepth} (threshold: 6)`,
    });
  }

  // Function length
  let funcStart = -1;
  let braceCount = 0;
  let inFunc = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      !inFunc &&
      (/^\s*(export\s+)?(default\s+)?function\b/.test(line) ||
        /^\s*(export\s+)?(const|let)\s+\w+\s*=\s*(\([^)]*\)|[^=])*=>/.test(line))
    ) {
      funcStart = i;
      inFunc = true;
      braceCount = 0;
    }
    if (inFunc) {
      for (const ch of line) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      if (braceCount <= 0 && funcStart >= 0) {
        const len = i - funcStart + 1;
        if (len > 100) {
          findings.push({
            rule: 'long-function',
            severity: 'moderate',
            detail: `Function starting at line ${funcStart + 1} is ${len} lines (threshold: 100)`,
            line: funcStart + 1,
          });
        }
        inFunc = false;
        funcStart = -1;
      }
    }
  }

  // Cyclomatic complexity (rough)
  let branches = 0;
  for (const line of lines) {
    if (/\bif\s*\(/.test(line)) branches++;
    if (/\belse\s+if\s*\(/.test(line)) branches++;
    if (/\belse\s*\{/.test(line)) branches++;
    if (/\bcase\s+/.test(line)) branches++;
    if (/\bcatch\s*\(/.test(line)) branches++;
    // Ternary
    const ternaryCount = (line.match(/\?[^?]/g) || []).length;
    branches += ternaryCount;
  }
  if (branches > 15) {
    findings.push({
      rule: 'high-complexity',
      severity: 'moderate',
      detail: `${branches} branches detected (threshold: 15)`,
    });
  }

  // TypeScript `any`
  const anyMatches = code.match(/:\s*any\b|as\s+any\b/g);
  if (anyMatches) {
    findings.push({
      rule: 'typescript-any',
      severity: 'minor',
      detail: `${anyMatches.length} uses of \`any\` type`,
      count: anyMatches.length,
    });
  }

  // console.log
  const consoleMatches = code.match(/console\.log\(/g);
  if (consoleMatches) {
    findings.push({
      rule: 'console-log',
      severity: 'minor',
      detail: `${consoleMatches.length} console.log statements`,
      count: consoleMatches.length,
    });
  }

  // .map() without key
  for (let i = 0; i < lines.length; i++) {
    if (/\.map\s*\(/.test(lines[i])) {
      const chunk = lines.slice(i, Math.min(i + 6, lines.length)).join('\n');
      if (/<\w/.test(chunk) && !/key\s*=/.test(chunk)) {
        findings.push({
          rule: 'map-no-key',
          severity: 'moderate',
          detail: '.map() renders JSX without key prop',
          line: i + 1,
        });
      }
    }
  }

  // Index as key
  const indexKeyRe = /key\s*=\s*\{(index|i|idx)\}/g;
  while (indexKeyRe.exec(code)) {
    findings.push({
      rule: 'index-as-key',
      severity: 'minor',
      detail: 'Array index used as key',
    });
  }

  // ESLint suppression in useEffect
  const eslintEffectRe = /eslint-disable.*useEffect|useEffect.*eslint-disable/g;
  if (eslintEffectRe.test(code)) {
    findings.push({
      rule: 'eslint-suppress-effect',
      severity: 'minor',
      detail: 'ESLint suppression in useEffect',
    });
  }

  return { score: penalize(100, findings), findings };
}

// ────────────────────────────────────────────────────────────
// 3. Repetition
// ────────────────────────────────────────────────────────────

function normalizeLine(line: string): string {
  return line
    .replace(/(["'`])(?:(?!\1).)*\1/g, '"_"')
    .replace(/\b\d+(\.\d+)?\b/g, 'N')
    .replace(/\s+/g, ' ')
    .trim();
}

function analyzeRepetition(code: string): DimensionScore {
  const findings: UniversalFinding[] = [];
  const lines = code.split('\n');
  const normalizedLines = lines.map(normalizeLine);

  // Duplicate normalized lines
  const lineCounts = new Map<string, number>();
  for (const nl of normalizedLines) {
    if (nl.length > 20) {
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

  // Repeated string literals
  const stringRe = /(["'`])([^"'`]{6,}?)\1/g;
  const stringCounts = new Map<string, number>();
  let sm: RegExpExecArray | null;
  while ((sm = stringRe.exec(code)) !== null) {
    const val = sm[2];
    // Skip import paths and @-prefixed
    if (/^[.\/]|^@/.test(val)) continue;
    stringCounts.set(val, (stringCounts.get(val) || 0) + 1);
  }
  for (const [str, count] of stringCounts) {
    if (count >= 3) {
      findings.push({
        rule: 'repeated-string',
        severity: 'minor',
        detail: `String "${str.slice(0, 40)}" repeated ${count} times`,
        count,
        example: str.slice(0, 60),
      });
    }
  }

  // Repeated className patterns
  const classRe = /className\s*=\s*["']([^"']{20,})["']/g;
  const classCounts = new Map<string, number>();
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

  // Duplicate 3-line blocks
  const blockCounts = new Map<string, number>();
  for (let i = 0; i < normalizedLines.length - 2; i++) {
    const block = normalizedLines.slice(i, i + 3).join('\n');
    if (block.length > 50) {
      blockCounts.set(block, (blockCounts.get(block) || 0) + 1);
    }
  }
  for (const [block, count] of blockCounts) {
    if (count >= 2) {
      findings.push({
        rule: 'duplicate-block',
        severity: 'moderate',
        detail: `3-line block repeated ${count} times`,
        count,
        example: block.split('\n')[0].slice(0, 60),
      });
    }
  }

  // Score: based on duplicate ratio
  const totalLines = normalizedLines.filter((l) => l.length > 0).length || 1;
  const duplicateRatio = duplicateLineCount / totalLines;
  const findingPenalty = findings.reduce((sum, f) => {
    switch (f.severity) {
      case 'critical':
        return sum + 15;
      case 'moderate':
        return sum + 8;
      case 'minor':
        return sum + 3;
      default:
        return sum;
    }
  }, 0);
  const score = clamp(100 - duplicateRatio * 60 - findingPenalty);

  return { score, findings };
}

// ────────────────────────────────────────────────────────────
// 4. Conciseness
// ────────────────────────────────────────────────────────────

function analyzeConciseness(
  code: string,
  target: string,
): DimensionScore<never> & { metrics: ConcisenessMetrics } {
  const lines = code.split('\n');
  let blankLines = 0;
  let commentLines = 0;
  let importLines = 0;
  let typeLines = 0;
  let stylingLines = 0;
  let jsxLines = 0;
  let logicLines = 0;

  let inBlockComment = false;
  let inTypeBlock = false;
  let typeBraceDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      blankLines++;
      continue;
    }

    // Block comments
    if (inBlockComment) {
      commentLines++;
      if (/\*\//.test(trimmed)) inBlockComment = false;
      continue;
    }
    if (/^\/\*/.test(trimmed)) {
      commentLines++;
      if (!/\*\//.test(trimmed)) inBlockComment = true;
      continue;
    }
    if (/^\/\//.test(trimmed)) {
      commentLines++;
      continue;
    }

    // Imports
    if (/^import\s/.test(trimmed) || /^from\s/.test(trimmed)) {
      importLines++;
      continue;
    }

    // Type definitions
    if (
      /^(export\s+)?(type|interface)\s/.test(trimmed) ||
      inTypeBlock
    ) {
      typeLines++;
      if (!inTypeBlock && /\{/.test(trimmed) && !/\}/.test(trimmed)) {
        inTypeBlock = true;
        typeBraceDepth = 1;
      } else if (inTypeBlock) {
        for (const ch of trimmed) {
          if (ch === '{') typeBraceDepth++;
          if (ch === '}') typeBraceDepth--;
        }
        if (typeBraceDepth <= 0) inTypeBlock = false;
      }
      continue;
    }

    // Styling
    if (target === 'xds') {
      // StyleX blocks
      if (
        /stylex\.create/.test(trimmed) ||
        /styles\.\w+/.test(trimmed) ||
        /\{[^}]*(?:backgroundColor|color|padding|margin|fontSize|fontWeight|display|flexDirection|alignItems|justifyContent)\s*:/.test(trimmed)
      ) {
        stylingLines++;
        continue;
      }
    } else {
      // className lines for baseline
      if (/className/.test(trimmed)) {
        stylingLines++;
        continue;
      }
    }

    // JSX
    if (/^\s*</.test(trimmed) || /^\s*\/>/.test(trimmed) || /^\s*<\//.test(trimmed)) {
      jsxLines++;
      continue;
    }
    if (/<\w/.test(trimmed) && /\/>|>/.test(trimmed)) {
      jsxLines++;
      continue;
    }

    // Everything else is logic
    logicLines++;
  }

  const totalLines = lines.length;
  const codeLines = totalLines - blankLines - commentLines;
  const nonBlankLines = lines.filter((l) => l.trim().length > 0);
  const totalChars = nonBlankLines.reduce((s, l) => s + l.trim().length, 0);
  const avgLineLength = nonBlankLines.length
    ? Math.round(totalChars / nonBlankLines.length)
    : 0;

  const stylingRatio = codeLines > 0 ? stylingLines / codeLines : 0;
  const boilerplateRatio =
    codeLines > 0 ? (importLines + typeLines) / codeLines : 0;

  const metrics: ConcisenessMetrics = {
    totalLines,
    codeLines,
    blankLines,
    commentLines,
    importLines,
    typeLines,
    stylingLines,
    logicLines,
    jsxLines,
    stylingRatio: Math.round(stylingRatio * 1000) / 1000,
    boilerplateRatio: Math.round(boilerplateRatio * 1000) / 1000,
    avgLineLength,
    charsPerLine: avgLineLength,
  };

  // Score: penalize ceremony and excessive length
  const ceremonyRatio =
    codeLines > 0
      ? (importLines + typeLines + commentLines) / codeLines
      : 0;
  const linePenalty = codeLines > 150 ? (codeLines - 150) * 0.1 : 0;
  const score = clamp(Math.round(100 - ceremonyRatio * 80 - linePenalty));

  return { score, metrics };
}

// ────────────────────────────────────────────────────────────
// 5. Theme Adherence
// ────────────────────────────────────────────────────────────

function analyzeThemeAdherence(
  code: string,
  target: string,
): DimensionScore & { darkModeSupport: boolean } {
  const findings: UniversalFinding[] = [];
  let tokenUsage = 0;
  let totalStyleRefs = 0;

  if (target === 'xds') {
    // Good: var(--*) usage
    const varMatches = code.match(/var\(--[\w-]+\)/g);
    if (varMatches) {
      tokenUsage += varMatches.length;
      totalStyleRefs += varMatches.length;
    }

    // Bad: hardcoded colors in style properties
    const colorPropRe =
      /(backgroundColor|borderColor|color|fill|stroke)\s*:\s*['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))['"]?/g;
    let cm: RegExpExecArray | null;
    while ((cm = colorPropRe.exec(code)) !== null) {
      // Skip if inside a data object (rough heuristic: check if we're in JSX or style context)
      const before = code.slice(Math.max(0, cm.index - 100), cm.index);
      if (/data\s*[:=]/.test(before) || /const\s+data/.test(before)) continue;
      totalStyleRefs++;
      const lineNum = code.slice(0, cm.index).split('\n').length;
      findings.push({
        rule: 'hardcoded-color',
        severity: 'moderate',
        detail: `Hardcoded color in ${cm[1]}: ${cm[2]}`,
        line: lineNum,
      });
    }

    // Bad: hardcoded spacing
    const spacingRe =
      /(padding|margin|gap)\s*:\s*['"]?\d+px['"]?/g;
    while ((cm = spacingRe.exec(code)) !== null) {
      // Skip if inside var()
      const context = code.slice(Math.max(0, cm.index - 10), cm.index + cm.length + 5);
      if (/var\(/.test(context)) continue;
      totalStyleRefs++;
      const lineNum = code.slice(0, cm.index).split('\n').length;
      findings.push({
        rule: 'hardcoded-spacing',
        severity: 'minor',
        detail: `Hardcoded spacing: ${cm[0].trim()}`,
        line: lineNum,
      });
    }

    // Bad: hardcoded typography
    const typoRe = /fontSize\s*:\s*['"]?\d+(px|rem|em)['"]?/g;
    while ((cm = typoRe.exec(code)) !== null) {
      const context = code.slice(Math.max(0, cm.index - 10), cm.index + cm[0].length + 5);
      if (/var\(/.test(context)) continue;
      totalStyleRefs++;
      const lineNum = code.slice(0, cm.index).split('\n').length;
      findings.push({
        rule: 'hardcoded-typography',
        severity: 'minor',
        detail: `Hardcoded fontSize: ${cm[0].trim()}`,
        line: lineNum,
      });
    }
  } else {
    // Baseline

    // Good: semantic Tailwind tokens
    const semanticTw =
      /\b(bg-primary|bg-secondary|bg-muted|bg-accent|bg-destructive|bg-popover|bg-card|bg-background|text-primary|text-secondary|text-muted-foreground|text-accent-foreground|text-destructive|text-popover-foreground|text-card-foreground|text-foreground|border-border|border-input|ring-ring)\b/g;
    const twMatches = code.match(semanticTw);
    if (twMatches) {
      tokenUsage += twMatches.length;
      totalStyleRefs += twMatches.length;
    }

    // Good: var(--*) usage
    const varMatches = code.match(/var\(--[\w-]+\)/g);
    if (varMatches) {
      tokenUsage += varMatches.length;
      totalStyleRefs += varMatches.length;
    }

    // Bad: arbitrary color values
    const arbColorRe = /\b(bg|text|border)-\[#[0-9a-fA-F]+\]/g;
    let bm: RegExpExecArray | null;
    while ((bm = arbColorRe.exec(code)) !== null) {
      totalStyleRefs++;
      const lineNum = code.slice(0, bm.index).split('\n').length;
      findings.push({
        rule: 'arbitrary-color',
        severity: 'moderate',
        detail: `Arbitrary color value: ${bm[0]}`,
        line: lineNum,
      });
    }

    // Bad: arbitrary spacing
    const arbSpacingRe = /\b(p|m|px|py|mx|my|gap)-\[\d+px\]/g;
    while ((bm = arbSpacingRe.exec(code)) !== null) {
      totalStyleRefs++;
      const lineNum = code.slice(0, bm.index).split('\n').length;
      findings.push({
        rule: 'arbitrary-spacing',
        severity: 'minor',
        detail: `Arbitrary spacing: ${bm[0]}`,
        line: lineNum,
      });
    }

    // Bad: hardcoded colors in inline styles
    const inlineColorRe =
      /style\s*=\s*\{\{[^}]*(backgroundColor|borderColor|color|fill|stroke)\s*:\s*['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
    while ((bm = inlineColorRe.exec(code)) !== null) {
      totalStyleRefs++;
      const lineNum = code.slice(0, bm.index).split('\n').length;
      findings.push({
        rule: 'inline-hardcoded-color',
        severity: 'moderate',
        detail: `Hardcoded color in inline style`,
        line: lineNum,
      });
    }
  }

  // Dark mode support
  let darkModeSupport = false;
  if (target === 'xds') {
    darkModeSupport =
      /darkTheme|dark.*Theme|Theme|theme/i.test(code);
  } else {
    darkModeSupport =
      /\bdark:/.test(code) ||
      /dark-mode/.test(code) ||
      /useTheme/.test(code) ||
      /ThemeProvider/.test(code);
  }

  // Score
  const tokenRatio =
    totalStyleRefs > 0 ? tokenUsage / totalStyleRefs : 1;
  const findingPenalty = findings.reduce((sum, f) => {
    switch (f.severity) {
      case 'critical':
        return sum + 15;
      case 'moderate':
        return sum + 8;
      case 'minor':
        return sum + 3;
      default:
        return sum;
    }
  }, 0);
  const score = clamp(Math.round(tokenRatio * 70 + 30 - findingPenalty));

  return { score, findings, darkModeSupport };
}

// ────────────────────────────────────────────────────────────
// 6. Correctness
// ────────────────────────────────────────────────────────────

const KNOWN_XDS_COMPONENTS = new Set([
  'XDSAspectRatio',
  'XDSAvatar',
  'XDSBadge',
  'XDSBreadcrumbs',
  'XDSButton',
  'XDSCalendar',
  'XDSCard',
  'XDSCenter',
  'XDSCheckboxInput',
  'XDSCloseButton',
  'XDSDateInput',
  'XDSDialog',
  'XDSDivider',
  'XDSDropdownMenu',
  'XDSEmptyState',
  'XDSField',
  'XDSGrid',
  'XDSIcon',
  'XDSLayer',
  'XDSLayout',
  'XDSLayoutHeader',
  'XDSLayoutContent',
  'XDSLayoutPanel',
  'XDSLink',
  'XDSNumberInput',
  'XDSProgressBar',
  'XDSRadioList',
  'XDSSection',
  'XDSSelector',
  'XDSSkeleton',
  'XDSSlider',
  'XDSSpinner',
  'XDSStack',
  'XDSVStack',
  'XDSHStack',
  'XDSStackItem',
  'XDSStatusDot',
  'XDSSwitch',
  'XDSTabList',
  'XDSTab',
  'XDSTable',
  'XDSText',
  'XDSTextArea',
  'XDSTextInput',
  'XDSTimeInput',
  'XDSTopNav',
  'XDSHeading',
  'XDSFontWrapper',
  'Theme',
  'defaultTheme',
  'darkTheme',
]);

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

function analyzeCorrectness(
  code: string,
  target: string,
): DimensionScore {
  const findings: UniversalFinding[] = [];

  if (target === 'xds') {
    // Flag unknown XDS components
    const xdsCompRe = /\bXDS\w+/g;
    const seen = new Set<string>();
    let xm: RegExpExecArray | null;
    while ((xm = xdsCompRe.exec(code)) !== null) {
      const name = xm[0];
      if (!seen.has(name) && !KNOWN_XDS_COMPONENTS.has(name)) {
        seen.add(name);
        const lineNum = code.slice(0, xm.index).split('\n').length;
        findings.push({
          rule: 'unknown-xds-component',
          severity: 'critical',
          detail: `Unknown XDS component: ${name}`,
          line: lineNum,
        });
      }
    }

    // Flag hallucinated CSS variables
    const hallucinatedVarRe =
      /var\((--xds-[\w-]+|--font-size-[\w-]+|--font-family-[\w-]+|--border-[\w-]+|--shadow-[\w-]+)\)/g;
    const seenVars = new Set<string>();
    while ((xm = hallucinatedVarRe.exec(code)) !== null) {
      const varName = xm[1];
      if (!seenVars.has(varName)) {
        seenVars.add(varName);
        const lineNum = code.slice(0, xm.index).split('\n').length;
        findings.push({
          rule: 'hallucinated-css-var',
          severity: 'critical',
          detail: `Hallucinated CSS variable: ${varName}`,
          line: lineNum,
        });
      }
    }
  } else {
    // Baseline: flag unknown components from @/components/ui/
    const uiImportRe =
      /import\s*\{([^}]+)\}\s*from\s*['"]@\/components\/ui\/[^'"]+['"]/g;
    let im: RegExpExecArray | null;
    while ((im = uiImportRe.exec(code)) !== null) {
      const names = im[1].split(',').map((s) => s.trim()).filter(Boolean);
      for (const name of names) {
        const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
        if (
          cleanName &&
          !KNOWN_BASELINE_COMPONENTS.has(cleanName)
        ) {
          const lineNum = code.slice(0, im.index).split('\n').length;
          findings.push({
            rule: 'unknown-baseline-component',
            severity: 'critical',
            detail: `Unknown component from @/components/ui/: ${cleanName}`,
            line: lineNum,
          });
        }
      }
    }
  }

  // Rough unmatched JSX tag check
  const openTags: string[] = [];
  const closeTags: string[] = [];
  const openRe = /<([A-Z]\w+)\b[^/]*(?<!\/)\s*>/g;
  let tm: RegExpExecArray | null;
  while ((tm = openRe.exec(code)) !== null) {
    openTags.push(tm[1]);
  }
  const closeRe = /<\/([A-Z]\w+)\s*>/g;
  while ((tm = closeRe.exec(code)) !== null) {
    closeTags.push(tm[1]);
  }
  // Count unmatched
  const tagBalance = new Map<string, number>();
  for (const t of openTags) {
    tagBalance.set(t, (tagBalance.get(t) || 0) + 1);
  }
  for (const t of closeTags) {
    tagBalance.set(t, (tagBalance.get(t) || 0) - 1);
  }
  let unmatched = 0;
  for (const count of tagBalance.values()) {
    unmatched += Math.abs(count);
  }
  if (unmatched > 3) {
    findings.push({
      rule: 'unmatched-jsx-tags',
      severity: 'moderate',
      detail: `${unmatched} unmatched JSX tags detected`,
      count: unmatched,
    });
  }

  // Missing export
  if (
    !/export\s+(default|function|const|class)/.test(code)
  ) {
    findings.push({
      rule: 'missing-export',
      severity: 'minor',
      detail: 'No export statement found',
    });
  }

  // Score with custom penalty for critical correctness issues (-20 per critical)
  let score = 100;
  for (const f of findings) {
    const count = f.count ?? 1;
    switch (f.severity) {
      case 'critical':
        score -= 20 * count;
        break;
      case 'moderate':
        score -= 8 * count;
        break;
      case 'minor':
        score -= 3 * count;
        break;
    }
  }

  return { score: clamp(score), findings };
}
