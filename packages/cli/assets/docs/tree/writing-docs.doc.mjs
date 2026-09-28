// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/writing-docs`: the guide to writing docs that readers,
 * people and agents alike, find by search or by moving one level at a time.
 * It lives in the docs tree under the `cli` namespace, so its only route is
 * `cli/writing-docs`.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'writing-docs',
  placement: {parent: 'namespace:cli', slot: 'guides', order: 20},
  title: 'Writing docs',
  category: 'guide',
  description:
    'Write docs that people and agents find by search or by reading one level at a time.',

  sections: [
    {
      title: 'How the docs work',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every doc is one node in one docs graph, with a stable identity and one home in a tree.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "Identity: the doc's provider, its kind, and its name. Moving a doc never changes it.",
            'Route: the names of the doc and its parents, such as `cli/api/functions/search`; `astryx docs <route>` reads it.',
            'Moves: every read ends with Up, Previous, Next, and Related, each as a command you can run.',
            'Search: a hit is the smallest part that answers, one section or one tree page. It gives the command that reads it and the command that opens the level above.',
          ],
        },
        {
          type: 'prose',
          text: "You never write moves or lists of children. The CLI derives them from each doc's home and its typed links.",
        },
      ],
    },
    {
      title: 'Add a doc',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'To add a doc, write one `.doc.mjs` file named after the doc, and stamp the type that matches what it describes.',
        },
        {
          type: 'table',
          headers: ['You document', 'Doc type', '`type`'],
          rows: [
            ['A topic or a guide', 'ReferenceDoc', "'generic'"],
            ['A CLI command', 'CommandDoc', "'command'"],
            ['A CLI API function', 'FunctionDoc', "'function'"],
            ['An object shape', 'SchemaDoc', "'schema'"],
            ['A fixed list of values', 'EnumDoc', "'enum'"],
            ['A component', 'ComponentDoc', "'component'"],
            ['A level of the tree', 'NamespaceDoc', "'namespace'"],
          ],
        },
        {
          type: 'prose',
          text: 'A topic or guide holds `sections`. Each section has a `title` and `content` blocks, and covers one idea. The `description` is one sentence that says what the doc covers.',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/deploying.doc.mjs',
          code: "export default {\n  type: 'generic',\n  name: 'deploying',\n  title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  sections: [\n    {\n      title: 'Build before you ship',\n      content: [\n        {type: 'prose', text: 'Build the app, then check it with {@link @astryxdesign/cli:command:doctor}.'},\n        {type: 'code', lang: 'bash', code: 'npm run build'},\n        {type: 'list', style: 'unordered', items: ['Check the output folder.']},\n        {type: 'table', headers: ['Env', 'Value'], rows: [['NODE_ENV', 'production']]},\n      ],\n    },\n  ],\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A name is a command argument, so use only letters, digits, `_`, and `-`. Use lowercase kebab-case, such as `writing-docs`, so the name and its route segment match.',
            'Keep the name stable. Links name a doc by its identity, and the name is part of it.',
            'A name that collides with an existing topic is an error unless the doc declares `replaces` or `extends`.',
            'Name the cases a doc does not cover, and link to where they are covered. A reader cannot tell a case you left out from a case that does not exist.',
          ],
        },
        {
          type: 'prose',
          text: 'Every field of every doc type is in {@link generic:authoring}.',
        },
      ],
    },
    {
      title: 'Place a doc',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Each doc gets one home in one of three ways: a namespace adopts it, it places itself, or it stays a flat topic. Folders never decide a home.',
        },
        {
          type: 'prose',
          text: "Adopted: a CLI typed doc declares `namespace`, either `'cli/commands'` or `'cli/api'`. That namespace adopts it by kind, so its route is `cli/commands/<name>` or `cli/api/functions/<name>`.",
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "{type: 'function', name: 'search', namespace: 'cli/api' /* ... */} // cli/api/functions/search",
        },
        {
          type: 'prose',
          text: "Placed: a guide declares `placement`. The `parent` names a namespace of your own package, the `slot` is one that namespace declares for the doc's kind, and `order` sorts the siblings in the slot. A placement that fails withdraws the doc with an error.",
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "placement: {parent: 'namespace:cli', slot: 'guides', order: 20}, // cli/writing-docs",
        },
        {
          type: 'prose',
          text: 'Flat: a doc with neither is a flat topic, read with `astryx docs <name>`.',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "{type: 'generic', name: 'tokens', title: 'All Tokens' /* ... */} // astryx docs tokens",
        },
      ],
    },
    {
      title: 'Link docs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Link a doc with `{@link <target>}` or a typed field, never by writing its `astryx docs` route in prose: a route you write goes stale when the doc moves. Other commands, such as `astryx doctor`, you write as they are, and a test checks each one.',
        },
        {
          type: 'prose',
          text: "Typed fields: a FunctionDoc's `command` names the CLI command that runs it, and its `related` names functions. A CommandDoc's `fn` names the function it runs, and its `related` names commands.",
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "{type: 'function', name: 'search', command: 'search', related: ['docs']}\n{type: 'command', name: 'search', fn: 'search', related: ['docs']}",
        },
        {
          type: 'prose',
          text: "Inside a section's text, write `{@link <target>}`, where the target is `[<provider>:]<kind>:<name>`; leave out the provider for a doc of your own provider. The CLI prints the command that opens the doc. It works in prose, list items, and table cells; link syntax inside code ticks is shown as written, and an older CLI prints the link as plain text. A namespace doc can also carry `reference` and `workflow` blocks in its `blocks`, though the CLI does not print them yet; a topic's sections cannot hold them.",
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "{type: 'prose', text: 'Check it with {@link command:doctor}.'}\n{type: 'list', style: 'unordered', items: ['Search with {@link @astryxdesign/cli:function:search}.']}\n\n// In a namespace doc's blocks only:\n{type: 'workflow', steps: [\n  {title: 'Write the doc', references: ['generic:authoring']},\n  {title: 'Check it', references: ['command:doctor']},\n]}",
        },
        {
          type: 'prose',
          text: "The route in the printed command is derived when the doc is read, so a link follows its doc when the doc moves. A target that names no doc prints as written, and so does a typed-field name that matches more than one doc; `astryx doctor` warns on both.",
        },
      ],
    },
    {
      title: 'Keep reads short',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Keep every read short so a reader gets one answer per command: one idea per section, a summary first, and a hard size limit.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Give each section one idea. If it needs a second topic, split it into two sections.',
            "A section's summary, shown in the section list and in search, is its first prose block or first list item, cut at 240 characters. Lead with what the section answers.",
            'In text, a topic with more than one section reads as its section list. The reader opens one section, or prints everything with `--full`. With `--json`, a topic returns the whole doc and `--index` its section list.',
            'Every read should fit in 32 KB; `astryx doctor` warns on one that does not. Aim for sections under about 30 lines.',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx docs cli/writing-docs\nastryx docs cli/writing-docs keep-reads-short\nastryx docs cli/writing-docs --full',
        },
      ],
    },
    {
      title: 'Make docs findable',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Search finds a doc only by the words it indexes, so put the words a reader types where search looks.',
        },
        {
          type: 'prose',
          text: "Search matches titles, section titles, headings, each section's summary, and identifiers written in code ticks, such as `ERR_UNKNOWN_SECTION` or `token-ref`. It also matches a doc's own name and the `keywords` of a namespace or typed doc.",
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Title a section with the task or question, such as "Place a doc".',
            'Start each section with a sentence that names its subject and answers it.',
            'Write exact identifiers in code ticks: field names, block types, and error codes.',
            'Add `keywords` only for words that are not already in the title or summary.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Open a section with background. Its first sentence is its summary.',
            'Use vague titles such as "Overview" or "Details" when a specific one fits.',
          ],
        },
        {
          type: 'prose',
          text: 'Test it the way a new reader arrives: search for the question, not the title, and check that the first hit answers it.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx search placement --type doc',
        },
      ],
    },
    {
      title: 'Docs from an integration',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'An integration joins the same graph with a namespace doc in its docs directory and guides placed in it. The namespace shows in `astryx docs` beside `cli`, with the same moves, search, and links. You can place a doc only in a namespace of your own package.',
        },
        {
          type: 'prose',
          text: 'Let the CLI write the files: inside the package, `astryx integration add doc deploying --parent acme` writes the guide with its placement, declares the docs root, and writes the `acme` namespace doc the first time. Run `astryx docs` in the package to see it.',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "// docs/acme.doc.mjs\n/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */\nexport default {\n  type: 'namespace', name: 'acme', title: 'Acme widgets',\n  summary: 'Guides for building apps with Acme widgets.',\n  slots: {guides: {title: 'Guides', accepts: {kinds: ['generic']}}},\n};\n\n// docs/deploying.doc.mjs (route: acme/deploying)\n/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */\nexport default {\n  type: 'generic', name: 'deploying', title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  placement: {parent: 'namespace:acme', slot: 'guides', order: 10},\n  sections: [{title: 'Check before you ship', content: [\n    {type: 'prose', text: 'Run {@link @astryxdesign/cli:command:doctor} before every deploy.'},\n  ]}],\n};",
        },
        {
          type: 'prose',
          text: "The link names the `@astryxdesign/cli` provider because its target lives in another package. A link without a provider resolves against yours: your manifest's `providerId`, or else your package name. That holds in a topic that `extends` another package's topic too: your sections link your docs, and a link to the other package's docs names its provider.",
        },
        {
          type: 'prose',
          text: 'Everything else an integration ships is in {@link generic:integrations}.',
        },
      ],
    },
    {
      title: 'Check your docs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Run the doctor commands to check every home, link, and read in your docs.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx doctor`, in a project, checks the whole graph: the tree, the links, and the size of each read.',
            '`astryx doctor integration docs`, inside an integration package, runs the same checks on that package\'s docs before it ships.',
            'In the Astryx repository, a test walks the whole graph. It fails on any move, link, or `astryx` command in a doc that does not work.',
          ],
        },
        {
          type: 'prose',
          text: 'No check can tell whether a doc is still true. Describe what the CLI does now, and change the doc in the same change that changes the behavior.',
        },
        {
          type: 'prose',
          text: 'A problem in the tree or a link is a warning: it names what to fix, but the exit code stays 0, so read the report (or its `--json`) before you ship.',
        },
      ],
    },
  ],
};
