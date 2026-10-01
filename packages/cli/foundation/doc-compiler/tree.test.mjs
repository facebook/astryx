// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the docs tree (spec:AST-046): one home per doc, decided by
 * explicit placement, then one adoption rule; every way a placement can fail;
 * generated kind levels; deterministic order; and the CLI's own tree.
 *
 * @input Plain fixture inputs for the pure builder, and this package's own
 *   tree files and typed docs for the loader.
 * @output Assertions on routes, parents, slots, children order, and
 *   diagnostics.
 * @position packages/cli/foundation/doc-compiler — tests for tree.mjs.
 */

import {describe, expect, it} from 'vitest';
import {
  buildDocsTree,
  KIND_GROUPS,
  loadDocsTree,
  loadTreeInputs,
  routeSegment,
} from './tree.mjs';
import {loadCliSelfDocs} from '../discovery/cli-self-docs.mjs';
import * as api from '../../api/index.mjs';
import {createDocId} from '../identity/provider-identity.mjs';
import {CLI_PROVIDER_ID} from '../identity/providers.mjs';

const SLOW = 60_000;
const P = '@acme/kit';

/**
 * @param {string} name
 * @param {object} [extra]
 * @returns {import('./tree.mjs').TreeNamespaceInput}
 */
const ns = (name, extra = {}) => ({
  provider: P,
  providerId: P,
  source: `${P}/tree/${name}.doc.mjs`,
  doc: /** @type {any} */ ({
    type: 'namespace',
    name,
    title: name.toUpperCase(),
    summary: `The ${name} level.`,
    slots: {
      items: {title: 'Items', accepts: {kinds: ['generic', 'namespace']}},
    },
    ...extra,
  }),
});

/**
 * @param {string} name
 * @param {object} [extra]
 * @returns {import('./tree.mjs').TreeDocInput}
 */
const guide = (name, extra = {}) => ({
  provider: P,
  providerId: P,
  source: `${P}/tree/${name}.doc.mjs`,
  kind: 'generic',
  name,
  title: `Guide ${name}`,
  summary: `About ${name}.`,
  group: null,
  placement: undefined,
  ...extra,
});

/**
 * @param {string} kind
 * @param {string} name
 * @param {string} group
 * @returns {import('./tree.mjs').TreeDocInput}
 */
const typed = (kind, name, group) => ({
  provider: P,
  providerId: P,
  source: `${P}/api/${name}.doc.mjs`,
  kind,
  name,
  title: name,
  summary: `The ${name} ${kind}.`,
  group,
  placement: undefined,
});

/** @param {ReturnType<typeof buildDocsTree>} tree */
const routes = tree => [...tree.nodes.keys()];

/** @param {ReturnType<typeof buildDocsTree>} tree */
const problems = tree => tree.diagnostics.map(d => [d.code, d.message]);

