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
 * The timed region inside that process is the spec's protocol, unsmoothed:
 * ten untimed warmups, then one median of nine alternating paired rounds,
 * for a stable plugin list and a recreated equivalent one, against the
 * omitted baseline.
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

  it.each([200, 500])(
    'keeps the representative three-helper set within 25 percent of the empty pipeline at %i sections',
    sections => {
      // Each attempt is a whole fresh process running the exact protocol;
      // nothing is averaged across them. The A/A control decides whether
      // the attempt counts: it ran the same protocol with identical work on
      // both sides, so anything it reports above the budget is this
      // machine's own measurement error, and an A/B number taken beside it
      // would be noise attributed to the helpers. A contended attempt is
      // therefore retried rather than certified — and if the box never
      // settles, the failure says so instead of blaming the code.
      let measured = runBenchmark(benchmarkArgv(sections), sections);
      for (let retry = 0; retry < 2 && measured.control > 1.25; retry++) {
        console.log(
          `  ${sections} sections: A/A control ${measured.control.toFixed(3)} —` +
            ' machine too contended to measure; retrying',
        );
        measured = runBenchmark(benchmarkArgv(sections), sections);
      }
      const {stable, recreated, control} = measured;
      console.log(
        `  ${sections} sections, FR23 representative set over empty:` +
          ` stable ${stable.toFixed(3)}, recreated ${recreated.toFixed(3)}` +
          ` (budget 1.25, A/A control ${control.toFixed(3)})`,
      );
      expect(
        control,
        'the machine was too contended to measure FR23; this is an ' +
          'environment failure, not a helper regression',
      ).toBeLessThanOrEqual(1.25);
      expect(stable).toBeLessThanOrEqual(1.25);
      expect(recreated).toBeLessThanOrEqual(1.25);
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
