// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file EnumDoc for the `type` discriminant carried on every --json success
 * envelope. The vocabulary equals the manifest's response types (each
 * command's FunctionDoc returns; see `clients/cli/lib/manifest.mjs`) plus
 * ROOT_RESPONSE_TYPES (help, version) there; a consumer switches on `type` to
 * narrow the `data` payload. Descriptions follow the currently published
 * response projection, not a future package-version boundary.
 *
 * @input Public response discriminants and their currently released payloads.
 * @output Generated consumer reference for every typed JSON success response.
 * @position packages/cli/foundation/response — enum documentation
 */

/** @type {import('@astryxdesign/cli/authoring').EnumDoc} */
export const doc = {
  type: 'enum',
  name: 'response-types',
  displayName: 'Response Types',
  namespace: 'cli/api',
  description:
    'The `type` discriminant present on every --json success envelope. Consumers switch on it to narrow `data`.',
  members: [
    {
      value: 'init.run',
      description:
        'The install receipt: the `mode` (`default` | `features`), the features run, agent-doc files written, any soft `docsError`, whether theme guidance was emitted, the template outcome (`workflow` | `created` | `skipped`) plus its path, and whether the next-steps were emitted.',
    },
    {
      value: 'init.remove',
      description:
        'Confirmation that the managed agent-docs block was removed (`data.removed: true`) — returned when --remove-agents is set.',
    },
    // component
    {
      value: 'component.list',
      description:
        "The component catalog grouped by component group (each component's group field): `detail` (the level: names | compact | full) and `components`, the grouped map of names entries ({name, package, and optional canonical import for integrations}), brief entries ({name, package, description, import}), or a full ComponentDoc per entry with its package.",
    },
    {
      value: 'component.batch',
      description:
        'The component specialization of the shared `BatchResponse` and `BatchRow` types. An explicit programmatic selector array, or two or more CLI selectors, returns one ordered receipt: `count` plus `results`, one row per selector including duplicates. Every row carries `selector` and `status` (found | not_found | ambiguous | error). A found row carries `result`, the same {type, data} response as one selector. An ambiguous row carries `code`, `error`, and `candidates` ({package, component, kind, installed}). Other failed rows carry `code`, `error`, and optional `suggestions` ({name, reason}).',
    },
    {
      value: 'component.detail',
      description:
        "One component's authored ComponentDoc plus ownership fields (package, the owner; import, the specifier; sourceAvailable, whether source exists) and parentDoc (present when the component is documented inside another component's doc, naming that doc). The envelope's package names the same owner.",
    },
    {
      value: 'component.detail.props',
      description: "Just one component's props table (ComponentPropDoc[]). The envelope's package names the npm package that owns the component.",
    },
    {
      value: 'component.detail.source',
      description: "One component's source file, as {component, source}. The envelope's package names the npm package that owns the component.",
    },
    {
      value: 'component.detail.showcase',
      description:
        "One component's showcase example, as {component, aspectRatio, source}. The envelope's package names the npm package that owns the component.",
    },
    {
      value: 'component.detail.blocks',
      description:
        "One component's example blocks, as {component, showcase, examples, related} of BlockEntry ({name, package, displayName, description, isShowcase, category}); each block names the package that owns it, and the envelope's package names the component's owner.",
    },

    // docs
    {
      value: 'docs.list',
      description:
        "All reference-doc topics as DocsListEntry[] ({topic, description, package, replaces?}), in read order; meta.namespaces lists the docs tree's top-level namespaces, and meta.notLoaded each package whose docs did not load.",
    },
    {
      value: 'docs.detail',
      description:
        "One topic's full ReferenceDoc (the JSON read of a topic, --full, --dense, or a topic with one section), with token-ref blocks inlined and each section naming the package that wrote it, plus links ({up, previous, next}: the commands that open the level it sits in and its neighbors there).",
    },
    {
      value: 'docs.index',
      description:
        "One topic's section index, the text read of a topic with more than one section (and --index): the topic's name, title, and description, plus sections, each {id, title, package, summary} (pass the id as the section argument; package is the npm package that wrote the section; summary is the section's one-line summary), and links ({up, previous, next}: the commands that open the level it sits in and its neighbors there).",
    },
    {
      value: 'docs.detail.section',
      description:
        'One ReferenceSection of a topic, found by key or title, with token-ref blocks inlined, plus links ({up, previous, next}: the commands that open its topic index and the sections before and after it). The envelope\'s package names the npm package that wrote the section.',
    },
    {
      value: 'docs.node',
      description:
        "One node of the docs tree, read by its route: its id, kind, package, title, summary, and breadcrumb, plus a namespace's slots with their children (one level down, each naming its package) or a typed doc's content, and links ({up, previous, next, related}: the commands that open its parent, its neighbors, and the docs it names).",
    },

    // blog (read from the published RSS feed)
    {
      value: 'blog.list',
      description:
        'The feed URL plus every post parsed from the RSS feed, each with slug, title, description, date, type, authors, link, and plaintext URL.',
    },
    {
      value: 'blog.detail',
      description:
        "One post's metadata plus the feed URL and the post's full plaintext body.",
    },

    // discover (external / integration packages)
    {
      value: 'discover.list',
      description:
        'The integrations the project loads (name, category, components, version, a list per other kind they add, and latest when a source knows it); with a discover source, meta.available lists what the project could add and meta.sources reports each source; when empty it carries meta.configured to tell "nothing configured" from "nothing discovered".',
    },
    {
      value: 'discover.detail',
      description:
        'One package, for an @scope/name or @scope/name@version query: what the shown version adds, whether the project has it, and, when a source knows the package, its versions, latest release, and the command that adds it.',
    },
    {
      value: 'discover.detail.doc',
      description:
        'The validated ComponentDoc for one installed component, for an @scope/name/Component query.',
    },
    {
      value: 'discover.item',
      description:
        'One item that is not an installed component, for an @scope/name/<item> query: its kind, name, package, version, and whether the project has the package.',
    },
    {
      value: 'discover.search',
      description:
        'The echoed query plus every matching item and package across all packages, each with its kind and whether the project has it, even when only one matches; total is set when --limit cut the list.',
    },

    // search
    {
      value: 'search',
      description:
        'The echoed query, `matchCount` (total matches, before `limit`), and results, a ranked SearchResultEntry[] bounded by `limit`: each {domain, name, package, score, reason, description, command} (package is the npm package that owns the result), plus import (components, hooks), title, parent (the command that opens the level above), and, for a hit on one section, section (docs), or displayName and kind (templates).',
    },

    // build
    {
      value: 'build.help',
      description:
        'The how-to-build-a-page playbook, emitted when no query is given: `playbook: true`, a title, the ordered steps (title, commands, optional returns), the on-system rules, and related lookups. Commands are bare subcommands for the caller to render with its own invocation.',
    },
    {
      value: 'build.kit',
      description:
        "The template to start from and its kit: query, hasResults, matchCount (never a cap), directMatch, start {name, package, command, basis, reason, alternatives, ...} (the start and each alternative name the package that owns the template), pages (search's closest templates), blocks and domain as SearchResultEntry[] (each naming its package), frame and foundation (Core component names), and hint {reason, commands} when thin.",
    },

    // swizzle
    {
      value: 'swizzle.list',
      description:
        "The names of swizzlable components discoverable from cwd's @astryxdesign/core. The envelope's package is @astryxdesign/core.",
    },
    {
      value: 'swizzle.copy',
      description:
        'An eject receipt: component name, owning package, output directory, files-copied count, the written file names, whether any file uses StyleX, and, when the owner has an issues URL, feedback ({issuesUrl, ghCommand?}): where to report the gap that led to swizzling. The envelope\'s package names the same owning package.',
    },

    // gap reports
    {
      value: 'gap-report.categories',
      description: 'The fixed gap category values and human-readable labels.',
    },
    {
      value: 'gap-report.file',
      description:
        'An aggregate receipt: overall status, the selected package, issuesUrl (or null), deliveries in handler order, each {handlerType: project | integration | fallback, handler, audience, status, url, message}, and filedCount/routedOnlyCount totals.',
    },

    // template
    {
      value: 'template.list',
      description:
        'The effective discovered TemplateListEntry[] for pages and blocks. A winning replacement entry includes optional `replaces`, naming the Core id omitted from the default list.',
    },
    {
      value: 'template.show',
      description:
        "The resolved template's source, exactly as a copy writes it, plus its description, kind, the component names it composes, and demoMediaReplaced (how many Astryx demo media references were replaced with placeholders for you to swap for your own media).",
    },
    {
      value: 'template.skeleton',
      description:
        "A layout skeleton (structural tags with spatial annotations) plus the template's description and the components it composes. The envelope's package names the npm package that owns the template.",
    },
    {
      value: 'template.copy',
      description:
        'A scaffold receipt: template id, output directory, written file name, file count, demoMediaReplaced (how many Astryx demo media references were replaced with placeholders), notes (setup notes naming what the template needs that the project lacks — missing packages, missing StyleX compiler; empty when satisfied), missingPackages (external package names the template imports that are not in the project), and installCommand (a ready-to-run install command with the detected package manager and workspace version ranges; null when nothing is missing). The envelope\'s package names the npm package that owns the template.',
    },

    {
      value: 'template.cdn',
      description:
        'A write receipt for the no-build-step CDN starter page: the path (relative to cwd), the Astryx version every CDN URL was pinned to, whether it was written, and the reason it was not. `exists` when a file was already there, which is a success.',
    },

    // hook
    {
      value: 'hook.list',
      description:
        'The hook catalog grouped by category: `detail` (the level: names | compact | full) and `components`, the grouped map of hook names, brief entries, or a full HookDoc per entry. The envelope\'s package is @astryxdesign/core, the only package that ships hooks.',
    },
    {
      value: 'hook.detail',
      description:
        "One hook's full authored HookDoc. The envelope's package is @astryxdesign/core.",
    },
    {
      value: 'hook.detail.params',
      description:
        "Just one hook's parameters table (HookParamDoc[]). The envelope's package is @astryxdesign/core.",
    },

    // theme
    {
      value: 'theme.build',
      description:
        'A theme build receipt: name, tokenCount and componentCount (override counts), sizeKB, the written outputs {css, cssDts, js, dts, and variantsDts when applicable}, warnings (defects to fix), and notices (advisories about a correct theme, such as a named font it does not load).',
    },
    {
      value: 'theme.build.check',
      description:
        'The --check receipt: theme name, an upToDate flag, the stale outputs (each {path, reason: missing | outdated}), and the full list of checked paths. Writes nothing.',
    },
    {
      value: 'theme.build.batch',
      description:
        "Several themes built in one invocation: `count` plus one {file, receipt} per theme in argument order, where receipt is that theme's theme.build (or theme.build.check) envelope, or null when it produced no CSS.",
    },
    {
      value: 'theme.list',
      description:
        'Every bundled, installed package, and local theme as a ThemeListEntry[]. Each entry has slug, displayName, description, maintained, owner package or local root, source, added, and default fields. Optional meta.unmigratedCopies names earlier descriptor-less copies, their missing descriptor, and the upgrade command; those copies are not data entries.',
    },
    {
      value: 'theme.add',
      description:
        'The released source-copy receipt: slug, displayName, maintained flag, owner package, outputDir, source entry, exportName, and files. Its additive meta.deprecations entry names DEP-0005 and the source-fork/import replacements.',
    },
    {
      value: 'theme.app',
      description:
        'The app theme record after add, remove, or use. It includes every added theme and its built imports, the default slug, generated module path, and the command change. After add, the envelope package names the npm package that owns the added theme; a local theme has none.',
    },
    {
      value: 'theme.eject',
      description:
        'A local source-fork receipt with the resolved slug, displayName, source theme maintained flag, source-selector package, outputDir, source entry, exportName, and every file written, including the descriptor. The written local descriptor always uses maintained: false.',
    },
    {
      value: 'theme.template',
      description:
        'A write receipt for the annotated theme template: the path (relative to cwd), whether it was written, and the reason it was not. `exists` when a file was already there, which is a success.',
    },
    {
      value: 'theme.targets',
      description:
        'The whole themeable surface: the echoed filter, componentCount, and targets, one per theming target — {key, className, component, props, states, deprecatedFor?}, where props and states are its legal override keys and deprecatedFor names the canonical replacement key.',
    },
    {
      value: 'theme.palette.generate',
      description:
        'An author-reviewable OKLCH palette candidate, its reproducibility receipt, summary counts, and optional candidate/receipt file-write result.',
    },

    // upgrade
    {
      value: 'upgrade.list',
      description:
        'Every available codemod, oldest→newest, as {name, package, title, version, optional}; returned for --list without running anything.',
    },
    {
      value: 'upgrade.registry',
      description:
        'The copied-composition receipt for --registry: applied, ok, the counts (found, current, wouldUpdate, updated, wouldMerge, merged, wouldRefreshReceipt, receiptsRefreshed, conflicts, missing, invalid, failed), and items.',
    },
    {
      value: 'upgrade.status',
      description:
        'A short-circuit outcome with no codemods run (up_to_date, no_codemods, or config_fixable), each carrying the agent-docs summary.',
    },
    {
      value: 'upgrade.run',
      description:
        'The run receipt: from/to versions, codemod count, integrations processed, the agent-docs summary, sourcePathFound (false when the resolved source directory does not exist, so no source file was read), and (apply mode) filesChanged, transformsApplied, and per-codemod errors.',
    },

    // manifest
    {
      value: 'manifest',
      description:
        'The CLI capability manifest: name, version, apiVersion, description, globalOptions, commands (each name, description, arguments, options, json, aliases?, responseTypes?, examples?, exitCodes? as [{code, when}], subcommands?), jsonSupported, and the flat responseTypes index.',
    },

    // help and version, which no single command owns
    {
      value: 'help',
      description:
        'Help, in one of two shapes. A bare `astryx --json` returns the root manifest: name, version, commands (the command names), jsonSupported, and manifest (the full payload `astryx manifest --json` returns). ' +
        "`--help --json` on any command, or `astryx help [command] --json`, returns that command's help: command, description, usage, options (each flags, description, and defaultValue and choices when set), and subcommands (each name and description). " +
        'data.manifest marks the first shape; data.usage marks the second.',
    },
    {
      value: 'version',
      description: 'The CLI version, for `astryx --version --json`: {version}.',
    },

    // doctor
    {
      value: 'doctor',
      description:
        'The health-check report: `checks` (each with id, label, status: pass | warn | fail | info, a message, and an optional fix, always present on warn and fail) plus a `summary` of counts per status.',
    },

    // integration authoring
    {
      value: 'integration.init',
      description:
        'An init receipt: name, packageCreated, fieldsAdded, installed, dryRun, and notes (informational messages such as a missing exports map).',
    },
    {
      value: 'integration.add',
      description:
        'A contribution-writer receipt: kind, name, optional root {path, created}, integration-manifest path, every affected project-relative path, written, and dryRun.',
    },
    {
      value: 'integration.pack-check',
      description:
        'The packed-package check: name, version, packable, tarball {filename, fileCount, size, unpackedSize} or null, inventory {manifest, roots [{kind, path, expectedFiles, missingFiles, complete}], expectedFiles, packedFiles}, contributions {local, packed}, each null or {themes [{slug, exportName}], components, templates [{id, type, name}], codemods [{version, id}], docs, agentDocsAppend}, and issues [{code, severity, message}].',
    },
    {
      value: 'integration.validate',
      description:
        'The validation result: validated (false when no integration manifest was found, so nothing was checked and the empty issues list proves nothing), the package name and version (both null when validated is false) plus issues, an AstryxIntegrationIssue[] of {code, severity: warning | error, message}.',
    },
    {
      value: 'integration.template-conflicts',
      description:
        'validated (false when no integration manifest was found, so nothing was inspected), the integration identity, structural issues, and non-blocking Core template-id conflicts as {id, severity: warning, integrationPackage, integrationType, integrationName, coreMatches, message, command}.',
    },
    {
      value: 'integration.component-conflicts',
      description:
        'validated (false when no integration manifest was found, so nothing was inspected), the integration identity, structural issues, and non-blocking conflicts where an integration component name is also owned by Core; each conflict includes the exact package-qualified command.',
    },
    {
      value: 'integration.doc-conflicts',
      description:
        'validated (false when no integration manifest was found, so nothing was inspected), the integration identity, structural issues, and Core doc overlaps. Each finding includes `severity` (`info` | `error`) and `relationship` (`replaces` | `extends` | `accidental`).',
    },

    // layout (XLE/XLO)
    {
      value: 'layout.expand',
      description:
        'The expansion: parsed form, generated TSX code, componentsUsed, states (count of useState hooks scaffolded), todos, blocksReferenced (each {name, mode}), warnings, written (the output path, or null when nothing was written), and demoMediaReplaced (count of demo media placeholders). Carries `meta.deprecations` with DEP-0006 and its replacement commands.',
    },
    {
      value: 'layout.check',
      description:
        'The validation result: a valid flag, the detected form, errors (each with line/col, message, formatted text, and suggestions), warnings, and the expression re-printed in both canonical surfaces (compact and outline). Carries `meta.deprecations` with DEP-0006 and its replacement commands.',
    },
    {
      value: 'layout.grammar',
      description:
        "The XLE/XLO grammar cheatsheet: a text field with the full reference plus an aliases map (short name → canonical component) generated from this install's registry. Carries `meta.deprecations` with DEP-0006 and its replacement commands.",
    },
  ],
};
