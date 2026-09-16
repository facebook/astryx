// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.helpers.perf.test.ts
 * @input Deterministic 200/500-section Markdown with text, fence, and decoration helpers
 * @output Paired median evidence for skipped helpers and for helper-owned overhead
 * @position Helper dispatch regression; full FR23 evidence lands after all helpers
 *
 * The exact FR23 comparison against the omitted/empty pipeline lives in its
 * own file, `Markdown.fr23.perf.test.ts`: it must run in a process that has
 * not already exercised a dozen other plugin configurations, or the engine's
 * state rather than the helpers' work dominates the ratio.
 *
 * A helper that actually runs also pays Core's fixed per-parse transform cost
 * (heading marking, freezing, and validation), which no helper change can
 * move; the running-helper cases below therefore compare against transforms
 * that return their input unchanged so a regression points at the helper.
 * `spec:AST-036` FR23's absolute budgets stay open until that protocol cost
 * and the remaining helpers land.
 */

import {describe, expect, it} from 'vitest';
import {parseMarkdown, parseMarkdownAst} from './parser';
import {
  applyMarkdownTransforms,
  createMarkdownPlugin,
  prepareMarkdownPlugins,
} from './plugins';
import type {MarkdownExtensionNode} from './plugins';
import {createMarkdownFenceTransform} from './semanticFence';
import {createMarkdownSourceDecoration} from './sourceDecoration';
import {createMarkdownTextTransform} from './textTransform';

let benchmarkSink = 0;

function benchmarkDocument(sections: number): string {
  return Array.from({length: sections}, (_, index) =>
    [
      `## Section ${index}`,
      '',
      `AST-${index} belongs to @{owner-${index}} with TODO follow-up.`,
      '',
      `- First item ${index}`,
      '- Second item',
      '',
      `> Quoted detail ${index}`,
      '',
      '| Item | Detail |',
      '| --- | --- |',
      `| ${index} | ordinary prose |`,
      '',
      '```text',
      `opaque ${index}`,
      '```',
    ].join('\n'),
  ).join('\n\n');
}

function median(values: ReadonlyArray<number>): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function measureAverage(callback: () => number): number {
  const start = performance.now();
  for (let iteration = 0; iteration < 20; iteration++) {
    benchmarkSink ^= callback();
  }
  return (performance.now() - start) / 20;
}

function pairedMedianRatio(
  baseline: () => number,
  candidate: () => number,
): number {
  for (let warmup = 0; warmup < 10; warmup++) {
    benchmarkSink ^= baseline();
    benchmarkSink ^= candidate();
  }
  const ratios: number[] = [];
  for (let round = 0; round < 9; round++) {
    const baselineFirst = round % 2 === 0;
    const first = measureAverage(baselineFirst ? baseline : candidate);
    const second = measureAverage(baselineFirst ? candidate : baseline);
    const baselineTime = baselineFirst ? first : second;
    const candidateTime = baselineFirst ? second : first;
    ratios.push(candidateTime / baselineTime);
  }
  void benchmarkSink;
  return median(ratios);
}

const zeroWorkPlugins = [
  ...Array.from({length: 4}, (_, index) =>
    createMarkdownPlugin({
      name: `zero-work-${index}`,
      apiVersion: 1,
      transform: createMarkdownTextTransform({
        pattern: new RegExp(`NEVER_MATCH_${index}`, 'g'),
        requiredSubstrings: [`NEVER_MATCH_${index}`],
        replace: () => {
          throw new Error('An unclaimed helper callback ran');
        },
      }),
    }),
  ),
  createMarkdownPlugin<
    'zero-work-semantic-fence',
    MarkdownExtensionNode<
      'zero-work-semantic-fence',
      'never',
      {readonly value: string},
      'block'
    >
  >({
    name: 'zero-work-semantic-fence',
    apiVersion: 1,
    transform: createMarkdownFenceTransform({
      languages: ['never-fence'],
      createNode: ({code}) => {
        throw new Error(`An unclaimed semantic fence callback ran: ${code}`);
      },
    }),
    renderers: {
      never: {
        render: () => {
          throw new Error('An unclaimed semantic fence renderer ran');
        },
        toText: node => node.data.value,
      },
    },
  }),
];

/**
 * Five decoration helpers whose ranges start past the end of any fixture
 * document, so none of them can claim source and Core skips every one.
 */
