// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Links between docs (spec:AST-047 FR9): the target grammar, and how a
 * list of blocks comes back with every link resolved or named as a problem.
 */

import {describe, expect, it} from 'vitest';
import {
  linkBlocks,
  linkSections,
  parseLinkTarget,
  unlinkText,
} from './links.mjs';

/** A resolver over two docs, the second from another provider. */
const resolve = async (/** @type {string} */ target) => {
  const docs = {
    'command:doctor': {route: 'cli/commands/doctor', title: 'astryx doctor'},
    '@acme/kit:generic:setup': {route: 'acme/setup', title: 'Set up Acme'},
  };
  const doc = /** @type {any} */ (docs)[target];
  return doc
    ? {
        target,
        id: `id:${target}`,
        route: doc.route,
        title: doc.title,
        summary: `About ${doc.title}.`,
        command: `astryx docs ${doc.route}`,
      }
    : {problem: `"${target}" names no doc`};
};

describe('parseLinkTarget', () => {
  it('reads a doc of the same provider, or of a named one', () => {
    expect(parseLinkTarget('command:theme build')).toEqual({
      provider: null,
      kind: 'command',
      name: 'theme build',
    });
    expect(parseLinkTarget('@astryxdesign/cli:function:search')).toEqual({
      provider: '@astryxdesign/cli',
      kind: 'function',
      name: 'search',
    });
  });

  it('refuses a target that is not `[<provider>:]<kind>:<name>`', () => {
    for (const bad of ['', 'search', 'a:b:c:d', 'command:', 'widget:x']) {
      expect(parseLinkTarget(bad)).toHaveProperty('error');
    }
  });
});

describe('linkBlocks', () => {
  it('reads an inline link as the command that opens its doc', async () => {
    const {content, problems} = await linkBlocks(
      [
        {type: 'prose', text: 'Check it with {@link command:doctor}.'},
        {type: 'list', style: 'unordered', items: ['See {@link @acme/kit:generic:setup}']},
        {type: 'table', headers: ['Doc'], rows: [['{@link command:doctor}']]},
        {type: 'code', lang: 'js', code: '{@link command:doctor}'},
      ],
      resolve,
    );
    expect(problems).toEqual([]);
    expect(content[0].text).toBe('Check it with `astryx docs cli/commands/doctor`.');
    expect(content[1].items).toEqual(['See `astryx docs acme/setup`']);
    expect(content[2].rows).toEqual([['`astryx docs cli/commands/doctor`']]);
    // Code is an example: it is shown as written.
    expect(content[3].code).toBe('{@link command:doctor}');
  });

  it('shows a link written in code ticks as written', async () => {
    const {content, problems} = await linkBlocks(
      [{type: 'prose', text: 'Write `{@link <target>}` to link; {@link command:doctor} checks it.'}],
      resolve,
    );
    expect(problems).toEqual([]);
    expect(content[0].text).toBe(
      'Write `{@link <target>}` to link; `astryx docs cli/commands/doctor` checks it.',
    );
  });

  it('gives a reference block and each workflow step the doc they name', async () => {
    const {content, problems} = await linkBlocks(
      [
        {type: 'reference', target: 'command:doctor'},
        {
          type: 'workflow',
          steps: [{title: 'Check', references: ['command:doctor']}],
        },
      ],
      resolve,
    );
    expect(problems).toEqual([]);
    expect(content[0].link).toMatchObject({
      route: 'cli/commands/doctor',
      command: 'astryx docs cli/commands/doctor',
      title: 'astryx doctor',
    });
    expect(content[1].steps[0].links[0].command).toBe(
      'astryx docs cli/commands/doctor',
    );
  });

  it('names every link that finds no doc, and never guesses', async () => {
    const {content, problems} = await linkSections(
      [
        {
          id: 'one',
          title: 'One',
          content: [
            {type: 'prose', text: 'See {@link command:nope}.'},
            {type: 'reference', target: 'generic:gone'},
            {type: 'collection', source: {slot: 'guides'}},
          ],
        },
      ],
      resolve,
    ).then(({sections, problems}) => ({content: sections[0].content, problems}));
    expect(content[0].text).toBe('See {@link command:nope}.');
    expect(content[1].link).toBeNull();
    expect(problems.map(p => [p.section, p.target])).toEqual([
      ['one', 'command:nope'],
      ['one', 'generic:gone'],
      ['one', 'collection:guides'],
    ]);
  });
});

describe('unlinkText', () => {
  it('keeps the name of each link, for an index', () => {
    expect(unlinkText('Run {@link command:theme build} or {@link x}.')).toBe(
      'Run theme build or x.',
    );
  });
});
