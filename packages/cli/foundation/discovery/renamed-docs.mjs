// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The CLI docs that took another name when the docs were organized
 *   into twelve guides by what a reader wants to do (spec:AST-046 FR12).
 *
 * @input Nothing: plain data.
 * @output {@link FORMER_TOPICS}, {@link RENAMED_TOPICS}, and
 *   {@link RENAMED_DOC_IDENTITIES}.
 * @position Read by the docs catalog (an integration topic's `extends` and
 *   `replaces`), the link resolver (an integration's links to the old
 *   identity), and the integration checks, so an integration written against
 *   the old names keeps working. A reader's `astryx docs <old route>` still
 *   opens nothing: the not-found error names the new route.
 */

/**
 * Every Core topic that became a guide when the docs were organized into
 * twelve guides (spec:AST-046), by its old name: the guide that holds its
 * text. An integration topic that `extends` or `replaces` the old name lands
 * on that guide, and `astryx doctor integration docs` treats both names as a
 * Core topic's; a reader's `astryx docs <old name>` still opens nothing.
 */
/** @type {Readonly<Record<string, string>>} */
export const FORMER_TOPICS = Object.freeze({
  'author-a-theme': 'author-a-theme',
  'browser-support': 'browser-support',
  'getting-started': 'add-to-a-project',
  'is-my-code-good': 'agent-review',
  principles: 'principles',
  'styling-overview': 'css-setup',
  theme: 'use-a-theme',
  'use-a-theme': 'use-a-theme',
  'use-integrations': 'use-integrations',
  'working-with-ai': 'agent-setup',
});

/**
 * Every CLI doc identity that took another name when the docs were organized
 * into twelve guides, as `<kind>:<name>`, and the identity that holds its
 * text now. A link an integration wrote to the old identity
 * (`{@link @astryxdesign/cli:generic:theme}`) still reaches the doc.
 */
/** @type {Readonly<Record<string, string>>} */
export const RENAMED_DOC_IDENTITIES = Object.freeze({
  'generic:theme': 'generic:use-a-theme',
  'generic:getting-started': 'generic:add-to-a-project',
  'generic:working-with-ai': 'generic:agent-setup',
  'generic:styling-overview': 'generic:css-setup',
  'generic:is-my-code-good': 'generic:agent-review',
  'generic:component-lookups': 'generic:search-and-read',
  'generic:problems': 'generic:global-mode-messages',
  'generic:reference': 'generic:global-mode',
  'namespace:authoring': 'namespace:make-an-integration',
  'namespace:cli': 'namespace:reference',
  'namespace:global': 'namespace:on-your-computer',
  'namespace:layout': 'namespace:build-a-page',
  'namespace:styling': 'namespace:style-components',
  'namespace:styling-libraries': 'namespace:style-components',
  'namespace:internationalization': 'namespace:translate-your-app',
  'namespace:migration': 'namespace:from-tailwind-shadcn-radix',
});

/**
 * The former Core topics whose guide took another name.
 * @type {Readonly<Record<string, string>>}
 */
export const RENAMED_TOPICS = Object.freeze(
  Object.fromEntries(
    Object.entries(FORMER_TOPICS).filter(([from, to]) => from !== to),
  ),
);