describe('buildDocsTree', () => {

  it('withdraws a namespace placed in a withdrawn namespace, and what is placed in it', () => {
    const CLI = '@astryxdesign/cli';
    const tree = buildDocsTree({
      namespaces: [
        ns('tokens'),
        ns('alpha', {placement: {parent: 'namespace:tokens', slot: 'items'}}),
      ],
      docs: [guide('deep', {placement: {parent: 'namespace:alpha', slot: 'items'}})],
      topics: [
        {provider: CLI, providerId: CLI, name: 'tokens', title: 'Tokens', summary: 'Tokens.', source: `${CLI}/tokens.doc.mjs`},
      ],
    });
    expect(tree.get('tokens')?.provider).toBe(CLI);
    expect(routes(tree).filter(route => route.startsWith('tokens/'))).toEqual([]);
    expect(problems(tree)).toEqual(
      expect.arrayContaining([
        ['duplicate_route', expect.stringContaining('takes the route "tokens"')],
        ['invalid_placement', 'Namespace "alpha" has no route: the namespace it is placed in was withdrawn.'],
        ['invalid_placement', expect.stringContaining('names a namespace that has no route')],
      ]),
    );
  });

  it("keeps a name a topic answers to through replaces as that topic's route", () => {
    const tree = buildDocsTree({
      namespaces: [ns('tokens')],
      docs: [],
      topics: [
        {provider: '@acme/a', providerId: '@acme/a', name: 'acme-tokens', title: 'Acme tokens', summary: 'Acme tokens.', source: '@acme/a:acme-tokens', aliases: ['tokens', 'old-tokens']},
      ],
    });
    expect(tree.get('tokens')).toBeUndefined();
    expect(tree.get('acme-tokens')?.provider).toBe('@acme/a');
    expect(problems(tree)).toEqual([
      ['duplicate_route', expect.stringContaining('takes the route "tokens", which the topic "acme-tokens" also answers to')],
    ]);
    // Every name it answers to is reserved, not only the last one it replaced.
    const older = buildDocsTree({
      namespaces: [ns('old-tokens')],
      docs: [],
      topics: [
        {provider: '@acme/a', providerId: '@acme/a', name: 'acme-tokens', title: 'Acme tokens', summary: 'Acme tokens.', source: '@acme/a:acme-tokens', aliases: ['tokens', 'old-tokens']},
      ],
    });
    expect(older.get('old-tokens')).toBeUndefined();
  });

  it("keeps the CLI's own routes from an integration, compared without case", () => {
    const CLI = '@astryxdesign/cli';
    /** @param {string} name @param {string} [provider] */
    const topic = (name, provider = P) => ({
      provider,
      providerId: provider,
      name,
      title: name,
      summary: `The ${name} topic.`,
      source: `${provider}/${name}.doc.mjs`,
    });
    const cliNs = {...ns('cli'), provider: CLI, providerId: CLI, source: `${CLI}/tree/cli.doc.mjs`};
    // An integration's topics named `CLI` and `UNORGANIZED` claim the CLI's
    // namespace and the generated level; both are withdrawn.
    const tree = buildDocsTree({
      namespaces: [cliNs],
      docs: [],
      topics: [topic('theme', CLI), topic('CLI'), topic('UNORGANIZED')],
    });
    expect(tree.get('cli')?.provider).toBe(CLI);
    expect(tree.get('unorganized')?.provider).toBe(CLI);
    expect(routes(tree)).not.toContain('CLI');
    expect(routes(tree)).not.toContain('UNORGANIZED');
    expect(problems(tree)).toEqual(
      expect.arrayContaining([
        ['duplicate_route', expect.stringContaining('both have the route "CLI"')],
        ['duplicate_route', expect.stringContaining('takes the route "UNORGANIZED", which the CLI\'s own docs keep')],
      ]),
    );
    expect(tree.getFolded('THEME')?.provider).toBe(CLI);
    // A CLI topic whose own name has capitals keeps its route against a
    // lowercase namespace, although namespaces go into the tree first.
    const caps = buildDocsTree({namespaces: [ns('tokens')], docs: [], topics: [topic('Tokens', CLI)]});
    expect(caps.get('Tokens')?.provider).toBe(CLI);
    expect(caps.get('tokens')).toBeUndefined();
    expect(problems(caps)).toEqual([
      ['duplicate_route', expect.stringContaining('takes the route "tokens", which the CLI\'s own docs keep')],
    ]);
  });
  it('builds three authored levels and a guide below them', () => {
    const tree = buildDocsTree({
      namespaces: [
        ns('top'),
        ns('middle', {placement: {parent: 'namespace:top', slot: 'items'}}),
        ns('bottom', {placement: {parent: 'namespace:middle'}}),
      ],
      docs: [
        guide('deep', {placement: {parent: 'namespace:bottom', order: 1}}),
      ],
    });
    expect(problems(tree)).toEqual([]);
    expect(routes(tree)).toEqual([
      'top',
      'top/middle',
      'top/middle/bottom',
      'top/middle/bottom/deep',
    ]);
    const deep = /** @type {any} */ (tree.get('top/middle/bottom/deep'));
    expect(deep).toMatchObject({
      id: 'astryx:artifact:v1/%40acme%2Fkit/generic/deep',
      parent: 'top/middle/bottom',
      slot: 'items',
      order: 1,
      generated: false,
    });
    expect(tree.ancestors(deep).map(node => node.route)).toEqual([
      'top',
      'top/middle',
      'top/middle/bottom',
    ]);
    expect(tree.roots().map(node => node.route)).toEqual(['top']);
  });

  it('adopts typed docs by group, with one generated level per kind', () => {
    const tree = buildDocsTree({
      namespaces: [
        ns('api', {
          slots: {kinds: {title: 'Reference', accepts: {kinds: ['namespace']}}},
          adopts: [
            {
              source: {group: 'kit/api', kinds: ['function', 'enum']},
              into: 'kinds',
              groupBy: 'kind',
            },
          ],
        }),
      ],
      docs: [
        typed('enum', 'errorCodes', 'kit/api'),
        typed('function', 'search', 'kit/api'),
        typed('function', 'build', 'kit/api'),
        typed('schema', 'config', 'kit/api'),
        typed('function', 'other', 'kit/elsewhere'),
      ],
    });
    expect(problems(tree)).toEqual([]);
    expect(routes(tree)).toEqual([
      'api',
      'api/enums',
      'api/enums/error-codes',
      'api/functions',
      'api/functions/build',
      'api/functions/search',
    ]);
    const functions = /** @type {any} */ (tree.get('api/functions'));
    expect(functions).toMatchObject({
      id: null,
      kind: 'namespace',
      title: KIND_GROUPS.function.title,
      generated: true,
      parent: 'api',
      slot: 'kinds',
    });
    // Kind levels follow the rule's kind order; docs inside sort by title.
    expect(tree.get('api')?.slots[0].children).toEqual([
      'api/functions',
      'api/enums',
    ]);
    expect(functions.slots[0].children).toEqual([
      'api/functions/build',
      'api/functions/search',
    ]);
  });

  it('adopts without grouping straight into the named slot', () => {
    const tree = buildDocsTree({
      namespaces: [
        ns('commands', {
          slots: {all: {title: 'All', accepts: {kinds: ['command']}}},
          adopts: [{source: {group: 'kit/commands'}, into: 'all'}],
        }),
      ],
      docs: [typed('command', 'theme add', 'kit/commands')],
    });
    expect(routes(tree)).toEqual(['commands', 'commands/theme-add']);
    expect(tree.get('commands')?.slots[0].children).toEqual([
      'commands/theme-add',
    ]);
  });

  it('prefers explicit placement over adoption, and never falls back', () => {
    const namespaces = [
      ns('guides'),
      ns('api', {
        slots: {all: {title: 'All', accepts: {kinds: ['generic']}}},
        adopts: [{source: {group: 'kit/api'}, into: 'all'}],
      }),
    ];
    const placed = buildDocsTree({
      namespaces,
      docs: [
        guide('intro', {
          group: 'kit/api',
          placement: {parent: 'namespace:guides'},
        }),
      ],
    });
    expect(routes(placed)).toContain('guides/intro');
    expect(routes(placed)).not.toContain('api/intro');

    const broken = buildDocsTree({
      namespaces,
      docs: [
        guide('intro', {
          group: 'kit/api',
          placement: {parent: 'namespace:nope'},
        }),
      ],
    });
    expect(routes(broken).some(route => route.endsWith('/intro'))).toBe(false);
    expect(problems(broken)).toEqual([
      [
        'invalid_placement',
        'placement.parent "namespace:nope" names no namespace; @acme/kit declares "api", "guides".',
      ],
    ]);
  });

  it('reports every way a placement can fail', () => {
    const tree = buildDocsTree({
      namespaces: [
        ns('home', {
          slots: {
            one: {title: 'One', accepts: {kinds: ['generic']}},
            two: {title: 'Two', accepts: {kinds: ['command']}},
          },
        }),
      ],
      docs: [
        guide('no-slot', {placement: {parent: 'namespace:home'}}),
        guide('bad-slot', {
          placement: {parent: 'namespace:home', slot: 'three'},
        }),
        guide('wrong-kind', {
          placement: {parent: 'namespace:home', slot: 'two'},
        }),
        guide('other-package', {
          placement: {parent: '@other/pkg/namespace/home'},
        }),
        guide('not-a-ref', {placement: {parent: 'home'}}),
      ],
    });
    expect(routes(tree)).toEqual(['home']);
    expect(
      problems(tree)
        .map(([, message]) => message)
        .sort(),
    ).toEqual(
      [
        'placement names no slot, and namespace "home" has 2 (one, two). Name one with placement.slot.',
        'placement.slot "three" is not a slot of namespace "home"; it declares one, two.',
        'slot "two" of namespace "home" does not accept generic docs; it accepts command.',
        'placement.parent "@other/pkg/namespace/home" belongs to @other/pkg. A doc can only be placed in a namespace of its own package (@acme/kit).',
        'placement.parent "home" is not a namespace reference. Write "namespace:<name>".',
      ].sort(),
    );
    expect(tree.diagnostics.every(d => d.code === 'invalid_placement')).toBe(
      true,
    );
    expect(tree.diagnostics.every(d => d.severity === 'error')).toBe(true);
  });

  it('fails a doc two namespaces adopt, naming both', () => {
    const rule = {source: {group: 'kit/api'}, into: 'items'};
    const tree = buildDocsTree({
      namespaces: [ns('a', {adopts: [rule]}), ns('b', {adopts: [rule]})],
      docs: [guide('shared', {group: 'kit/api'})],
    });
    expect(routes(tree)).toEqual(['a', 'b']);
    expect(problems(tree)).toEqual([
      [
        'overlapping_adoption',
        '@acme/kit/generic/shared is adopted by "a" and "b"; exactly one namespace may adopt a doc.',
      ],
    ]);
  });

  it('fails two docs at one route, keeping the first by identity', () => {
    const tree = buildDocsTree({
      namespaces: [ns('home')],
      docs: [
        guide('fooBar', {placement: {parent: 'namespace:home'}}),
        guide('foo_bar', {placement: {parent: 'namespace:home'}}),
      ],
    });
    expect(routes(tree)).toEqual(['home', 'home/foo-bar']);
    expect(tree.get('home/foo-bar')?.id).toBe(
      'astryx:artifact:v1/%40acme%2Fkit/generic/fooBar',
    );
    expect(problems(tree)).toEqual([
      [
        'duplicate_route',
        'astryx:artifact:v1/%40acme%2Fkit/generic/foo_bar and astryx:artifact:v1/%40acme%2Fkit/generic/fooBar both have the route "home/foo-bar". Rename or move one of them.',
      ],
    ]);
  });

  it('fails a namespace cycle and everything under it', () => {
    const tree = buildDocsTree({
      namespaces: [
        ns('a', {placement: {parent: 'namespace:b'}}),
        ns('b', {placement: {parent: 'namespace:a'}}),
      ],
      docs: [guide('lost', {placement: {parent: 'namespace:a'}})],
    });
    expect(routes(tree)).toEqual([]);
    expect(problems(tree).map(([code]) => code)).toEqual([
      'invalid_placement',
      'invalid_placement',
      'invalid_placement',
    ]);
  });

  it('fails a duplicate or unsafe namespace name', () => {
    const tree = buildDocsTree({
      namespaces: [
        ns('twice'),
        {...ns('twice'), source: `${P}/other.doc.mjs`},
        ns('Bad Name'),
      ],
      docs: [],
    });
    expect(routes(tree)).toEqual(['twice']);
    expect(tree.diagnostics.map(d => d.code)).toEqual([
      'invalid_namespace',
      'invalid_namespace',
    ]);
  });

  it('leaves a doc with no placement and no adoption out, in phase 1', () => {
    const tree = buildDocsTree({
      namespaces: [ns('home')],
      docs: [guide('loose'), typed('function', 'free', 'kit/nowhere')],
    });
    expect(routes(tree)).toEqual(['home']);
    expect(tree.diagnostics).toEqual([]);
  });

  it('is the same tree whatever order its inputs arrive in', () => {
    const namespaces = [
      ns('top'),
      ns('child', {placement: {parent: 'namespace:top'}}),
    ];
    const docs = [
      guide('b', {placement: {parent: 'namespace:child'}}),
      guide('a', {placement: {parent: 'namespace:child'}}),
    ];
    const one = buildDocsTree({namespaces, docs});
    const two = buildDocsTree({
      namespaces: [...namespaces].reverse(),
      docs: [...docs].reverse(),
    });
    expect(JSON.stringify([...two.nodes])).toBe(JSON.stringify([...one.nodes]));
  });

  it('orders children by order, then title', () => {
    const tree = buildDocsTree({
      namespaces: [ns('home')],
      docs: [
        guide('z', {
          title: 'Zed',
          placement: {parent: 'namespace:home', order: 1},
        }),
        guide('b', {title: 'Beta', placement: {parent: 'namespace:home'}}),
        guide('a', {title: 'Alpha', placement: {parent: 'namespace:home'}}),
      ],
    });
    expect(tree.get('home')?.slots[0].children).toEqual([
      'home/z',
      'home/a',
      'home/b',
    ]);
  });
});

