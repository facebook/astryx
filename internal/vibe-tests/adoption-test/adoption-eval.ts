// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adoption-eval.ts
 * @input A sandbox's working-tree diff (+ the astryx invocation log), or --experiment <id>
 * @output One eval JSON per task under <iterDir>/evals/
 * @position internal/vibe-tests/adoption-test — deterministic half of the adoption scorer
 *
 * Scores what an agent did to an existing app. No LLM in this path: every arm is
 * measured by the same code, and the analyzer never sees the condition id
 * (Checker Protocol §1).
 *
 * The analyzers are pure functions over file contents so they can be tested
 * directly — see adoption-eval.test.ts.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';

// ── inputs ───────────────────────────────────────────────────────────

export type ChangedFile = {
  /** Repo-relative path inside the sandbox. */
  path: string;
  status: 'added' | 'modified' | 'deleted';
  /** Content after the change (empty for deleted). */
  content: string;
  /** Content at the baseline commit, when the file existed. */
  before?: string;
};

export type Invocation = {ts: string; argv: string[]; status: number};

export type AnalyzeOptions = {
  /** Canonical domain mapping the app owns; a diff that re-derives it drifts. */
  canonicalStatusTone?: Record<string, string>;
  /** The app's own token classes. Raw values where one of these fits is a miss. */
  appTokenClasses?: string[];
  /** ISO time of the agent's first write, when known (ordering vs lookups). */
  firstWriteAt?: string;
};

export type Evidence = {file: string; line: number; snippet: string};

// ── defaults ─────────────────────────────────────────────────────────

const DEFAULT_STATUS_TONE: Record<string, string> = {
  queued: 'neutral',
  running: 'progress',
  needs_review: 'attention',
  blocked: 'attention',
  succeeded: 'positive',
  failed: 'danger',
  abandoned: 'inert',
};

const DEFAULT_TOKEN_CLASSES = [
  'bg-background',
  'bg-card',
  'bg-muted',
  'bg-accent',
  'text-foreground',
  'text-muted-foreground',
  'text-accent-foreground',
  'border-border',
  'rounded-md',
  'ring-ring',
];

const DOC_LOOKUP_COMMANDS = new Set([
  'component',
  'search',
  'docs',
  'hook',
  'template',
  'list',
  'build',
]);

