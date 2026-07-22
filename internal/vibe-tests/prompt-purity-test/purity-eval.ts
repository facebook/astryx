// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file purity-eval.ts
 * @input generated .tsx code (single version) or an ordered array of versions (a run's snapshot timeline)
 * @output veer-marker hits, a 0-100 purity score, and a per-run veered/caught classification
 * @position internal/vibe-tests/prompt-purity-test — the "did it veer, did we catch it" detector
 *
 * This is the ONE place that defines what counts as "veering off Astryx". Tune here.
 *
 * HARD markers (drive the binary "veered" flag): unambiguous non-Astryx styling —
 *   className=, inline style={{...}}, imported .css / @apply / @import, Tailwind
 *   utility classes. In the Astryx (stylex) path these should never appear; styling
 *   is Astryx components + the `xstyle` prop + tokens.
 * SOFT markers (affect the score, NOT the binary flag): hardcoded #hex/rgb() colors
 *   and px/rem sizes. Kept soft because a hex inside a theme/token definition
 *   (createTheme/defineVars) is legitimate Astryx, and we don't want to punish that.
 */

import * as fs from 'node:fs';

export type VeerType =
  | 'className'
  | 'inlineStyle'
  | 'cssImport'
  | 'tailwind'
  | 'hardcodedColor'
  | 'hardcodedSize';

export type Severity = 'hard' | 'soft';

export interface MarkerHit {
  type: VeerType;
  severity: Severity;
  count: number;
  example: string;
}

export interface Classification {
  versions: number;
  noOutput: boolean;
  everVeered: boolean;
  finalClean: boolean;
  /** everVeered && finalClean — tried CSS/Tailwind, then fixed it (the self-check working). */
  caught: boolean;
  /** everVeered && !finalClean — non-Astryx styling still present at the end (bad). */
  veeredUncaught: boolean;
  /** produced clean output and never introduced a hard marker (best). */
  neverVeered: boolean;
  finalPurity: number;
  peakHardCount: number;
  finalHardCount: number;
  /** how many hard veers were present at peak but gone by the end (evidence of catching). */
  removedHardCount: number;
  finalMarkers: MarkerHit[];
  /** secondary, transcript-based: agent mentioned CSS/Tailwind in reasoning. */
  mentionedVeerInReasoning: boolean;
  /** mentioned a veer but never wrote a hard marker — caught itself pre-write. */
  caughtInReasoning: boolean;
}

// ── className string extraction (for Tailwind detection) ──────────────

/** Pull the contents of className="..." / '...' / {`...`} literals. */
function extractClassNameLiterals(code: string): string[] {
  const out: string[] = [];
  const re = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\}|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const val = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5];
    if (val) {out.push(val);}
  }
  return out;
}

