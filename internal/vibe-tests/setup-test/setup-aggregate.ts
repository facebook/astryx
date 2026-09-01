// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Aggregate setup measurements with strict matrix and acceptance accounting. */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadOptionalExecutionProvenance} from '../src/provenance-aggregation.js';
import {
  compareCandidate,
  failureCauses,
  passesAcceptance,
  scoreArm,
  strictAcceptanceSummary,
  verdict,
  type HardDimension,
  type Measurement,
  type SetupScore,
} from './setup-eval.js';
// This JavaScript module is covered by its focused runtime tests.
// @ts-expect-error -- setup-matrix.mjs intentionally has no declaration output.
import {expandSetupMatrix, setupCellKey} from './setup-matrix.mjs';
// This JavaScript module owns the public-boundary checks for emitted reports.
// @ts-expect-error -- public-artifact.mjs intentionally has no declarations.
import {
  assertPublicArtifactSafe,
  sanitizePublicArtifact,
} from '../src/public-artifact.mjs';

type MatrixEntry = {
  id: string;
  fixture: string;
  condition: string;
  prompt: string;
  bundle: string;
  rep: number;
};
type MatrixConfig = {
  stages: Array<{id: string}>;
};
const expandMatrix = expandSetupMatrix as (
  config: MatrixConfig,
  selection: {stage: string},
) => MatrixEntry[];
const cellKey = setupCellKey as (entry: {
  condition: string;
  fixture: string;
  prompt: string;
  bundle: string;
  rep: number;
}) => string;

const HERE = path.dirname(fileURLToPath(import.meta.url));

function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

export type SetupAggregateRow = {
  id: string;
  file: string;
  stage: string;
  fixture: string;
  prompt: string;
  condition: string;
  bundle: string;
  executor: string;
  rep: number;
  score: SetupScore;
};

export function assertAggregateReportPublicSafe(value: unknown) {
  assertPublicArtifactSafe(value, {label: 'setup aggregate report'});
}

export function matrixCoverage(
  rows: SetupAggregateRow[],
  expectedEntries: Array<{id: string}>,
) {
  const expected = new Set(expectedEntries.map(entry => entry.id));
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
  }
  return {
    missing: [...expected].filter(id => !counts.has(id)).sort(),
    duplicate: [...counts]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
      .sort(),
    unexpected: [...counts.keys()].filter(id => !expected.has(id)).sort(),
  };
}

export function compareGuidanceRows(rows: SetupAggregateRow[]) {
  const byCell = new Map<
    string,
    Partial<Record<'current' | 'candidate', SetupAggregateRow>>
  >();
  for (const row of rows) {
    if (row.condition !== 'current' && row.condition !== 'candidate') {
      continue;
    }
    const key = [row.fixture, row.prompt, row.bundle, `r${row.rep}`].join('__');
    const pair = byCell.get(key) ?? {};
    pair[row.condition] = row;
    byCell.set(key, pair);
  }
  type GuidanceComparison =
    | {cell: string; complete: false}
    | ({cell: string; complete: true} & ReturnType<typeof compareCandidate>);
  const comparisons: GuidanceComparison[] = [...byCell]
    .map(([cell, pair]): GuidanceComparison => {
      if (!pair.current || !pair.candidate) {
        return {cell, complete: false};
      }
      return {
        cell,
        complete: true,
        ...compareCandidate(pair.current.score, pair.candidate.score),
      };
    })
    .sort((left, right) => left.cell.localeCompare(right.cell));
  const complete = comparisons.every(comparison => comparison.complete);
  const regressions: string[] = [];
  const improvements = new Set<HardDimension>();
  for (const comparison of comparisons) {
    if (!comparison.complete) {
      continue;
    }
    for (const dimension of comparison.regressions) {
      regressions.push(`${comparison.cell}:${dimension}`);
    }
    for (const dimension of comparison.improvements) {
      improvements.add(dimension);
    }
  }
  return {
    comparisons,
    complete,
    regressions,
    improvements: [...improvements].sort(),
  };
}

function renderTable(rows: SetupAggregateRow[]) {
  const header = [
    'stage',
    'fixture',
    'prompt',
    'condition',
    'executor',
    'rep',
    'run',
    'builds',
    'runtime',
    'regressions',
    'unreadable',
    'layers',
    'task',
    'integrity',
    'verdict',
    'cause',
    'accepts',
  ];
  const body = rows.map(row => [
    row.stage,
    row.fixture,
    row.prompt,
    row.condition,
    row.executor,
    String(row.rep || '-'),
    row.score.validRun
      ? row.score.executionSucceeded
        ? 'ok'
        : 'AGENT-FAILURE'
      : 'INVALID',
    row.score.builds ? 'yes' : 'NO',
    String(row.score.consoleErrors + row.score.failedRequests),
    `${row.score.regressions} (${Object.entries(row.score.byCategory)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => `${category[0]}${count}`)
      .join(' ')})`,
    String(row.score.contrastFailures.length),
    String(
      row.score.layeringFailures.length + row.score.layerOrderFailures.length,
    ),
    row.score.taskSuccess ? 'yes' : 'NO',
    String(row.score.integrityFailures.length),
    verdict(row.score),
    failureCauses(row.score).join('+') || '-',
    passesAcceptance(row.score) ? 'yes' : 'NO',
  ]);
  const widths = header.map((heading, index) =>
    Math.max(heading.length, ...body.map(row => row[index].length)),
  );
  const line = (cells: string[]) =>
    cells.map((cell, index) => cell.padEnd(widths[index])).join(' | ');
  console.log(line(header));
  console.log(widths.map(width => '-'.repeat(width)).join('-+-'));
  for (const row of body) {
    console.log(line(row));
  }
}