describe('routeSegment', () => {
  it('joins lowercase words with hyphens, whatever the name looks like', () => {
    expect(routeSegment('integrationPackCheck')).toBe('integration-pack-check');
    expect(routeSegment('doctor integration validate')).toBe(
      'doctor-integration-validate',
    );
    expect(routeSegment('error-codes')).toBe('error-codes');
    expect(routeSegment('isError')).toBe('is-error');
    expect(routeSegment('!!')).toBe('');
  });
});

describe("the CLI's own docs tree", () => {
  it(
    'builds with no diagnostic, rooted at cli',
    async () => {
      const tree = await loadDocsTree({fresh: true});
      expect(tree.diagnostics).toEqual([]);
      expect(tree.roots().map(node => node.route)).toEqual(['cli']);
      expect(
        tree.get('cli')?.slots.map(slot => [slot.name, slot.children]),
      ).toEqual([
        ['guides', ['cli/integrations']],
        ['reference', ['cli/commands', 'cli/api']],
      ]);
      // The integration guides: Quick Start, Building Blocks, Ship, and Help,
      // with nested namespaces for deeper authoring topics.
      expect(
        tree
          .get('cli/integrations')
          ?.slots.map(slot => [slot.name, slot.children.length]),
      ).toEqual([['guides', 4]]);
      expect(
        tree.get('cli/integrations/building-blocks/docs')?.slots[0].children,
      ).toEqual([
        'cli/integrations/building-blocks/docs/add-a-topic',
        'cli/integrations/building-blocks/docs/sections-and-placement',
        'cli/integrations/building-blocks/docs/links',
        'cli/integrations/building-blocks/docs/extend-or-replace',
        'cli/integrations/building-blocks/docs/short-and-findable',
        'cli/integrations/building-blocks/docs/check-your-docs',
      ]);
      expect(
        tree
          .get('cli/integrations/building-blocks/components')
          ?.slots.map(slot => [slot.name, slot.children]),
      ).toEqual([
        [
          'guides',
          [
            'cli/integrations/building-blocks/components/add-a-component',
            'cli/integrations/building-blocks/components/describe-the-component',
            'cli/integrations/building-blocks/components/component-imports',
            'cli/integrations/building-blocks/components/see-it-in-an-app',
            'cli/integrations/building-blocks/components/replace-a-core-component',
          ],
        ],
      ]);
      expect(
        tree.get(
          'cli/integrations/building-blocks/components/describe-the-component',
        )?.slots[0].children,
      ).toEqual([
        'cli/integrations/building-blocks/components/describe-the-component/single-component',
        'cli/integrations/building-blocks/components/describe-the-component/component-family',
        'cli/integrations/building-blocks/components/describe-the-component/subcomponent',
      ]);
      expect(tree.get('cli/api')?.slots[0].children).toEqual([
        'cli/api/functions',
        'cli/api/schemas',
        'cli/api/enums',
      ]);
    },
    SLOW,
  );

  it(
    'gives every CLI typed doc in a cli group one route, by its kind',
    async () => {
      const tree = await loadDocsTree();
      const {loaded} = await loadCliSelfDocs();
      const inTree = loaded.filter(({doc}) =>
        String(doc.namespace).startsWith('cli/'),
      );
      expect(inTree.length).toBeGreaterThan(0);
      const expected = inTree.map(({doc}) =>
        doc.type === 'command'
          ? `cli/commands/${routeSegment(doc.name)}`
          : `cli/api/${KIND_GROUPS[doc.type].segment}/${routeSegment(doc.name)}`,
      );
      expect(expected.filter(route => tree.get(route) == null)).toEqual([]);
      // A doc in the authoring group stays a section of `astryx docs authoring`.
      const authoring = loaded.filter(({doc}) => doc.namespace === 'authoring');
      expect(authoring.length).toBeGreaterThan(0);
      const ids = new Set([...tree.nodes.values()].map(node => node.id));
      expect(
        authoring.filter(({doc}) =>
          ids.has(createDocId(CLI_PROVIDER_ID, doc.type, doc.name)),
        ),
      ).toEqual([]);
    },
    SLOW,
  );

  it(
    'gives every function @astryxdesign/cli/api exports a route',
    async () => {
      const tree = await loadDocsTree();
      const exported = Object.entries(api)
        .filter(
          ([, value]) =>
            typeof value === 'function' &&
            Object.getOwnPropertyDescriptor(value, 'prototype')?.writable !==
              false,
        )
        .map(([name]) => `cli/api/functions/${routeSegment(name)}`);
      expect(exported.length).toBeGreaterThan(0);
      expect(exported.filter(route => tree.get(route) == null)).toEqual([]);
    },
    SLOW,
  );

  it(
    'reads only namespace and generic docs from the tree directory, each named after its file',
    async () => {
      const inputs = await loadTreeInputs({selfDocs: false});
      expect(inputs.diagnostics).toEqual([]);
      expect(inputs.namespaces.map(n => n.doc.name).sort()).toEqual([
        'api',
        'build-the-template',
        'building-blocks',
        'cli',
        'commands',
        'components',
        'configuration',
        'describe-the-component',
        'docs',
        'document-the-template',
        'help',
        'integrations',
        'package-and-test',
        'ship',
        'template-assets',
        'templates',
      ]);
      const parents = new Set(inputs.docs.map(d => d.placement?.parent));
      expect([...parents].sort()).toEqual([
        'namespace:build-the-template',
        'namespace:building-blocks',
        'namespace:components',
        'namespace:configuration',
        'namespace:describe-the-component',
        'namespace:docs',
        'namespace:document-the-template',
        'namespace:help',
        'namespace:integrations',
        'namespace:package-and-test',
        'namespace:ship',
        'namespace:template-assets',
        'namespace:templates',
      ]);
      expect(inputs.docs.length).toBe(41);
    },
    SLOW,
  );
});

describe('doc identity', () => {
  it('builds each id from the provider id, never the package name', () => {
    const provider = '@acme/tree-provider';
    const tree = buildDocsTree({
      namespaces: [{...ns('home'), providerId: provider}],
      docs: [
        {
          ...guide('intro', {placement: {parent: 'namespace:home'}}),
          providerId: provider,
        },
      ],
    });
    expect(problems(tree)).toEqual([]);
    expect(tree.get('home')?.id).toBe(
      'astryx:artifact:v1/%40acme%2Ftree-provider/namespace/home',
    );
    expect(tree.get('home/intro')).toMatchObject({
      id: 'astryx:artifact:v1/%40acme%2Ftree-provider/generic/intro',
      provider: P,
    });
  });
});
