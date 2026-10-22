// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Every Core doc has a named home in the docs tree (spec:AST-046 FR12).
 *
 * The root of the docs is twelve guides, each named for what a reader wants
 * to do, then Reference. Foundations is the generated level of its flat
 * topics, with the tokens and typography namespaces beside it. Every Core doc
 * sits under exactly one root: a new doc placed nowhere, any other flat Core
 * topic, a catch-all level, or a second list at the root fails here. Integration authoring lives under
 * make-an-integration, and every route a doc left names where it went.
 */

import {describe, expect, it} from 'vitest';
import {docs} from './docs.mjs';
import {GUIDE_ORDER} from '../../foundation/doc-compiler/tree.mjs';

const CLI = '@astryxdesign/cli';
const SLOW = 60_000;

/** Core's only flat topics: the Foundations topics, as on 0.7. */
const FOUNDATIONS_TOPICS = [
  'color',
  'elevation',
  'icons',
  'illustrations',
  'motion',
  'shape',
  'spacing',
];
/** Roots that keep their 0.7 summaries rather than a one-line promise. */
const KEPT_ROOTS = new Set(['foundations', 'tokens', 'typography']);

describe('every Core doc has a named home', () => {
  it(
    'lists the twelve guides and Reference at the root, in order, and nothing else',
    async () => {
      const list = await docs();
      // Core's only flat topics are the Foundations topics.
      expect(
        list.data
          .filter(topic => topic.package === CLI)
          .map(topic => topic.topic),
      ).toEqual(FOUNDATIONS_TOPICS);
      const roots = list.meta?.namespaces ?? [];
      expect(roots.map(entry => entry.topic)).toEqual([...GUIDE_ORDER]);
      expect(GUIDE_ORDER).toHaveLength(15);
      for (const root of roots) {
        expect(root.package).toBe(CLI);
        // Each guide's summary is its one-line promise.
        if (KEPT_ROOTS.has(root.topic)) continue;
        expect(root.description, root.topic).toMatch(/^[A-Z].{10,100}\.$/);
      }
      for (const gone of ['guides', 'unorganized', 'more-topics', 'cli']) {
        await expect(docs(gone), gone).rejects.toMatchObject({
          code: 'ERR_UNKNOWN_TOPIC',
        });
      }
    },
    SLOW,
  );

  it(
    'puts every Core doc under exactly one guide or Reference',
    async () => {
      /** @type {Map<string, string>} each route and the root it sits under */
      const homes = new Map();
      for (const root of GUIDE_ORDER) {
        const read = await docs(root, undefined, {depth: 'all'});
        expect(read.data).toMatchObject({
          route: root,
          kind: 'namespace',
          breadcrumb: [],
          links: {up: 'astryx docs'},
        });
        // A Foundations topic keeps its own name as its route.
        const inRoot = (/** @type {string} */ route) =>
          root === 'foundations'
            ? FOUNDATIONS_TOPICS.includes(route)
            : route.startsWith(`${root}/`);
        /** @param {any[]} slots */
        const walk = slots => {
          for (const slot of slots ?? []) {
            for (const child of slot.children) {
              expect(inRoot(child.route), child.route).toBe(true);
              expect(homes.has(child.route), child.route).toBe(false);
              homes.set(child.route, root);
              walk(child.slots);
            }
          }
        };
        walk(read.data.slots);
      }
      // Every guide has something below it.
      for (const root of GUIDE_ORDER) {
        expect(
          [...homes.values()].filter(home => home === root).length,
          root,
        ).toBeGreaterThan(0);
      }
      // A child's name never repeats its parent's.
      for (const route of homes.keys()) {
        const parts = route.split('/');
        // Foundations, tokens, and typography keep their 0.7 names.
        if (parts.length < 2 || KEPT_ROOTS.has(parts[0])) continue;
        const [parent, child] = parts.slice(-2);
        expect(child.startsWith(`${parent}-`), route).toBe(false);
      }
    },
    SLOW,
  );

  it(
    'keeps everything for integration authors under make-an-integration',
    async () => {
      const authoring = await docs('make-an-integration');
      const children = authoring.data.slots.flatMap(slot =>
        slot.children.map(child => child.route),
      );
      expect(children).toEqual(
        expect.arrayContaining([
          'make-an-integration/quick-start',
          'make-an-integration/building-blocks',
          'make-an-integration/ship',
          'make-an-integration/help',
          'make-an-integration/field-reference',
        ]),
      );
      // Every field reference section still opens from the namespace by its
      // key (FR13).
      const reference = await docs(
        'make-an-integration/field-reference',
        undefined,
        {index: true},
      );
      const keys = reference.data.sections.map(section => section.id);
      expect(keys.length).toBeGreaterThan(15);
      for (const key of keys) {
        const section = await docs('make-an-integration', key);
        expect(section.type, key).toBe('docs.detail.section');
        expect(section.data.id, key).toBe(key);
      }
    },
    SLOW,
  );

  it(
    'names where every old route went, ahead of the usual suggestions',
    async () => {
      for (const [old, now] of [
        ['cli/integrations', 'make-an-integration'],
        ['cli/integrations/quick-start', 'make-an-integration/quick-start'],
        ['authoring/ship/publishing', 'make-an-integration/ship/publishing'],
        ['getting-started', 'get-started/add-to-a-project'],
        ['theme', 'theme-your-app'],
        ['use-a-theme', 'theme-your-app/use-a-theme'],
        ['principles', 'get-started/principles'],
        ['is-my-code-good', 'check-your-code/agent-review'],
        ['layout/scaffold', 'build-a-page/scaffold'],
        ['styling-libraries/tailwind', 'style-components/tailwind'],
        ['global', 'get-started/on-your-computer'],
        ['global/problems', 'fix-a-problem/global-mode-messages'],
        ['cli/commands/upgrade', 'reference/commands/upgrade'],
        ['cli/component-lookups', 'find-a-component/search-and-read'],
        [
          'migration/migration-setup',
          'upgrade-and-migrate/from-tailwind-shadcn-radix/migration-setup',
        ],
      ]) {
        const error = await docs(old).catch(e => e);
        expect(error, old).toMatchObject({
          code: 'ERR_UNKNOWN_TOPIC',
          message: expect.stringContaining(`It moved to "${now}"`),
        });
        // The new route comes first (FR6).
        expect(error.suggestions[0], old).toMatchObject({name: now});
      }
    },
    SLOW,
  );
});
