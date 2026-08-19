#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file audit.mjs
 * @description Scores every lab graduation candidate against the 30-check
 *   rubric and writes the readiness report the Storybook panel reads. Merges
 *   what the repo can prove (`automated.mjs`) over what the manifest claims
 *   (`manifest.mjs`), so a stale claim is corrected by the source tree rather
 *   than trusted.
 * @input --output <file> --registry <file> --candidate <id> --check --json
 * @output Readiness report JSON (schema v1) and the derived Storybook
 *   registry. Exits 1 in `--check` mode when a manifest claim is contradicted.
 * @position Run locally via `pnpm lab:readiness`, and in CI to keep the
 *   committed report honest. Replaces the ad-hoc report that was generated
 *   from an unlanded working tree and could never be reproduced.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

import {
  CHECK_CATALOG,
  CHECK_KEYS,
  HUMAN_REVIEW_KEYS,
  PASSING_STATE,
  REPORT_KIND,
  SCHEMA_VERSION,
  STAGE_DEFINITIONS,
  getCheck,
} from './catalog.mjs';
import {deriveChecks} from './automated.mjs';
import {CANDIDATES} from './manifest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');

const DEFAULT_OUTPUT = 'apps/storybook/.lab-readiness/latest.json';
const DEFAULT_REGISTRY =
  'apps/storybook/.storybook/lab-readiness/generated-registry.json';

const args = process.argv.slice(2);
const getArg = name => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = name => args.includes(`--${name}`);