const unclaimedDecorationPlugins = Array.from({length: 5}, (_, index) =>
  createMarkdownPlugin({
    name: `unclaimed-decoration-${index}`,
    apiVersion: 1,
    transform: createMarkdownSourceDecoration({
      name: `unclaimed-decoration-${index}`,
      ranges: [{start: 10_000_000 + index, end: 10_000_100 + index}],
    }),
  }),
);

/**
 * Five decoration helpers that claim the source and sweep the whole block
 * list, but whose ranges sit in the blank lines between blocks and therefore
 * record nothing.
 */
function gapDecorationPlugins(
  source: string,
  count: number,
  rangesPerHelper: number,
  prefix: string,
) {
  const gaps: {start: number; end: number}[] = [];
  for (
    let gap = source.indexOf('\n\n');
    gap >= 0 && gaps.length < rangesPerHelper;
    gap = source.indexOf('\n\n', gap + 1)
  ) {
    gaps.push({start: gap, end: gap + 1});
  }
  if (gaps.length < rangesPerHelper) {
    throw new Error('Fixture has too few block gaps for this case');
  }
  return Array.from({length: count}, (_, index) =>
    createMarkdownPlugin({
      name: `${prefix}-${index}`,
      apiVersion: 1,
      transform: createMarkdownSourceDecoration({
        name: `${prefix}-${index}`,
        ranges: gaps,
      }),
    }),
  );
}

/**
 * Transforms that return their input unchanged. Comparing a helper against
 * these isolates the helper's own dispatch from the fixed per-parse cost Core
 * pays for any running transform (heading marking, freezing, validation),
 * which `spec:AST-036` FR23's absolute budgets also cover but which no helper
 * change can move.
 */
function identityPlugins(count: number, prefix: string) {
  return Array.from({length: count}, (_, index) =>
    createMarkdownPlugin({
      name: `${prefix}-${index}`,
      apiVersion: 1,
      transform: root => root,
    }),
  );
}

const identityFivePlugins = identityPlugins(5, 'identity-five');

/** Matches a prose identifier in every fixture section. */
const identifierPlugin = createMarkdownPlugin({
  name: 'representative-identifiers',
  apiVersion: 1,
  transform: createMarkdownTextTransform({
    pattern: /\bAST-\d+\b/g,
    requiredSubstrings: ['AST-'],
    replace: match => ({type: 'text', value: match[0].toLowerCase()}),
  }),
});

/** Turns the ordinary text fence each fixture section carries into data. */
type PerfFenceNode = MarkdownExtensionNode<
  'representative-fences',
  'fence',
  {readonly code: string},
  'block'
>;

const fencePlugin = createMarkdownPlugin<
  'representative-fences',
  PerfFenceNode
>({
  name: 'representative-fences',
  apiVersion: 1,
  transform: createMarkdownFenceTransform<readonly ['text'], PerfFenceNode>({
    languages: ['text'],
    createNode: ({code}) => ({
      type: 'extension',
      plugin: 'representative-fences',
      name: 'fence',
      display: 'block',
      data: {code},
    }),
  }),
  renderers: {
    fence: {
      render: ({node}) => node.data.code,
      toText: node => node.data.code,
    },
  },
});

/** Decorates one known source range: the first section heading. */
function knownRangeDecorationPlugin(source: string) {
  const heading = source.indexOf('## Section 0');
  return createMarkdownPlugin({
    name: 'representative-decoration',
    apiVersion: 1,
    transform: createMarkdownSourceDecoration({
      name: 'representative-decoration',
      ranges: [{start: heading, end: heading + '## Section 0'.length}],
    }),
  });
}

// Each case runs the paired protocol twice (10 warmups, then 9 rounds of two
// 20-iteration averages per side), so a 500-section case parses ~1500 times.
// The bounds below are the measured cost plus generous headroom for a busy
// machine; they exist so a hang fails loudly instead of stalling the suite.
const TIMEOUT_MS: Readonly<Record<number, number>> = {
  200: 60_000,
  500: 180_000,
};

