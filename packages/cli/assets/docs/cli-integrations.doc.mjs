// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'cli-integrations',
  title: 'CLI Integrations',
  category: 'guide',
  description:
    'Author an npm package that contributes components, templates, themes, docs, and upgrade codemods to Astryx.',

  sections: [
    {
      title: 'Overview',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "An integration is an npm package that contributes components, templates, source themes, doc topics, agent guidance, and/or upgrade codemods to a consumer's design-system workflow. Consumers install the package as a direct dependency and Astryx autolinks it; an explicit `astryx.config` entry remains available when the app needs to control ordering.",
        },
        {
          type: 'prose',
          text: 'The authoring CLI owns the integration file. The first `astryx integration add` creates `astryx.integration.mjs`; each later add declares its root only after writing a valid contribution behind it. Identity (name and version) still comes from package.json. For the consumer side, run `npx astryx docs getting-started`.',
        },
        {
          type: 'prose',
          text: 'A consumer can still name the package explicitly when order or precedence matters:',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.config.ts\nexport default {\n  integrations: ['@acme/astryx-widgets'],\n};",
        },
        {
          type: 'prose',
          text: "Your components and templates then appear next to core's:",
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx component --list --package @acme/astryx-widgets\nastryx component AcmeCarousel --props',
        },
      ],
    },
    {
      title: 'Authoring with the CLI',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Do not start by hand-editing a manifest. Add the contribution you mean to ship; Astryx creates the manifest, writes every required file, preserves an existing custom root, and updates an existing package.json files allowlist without creating one.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "astryx integration add component AcmeCarousel\nastryx integration add doc deploying\nastryx integration add template dashboard --type page\nastryx integration add codemod rename-prop --to 1.2.0\nastryx integration add agent-doc 'Use AcmeCarousel for rotating content.'\nastryx integration add theme ocean",
        },
        {
          type: 'prose',
          text: 'The package self-resolves while you author it. Run `astryx component --list`, `astryx docs`, `astryx template --list`, or `astryx theme list` from the package and its local contributions appear with the package name. You do not publish or build a throwaway app to see your own work.',
        },
        {
          type: 'prose',
          text: 'Every add is non-interactive, refuses to overwrite authored files, supports --dry-run, and verifies the generated contribution through the same discovery rules a consumer uses. Before publishing, run the package gate:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx integration pack --check',
        },
        {
          type: 'prose',
          text: 'The gate runs the package lifecycle, creates the real npm tarball, checks every required contribution file against the pack list, extracts it into a scratch consumer, and compares the local and packed contribution inventories. `astryx doctor integration` remains the read-only diagnostic surface when something is not found.',
        },
      ],
    },
    {
      title: 'Theme Package Walkthrough',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'A useful theme package usually ships more than colors. Start with the source theme, then add the guides its consumers need. Each command writes a complete contribution and keeps the package manifest in sync.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'In the provider package',
          code: 'astryx integration add theme ocean\nastryx theme palette generate palette.config.json --out themes/ocean/tokens/ocean.palette.ts\nastryx integration add doc brand-theme\nastryx integration add doc theme-migration\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx integration pack --check\nnpm pack',
        },
        {
          type: 'prose',
          text: 'Edit the generated theme and guide files before publishing. Palette generation writes an importable TypeScript candidate and a reproducibility receipt; import the candidate from the theme and list both nested files in that theme catalog entry. `integration pack --check` runs the real package lifecycle and compares local discovery with the npm tarball, so a missing source file or files allowlist entry fails before a consumer sees it.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'In a separate consumer app',
          code: 'npm install @astryxdesign/core ../brand-integration/acme-brand-integration-1.0.0.tgz\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx docs theme-migration\nastryx theme add ocean --package @acme/brand-integration\nastryx theme build src/themes/ocean/oceanTheme.ts',
        },
        {
          type: 'prose',
          text: 'The package must be a direct dependency for automatic discovery. No `astryx.config` entry is needed unless the app must control integration order. `theme add` copies every file listed by the selected catalog entry, including nested token modules, and refuses to overwrite existing project files.',
        },
      ],
    },
    {
      title: 'The Integration File',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The CLI creates one `astryx.integration.mjs` beside package.json and adds a root only when that same operation writes a real contribution. The file tells consumers where each contribution kind lives; this example is the resulting shape, not a setup step:',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.integration.ts\nexport default {\n  components: './components',\n  templates: './templates',\n  themes: './themes',\n  codemods: './codemods',\n  docs: './docs',\n  issuesUrl: 'https://github.com/acme/widgets/issues',\n};",
        },
        {
          type: 'prose',
          text: 'Every field is optional. Declare only the contribution roots your package ships. There is no factory to call. Write a plain object, and for editor autocomplete and type-checking annotate it with the `AstryxIntegration` type exported from `@astryxdesign/cli/authoring`.',
        },
      ],
    },
    {
      title: 'Components',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Export your components from your library however you like, and consumers still import them from your package. For each component the CLI should document, ship a `.doc.{ts,mjs,js}` file with the same stem, for example `AcmeCarousel.tsx` alongside `AcmeCarousel.doc.ts`.',
        },
        {
          type: 'prose',
          text: 'Component names are package-aware. If an integration name matches Core, unqualified lookup fails closed instead of choosing one. Run `astryx doctor integration components <package>` before publishing: it recommends renaming and prints the exact `--package` command when the overlap is intentional.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// AcmeCarousel.doc.ts\nexport default {\n  type: 'component',\n  name: 'AcmeCarousel',\n  description: 'A carousel that cycles through slides.',\n  // props, usage, examples, ...\n};",
        },
      ],
    },
    {
      title: 'Templates',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Templates are usually not exported from the package directly. Instead, consumers browse them through the CLI and materialize them into their app. Define a template as a plain object stamped with `type: 'page'` (full pages) or `type: 'block'` (smaller chunks) in a `.template.{ts,mjs,js}` file next to the source, for example `AcmeLandingPage.tsx` and `AcmeLandingPage.template.ts`.",
        },
        {
          type: 'prose',
          text: "A template id is its exact source-relative path with the metadata suffix removed; the display `name` is not its identity and may repeat. Run `astryx --json template --list --package @astryxdesign/core` and copy the Core entry's `id` exactly. In `templateReplacements`, each key is the integration template's exact id and each value is the exact Core id it replaces. Generate the source/metadata pair with `integration add template`, then add this explicit replacement policy to the manifest.",
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Create the integration template',
          code: 'astryx integration add template acme-app-shell --type page',
        },
        {
          type: 'code',
          lang: 'typescript',
          label: 'Declare the replacement',
          code: "// astryx.integration.ts\nexport default {\n  templates: './templates',\n  templateReplacements: {\n    'acme-app-shell': 'shell-side-nav',\n  },\n};\n\n// templates/acme-app-shell.template.mjs\nexport default {\n  type: 'page',\n  name: 'Acme App Shell',\n  description: 'An app shell with Acme navigation.',\n};",
        },
        {
          type: 'code',
          lang: 'typescript',
          label: 'Use product navigation in the replacement source',
          code: "// templates/acme-app-shell.tsx\nimport {AppShell} from '@astryxdesign/core/AppShell';\nimport {Card} from '@astryxdesign/core/Card';\nimport {AcmeSideNav, AcmeTopNav} from '@acme/navigation';\n\nexport default function AcmeAppShell() {\n  return (\n    <AppShell\n      sideNav={<AcmeSideNav />}\n      topNav={<AcmeTopNav />}>\n      <Card>Product content</Card>\n    </AppShell>\n  );\n}",
        },
        {
          type: 'prose',
          text: 'With that declaration, `astryx template shell-side-nav` selects `acme-app-shell`; template listing, search, build suggestions, and block-layout lookup use the same effective identity. `astryx template shell-side-nav --package @astryxdesign/core` still selects the original, and `astryx template acme-app-shell --package @acme/navigation` explicitly selects the integration template. In the `template.list` JSON response, a winning replacement entry carries `replaces` naming the Core id it supersedes, and the Core entry is omitted from the default listing. A page can replace only a Core page, and a block can replace only a Core block. Missing Core targets, type mismatches, declarations for templates the package does not provide, and more than one replacement from one package fail closed: Core stays the default and `astryx doctor integration templates <package>` reports the error. If multiple explicitly configured packages each replace the target, the package configured later wins with a warning. An explicitly configured replacement always wins over an autolinked one. If only autolinked packages conflict, the package listed later in package.json dependencies wins with a warning; add the intended package to `astryx.config` to make the choice explicit. Without `templateReplacements`, valid template selection keeps the existing package-aware ambiguity behavior; contribution failure isolation still follows the rules below.',
        },
        {
          type: 'prose',
          text: "The replacement map is part of the integration manifest rather than the strict per-template metadata object. CLIs from 0.5.3 onward ignore an unknown manifest key with a warning, preserve contributions they understand, and leave templates addressable by their own ids. Versions 0.5.2 and earlier reject unknown manifest keys and drop the entire integration. Replacement selection starts in 0.7.0. Integration authors who require replacement behavior should declare `@astryxdesign/cli >=0.7.0`; use `@astryxdesign/cli >=0.5.3` only when fallback to own-id access is acceptable. `__proto__` is unsupported and reserved as a `templateReplacements` map key. An ordinary `{'__proto__': 'shell-side-nav'}` literal uses JavaScript's special prototype-setter form; because the string value is neither an object nor null, it does not change the prototype, creates no own key, and disappears before validation. Observable own keys created with computed-property syntax or deserialization are rejected. As a template directory id it remains discoverable, but choose another kebab-case id.",
        },
        {
          type: 'prose',
          text: 'The CLI needs both files at consume time. `integration add` includes the templates root when package.json already has a files allowlist. It never creates an exports map, because doing that can make previously-open deep imports private; when a map already exists, it adds the generated source subpath without replacing author-owned entries. `integration pack --check` proves the source, metadata, and replacement map survive the tarball and verifies every component through the public import its metadata advertises.',
        },
      ],
    },
    {
      title: 'Docs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Point the integration file's `docs` field at a directory of reference docs and every `{topic}.doc.{ts,mjs,js}` under it becomes a topic the CLI serves: `astryx docs` lists it, `astryx docs <topic>` prints it, `astryx search` indexes it, and `astryx init` names it in the agent block. A topic is a plain object stamped `type: 'generic'`, the same shape core's own topics use.",
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// docs/deploying.doc.ts\nexport default {\n  type: 'generic',\n  name: 'deploying',\n  title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  category: 'guide',\n  sections: [\n    {title: 'Overview', content: [{type: 'prose', text: '...'}]},\n  ],\n};",
        },
        {
          type: 'prose',
          text: "A topic can also speak about one that already exists. `replaces: 'x'` takes over topic x (core's, or another integration's) so a package whose consumers install it differently can serve its own Getting Started instead of the built-in one. Give the replacement a different `name` and the old name keeps resolving to it, so a link or an agent that learned the old topic still lands in the right place.",
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "export default {\n  type: 'generic',\n  name: 'getting-started',\n  replaces: 'getting-started',\n  title: 'Getting started',\n  description: 'Install Acme widgets and use your first component.',\n  sections: [/* ... */],\n};",
        },
        {
          type: 'prose',
          text: "`extends: 'x'` merges onto a topic instead of owning it: a section whose title matches one in the base replaces that section, and a section the base does not have is appended. Reach for it to correct or add to a topic you do not want to fork: a fork of someone else's guide stops receiving their fixes the day you write it.",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A topic name is a CLI argument and a docsite path, so it may hold only letters, digits, `_` and `-`.',
            'A name that collides with an existing topic and declares neither `replaces` nor `extends` is an error, not a silent override; the CLI will not guess which one you meant.',
            "`replaces` and `extends` are exclusive: a topic either takes another's place or merges onto it.",
            'Two integrations replacing one topic is a warning, and the one configured later in `astryx.config` wins.',
            '`astryx doctor integration docs <package>` classifies Core overlaps as intentional replacements, intentional extensions, or accidental same-name conflicts.',
          ],
        },
      ],
    },
    {
      title: 'Themes',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "A theme contribution is editable `defineTheme` source, not compiled CSS. Add `themes: './themes'` to `astryx.integration.*`, place the source under one directory per slug, and list it in `themes/manifest.json`. If package.json has a `files` allowlist, include both the integration manifest and the themes root; packages with no allowlist already publish both. Do not add an `exports` map only for theme discovery.",
        },
        {
          type: 'code',
          lang: 'text',
          code: 'themes/\n  manifest.json\n  ocean/\n    oceanTheme.ts',
        },
        {
          type: 'prose',
          text: "The root catalog uses the same entry contract as Astryx's bundled themes: `slug`, `displayName`, `description`, `maintained`, `entry`, `exportName`, and `files`. `entry` and every file are relative to `themes/<slug>/`; `exportName` identifies a named runtime export in the entry source. Astryx parses that source without executing it, requires every local static import and re-export to name a file in `files`, and rejects missing or type-only exports.",
        },
        {
          type: 'code',
          lang: 'json',
          code: '{\n  "version": 1,\n  "themes": [{\n    "slug": "ocean",\n    "displayName": "Ocean",\n    "description": "Ocean theme.",\n    "maintained": true,\n    "entry": "oceanTheme.ts",\n    "exportName": "oceanTheme",\n    "files": ["oceanTheme.ts"]\n  }]\n}',
        },
        {
          type: 'prose',
          text: 'After a consumer installs the package, `astryx theme list` shows its themes with the owner package, and `astryx theme add <slug> --package <package>` copies the selected source into the app. If two packages use one slug, an unscoped add fails instead of choosing one silently.',
        },
        {
          type: 'prose',
          text: "Compatibility is additive. A CLI released before the `themes` field ignores that unknown key with a warning and continues loading the integration's older contribution kinds, but it cannot list or add the contributed theme. Upgrade `@astryxdesign/cli` in the consumer to use it.",
        },
      ],
    },
    {
      title: 'Agent Docs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'An integration can append a small amount of static package guidance to the end of the managed agent block through `agentDocs.append` in its default manifest. The CLI owns the section heading, package-labeled bullets, placement, markers, target files, and writes.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.integration.ts\nimport type {AstryxIntegration} from '@astryxdesign/cli/authoring';\n\nexport default {\n  components: './components',\n  agentDocs: {\n    append: ['Run acme verify before finishing.'],\n  },\n} satisfies AstryxIntegration;",
        },
        {
          type: 'prose',
          text: '`append` is optional and may contain at most 8 lines per integration. A line is a trimmed, non-blank plain string of at most 240 Unicode code points with no line separators, control characters, NUL, or Astryx/XDS managed-marker text. A configured project may render at most 32 integration lines total.',
        },
        {
          type: 'prose',
          text: '`astryx init` renders the installed manifests. `astryx upgrade` compares the same expected block even when the Core version is unchanged, so a line addition, removal, reorder, or edit appears in dry-run and is written with `--apply`. When codemods or post-codemod hooks run, the block is refreshed only after they succeed; no integration codemod is required for guidance changes.',
        },
      ],
    },
    {
      title: 'Codemods',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Ship codemods so `astryx upgrade` can migrate consumers across breaking changes in your package. Point the integration file's `codemods` field at your codemods root, and author each one as a plain object stamped with `type: 'code'` (transforms source files) or `type: 'config'` (rewrites the consumer's `astryx.config`).",
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// codemods/v2-rename-prop.ts\nexport default {\n  type: 'code',\n  // title, description, transform, ...\n};",
        },
        {
          type: 'prose',
          text: 'All authoring types are exported from `@astryxdesign/cli/authoring`: `ComponentDoc`, `HookDoc`, and `ReferenceDoc` for docs, `TemplateDoc` for templates, and `AstryxConfig`, `AstryxIntegration`, and `AstryxCodemod` for the project files. Consumers can also run their own post-codemod hooks, such as a reinstall or rebuild, via `hooks.postCodemod` in their `astryx.config`.',
        },
      ],
    },
    {
      title: 'Recording Runs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'An integration can receive every command run in the apps that install it, so you can see how your package is actually used without asking each app to add anything. Export a function named `debug` from the integration file. It is a NAMED export, deliberately not a manifest field: a CLI version that predates this feature reads only the default export, so adding one does not disturb any consumer.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.integration.ts\nimport type {DebugEvent} from '@astryxdesign/cli/authoring';\n\nexport function debug(event: DebugEvent): void {\n  // synchronous only — the process is exiting\n  reportSomewhere(event);\n}\n\nexport default {\n  components: './components',\n};",
        },
        {
          type: 'prose',
          text: "The event is the same `DebugEvent` a consumer receives from `debug` in their own `astryx.config`, and both run: an app that sets its own handler still reaches yours, and yours never displaces theirs. The app handler is called first, then each integration in the order the config lists them. Every handler is called in isolation with its own copy of the event — one that throws, prints, or calls `process.exit` cannot change the command's output or exit code, and cannot stop the others.",
        },
        {
          type: 'prose',
          text: 'The handler is synchronous, for the same reason a consumer\'s is: it runs on process exit, where Node abandons pending async work. Buffer or write synchronously; do not await. An app that wants no inherited handler sets `{"astryx": {"inheritDebug": false}}` in its `package.json`, which suppresses every integration\'s handler while leaving its own untouched.',
        },
      ],
    },
    {
      title: 'Gap report handler',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'An integration can handle `astryx gap-report` events by exporting a `gapReport` handler from its integration module. The handler is a plain object with an `audience` and a `handle` function — not an executable command. Export it as a named export; do not put it in the default manifest. Older CLI versions ignore the named export and continue loading every manifest contribution they understand.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.integration.ts\nimport type {GapReportHandler} from '@astryxdesign/cli/authoring';\n\nexport const gapReport: GapReportHandler = {\n  audience: 'public',\n  async handle(event, {signal}) {\n    // event is a normalized GapReport with camelCase fields\n    // and event.target.{package, version, issuesUrl}\n    const url = await createIssue(event, {signal});\n    return { status: 'filed', url };\n  },\n};\n\nexport default {\n  components: './components',\n  issuesUrl: 'https://github.com/acme/widgets/issues',\n};",
        },
        {
          type: 'prose',
          text: 'The same handler type is available as a `gapReport` field in `astryx.config` for project-level handling. When both exist, the project handler runs first, then each integration handler in config order. Every handler runs — none overrides another.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.config.ts\nimport type {AstryxConfig, GapReportHandler} from '@astryxdesign/cli/authoring';\n\nconst projectHandler: GapReportHandler = {\n  audience: 'internal',\n  async handle(event) {\n    await postToTracker(event);\n    return { status: 'filed', message: 'Posted to internal tracker' };\n  },\n};\n\nexport default {\n  integrations: ['@acme/astryx-widgets'],\n  gapReport: projectHandler,\n} satisfies AstryxConfig;",
        },
        {
          type: 'prose',
          text: "Each handler receives its own deep copy of the `GapReport` event (via `structuredClone`) plus an `AbortSignal` that fires at the 30-second timeout. Each handler runs in its own worker. A throw, timeout, `stdout` write, `process.exit`, or `process.exitCode` change is contained there and produces a failed delivery for that handler only. On timeout the CLI aborts the signal, terminates the worker before starting the next handler, and preserves its own output and exit code. Handler `stdout` is forwarded to the CLI's `stderr` so it cannot corrupt a JSON envelope.",
        },
        {
          type: 'prose',
          text: "A handler MUST return a `GapReportHandlerReceipt` with a `status` of `'filed'`, `'routed_only'`, or `'skipped'`, plus optional `url` and `message` strings. The aggregate response includes an ordered `deliveries` array. Each entry names its project, integration package, or fallback and includes the declared audience, final status, URL, and message.",
        },
        {
          type: 'prose',
          text: "Use `audience: 'public'` for any public or third-party destination. The CLI will not invoke a public handler unless the caller explicitly confirms the public write. `audience: 'internal'` requires no additional confirmation. In a fan-out with mixed audiences, internal handlers run unconditionally while public handlers are consent-gated independently.",
        },
        {
          type: 'prose',
          text: 'When the effective handler set is empty (no project handler, no integration handlers), and the target has a GitHub `issuesUrl`, the CLI falls back to `gh issue create` after explicit confirmation. Any other `issuesUrl` scheme produces a `routed_only` receipt. The fallback is suppressed entirely when at least one handler is configured.',
        },
      ],
    },
    {
      title: 'How It Works',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Every CLI command loads the consumer's `astryx.config`, resolves each listed integration's manifest from `node_modules`, and discovers its contributions. Each file is parsed at the load boundary through `@astryxdesign/cli/authoring` — when the CLI loads it, not when you author it. A field of the wrong type fails there. A field this CLI does not know is ignored with a warning naming it, so a manifest written against a newer CLI still contributes everything this one understands. There are no factories; you write a plain object and stamp its `type`.",
        },
        {
          type: 'prose',
          text: 'Runtime integration features — `debug` and `gapReport` — use named exports from the integration module rather than fields in the default manifest. The CLI discovers them alongside the manifest but loads them through the composition rules in `spec:AST-031`: every configured handler runs additively, each in isolation with its own copy of the event.',
        },
        {
          type: 'prose',
          text: "Discovery is resilient. A manifest that fails to load is skipped because none of its roots are trustworthy. An error in one contribution kind is reported without hiding the integration's other valid kinds. Invalid template and component files are omitted without hiding valid siblings; other kinds keep their existing all-or-nothing behavior. Everyday commands keep working with the remaining valid contributions, warnings go to stderr, and `--json` stdout stays clean.",
        },
        {
          type: 'prose',
          text: 'To inspect problems, run `astryx doctor integration validate <package>` for structure, then use `templates`, `components`, or `docs` under the same `astryx doctor integration` group to check Core identity overlaps before publishing. Bare `astryx doctor` checks overall project health.',
        },
      ],
    },
  ],
};
