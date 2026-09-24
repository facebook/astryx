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
          text: 'The authoring CLI owns the integration file. The first `astryx integration add` creates `astryx.integration.mjs`; each later add declares its root only after writing a valid contribution behind it. Identity (name and version) still comes from package.json. For the consumer side, run `astryx docs getting-started`.',
        },
        {
          type: 'prose',
          text: 'Every file an integration author writes is documented field by field in `npx astryx docs authoring`: the manifest, astryx.config, codemods, identity, and each doc type. `npx astryx docs authoring --index` lists them, and `npx astryx docs authoring <key>` reads one.',
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
          text: 'Do not start by hand-editing a manifest. Add the contribution you mean to ship; Astryx creates the manifest, writes every required file, preserves an existing custom root, and updates an existing package.json files allowlist without creating one. Always run these commands from the locally installed CLI in the package (e.g. `node node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs` or `pnpm astryx`), not `npx @astryxdesign/cli` — npx may resolve a stale registry version whose integration scaffolding does not match the installed one.',
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
          text: 'A useful theme package usually ships more than colors. Start with the source theme, author the palette request at `themes/ocean/palette.config.json`, then add the guides its consumers need. The `integration add` commands keep the package manifest in sync. Palette outputs live inside the theme directory, which ships as one unit, so there is nothing to register after generation.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'In the provider package',
          code: 'astryx integration add theme ocean\nastryx theme palette generate themes/ocean/palette.config.json --out themes/ocean/tokens/ocean.palette.ts\nastryx integration add doc brand-theme\nastryx integration add doc theme-migration\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx integration pack --check\nnpm pack',
        },
        {
          type: 'prose',
          text: 'Edit the generated theme descriptor, source, and guide files before publishing. The shown palette command writes `themes/ocean/tokens/ocean.palette.ts` and its sibling `themes/ocean/tokens/ocean.palette.receipt.json`, a reproducibility receipt. The TypeScript candidate directly exports `black`, `white`, and `palette`; import what the theme uses from `./tokens/ocean.palette`. Keep the request at `themes/ocean/palette.config.json`. The whole theme directory is copied and packed as one unit, so an optional wrapper, refs, icon, or preview module you add inside it ships with the theme. `integration pack --check` runs the real package lifecycle and compares local discovery with the npm tarball, so a missing source or descriptor fails before a consumer sees it.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'In a separate consumer app',
          code: 'npm install @astryxdesign/core ../brand-integration/acme-brand-integration-1.0.0.tgz\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx docs theme-migration\nastryx theme add ocean --package @acme/brand-integration\nastryx theme build src/themes/ocean/oceanTheme.ts',
        },
        {
          type: 'prose',
          text: "The package must be a direct dependency for automatic discovery. No `astryx.config` entry is needed unless the app must control integration order. `theme add` copies the selected theme's complete directory, including its typed `.doc.mjs`, nested token modules, and receipts, and refuses to overwrite existing project files.",
        },
      ],
    },
    {
      title: 'Contribution Kinds at a Glance',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Each contribution kind uses a different metadata suffix, type stamp, and discovery rule. The table below prevents the most common first-time authoring mistake — using the wrong file or export convention.',
        },
        {
          type: 'code',
          lang: 'text',
          code: "Kind        Metadata file              type stamp     Source file\n────────    ─────────────────────────  ─────────────  ──────────────────────\nComponent   Name.doc.mjs               'component'    Name.tsx (same stem)\nTemplate    Name.doc.mjs               'page'/'block' Name.tsx (same stem)\nDoc topic   topic.doc.mjs              'generic'      (none — docs are prose)\nCodemod     <version>/<id>.{ts,mjs,js} 'code'/'config' (the codemod IS the source)\nTheme       <slug>/nameTheme.doc.mjs   'theme'        <slug>/nameTheme.ts (same stem)\n\nReleased component and template .doc.ts / .doc.js files and .template.{ts,mjs,js}\ntemplates still load. Doc topics must be .doc.mjs or .doc.js: an installed\npackage's .doc.ts topic is listed but cannot be read.",
        },
        {
          type: 'prose',
          text: 'The `type` stamp is how new docs should be authored — it routes parsing to the correct schema at the load boundary. Legacy docs without a stamp still load via shape-sniffing for backward compatibility, but unstamped docs rely on heuristics (presence of `props`, `params`, etc.) and may parse under the wrong schema if the shape is ambiguous. Always stamp new integration contributions.',
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
          text: "Export your components from your library however you like, and consumers still import them from your package. For each component the CLI should document, ship a strongly typed `.doc.mjs` file with the same stem, for example `AcmeCarousel.tsx` alongside `AcmeCarousel.doc.mjs`. The doc file must default-export an object with `type: 'component'` — not `'generic'` (that is for reference docs) and not `'page'`/`'block'` (those are for templates). Released `.doc.ts` and `.doc.js` inputs remain readable for compatibility, but new authoring uses `.doc.mjs`.",
        },
        {
          type: 'prose',
          text: 'Component names are package-aware. If an integration name matches Core, unqualified lookup fails closed instead of choosing one. Run `astryx doctor integration components <package>` before publishing: it recommends renaming and prints the exact `--package` command when the overlap is intentional.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// AcmeCarousel.doc.mjs\n/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */\nexport default {\n  type: 'component',\n  name: 'AcmeCarousel',\n  displayName: 'Acme Carousel',\n  usage: {description: 'A carousel that cycles through slides.'},\n  props: [],\n};",
        },
      ],
    },
    {
      title: 'Templates',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Templates are usually not exported from the package directly. Instead, consumers browse them through the CLI and materialize them into their app. Define a template as a strongly typed plain object stamped with `type: 'page'` (full pages) or `type: 'block'` (smaller chunks) in a same-stem `.doc.mjs`, for example `AcmeLandingPage.tsx` and `AcmeLandingPage.doc.mjs`. Released `.template.*` files remain readable for compatibility.",
        },
        {
          type: 'prose',
          text: 'A template id is its source-relative path with the metadata suffix removed; the display `name` is not its identity and may repeat. If an integration id matches a Core id, unqualified lookup fails closed instead of choosing one. Run `astryx doctor integration templates <package>` before publishing: it recommends renaming, but an intentional overlap is allowed when callers always pass `--package <package>`.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// AcmeLandingPage.doc.mjs\n/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */\nexport default {\n  type: 'page',\n  name: 'acme-landing-page',\n  displayName: 'Acme Landing Page',\n  description: 'A complete product landing page.',\n};",
        },
        {
          type: 'prose',
          text: 'The CLI needs both files at consume time. `integration add` includes the templates root when package.json already has a files allowlist. It never creates an exports map, because doing that can make previously-open deep imports private; when a map already exists, it adds the generated source subpath without replacing author-owned entries. Use consumer-safe extensionless subpaths in the exports map (e.g. `"./templates/AcmeDashboard"` instead of `"./templates/AcmeDashboard.tsx"`), so consumers import without knowing the file extension. `integration pack --check` proves the source and metadata survive the tarball and verifies every component through the public import its metadata advertises.',
        },
      ],
    },
    {
      title: 'Docs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Point the integration file's `docs` field at a directory of reference docs and every strongly typed `{topic}.doc.mjs` under it becomes a topic the CLI serves: `astryx docs` lists it, `astryx docs <topic>` prints it, `astryx search` indexes it, and `astryx init` names it in the agent block. A topic is a plain object stamped `type: 'generic'` — not `'component'` (that is for component docs with a same-stem source file) — the same shape core's own topics use.",
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// docs/deploying.doc.mjs\n/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */\nexport default {\n  type: 'generic',\n  name: 'deploying',\n  title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  category: 'guide',\n  sections: [\n    {title: 'Overview', content: [{type: 'prose', text: '...'}]},\n  ],\n};",
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
          text: "`extends: 'x'` merges onto a topic instead of owning it: a section with the same key as one in the base (its `id`, or the key its title derives) or the same title replaces that section, and a section the base does not have is appended. The topic keeps its own title and description; only `replaces` renames it. Reach for it to correct or add to a topic you do not want to fork: a fork of someone else's guide stops receiving their fixes the day you write it.",
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
          text: "A theme contribution is editable `defineTheme` source, not compiled CSS. Add `themes: './themes'` to `astryx.integration.*`. Give each lower-kebab slug its own directory containing a theme source and mandatory same-stem, strongly typed `.doc.mjs`. If package.json has a `files` allowlist, include both the integration manifest and the themes root; packages with no allowlist already publish both. Do not add an `exports` map only for theme discovery.",
        },
        {
          type: 'code',
          lang: 'text',
          code: 'themes/\n  ocean/\n    oceanTheme.ts\n    oceanTheme.doc.mjs\n    palette.config.json\n    tokens/\n      ocean.palette.ts\n      ocean.palette.receipt.json',
        },
        {
          type: 'prose',
          text: '`ThemeDoc` owns `name` (the slug), `displayName`, `description`, and `maintained`. The descriptor/source stem supplies the source entry and required named runtime export. Astryx parses the source without executing it, confines every local static import and re-export to the theme directory, copies that complete directory, and rejects missing or type-only exports.',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\nexport default {\n  type: 'theme',\n  name: 'ocean',\n  displayName: 'Ocean',\n  description: 'Ocean theme.',\n  maintained: true,\n};",
        },
        {
          type: 'prose',
          text: 'The generated palette candidate is already importable: it exports `black`, `white`, `palette`, and a default palette value. Import it directly from `./tokens/ocean.palette`. A wrapper or palette-refs module is optional application code, not generator output.',
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
          type: 'prose',
          text: 'The codemods root uses a version-folder-first layout. Each folder name is an exact semver string (no `v` prefix) matching the version the codemod migrates TO. Each module under it is a kebab-case `.ts`, `.mjs`, or `.js` file whose default export is the codemod envelope:',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'codemods/\n  0.2.0/\n    rename-widget-prop.ts\n  0.3.0/\n    update-theme-import.ts\n    config/rename-integration.ts',
        },
        {
          type: 'prose',
          text: 'Codemod ids (the extension-less relative path under the version folder, e.g. `rename-widget-prop`, `config/rename-integration`) must be unique within a package across all versions. A duplicate id across versions is a hard error.',
        },
        {
          type: 'prose',
          text: 'The loader automatically skips test and fixture files so you can colocate tests with transforms. Reserved names: files matching `*.test.*`, `*.spec.*`, or `*.fixture.*`, and any file under a `__tests__/` or `__fixtures__/` directory. These are never loaded as codemods regardless of their extension.',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'codemods/\n  0.2.0/\n    rename-widget-prop.ts              # loaded as a codemod\n    rename-widget-prop.test.ts          # skipped (reserved name)\n    __tests__/\n      rename-widget-prop.test.ts        # skipped (reserved directory)',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// codemods/0.2.0/rename-widget-prop.ts\nexport default {\n  type: 'code',\n  title: 'Rename AcmeWidget oldProp to newProp',\n  description: 'Updates JSX props in consumer source files.',\n  transform(file, api) {\n    // jscodeshift transform\n    return file.source;\n  },\n};",
        },
        {
          type: 'prose',
          text: "`astryx upgrade` is dry-run by default — it previews which codemods would run and what files would change, without writing anything. Pass `--apply` to write the changes. There is no `--dry-run` flag; omitting `--apply` is the dry run. The `--integration` flag resolves each value beneath the project's `node_modules` (for example, `--integration @acme/widgets`). Absolute paths and `.` or `..` segments are rejected; other slash-separated values remain beneath `node_modules`.",
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# Preview what would change (dry-run, the default)\nastryx upgrade --from 0.1.0\n\n# Apply the migration\nastryx upgrade --from 0.1.0 --apply',
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
          text: 'Discovery is resilient. A broken or misconfigured integration is skipped with a single non-blocking warning on stderr instead of crashing the CLI, and it never corrupts a `--json` stdout envelope. Everyday commands keep working with the remaining valid contributions.',
        },
        {
          type: 'prose',
          text: 'To inspect problems, run `astryx doctor integration validate <package>` for structure, then use `templates`, `components`, or `docs` under the same `astryx doctor integration` group to check Core identity overlaps before publishing. Bare `astryx doctor` checks overall project health.',
        },
      ],
    },
  ],
};