describe('Markdown helper performance', () => {
  // The skip path's real contract is a work count, not a clock: an unclaimed
  // helper's transform must never be entered, for a stable list and for a
  // recreated equivalent one. Asserting the count directly is exact and
  // immune to what else the machine is running; the timing cases below cover
  // the helpers that do run.
  it.each([200, 500])(
    'never enters an unclaimed helper at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      let entered = 0;
      const countingPlugins = [
        ...Array.from({length: 4}, (_, index) =>
          createMarkdownPlugin({
            name: `counted-text-${index}`,
            apiVersion: 1,
            transform: createMarkdownTextTransform({
              pattern: new RegExp(`NEVER_MATCH_${index}`, 'g'),
              requiredSubstrings: [`NEVER_MATCH_${index}`],
              replace: () => {
                entered++;
                return {type: 'text', value: ''};
              },
            }),
          }),
        ),
        createMarkdownPlugin<
          'counted-fence',
          MarkdownExtensionNode<
            'counted-fence',
            'never',
            {readonly value: string},
            'block'
          >
        >({
          name: 'counted-fence',
          apiVersion: 1,
          transform: createMarkdownFenceTransform<
            readonly ['never-fence'],
            MarkdownExtensionNode<
              'counted-fence',
              'never',
              {readonly value: string},
              'block'
            >
          >({
            languages: ['never-fence'],
            createNode: () => {
              entered++;
              return null;
            },
          }),
          renderers: {
            never: {
              render: () => null,
              toText: node => node.data.value,
            },
          },
        }),
        ...Array.from({length: 5}, (_, index) =>
          createMarkdownPlugin({
            name: `counted-decoration-${index}`,
            apiVersion: 1,
            transform: createMarkdownSourceDecoration({
              name: `counted-decoration-${index}`,
              ranges: [{start: 10_000_000 + index, end: 10_000_100 + index}],
            }),
          }),
        ),
      ];

      parseMarkdown(source, {plugins: countingPlugins});
      parseMarkdown(source, {plugins: [...countingPlugins]});
      expect(entered).toBe(0);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'keeps five hinted no-claim helpers within a 1.15 ratio at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      const stableRatio = pairedMedianRatio(
        () => parseMarkdown(source).length,
        () => parseMarkdown(source, {plugins: zeroWorkPlugins}).length,
      );
      const recreatedRatio = pairedMedianRatio(
        () => parseMarkdown(source).length,
        () => parseMarkdown(source, {plugins: [...zeroWorkPlugins]}).length,
      );
      console.log(
        `  ${sections} sections, zero-work ratios: stable ${stableRatio.toFixed(3)}, recreated ${recreatedRatio.toFixed(3)}`,
      );
      expect(stableRatio).toBeLessThanOrEqual(1.15);
      expect(recreatedRatio).toBeLessThanOrEqual(1.15);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'keeps five unclaimed decoration helpers within a 1.15 ratio at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      const stableRatio = pairedMedianRatio(
        () => parseMarkdown(source).length,
        () =>
          parseMarkdown(source, {plugins: unclaimedDecorationPlugins}).length,
      );
      const recreatedRatio = pairedMedianRatio(
        () => parseMarkdown(source).length,
        () =>
          parseMarkdown(source, {plugins: [...unclaimedDecorationPlugins]})
            .length,
      );
      console.log(
        `  ${sections} sections, unclaimed decoration ratios: stable ${stableRatio.toFixed(3)}, recreated ${recreatedRatio.toFixed(3)}`,
      );
      expect(stableRatio).toBeLessThanOrEqual(1.15);
      expect(recreatedRatio).toBeLessThanOrEqual(1.15);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'adds at most 15 percent over plain transforms for five sweeping decorations at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      const sweeping = gapDecorationPlugins(source, 5, 1, 'gap-decoration');
      const ratio = pairedMedianRatio(
        () => parseMarkdown(source, {plugins: identityFivePlugins}).length,
        () => parseMarkdown(source, {plugins: sweeping}).length,
      );
      console.log(
        `  ${sections} sections, sweeping decoration over identity: ${ratio.toFixed(3)}`,
      );
      expect(ratio).toBeLessThanOrEqual(1.15);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'costs the ranges it carries, not blocks times ranges, at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      // The sweep admits and retires each range once, so doubling the
      // ranges over the same document should roughly double the sweep's
      // own work — not square it. Both sides walk every block and decorate
      // nothing, so range count is the only thing that differs, and the
      // bound sits far below the 4x a blocks-times-ranges implementation
      // would show.
      const gaps: {start: number; end: number}[] = [];
      for (
        let gap = source.indexOf('\n\n');
        gap >= 0;
        gap = source.indexOf('\n\n', gap + 1)
      ) {
        gaps.push({start: gap, end: gap + 1});
      }
      const doubled = gaps.flatMap(gap => [
        gap,
        {start: gap.start, end: gap.end + 1},
      ]);
      const plugin = (
        name: string,
        ranges: ReadonlyArray<{start: number; end: number}>,
      ) => [
        createMarkdownPlugin({
          name: `${name}-${sections}`,
          apiVersion: 1,
          transform: createMarkdownSourceDecoration({name, ranges}),
        }),
      ];

      // Timed on the transform stage alone and compared at the FASTEST
      // sample of each side: this is a few hundred microseconds against a
      // parse of milliseconds, so measuring the whole parse buries it, and
      // a minimum is the least-disturbed sample each side achieved.
      const root = parseMarkdownAst(source);
      const fastestTransform = (
        plugins: ReadonlyArray<ReturnType<typeof createMarkdownPlugin>>,
      ): number => {
        const prepared = prepareMarkdownPlugins(plugins);
        let fastest = Number.POSITIVE_INFINITY;
        for (let sample = 0; sample < 60; sample++) {
          const start = performance.now();
          benchmarkSink ^= applyMarkdownTransforms(
            root,
            prepared,
            source,
            true,
            'block',
          ).children.length;
          fastest = Math.min(fastest, performance.now() - start);
        }
        void benchmarkSink;
        return fastest;
      };

      const single = plugin('scale-single', gaps);
      const double = plugin('scale-double', doubled);
      // Warm both before either is recorded.
      fastestTransform(single);
      fastestTransform(double);
      const ratio = fastestTransform(double) / fastestTransform(single);
      console.log(
        `  ${sections} sections, ${doubled.length} ranges over ${gaps.length}: ${ratio.toFixed(3)}`,
      );
      expect(ratio).toBeLessThanOrEqual(2.6);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'adds at most 15 percent to a matching prose helper when it decorates a known range at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      // The baseline's second transform also returns a replacement root, so
      // both sides pay Core's validation of a changed tree and the ratio
      // reports the decoration walk itself.
      const withoutDecoration = [
        identifierPlugin,
        createMarkdownPlugin({
          name: `representative-replacement-${sections}`,
          apiVersion: 1,
          transform: root => ({...root}),
        }),
      ];
      const withDecoration = [
        identifierPlugin,
        knownRangeDecorationPlugin(source),
      ];
      const ratio = pairedMedianRatio(
        () => parseMarkdown(source, {plugins: withoutDecoration}).length,
        () => parseMarkdown(source, {plugins: withDecoration}).length,
      );
      console.log(
        `  ${sections} sections, known-range decoration over prose helper: ${ratio.toFixed(3)}`,
      );
      expect(ratio).toBeLessThanOrEqual(1.15);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'keeps the representative three-helper set within 25 percent of three plain transforms at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      // The same set against three transforms that each return a replacement
      // root. Both sides then pay Core's per-transform guards, so this ratio
      // reports what the three helpers themselves cost — the part a helper
      // change can actually move.
      const baseline = Array.from({length: 3}, (_, index) =>
        createMarkdownPlugin({
          name: `representative-baseline-${sections}-${index}`,
          apiVersion: 1,
          transform: root => ({...root}),
        }),
      );
      const representative = [
        identifierPlugin,
        fencePlugin,
        knownRangeDecorationPlugin(source),
      ];
      const ratio = pairedMedianRatio(
        () => parseMarkdown(source, {plugins: baseline}).length,
        () => parseMarkdown(source, {plugins: representative}).length,
      );
      console.log(
        `  ${sections} sections, representative set over three transforms: ${ratio.toFixed(3)}`,
      );
      expect(ratio).toBeLessThanOrEqual(1.25);
    },
    TIMEOUT_MS[500],
  );

  it.each([200, 500])(
    'keeps a trusted helper far below an equivalent plugin-authored transform at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      // Trusted Core helpers skip the guards Core applies to plugin-authored
      // output. Comparing the decoration helper against a plugin transform
      // that returns an equivalent replacement root measures that saving
      // without depending on absolute machine speed.
      const pluginAuthored = createMarkdownPlugin({
        name: `trusted-comparison-${sections}`,
        apiVersion: 1,
        transform: root => ({...root, children: [...root.children]}),
      });
      const ratio = pairedMedianRatio(
        () => parseMarkdown(source, {plugins: [pluginAuthored]}).length,
        () =>
          parseMarkdown(source, {
            plugins: [knownRangeDecorationPlugin(source)],
          }).length,
      );
      console.log(
        `  ${sections} sections, trusted decoration over plugin-authored transform: ${ratio.toFixed(3)}`,
      );
      expect(ratio).toBeLessThanOrEqual(0.85);
    },
    TIMEOUT_MS[500],
  );
});