async function main() {
  const directory = path.resolve(argument('dir', 'results'));
  const legacyBaseline = argument('baseline', 'baseline');
  const matrixFile = path.resolve(
    argument('matrix', path.join(HERE, 'matrix.json')),
  );
  const stageId = argument('stage', 'confirmation');
  const matrix = JSON.parse(
    fs.readFileSync(matrixFile, 'utf8'),
  ) as MatrixConfig;
  const stage = matrix.stages.find(entry => entry.id === stageId);
  if (!stage) {
    throw new Error(`unknown stage: ${stageId}`);
  }
  const expectedEntries = expandMatrix(matrix, {stage: stageId});

  const load = (file: string): Measurement =>
    JSON.parse(
      fs.readFileSync(path.join(directory, file), 'utf8'),
    ) as Measurement;
  const measurementFiles = fs
    .readdirSync(directory)
    .filter(
      file => file.endsWith('.json') && !file.endsWith('.provenance.json'),
    );
  const baselineFiles = new Map(
    measurementFiles
      .filter(file => file.startsWith('baseline__'))
      .map(file => [file.slice('baseline__'.length, -'.json'.length), file]),
  );
  const armFiles = measurementFiles.filter(
    file => !file.startsWith('baseline__') && file !== `${legacyBaseline}.json`,
  );

  const rows = armFiles.flatMap(file => {
    const stem = path.basename(file, '.json');
    const provenance = loadOptionalExecutionProvenance(
      path.join(directory, `${stem}.provenance.json`),
    );
    if (!provenance) {
      return [];
    }
    const matrixMetadata = provenance.matrix as
      {stage?: string; bundle?: string} | undefined;
    const rowStage = matrixMetadata?.stage ?? 'unknown';
    if (rowStage !== stageId) {
      return [];
    }
    const arm = load(file);
    const fixture = provenance.fixture?.id ?? arm.fixture;
    const baselineFile =
      (fixture && baselineFiles.get(fixture)) ?? `${legacyBaseline}.json`;
    if (!fixture || !fs.existsSync(path.join(directory, baselineFile))) {
      throw new Error(
        `No baseline measurement found for fixture ${fixture ?? 'unknown'}`,
      );
    }
    const dimensions = {
      condition: provenance.condition ?? 'unknown',
      fixture,
      prompt: provenance.task?.id ?? 'unknown',
      bundle: matrixMetadata?.bundle ?? 'unknown',
      rep: provenance.rep ?? 0,
    };
    return [
      {
        id: `${rowStage}__${cellKey(dimensions)}`,
        file,
        stage: rowStage,
        fixture,
        prompt: dimensions.prompt,
        condition: dimensions.condition,
        bundle: dimensions.bundle,
        executor: provenance.executor
          ? `${provenance.executor.harness}/${provenance.executor.model}`
          : 'unknown/unknown',
        rep: dimensions.rep,
        score: scoreArm(load(baselineFile), arm),
      },
    ];
  });

  const coverage = matrixCoverage(rows, expectedEntries);
  const completeCoverage =
    coverage.missing.length === 0 &&
    coverage.duplicate.length === 0 &&
    coverage.unexpected.length === 0;
  const summary = strictAcceptanceSummary(
    rows.map(row => row.score),
    expectedEntries.length,
    completeCoverage,
  );
  assertAggregateReportPublicSafe({stageId, rows, coverage});

  console.log(`\nSetup run — stage: ${stageId}\n`);
  renderTable(rows);
  console.log(
    `\nCoverage: ${summary.coverage.valid}/${summary.coverage.expected} valid` +
      ` (${summary.coverage.present} present)`,
  );
  console.log(
    `Strict clean rate: ${summary.strictClean.numerator}/${summary.strictClean.denominator}`,
  );
  console.log(
    `Damage-free: ${summary.damageFree.numerator}/${summary.damageFree.denominator}`,
  );
  if (coverage.missing.length > 0) {
    console.log(`Missing cells: ${coverage.missing.join(', ')}`);
  }
  if (coverage.duplicate.length > 0) {
    console.log(`Duplicate cells: ${coverage.duplicate.join(', ')}`);
  }
  if (coverage.unexpected.length > 0) {
    console.log(`Unexpected cells: ${coverage.unexpected.join(', ')}`);
  }

  if (stageId === 'guidance') {
    const comparison = compareGuidanceRows(rows);
    console.log('\nCandidate minus current by cell (negative is better):');
    for (const result of comparison.comparisons) {
      if (!result.complete) {
        console.log(`  ${result.cell}: INCOMPLETE`);
        continue;
      }
      const deltas = Object.entries(result.deltas)
        .map(
          ([dimension, delta]) =>
            `${dimension}=${delta >= 0 ? '+' : ''}${delta}`,
        )
        .join(' ');
      console.log(`  ${result.cell}: ${deltas}`);
    }
    console.log(
      'Exploratory comparison only: review the explicit tradeoffs; no automatic ranking is applied.',
    );
  }

  if (stageId === 'confirmation') {
    console.log(
      `Final confirmation: ${completeCoverage && summary.passes ? 'PASS' : 'FAIL'}`,
    );
    if (!completeCoverage || !summary.passes) {
      process.exitCode = 1;
    }
  }
}

const isMain =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  await main().catch(error => {
    const message = sanitizePublicArtifact(String(error), {
      privateValues: [
        process.cwd(),
        process.env.HOME,
        process.env.USER,
        process.env.HOSTNAME,
      ].filter((value): value is string => typeof value === 'string'),
    });
    console.error(message);
    process.exitCode = 1;
  });
}
