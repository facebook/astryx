// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.helpers.perf.test.ts
 * @input Deterministic 200/500-section Markdown and zero-work transform helpers
 * @output Zero helper-transform invocations for hinted no-claim plugins
 * @position Helper dispatch regression; full FR23 evidence lands after all helpers
 */

import {describe, expect, it} from 'vitest';
import {parseMarkdown} from './parser';
import {createMarkdownPlugin} from './plugins';
import type {MarkdownExtensionNode} from './plugins';
import type {MarkdownTransform} from './plugins/protocol';
import {createMarkdownFenceTransform} from './plugins/semanticFence';
import {createMarkdownTextTransform} from './plugins/textTransform';

let transformCalls = 0;

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

function observeTransformCalls(
  transform: MarkdownTransform,
): MarkdownTransform {
  const observed: MarkdownTransform = (root, context) => {
    transformCalls++;
    return transform(root, context);
  };
  // Preserve the helper's private source-claim metadata on the observer.
  Object.defineProperties(
    observed,
    Object.getOwnPropertyDescriptors(transform),
  );
  return observed;
}

const zeroWorkPlugins = [
  ...Array.from({length: 4}, (_, index) =>
    createMarkdownPlugin({
      name: `zero-work-${index}`,
      apiVersion: 1,
      transform: observeTransformCalls(
        createMarkdownTextTransform({
          pattern: new RegExp(`NEVER_MATCH_${index}`, 'g'),
          requiredSubstrings: [`NEVER_MATCH_${index}`],
          replace: () => {
            throw new Error('An unclaimed helper callback ran');
          },
        }),
      ),
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
    transform: observeTransformCalls(
      createMarkdownFenceTransform({
        languages: ['never-fence'],
        createNode: ({code}) => {
          throw new Error(`An unclaimed semantic fence callback ran: ${code}`);
        },
      }),
    ),
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

describe('Markdown helper performance', () => {
  it.each([200, 500])(
    'skips five hinted no-claim helpers at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      const baseline = parseMarkdown(source);
      transformCalls = 0;

      expect(parseMarkdown(source, {plugins: zeroWorkPlugins})).toEqual(
        baseline,
      );
      expect(parseMarkdown(source, {plugins: [...zeroWorkPlugins]})).toEqual(
        baseline,
      );
      expect(transformCalls).toBe(0);
    },
  );
});
