// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file report.ts
 * @input Uses ./run (BindingResult) and ./contract (PatternContract)
 * @output `summarize` and `formatReport` — the facts a reader needs, kept as
 *   separate facts.
 * @position Reporting layer. Also the gate: `blockingResults` decides what
 *   fails a build.
 *
 * `docs/specs/AST-021/spec.md` FR11 is the whole design here: report patterns,
 * bindings, applicable expectations, passes, known failures, unrun layers, and
 * exemptions SEPARATELY, and never collapse them into one percentage or grade.
 * A pattern with one required failure is not "mostly conformant", and there is
 * no number in this file that could be mistaken for saying it is.
 *
 * SYNC: When ./run.ts gains a status, add it here and to the README table.
 */

import type {PatternContract} from './contract';
import type {BindingResult, ExpectationResult} from './run';

export interface ReportCounts {
  readonly pass: number;
  readonly fail: number;
  readonly knownFailure: number;
  readonly unexpectedPass: number;
  readonly notApplicable: number;
  readonly unrun: number;
}

export interface Report {
  readonly pattern: string;
  readonly bindings: readonly BindingResult[];
  readonly counts: ReportCounts;
  /** Unrun evidence layers, so nothing reads a green run as full coverage. */
  readonly unrunLayers: readonly string[];
  /** Dimensions this pattern does not own, with the owner that does. */
  readonly exemptions: readonly {
    readonly dimension: string;
    readonly owner: string;
    readonly verifiedBy: string;
    readonly reason: string;
  }[];
}

function count(
  results: readonly ExpectationResult[],
  status: ExpectationResult['status'],
): number {
  return results.filter(result => result.status === status).length;
}

export function summarize<Facts>(
  contract: PatternContract<Facts>,
  bindings: readonly BindingResult[],
): Report {
  const results = bindings.flatMap(binding => binding.results);
  const unrunLayers = [
    ...new Set(
      results
        .filter(result => result.status === 'unrun')
        .map(result => result.evidenceLayer),
    ),
  ].sort();

  const exemptions = Object.entries(contract.exemptions)
    .flatMap(([dimension, exemption]) =>
      exemption == null
        ? []
        : [
            {
              dimension,
              owner: exemption.owner,
              verifiedBy: exemption.verifiedBy,
              reason: exemption.reason,
            },
          ],
    )
    .sort((a, b) => a.dimension.localeCompare(b.dimension));

  return {
    pattern: contract.pattern,
    bindings,
    counts: {
      pass: count(results, 'pass'),
      fail: count(results, 'fail'),
      knownFailure: count(results, 'known-failure'),
      unexpectedPass: count(results, 'unexpected-pass'),
      notApplicable: count(results, 'not-applicable'),
      unrun: count(results, 'unrun'),
    },
    unrunLayers,
    exemptions,
  };
}

/**
 * The results that must fail a build.
 *
 * A `required` expectation that fails is a regression. An unexpected pass is a
 * stale debt record, and AST-021 FR9 requires removing it rather than counting
 * it. An `advisory` failure reports and does not gate (AST-020 FR9), and an
 * `unrun` layer gates nothing — it is a coverage fact, reported as one.
 */
export function blockingResults(
  bindings: readonly BindingResult[],
): readonly {binding: BindingResult; result: ExpectationResult}[] {
  return bindings.flatMap(binding =>
    binding.results
      .filter(
        result =>
          result.status === 'unexpected-pass' ||
          (result.status === 'fail' && result.enforcement === 'required'),
      )
      .map(result => ({binding, result})),
  );
}

/** A reader-legible failure block: which binding, which state, which layer, why. */
export function formatFailures(
  blocking: readonly {binding: BindingResult; result: ExpectationResult}[],
): string {
  return blocking
    .map(
      ({binding, result}) =>
        `${binding.binding} [${binding.state}] via ${binding.harness}\n` +
        `  ${result.description}\n` +
        `  evidence layer: ${result.evidenceLayer} · enforcement: ${result.enforcement} · status: ${result.status}\n` +
        `  ${(result.detail ?? '').split('\n').join('\n  ')}`,
    )
    .join('\n\n');
}

/** The full factual report. Counts stay counts; there is no score to quote. */
export function formatReport(report: Report): string {
  const lines: string[] = [];
  lines.push(`Accessibility spec-test report — pattern "${report.pattern}"`);
  lines.push('');
  for (const binding of report.bindings) {
    lines.push(`${binding.binding} [${binding.state}] via ${binding.harness}`);
    for (const result of binding.results) {
      const suffix =
        result.status === 'known-failure' && result.knownFailure != null
          ? ` (${result.knownFailure.issue})`
          : '';
      lines.push(
        `  ${result.status.padEnd(15)} ${result.expectation} · ${result.evidenceLayer} · ${result.enforcement}${suffix}`,
      );
    }
    lines.push('');
  }
  const {counts} = report;
  lines.push(
    `pass ${counts.pass} · fail ${counts.fail} · known-failure ${counts.knownFailure} · ` +
      `unexpected-pass ${counts.unexpectedPass} · not-applicable ${counts.notApplicable} · unrun ${counts.unrun}`,
  );
  lines.push(
    report.unrunLayers.length === 0
      ? 'unrun evidence layers: none in this run'
      : `unrun evidence layers: ${report.unrunLayers.join(', ')}`,
  );
  for (const exemption of report.exemptions) {
    lines.push(
      `exempt ${exemption.dimension} → ${exemption.owner} (${exemption.verifiedBy})`,
    );
  }
  return lines.join('\n');
}