const TW_TOKEN =
  /^(?:(?:sm|md|lg|xl|2xl|hover|focus|focus-visible|active|disabled|group-hover|dark|first|last|odd|even)?:)*(?:flex|grid|block|inline-block|inline-flex|inline|hidden|container|isolate|(?:p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|w|h|min-w|max-w|min-h|max-h|top|bottom|left|right|inset|size)-[\w./%[\]#-]+|text-(?:xs|sm|base|lg|xl|\dxl|left|center|right|justify|[a-z]+-\d{2,3})|leading-\w+|tracking-\w+|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|mono|sans|serif)|bg-[\w./%[\]#-]+|border(?:-[\w./%[\]#-]+)?|rounded(?:-[\w]+)?|shadow(?:-[\w]+)?|ring(?:-[\w]+)?|items-\w+|justify-\w+|content-\w+|self-\w+|place-\w+|flex-\w+|grow(?:-\d)?|shrink(?:-\d)?|basis-[\w./%-]+|order-\w+|col-\w+|row-\w+|grid-cols-\w+|grid-rows-\w+|z-\d+|opacity-\d+|cursor-\w+|select-\w+|pointer-events-\w+|overflow-\w+|whitespace-\w+|truncate|uppercase|lowercase|capitalize|italic|underline|absolute|relative|fixed|sticky|static|transition(?:-\w+)?|duration-\d+|ease-\w+|animate-\w+|divide-[\w./%-]+)$/;

function countTailwindTokens(code: string): {count: number; example: string} {
  let count = 0;
  let example = '';
  for (const literal of extractClassNameLiterals(code)) {
    for (const tok of literal.split(/\s+/).filter(Boolean)) {
      if (TW_TOKEN.test(tok)) {
        count++;
        if (!example) {example = tok;}
      }
    }
  }
  return {count, example};
}

// ── Marker detectors ─────────────────────────────────────────────────

interface Detector {
  type: VeerType;
  severity: Severity;
  detect: (code: string) => {count: number; example: string};
}

function regexDetector(type: VeerType, severity: Severity, re: RegExp): Detector {
  return {
    type,
    severity,
    detect: (code: string) => {
      const matches = code.match(re) || [];
      return {count: matches.length, example: matches[0]?.trim().slice(0, 60) ?? ''};
    },
  };
}

const DETECTORS: Detector[] = [
  regexDetector('className', 'hard', /\bclassName\s*=/g),
  regexDetector('inlineStyle', 'hard', /\bstyle\s*=\s*\{\{/g),
  regexDetector('cssImport', 'hard', /(?:import[^;\n]*["'][^"']+\.css["']|@apply\b|@import\b)/g),
  {type: 'tailwind', severity: 'hard', detect: countTailwindTokens},
  regexDetector('hardcodedColor', 'soft', /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/g),
  regexDetector('hardcodedSize', 'soft', /\b\d{2,}(?:px|rem)\b/g),
];

/** All marker hits (count > 0) for a single code string. */
export function detectMarkers(code: string): MarkerHit[] {
  const hits: MarkerHit[] = [];
  for (const d of DETECTORS) {
    const {count, example} = d.detect(code);
    if (count > 0) {hits.push({type: d.type, severity: d.severity, count, example});}
  }
  return hits;
}

export function hardMarkers(code: string): MarkerHit[] {
  return detectMarkers(code).filter(h => h.severity === 'hard');
}

export function hardMarkerCount(code: string): number {
  return hardMarkers(code).reduce((n, h) => n + h.count, 0);
}

// Per-type penalty weight and cap for the graded purity score.
const PENALTY: Record<VeerType, {weight: number; cap: number}> = {
  className: {weight: 10, cap: 40},
  inlineStyle: {weight: 10, cap: 40},
  cssImport: {weight: 20, cap: 40},
  tailwind: {weight: 3, cap: 30},
  hardcodedColor: {weight: 4, cap: 20},
  hardcodedSize: {weight: 2, cap: 16},
};

/** 0-100 purity of a single code string (100 = pure Astryx, 0 = drowning in raw CSS/TW). */
export function purityScore(code: string): number {
  if (!code || !code.trim()) {return 0;}
  let penalty = 0;
  for (const h of detectMarkers(code)) {
    const {weight, cap} = PENALTY[h.type];
    penalty += Math.min(cap, h.count * weight);
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

const REASONING_VEER =
  /\b(tailwind|plain css|raw css|vanilla css|inline styles?|hand-?roll|hardcod\w*|className)\b/i;

/**
 * Classify a run from its ordered snapshot timeline (each entry = the full file
 * contents at that moment). `transcriptText` is optional corroborating reasoning text.
 */
export function classifyTimeline(
  versions: string[],
  opts: {transcriptText?: string} = {},
): Classification {
  const nonEmpty = versions.filter(v => v && v.trim().length > 0);
  const noOutput = nonEmpty.length === 0;

  const hardCounts = versions.map(v => hardMarkerCount(v));
  const everVeered = hardCounts.some(n => n > 0);
  const peakHardCount = hardCounts.length ? Math.max(...hardCounts) : 0;

  const final = versions.length ? versions[versions.length - 1] : '';
  const finalMarkers = detectMarkers(final);
  const finalHardCount = finalMarkers.filter(h => h.severity === 'hard').reduce((n, h) => n + h.count, 0);
  const finalClean = !noOutput && finalHardCount === 0;
  const finalPurity = purityScore(final);

  const caught = everVeered && finalClean;
  const veeredUncaught = everVeered && !finalClean;
  const neverVeered = !everVeered && !noOutput;

  const mentionedVeerInReasoning = opts.transcriptText
    ? REASONING_VEER.test(opts.transcriptText)
    : false;
  const caughtInReasoning = mentionedVeerInReasoning && neverVeered;

  return {
    versions: versions.length,
    noOutput,
    everVeered,
    finalClean,
    caught,
    veeredUncaught,
    neverVeered,
    finalPurity,
    peakHardCount,
    finalHardCount,
    removedHardCount: Math.max(0, peakHardCount - finalHardCount),
    finalMarkers,
    mentionedVeerInReasoning,
    caughtInReasoning,
  };
}

/**
 * Supplementary graded quality via the shared deterministic scorer. Lazy + guarded so
 * the core classifier stays dependency-free (and the no-LLM smoke test never needs it).
 */
export async function gradedQuality(code: string): Promise<number | null> {
  try {
    const mod = (await import('../src/universal-eval.js')) as {
      evaluate: (code: string, target: string) => unknown;
      getAverageScore?: (score: unknown) => number;
    };
    const score = mod.evaluate(code, 'astryx');
    return typeof mod.getAverageScore === 'function' ? mod.getAverageScore(score) : null;
  } catch {
    return null;
  }
}

// ── Cost: parse the cursor-agent terminal `result` event + estimate $ ─────────
//
// Token counts are EXACT (from the CLI's stream-json result line). The $ is an
// ESTIMATE from the per-model table below — on a Cursor plan actual billing may be
// request-based, so treat $ as directional and re-scale PRICING for your graphs.
// The raw token counts are the hard numbers to plot.

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface AgentResult {
  subtype: string | null;
  isError: boolean;
  durationMs: number | null;
  apiDurationMs: number | null;
  usage: TokenUsage | null;
}

export interface ModelPricing {
  inputPerM: number;
  outputPerM: number;
  cacheReadPerM: number;
  cacheWritePerM: number;
}

/** USD per 1M tokens. Estimates — edit freely; cache-read is intentionally cheap. */
export const PRICING: Record<string, ModelPricing> = {
  // Opus 4.x class
  'claude-opus-4-8-max-fast': {inputPerM: 15, outputPerM: 75, cacheReadPerM: 1.5, cacheWritePerM: 18.75},
  'claude-opus-4-8-thinking-max-fast': {inputPerM: 15, outputPerM: 75, cacheReadPerM: 1.5, cacheWritePerM: 18.75},
  default: {inputPerM: 15, outputPerM: 75, cacheReadPerM: 1.5, cacheWritePerM: 18.75},
};

export function pricingFor(model: string): ModelPricing {
  return PRICING[model] ?? PRICING.default;
}

export function estimateCostUSD(usage: TokenUsage, model: string): number {
  const p = pricingFor(model);
  return (
    (usage.inputTokens * p.inputPerM +
      usage.outputTokens * p.outputPerM +
      usage.cacheReadTokens * p.cacheReadPerM +
      usage.cacheWriteTokens * p.cacheWritePerM) /
    1_000_000
  );
}

const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * Parse the last `type:"result"` line out of a cursor-agent stream-json transcript.
 * Tolerant to camelCase (cursor-agent) and snake_case (Claude-style) field names.
 */
export function parseResultFromText(text: string): AgentResult | null {
  if (!text) {return null;}
  const lines = text.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.includes('"type":"result"') && !line.includes('"type": "result"')) {continue;}
    try {
      const ev = JSON.parse(line) as {
        type?: string;
        subtype?: string;
        is_error?: boolean;
        duration_ms?: number;
        duration_api_ms?: number;
        usage?: Record<string, unknown>;
      };
      if (ev?.type !== 'result') {continue;}
      const u: Record<string, unknown> = ev.usage ?? {};
      const usage: TokenUsage = {
        inputTokens: numOrNull(u.inputTokens ?? u.input_tokens) ?? 0,
        outputTokens: numOrNull(u.outputTokens ?? u.output_tokens) ?? 0,
        cacheReadTokens: numOrNull(u.cacheReadTokens ?? u.cache_read_input_tokens ?? u.cacheReadInputTokens) ?? 0,
        cacheWriteTokens:
          numOrNull(u.cacheWriteTokens ?? u.cache_creation_input_tokens ?? u.cacheWriteInputTokens) ?? 0,
      };
      return {
        subtype: ev.subtype ?? null,
        isError: !!ev.is_error,
        durationMs: numOrNull(ev.duration_ms),
        apiDurationMs: numOrNull(ev.duration_api_ms) ?? numOrNull(ev.duration_ms),
        usage,
      };
    } catch {
      /* malformed line — keep scanning upward */
    }
  }
  return null;
}

export function parseResultEvent(transcriptPath: string): AgentResult | null {
  try {
    return parseResultFromText(fs.readFileSync(transcriptPath, 'utf-8'));
  } catch {
    return null;
  }
}

export function emptyUsage(): TokenUsage {
  return {inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0};
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
  };
}
