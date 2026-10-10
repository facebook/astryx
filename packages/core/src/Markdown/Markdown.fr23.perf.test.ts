// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.fr23.perf.test.ts
 * @input The FR23 benchmark, run as its own process
 * @output The exact `spec:AST-036` FR23 gate against the empty pipeline
 * @position Overhead budget evidence for the canonical plugin protocol
 *
 * The measurement does not run here. This file spawns
 * `Markdown.fr23.bench.ts` as a dedicated Node process, one section size at
 * a time, and only asserts on what that process reports.
 *
 * A fresh process isolates engine state left by other plugin configurations,
 * but it still shares CPU and memory with other Vitest workers. CI and Deploy
 * exclude this file from the parallel UI suite, then run it alone after those
 * workers exit, as the spec's isolated-process-and-runner protocol requires.
 * Local measurements need the same isolation from other test and build work.
 *
 * The timed region inside each process is the spec's protocol, unsmoothed:
 * ten untimed warmups, then one median of nine alternating paired rounds,
 * for a stable plugin list and a recreated equivalent one, against the
 * omitted baseline. One over-budget A/B triggers two fresh-process attempts;
 * the unchanged budget fails only when at least two of the three exceed it.
 */

import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterAll, describe, expect, it} from 'vitest';
import {measureMarkdownPairedRatio} from './Markdown.fr23.sampling';