/** Current commit and whether the tree is dirty, for report provenance. */
function gitProvenance(repoRoot) {
  const run = cmd => {
    try {
      return execFileSync('git', cmd, {
        cwd: repoRoot,
        encoding: 'utf8',
        // A scratch dir is not a repo; that is expected, not worth the noise.
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch {
      return null;
    }
  };
  return {
    sourceSha: run(['rev-parse', 'HEAD']),
    dirty: run(['status', '--porcelain']) !== '',
  };
}

/**
 * Resolve one check's final state.
 *
 * Precedence is deliberate: a derived result always beats a declared one, and
 * an evidence-free `passed` claim is demoted. Human-review checks are never
 * derivable, so they pass through as declared — but the manifest cannot mark
 * them `passed` without evidence either.
 */
function resolveCheck(key, declared, derived) {
  const catalog = getCheck(key);

  if (derived && !catalog.humanReview) {
    const contradicts =
      declared?.state === PASSING_STATE && derived.state !== PASSING_STATE;
    return {
      state: derived.state,
      note: derived.note,
      evidence: declared?.evidence ?? [],
      derivedEvidence: derived.evidence,
      provenance: 'derived',
      contradictsManifest: contradicts,
    };
  }

  const state = declared?.state ?? 'not_started';
  const evidence = declared?.evidence ?? [];
  // A passing claim with nothing to open is not a claim, it is an assertion.
  const demoted = state === PASSING_STATE && evidence.length === 0;
  return {
    state: demoted ? 'in_progress' : state,
    note: demoted
      ? `${declared?.note ? `${declared.note} ` : ''}Demoted: a passing claim requires linked evidence.`
      : (declared?.note ?? 'No verified evidence has been linked.'),
    evidence,
    derivedEvidence: [],
    provenance: 'declared',
    contradictsManifest: false,
  };
}

/** Roll per-check states up into stage and section tallies. */
function scoreStages(checks) {
  const byKey = new Map(checks.map(c => [c.key, c]));
  const stageResults = {};

  for (const stage of STAGE_DEFINITIONS) {
    const stageChecks = CHECK_CATALOG.filter(c => c.stageKey === stage.key);
    const sections = {};

    for (const check of stageChecks) {
      const section = (sections[check.sectionKey] ??= {
        state: 'not_started',
        passedChecks: 0,
        applicableChecks: 0,
        totalChecks: 0,
      });
      section.totalChecks += 1;
      section.applicableChecks += 1;
      if (byKey.get(check.key)?.state === PASSING_STATE) {
        section.passedChecks += 1;
      }
    }

    for (const section of Object.values(sections)) {
      section.state =
        section.passedChecks === section.applicableChecks
          ? 'passed'
          : section.passedChecks === 0
            ? 'not_started'
            : 'in_progress';
    }

    const passedChecks = Object.values(sections).reduce(
      (n, s) => n + s.passedChecks,
      0,
    );
    const applicableChecks = Object.values(sections).reduce(
      (n, s) => n + s.applicableChecks,
      0,
    );
    // A stage with some but not all checks passing is in progress; a stage
    // where a section has started is in progress even if none passed yet.
    const anyStarted = stageChecks.some(
      c => byKey.get(c.key)?.state === 'in_progress',
    );
    stageResults[stage.key] = {
      state:
        passedChecks === applicableChecks
          ? 'passed'
          : passedChecks > 0 || anyStarted
            ? 'in_progress'
            : 'not_started',
      passedChecks,
      applicableChecks,
      totalChecks: applicableChecks,
      sections,
    };
  }

  return stageResults;
}

/** Score one candidate into its full check list, stage rollup, and summary. */
export function auditCandidate(repoRoot, candidate) {
  const derived = deriveChecks(repoRoot, candidate);

  const checks = CHECK_KEYS.map(key => {
    const catalog = getCheck(key);
    const resolved = resolveCheck(key, candidate.declared?.[key], derived[key]);
    return {...catalog, ...resolved, key};
  });

  const stageResults = scoreStages(checks);
  const passed = checks.filter(c => c.state === PASSING_STATE).length;
  const contradictions = checks.filter(c => c.contradictsManifest);
  const blockingStage = STAGE_DEFINITIONS.find(
    s => stageResults[s.key].state !== 'passed',
  );

  return {
    id: candidate.id,
    candidateId: candidate.id,
    displayName: candidate.displayName,
    sourceDir: candidate.sourceDir,
    targetPackage: candidate.targetPackage,
    trackingIssue: candidate.trackingIssue,
    voteIssue: candidate.voteIssue,
    storybookStoryId: candidate.storybookStoryId,
    publicExports: candidate.publicExports,
    summary: candidate.summary,
    passedChecks: passed,
    totalChecks: CHECK_KEYS.length,
    isGraduationReady: passed === CHECK_KEYS.length,
    summaryText: buildSummary(candidate, passed, blockingStage, contradictions),
    contradictions: contradictions.map(c => ({key: c.key, note: c.note})),
    stageResults,
    checks,
  };
}

function buildSummary(candidate, passed, blockingStage, contradictions) {
  const total = CHECK_KEYS.length;
  if (passed === total) {
    return `${candidate.displayName} passes all ${total} checks and is ready to graduate into ${candidate.targetPackage}.`;
  }
  const parts = [
    `${candidate.displayName} passes ${passed} of ${total} checks; the ${blockingStage.label} stage is the first that is not complete.`,
  ];
  if (contradictions.length > 0) {
    parts.push(
      `${contradictions.length} manifest claim${contradictions.length === 1 ? '' : 's'} contradicted by the source tree: ${contradictions.map(c => c.key).join(', ')}.`,
    );
  }
  return parts.join(' ');
}

/** Build the full report envelope. */
export function buildReport(repoRoot, candidates) {
  const startedAt = new Date().toISOString();
  const {sourceSha, dirty} = gitProvenance(repoRoot);
  const audited = candidates.map(c => auditCandidate(repoRoot, c));
  const finishedAt = new Date().toISOString();

  return {
    schemaVersion: SCHEMA_VERSION,
    kind: REPORT_KIND,
    auditedAt: finishedAt,
    run: {
      id: `lab-${finishedAt.replace(/[-:.]/g, '')}`,
      status: 'completed',
      startedAt,
      finishedAt,
      sourceSha,
      dirty,
      candidateIds: audited.map(c => c.id),
      completedCount: audited.length,
      failedCount: 0,
    },
    stageDefinitions: STAGE_DEFINITIONS,
    checkCatalog: CHECK_CATALOG,
    humanReviewKeys: HUMAN_REVIEW_KEYS,
    candidates: audited,
  };
}

/** The slimmer shape the Storybook readiness panel consumes. */
export function buildRegistry(report) {
  return {
    schemaVersion: report.schemaVersion,
    auditedAt: report.auditedAt.slice(0, 10),
    stageDefinitions: report.stageDefinitions,
    components: report.candidates.map(c => ({
      id: c.id,
      displayName: c.displayName,
      sourceDir: c.sourceDir,
      targetPackage: c.targetPackage,
      trackingIssue: c.trackingIssue,
      voteIssue: c.voteIssue,
      storybookStoryId: c.storybookStoryId,
      summary: c.summary,
      auditedAt: report.auditedAt.slice(0, 10),
      passedChecks: c.passedChecks,
      totalChecks: c.totalChecks,
      isGraduationReady: c.isGraduationReady,
      stageResults: c.stageResults,
      checks: c.checks.map(check => ({
        key: check.key,
        label: check.label,
        state: check.state,
        note: check.note,
        evidence: check.evidence,
        provenance: check.provenance,
      })),
    })),
  };
}

function writeJSON(repoRoot, relPath, value) {
  const abs = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(abs), {recursive: true});
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
  return abs;
}

function main() {
  const only = getArg('candidate');
  const candidates = only
    ? CANDIDATES.filter(c => c.id === only)
    : CANDIDATES;

  if (candidates.length === 0) {
    console.error(
      `No candidate matches "${only}". Known: ${CANDIDATES.map(c => c.id).join(', ')}`,
    );
    process.exit(1);
  }

  const report = buildReport(REPO_ROOT, candidates);

  if (hasFlag('json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  for (const candidate of report.candidates) {
    const bar = `${candidate.passedChecks}/${candidate.totalChecks}`;
    console.log(`\n${candidate.displayName}  ${bar}`);
    for (const stage of report.stageDefinitions) {
      const s = candidate.stageResults[stage.key];
      console.log(
        `  ${stage.label.padEnd(16)} ${String(s.passedChecks).padStart(2)}/${s.applicableChecks}  ${s.state}`,
      );
    }
    const failing = candidate.checks.filter(c => c.state !== PASSING_STATE);
    if (failing.length > 0) {
      console.log('  open:');
      for (const check of failing) {
        console.log(`    - ${check.key}: ${check.note}`);
      }
    }
  }

  if (hasFlag('check')) {
    const contradicted = report.candidates.flatMap(c =>
      c.contradictions.map(x => `${c.id}/${x.key}`),
    );
    // Also detect positive staleness: a derived check now passes but the
    // manifest still claims not_started/in_progress — the manifest is behind.
    const stale = report.candidates.flatMap(c => {
      const candidate = CANDIDATES.find(cand => cand.id === c.id);
      if (!candidate) return [];
      return c.checks
        .filter(
          ch =>
            ch.provenance === 'derived' &&
            ch.state === PASSING_STATE,
        )
        .filter(ch => {
          const declared = candidate.declared?.[ch.key];
          return (
            declared != null &&
            declared.state != null &&
            declared.state !== PASSING_STATE
          );
        })
        .map(ch => `${c.id}/${ch.key}`);
    });
    const issues = [...contradicted, ...stale];
    if (issues.length > 0) {
      console.error(
        `\nManifest is stale — these checks disagree with the source tree:\n  ${issues.join('\n  ')}`,
      );
      process.exit(1);
    }
    console.log('\nManifest agrees with the source tree.');
    return;
  }

  const reportPath = writeJSON(
    REPO_ROOT,
    getArg('output') || DEFAULT_OUTPUT,
    report,
  );
  const registryPath = writeJSON(
    REPO_ROOT,
    getArg('registry') || DEFAULT_REGISTRY,
    buildRegistry(report),
  );
  console.log(`\nWrote ${path.relative(REPO_ROOT, reportPath)}`);
  console.log(`Wrote ${path.relative(REPO_ROOT, registryPath)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