const ASTRYX_PKG = /@astryxdesign\/(core|lab|charts)/;
const APP_UI_IMPORT = /['"]@\/components\/ui\//;
const RADIX_IMPORT = /@radix-ui\//;

const isCodeFile = (p: string) => /\.(tsx|ts)$/.test(p) && !p.endsWith('.d.ts');

function lines(content: string): string[] {
  return content.split('\n');
}

function findAll(file: ChangedFile, re: RegExp): Evidence[] {
  const out: Evidence[] = [];
  lines(file.content).forEach((text, i) => {
    const m = text.match(re);
    if (m) {
      out.push({
        file: file.path,
        line: i + 1,
        snippet: text.trim().slice(0, 160),
      });
    }
  });
  return out;
}

// ── 1. adoption decision ─────────────────────────────────────────────

export type AdoptionDecision =
  'astryx' | 'app-component' | 'hand-rolled' | 'mixed' | 'none';

export function analyzeAdoption(files: ChangedFile[]) {
  const code = files.filter(f => isCodeFile(f.path) && f.status !== 'deleted');
  const astryxImports: Evidence[] = [];
  const astryxSymbols = new Set<string>();
  const appUiImports: Evidence[] = [];
  const radixImports: Evidence[] = [];
  const newComponentFiles: string[] = [];

  for (const f of code) {
    if (f.status === 'added' && /^components\//.test(f.path)) {
      newComponentFiles.push(f.path);
    }
    lines(f.content).forEach((text, i) => {
      const ev = {
        file: f.path,
        line: i + 1,
        snippet: text.trim().slice(0, 160),
      };
      if (ASTRYX_PKG.test(text)) {
        astryxImports.push(ev);
        for (const s of text.match(
          /\b[A-Z][A-Za-z0-9]+\b|\buse[A-Z][A-Za-z0-9]+\b/g,
        ) ?? []) {
          astryxSymbols.add(s);
        }
      }
      if (APP_UI_IMPORT.test(text)) {
        appUiImports.push(ev);
      }
      if (RADIX_IMPORT.test(text)) {
        radixImports.push(ev);
      }
    });
  }

  const usedHooks = [...astryxSymbols].filter(s => /^use[A-Z]/.test(s));
  const usedComponents = [...astryxSymbols].filter(s => !/^use[A-Z]/.test(s));

  // A hand-rolled interactive surface: a new component that builds its own
  // overlay/menu out of raw elements instead of reaching for anything.
  const handRolledSurface = code.filter(
    f =>
      f.status === 'added' &&
      /absolute|fixed/.test(f.content) &&
      /onMouseEnter|onClick|onKeyDown/.test(f.content) &&
      !ASTRYX_PKG.test(f.content) &&
      !APP_UI_IMPORT.test(f.content),
  );

  let decision: AdoptionDecision = 'none';
  if (astryxImports.length && (appUiImports.length || radixImports.length)) {
    decision = 'mixed';
  } else if (astryxImports.length) {
    decision = 'astryx';
  } else if (appUiImports.length) {
    decision = 'app-component';
  } else if (handRolledSurface.length || newComponentFiles.length) {
    decision = 'hand-rolled';
  }

  return {
    decision,
    astryxImports,
    astryxComponents: usedComponents.sort(),
    astryxHooks: usedHooks.sort(),
    usedPrimitives: usedHooks.length > 0,
    appUiImports,
    radixImports,
    newComponentFiles,
    handRolledSurfaces: handRolledSurface.map(f => f.path),
  };
}

// ── 2. verification (did it look before deciding?) ───────────────────

export function analyzeVerification(
  invocations: Invocation[],
  opts: AnalyzeOptions = {},
) {
  const lookups = invocations.filter(i =>
    DOC_LOOKUP_COMMANDS.has(i.argv[0] ?? ''),
  );
  const firstWrite = opts.firstWriteAt
    ? Date.parse(opts.firstWriteAt)
    : undefined;
  const before = firstWrite
    ? lookups.filter(i => Date.parse(i.ts) <= firstWrite)
    : /* unknown ordering: don't claim it */ [];

  return {
    lookupCount: lookups.length,
    lookedUpBeforeWriting: firstWrite ? before.length > 0 : null,
    lookupsBeforeFirstWrite: before.length,
    commands: invocations.map(i => i.argv.join(' ')),
    setupFailures: invocations
      .filter(i => i.status !== 0)
      .map(i => i.argv.join(' ')),
  };
}

// ── 3. escape hatches ────────────────────────────────────────────────

const ESCAPE_HATCHES: {kind: string; re: RegExp}[] = [
  {kind: 'arbitraryValue', re: /(?:^|[\s"'`:])[a-z-]+-\[[^\]]+\]/},
  {kind: 'negativeMargin', re: /(?:^|[\s"'`])-m[trblxyse]?-/},
  {kind: 'important', re: /!important|(?:^|[\s"'`])![a-z-]+-/},
  {kind: 'rawHex', re: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/},
  {kind: 'zIndexLiteral', re: /z-(?:\[\d+\]|\d{2,})|zIndex:\s*\d+/},
  {kind: 'inlineStyle', re: /style=\{\{/},
];

export function analyzeEscapeHatches(files: ChangedFile[]) {
  const byKind: Record<string, Evidence[]> = {};
  for (const f of files.filter(
    f => isCodeFile(f.path) && f.status !== 'deleted',
  )) {
    for (const {kind, re} of ESCAPE_HATCHES) {
      const hits = findAll(f, re);
      if (hits.length) {
        byKind[kind] = [...(byKind[kind] ?? []), ...hits];
      }
    }
  }
  const total = Object.values(byKind).reduce((n, hits) => n + hits.length, 0);
  return {total, byKind};
}

// ── 4. token discipline ──────────────────────────────────────────────

export function analyzeTokenDiscipline(
  files: ChangedFile[],
  opts: AnalyzeOptions = {},
) {
  const tokens = opts.appTokenClasses ?? DEFAULT_TOKEN_CLASSES;
  let tokenUses = 0;
  const rawValues: Evidence[] = [];
  for (const f of files.filter(
    f => isCodeFile(f.path) && f.status !== 'deleted',
  )) {
    for (const t of tokens) {
      tokenUses += (f.content.match(new RegExp(`\\b${t}\\b`, 'g')) ?? [])
        .length;
    }
    rawValues.push(
      ...findAll(f, /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|rgb\(|hsl\(/),
    );
  }
  return {
    tokenUses,
    rawValues,
    ratio: tokenUses / Math.max(1, tokenUses + rawValues.length),
  };
}

// ── 5. semantic fidelity ─────────────────────────────────────────────

/**
 * Tone vocabularies differ between systems, and a rename is not a meaning
 * change: `positive`/`success` are the same claim about the world, `attention`
 * and `info` are not. Only the second kind is a finding — over-reporting the
 * first would bury it.
 */
const TONE_SYNONYMS: Record<string, string[]> = {
  neutral: ['default', 'muted', 'grey', 'gray'],
  info: ['informational'],
  progress: ['active', 'running', 'in-progress', 'blue'],
  attention: ['warning', 'caution', 'pending', 'orange', 'yellow'],
  positive: ['success', 'ok', 'green'],
  danger: ['error', 'critical', 'failure', 'red'],
  inert: ['neutral', 'muted', 'disabled', 'default', 'grey', 'gray'],
};

export function sameMeaning(expected: string, got: string): boolean {
  if (expected === got) {
    return true;
  }
  return (TONE_SYNONYMS[expected] ?? []).includes(got);
}

export function analyzeSemanticFidelity(
  files: ChangedFile[],
  opts: AnalyzeOptions = {},
) {
  const canonical = opts.canonicalStatusTone ?? DEFAULT_STATUS_TONE;
  const statuses = Object.keys(canonical);
  const mismatches: (Evidence & {
    status: string;
    got: string;
    expected: string;
  })[] = [];
  const reDerived: string[] = [];

  for (const f of files.filter(
    f => isCodeFile(f.path) && f.status !== 'deleted',
  )) {
    const mentions = statuses.filter(s =>
      new RegExp(`\\b${s}\\b`).test(f.content),
    );
    if (mentions.length === 0) {
      continue;
    }

    const importsCanonical = /['"]@\/lib\/status['"]/.test(f.content);
    if (mentions.length >= 2 && !importsCanonical) {
      reDerived.push(f.path);
    }

    lines(f.content).forEach((text, i) => {
      const m = text.match(/\b([a-z_]+)\b\s*:\s*['"]([a-z-]+)['"]/);
      if (!m) {
        return;
      }
      const [, key, value] = m;
      if (!statuses.includes(key)) {
        return;
      }
      if (!sameMeaning(canonical[key], value)) {
        mismatches.push({
          file: f.path,
          line: i + 1,
          snippet: text.trim().slice(0, 160),
          status: key,
          got: value,
          expected: canonical[key],
        });
      }
    });
  }
  return {
    mismatches,
    reDerivedIn: reDerived,
    preserved: mismatches.length === 0 && !reDerived.length,
  };
}

// ── 6. accessibility statics (delta, not absolute — see PLAN §10) ────

export type A11yFacts = {
  hoverHandlers: number;
  focusHandlers: number;
  keyboardHandlers: number;
  escapeHandled: boolean;
  ariaAttributes: number;
  roles: number;
  tabIndexes: number;
  focusVisibleStyles: number;
  clickableNonInteractive: number;
};

export function a11yFacts(content: string): A11yFacts {
  const count = (re: RegExp) => (content.match(re) ?? []).length;
  return {
    hoverHandlers: count(/onMouseEnter|onMouseOver|onMouseLeave/g),
    focusHandlers: count(/onFocus|onBlur|focusTrigger/g),
    keyboardHandlers: count(
      /onKeyDown|onKeyUp|useListFocus|useGridFocus|useKeyboard/g,
    ),
    escapeHandled: /['"]Escape['"]/.test(content),
    ariaAttributes: count(/\baria-[a-z]+=/g),
    roles: count(/\brole=/g),
    tabIndexes: count(/tabIndex=/g),
    focusVisibleStyles: count(/focus-visible|focusVisible|ring-ring|outline-/g),
    clickableNonInteractive: count(/<(?:div|span)[^>]*onClick=/g),
  };
}

export function analyzeA11yDelta(files: ChangedFile[]) {
  const zero = (): A11yFacts => ({
    hoverHandlers: 0,
    focusHandlers: 0,
    keyboardHandlers: 0,
    escapeHandled: false,
    ariaAttributes: 0,
    roles: 0,
    tabIndexes: 0,
    focusVisibleStyles: 0,
    clickableNonInteractive: 0,
  });
  const sum = (a: A11yFacts, b: A11yFacts): A11yFacts => ({
    hoverHandlers: a.hoverHandlers + b.hoverHandlers,
    focusHandlers: a.focusHandlers + b.focusHandlers,
    keyboardHandlers: a.keyboardHandlers + b.keyboardHandlers,
    escapeHandled: a.escapeHandled || b.escapeHandled,
    ariaAttributes: a.ariaAttributes + b.ariaAttributes,
    roles: a.roles + b.roles,
    tabIndexes: a.tabIndexes + b.tabIndexes,
    focusVisibleStyles: a.focusVisibleStyles + b.focusVisibleStyles,
    clickableNonInteractive:
      a.clickableNonInteractive + b.clickableNonInteractive,
  });

  let before = zero();
  let after = zero();
  for (const f of files.filter(f => isCodeFile(f.path))) {
    if (f.before) {
      before = sum(before, a11yFacts(f.before));
    }
    if (f.status !== 'deleted') {
      after = sum(after, a11yFacts(f.content));
    }
  }

  const hoverOnly = files
    .filter(f => isCodeFile(f.path) && f.status !== 'deleted')
    .filter(f => {
      const facts = a11yFacts(f.content);
      return facts.hoverHandlers > 0 && facts.focusHandlers === 0;
    })
    .map(f => f.path);

  return {
    before,
    after,
    hoverWithoutFocusPath: hoverOnly,
    keyboardPathAdded: after.keyboardHandlers > before.keyboardHandlers,
    focusIndicatorAdded: after.focusVisibleStyles > before.focusVisibleStyles,
    clickableNonInteractiveDelta:
      after.clickableNonInteractive - before.clickableNonInteractive,
  };
}

// ── 7. blast radius ──────────────────────────────────────────────────

export function analyzeBlastRadius(files: ChangedFile[]) {
  const touched = files.map(f => f.path);
  const shared = touched.filter(p => p.startsWith('components/ui/'));
  const global = touched.filter(p =>
    /^app\/(globals\.css|layout\.tsx)$/.test(p),
  );
  const config = touched.filter(p =>
    /^(package\.json|tsconfig\.json|.*\.config\.[cm]?[jt]s)$/.test(p),
  );
  const feature = touched.filter(
    p => !shared.includes(p) && !global.includes(p) && !config.includes(p),
  );
  return {
    filesChanged: touched.length,
    feature,
    touchedSharedPrimitives: shared,
    touchedGlobal: global,
    touchedConfig: config,
  };
}

// ── the score ────────────────────────────────────────────────────────

export function analyze(
  files: ChangedFile[],
  invocations: Invocation[] = [],
  opts: AnalyzeOptions = {},
) {
  const adoption = analyzeAdoption(files);
  const verification = analyzeVerification(invocations, opts);
  const escapeHatches = analyzeEscapeHatches(files);
  const tokens = analyzeTokenDiscipline(files, opts);
  const semantics = analyzeSemanticFidelity(files, opts);
  const a11y = analyzeA11yDelta(files);
  const blast = analyzeBlastRadius(files);

  const flags: string[] = [];
  if (adoption.decision === 'hand-rolled' && verification.lookupCount === 0) {
    flags.push(
      'hand-rolled with no documentation lookup at all — decided without looking',
    );
  }
  if (adoption.decision === 'astryx' && escapeHatches.total > 3) {
    flags.push(
      `adopted, then needed ${escapeHatches.total} overrides to fit — parity cost, file against the component`,
    );
  }
  if (semantics.reDerivedIn.length) {
    flags.push(
      `canonical status mapping re-derived in ${semantics.reDerivedIn.join(', ')}`,
    );
  }
  if (semantics.mismatches.length) {
    flags.push(
      `status mapping changed meaning: ${semantics.mismatches
        .map(m => `${m.status} ${m.expected}→${m.got}`)
        .join(', ')}`,
    );
  }
  if (a11y.hoverWithoutFocusPath.length) {
    flags.push(
      `hover-only affordance with no focus path in ${a11y.hoverWithoutFocusPath.join(', ')}`,
    );
  }
  if (a11y.clickableNonInteractiveDelta > 0) {
    flags.push('added click handlers to non-interactive elements');
  }
  if (blast.touchedSharedPrimitives.length) {
    flags.push(
      `modified shared primitives: ${blast.touchedSharedPrimitives.join(', ')}`,
    );
  }
  if (verification.setupFailures.length) {
    flags.push(
      `setup friction: ${verification.setupFailures.length} failed CLI call(s)`,
    );
  }

  return {
    adoption,
    verification,
    escapeHatches,
    tokens,
    semantics,
    a11y,
    blast,
    flags,
  };
}

export type AdoptionScore = ReturnType<typeof analyze>;

// ── sandbox plumbing ─────────────────────────────────────────────────

const git = (dir: string, args: string[]) =>
  execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_SYSTEM: '/dev/null',
    },
  });

/** The agent's output: everything that differs from the baseline commit. */
export function readSandboxDiff(sandboxDir: string): ChangedFile[] {
  const out = git(sandboxDir, [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
  ]);
  const files: ChangedFile[] = [];
  for (const line of out.split('\n').filter(Boolean)) {
    const code = line.slice(0, 2).trim();
    const rel = line.slice(3).trim().replace(/^"|"$/g, '');
    if (
      rel.startsWith('.agent-notes') ||
      rel.startsWith('.astryx-invocations')
    ) {
      continue;
    }
    const abs = path.join(sandboxDir, rel);
    const status: ChangedFile['status'] =
      code === '??' || code === 'A'
        ? 'added'
        : code === 'D'
          ? 'deleted'
          : 'modified';
    let before: string | undefined;
    if (status !== 'added') {
      try {
        before = git(sandboxDir, ['show', `HEAD:${rel}`]);
      } catch {
        before = undefined; // not in the baseline commit
      }
    }
    files.push({
      path: rel,
      status,
      content:
        status === 'deleted' || !fs.existsSync(abs)
          ? ''
          : fs.readFileSync(abs, 'utf8'),
      before,
    });
  }
  return files;
}

export function readInvocations(logPath: string): Invocation[] {
  if (!fs.existsSync(logPath)) {
    return [];
  }
  return fs
    .readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l) as Invocation);
}

/** Earliest mtime among changed files — when the agent first wrote anything. */
function firstWriteAt(
  sandboxDir: string,
  files: ChangedFile[],
): string | undefined {
  const times = files
    .filter(f => f.status !== 'deleted')
    .map(f => {
      try {
        return fs.statSync(path.join(sandboxDir, f.path)).mtimeMs;
      } catch {
        return undefined;
      }
    })
    .filter((n): n is number => typeof n === 'number');
  return times.length ? new Date(Math.min(...times)).toISOString() : undefined;
}

export function evaluateSandbox(sandboxDir: string, opts: AnalyzeOptions = {}) {
  const files = readSandboxDiff(sandboxDir);
  const invocations = readInvocations(
    path.join(sandboxDir, '.astryx-invocations.log'),
  );
  const notesPath = path.join(sandboxDir, '.agent-notes.json');
  const notes = fs.existsSync(notesPath)
    ? JSON.parse(fs.readFileSync(notesPath, 'utf8'))
    : null;
  const score = analyze(files, invocations, {
    firstWriteAt: firstWriteAt(sandboxDir, files),
    ...opts,
  });
  return {
    sandboxDir,
    files: files.map(f => ({path: f.path, status: f.status})),
    notes,
    ...score,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────

function main() {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i !== -1 ? argv[i + 1] : undefined;
  };

  const single = get('--sandbox');
  if (single) {
    console.log(JSON.stringify(evaluateSandbox(path.resolve(single)), null, 2));
    return;
  }

  const experiment = get('--experiment');
  if (!experiment) {
    console.error(
      'usage: adoption-eval.ts --experiment <id> | --sandbox <dir>',
    );
    process.exit(2);
  }
  const resultsDir = path.resolve(
    get('--results') ?? path.join(import.meta.dirname, '..', 'results'),
  );
  const config = JSON.parse(
    fs.readFileSync(
      path.join(resultsDir, `adoption-config-${experiment}.json`),
      'utf8',
    ),
  );

  for (const [conditionId, iterDir] of Object.entries<string>(
    config.iterDirs,
  )) {
    const tasksDir = path.join(iterDir, 'tasks');
    const evalsDir = path.join(iterDir, 'evals');
    fs.mkdirSync(evalsDir, {recursive: true});
    for (const taskFile of fs.readdirSync(tasksDir)) {
      const task = JSON.parse(
        fs.readFileSync(path.join(tasksDir, taskFile), 'utf8'),
      );
      const result = {
        taskId: task.taskId,
        promptId: task.promptId,
        tier: task.tier,
        condition: conditionId,
        precedent: task.precedent,
        ...evaluateSandbox(task.sandboxDir),
      };
      fs.writeFileSync(
        path.join(evalsDir, `${task.taskId}.json`),
        JSON.stringify(result, null, 2),
      );
      console.log(
        `${conditionId.padEnd(14)} ${task.taskId.padEnd(22)} ${result.adoption.decision.padEnd(13)} ` +
          `hatches=${result.escapeHatches.total} flags=${result.flags.length}`,
      );
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('adoption-eval.ts')) {
  main();
}