interface BenchmarkResult {
  readonly sections: number;
  readonly stable: number;
  readonly recreated: number;
  /** An A/A run: identical work both sides, so 1.0 is a perfect machine. */
  readonly control: number;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../../..');
// Inside the repo so the bootstrap can resolve `esbuild` by bare specifier,
// and under node_modules so it is ignored and swept with the install.
const workspace = mkdtempSync(
  path.join(repoRoot, 'node_modules', '.astryx-fr23-'),
);

afterAll(() => {
  rmSync(workspace, {recursive: true, force: true});
});

/**
 * Compiles the benchmark and runs it, inside the spawned process.
 *
 * esbuild cannot run in this suite's jsdom environment (it asserts on a
 * native `TextEncoder`), and the benchmark must not share a process with the
 * runner anyway — so the compile happens out there too.
 */
const bootstrap = path.join(workspace, 'bootstrap.mjs');
writeFileSync(
  bootstrap,
  [
    "import {build} from 'esbuild';",
    "import {pathToFileURL} from 'node:url';",
    'const [entry, outfile, sections] = process.argv.slice(2);',
    'await build({',
    '  entryPoints: [entry],',
    '  outfile,',
    '  bundle: true,',
    "  format: 'esm',",
    "  platform: 'node',",
    "  target: 'node22',",
    "  logLevel: 'silent',",
    '});',
    'process.argv = [process.argv[0], outfile, sections];',
    'await import(pathToFileURL(outfile).href);',
  ].join('\n'),
);

/**
 * Runs one benchmark process and returns what it reported.
 *
 * Throws on a non-zero exit, on output that is not JSON, and on a result
 * whose ratios are unusable. A measurement that did not happen must never
 * read as a measurement that passed.
 */
function runBenchmark(
  argv: ReadonlyArray<string>,
  sections: number,
): BenchmarkResult {
  let stdout: string;
  try {
    stdout = execFileSync(process.execPath, [...argv], {
      encoding: 'utf8',
      timeout: 300_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // The benchmark reports contention diagnostics on stderr; surface them.
  } catch (error) {
    const reason = error as {status?: number; stderr?: string};
    throw new Error(
      `FR23 benchmark process failed (exit ${reason.status ?? 'unknown'}): ${
        reason.stderr?.trim() ?? String(error)
      }`,
      {cause: error},
    );
  }
  const line = stdout.trim().split('\n').pop() ?? '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    throw new Error(`FR23 benchmark produced no result: ${stdout.trim()}`);
  }
  const result = parsed as Partial<BenchmarkResult>;
  if (
    result.sections !== sections ||
    !Number.isFinite(result.stable) ||
    !Number.isFinite(result.recreated) ||
    !Number.isFinite(result.control)
  ) {
    throw new Error(`FR23 benchmark returned an unusable result: ${line}`);
  }
  return result as BenchmarkResult;
}

function benchmarkArgv(sections: number): ReadonlyArray<string> {
  return [
    bootstrap,
    path.join(here, 'Markdown.fr23.bench.ts'),
    path.join(workspace, `fr23-${sections}.mjs`),
    String(sections),
  ];
}

const FR23_BUDGET = 1.25;

function exceedsFR23Budget(result: BenchmarkResult): boolean {
  return result.stable > FR23_BUDGET || result.recreated > FR23_BUDGET;
}

function runSettledBenchmark(sections: number): BenchmarkResult {
  let measured = runBenchmark(benchmarkArgv(sections), sections);
  for (let retry = 0; retry < 2 && measured.control > FR23_BUDGET; retry++) {
    console.log(
      `  ${sections} sections: A/A control ${measured.control.toFixed(3)} —` +
        ' machine too contended to measure; retrying',
    );
    measured = runBenchmark(benchmarkArgv(sections), sections);
  }
  if (measured.control > FR23_BUDGET) {
    throw new Error(
      'the machine was too contended to measure FR23; this is an ' +
        'environment failure, not a helper regression',
    );
  }
  return measured;
}

function logBenchmarkResult(result: BenchmarkResult, attempt: number): void {
  console.log(
    `  ${result.sections} sections, attempt ${attempt}, FR23 representative set over empty:` +
      ` stable ${result.stable.toFixed(3)}, recreated ${result.recreated.toFixed(3)}` +
      ` (budget ${FR23_BUDGET}, A/A control ${result.control.toFixed(3)})`,
  );
}

function collectFR23Attempts(
  sections: number,
  runAttempt: (sections: number) => BenchmarkResult = runSettledBenchmark,
): ReadonlyArray<BenchmarkResult> {
  const attempts = [runAttempt(sections)];
  if (exceedsFR23Budget(attempts[0])) {
    attempts.push(runAttempt(sections));
    attempts.push(runAttempt(sections));
  }
  return attempts;
}

describe('Markdown FR23 helper overhead', () => {
  it('reports one nine-pair median without selecting the cheapest baseline', () => {
    // Paired ratios: four 1.1s, one 1.2, four 10s. The median is 1.2,
    // whereas dividing the separate medians would give 10. Later attempts
    // have a cheaper baseline but a ratio of 2: selecting them biases the
    // result even though the selector never inspects candidate times.
    const baselineCosts = [1000, 1000, 1000, 1000, 10, 10, 10, 10, 10];
    const candidateCosts = [1100, 1100, 1100, 1100, 12, 100, 100, 100, 100];
    const calls: string[] = [];
    let elapsed = 0;
    const callback = (name: string, costs: ReadonlyArray<number>) => {
      let count = 0;
      return () => {
        count++;
        calls.push(name);
        elapsed +=
          count <= 10
            ? 100
            : (costs[Math.floor((count - 11) / 20)] ?? (name === 'B' ? 5 : 10));
        return count;
      };
    };

    expect(
      measureMarkdownPairedRatio(
        callback('B', baselineCosts),
        callback('C', candidateCosts),
        () => elapsed,
      ),
    ).toBeCloseTo(1.2, 10);
    expect(calls).toHaveLength(2 * (10 + 9 * 20));
    expect(calls.slice(0, 20).join('')).toBe('BC'.repeat(10));
    for (let round = 0; round < 9; round++) {
      const pair = ['B'.repeat(20), 'C'.repeat(20)];
      expect(calls.slice(20 + round * 40, 60 + round * 40).join('')).toBe(
        (round % 2 === 0 ? pair : pair.reverse()).join(''),
      );
    }
  });

  it('retries one over-budget A/B twice and uses the three-attempt majority', () => {
    const result = (stable: number, recreated: number): BenchmarkResult => ({
      sections: 200,
      stable,
      recreated,
      control: 1,
    });
    const passFirst = [result(1.2, 1.22)];
    expect(collectFR23Attempts(200, () => passFirst.shift()!)).toHaveLength(1);

    const retryResults = [
      result(1.27, 1.1),
      result(1.2, 1.22),
      result(1.18, 1.19),
    ];
    const attempts = collectFR23Attempts(200, () => retryResults.shift()!);
    expect(attempts).toHaveLength(3);
    expect(attempts.filter(exceedsFR23Budget)).toHaveLength(1);

    const majorityResults = [
      result(1.27, 1.1),
      result(1.2, 1.26),
      result(1.18, 1.19),
    ];
    expect(
      collectFR23Attempts(200, () => majorityResults.shift()!).filter(
        exceedsFR23Budget,
      ),
    ).toHaveLength(2);
  });

  it.each([200, 500])(
    'keeps the representative three-helper set within 25 percent of the empty pipeline at %i sections',
    sections => {
      // Each attempt is a whole fresh process running the exact protocol;
      // nothing is averaged across them. The A/A control decides whether an
      // attempt counts: a value over budget is machine noise, so that process
      // is replaced before its A/B result can certify or fail the helpers.
      //
      // A single over-budget A/B is also noisy at this threshold. Retry that
      // result twice in fresh processes and fail only when a majority (at
      // least two of the three independent attempts) exceeds the unchanged
      // 1.25 budget.
      const attempts = collectFR23Attempts(sections);
      if (attempts.length === 3) {
        console.log(
          `  ${sections} sections: first A/B exceeded ${FR23_BUDGET};` +
            ' retried twice in fresh processes',
        );
      }
      attempts.forEach((result, index) =>
        logBenchmarkResult(result, index + 1),
      );
      const overBudget = attempts.filter(exceedsFR23Budget).length;
      expect(
        overBudget,
        `${overBudget} of ${attempts.length} fresh FR23 attempts exceeded ` +
          `the ${FR23_BUDGET} budget`,
      ).toBeLessThan(2);
    },
    300_000,
  );

  it('fails loudly when the benchmark process cannot produce a result', () => {
    // The gate is only worth having if a measurement that did not happen
    // fails instead of passing quietly.
    const script = (name: string, contents: string): string => {
      const file = path.join(workspace, name);
      writeFileSync(file, contents);
      return file;
    };

    // A crash.
    expect(() =>
      runBenchmark([script('crash.mjs', 'process.exit(3);')], 200),
    ).toThrow(/exit 3/);

    // The benchmark's own argument guard, reached through the real bootstrap.
    expect(() =>
      runBenchmark([...benchmarkArgv(200).slice(0, 3), 'not-a-number'], 200),
    ).toThrow(/benchmark process failed/);

    // Output that is not a result at all.
    expect(() =>
      runBenchmark([script('silent.mjs', 'console.log("not json");')], 200),
    ).toThrow(/produced no result/);

    // A well-formed JSON line that is not a usable measurement.
    expect(() =>
      runBenchmark(
        [
          script(
            'wrong.mjs',
            'console.log(JSON.stringify({sections: 1, stable: null, recreated: 1}));',
          ),
        ],
        200,
      ),
    ).toThrow(/unusable result/);
  });
});
