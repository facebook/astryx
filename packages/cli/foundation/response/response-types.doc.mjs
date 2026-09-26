// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file EnumDoc for the `type` discriminant carried on every --json success
 * envelope. The vocabulary mirrors the RESPONSE_TYPES map (each command's
 * `jsonOut(...)` call sites) in `clients/cli/lib/manifest.mjs`; a consumer
 * switches on `type` to narrow the `data` payload.
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
        'The removal receipt — returned when --remove-agents is set: `data.removed` is true when a managed agent-docs block was found and removed, and false when there was none to remove.',
    },
    // component
    {
      value: 'component.list',
      description:
        'The component catalog grouped by category: `detail` (the level: names | compact | full) and `components`, the grouped map of names entries ({name, package, and optional canonical import for integrations}), brief entries, or a full ComponentDoc per entry.',
    },
    {
      value: 'component.detail',
      description:
        "One component's authored ComponentDoc plus ownership fields (package, the owner; import, the specifier; sourceAvailable, whether source exists) and parentDoc (present when the component is documented inside another component's doc, naming that doc).",
    },
    {
      value: 'component.detail.props',
      description: "Just one component's props table (ComponentPropDoc[]).",
    },
    {
      value: 'component.detail.source',
      description: "One component's source file, as {component, source}.",
    },
    {
      value: 'component.detail.showcase',
      description:
        "One component's showcase example, as {component, aspectRatio, source}.",
    },
    {
      value: 'component.detail.blocks',
      description:
        "One component's example blocks, as {component, showcase, examples, related} of BlockEntry.",
    },

    // docs
    {
      value: 'docs.list',
      description:
        'All reference-doc topics as DocsListEntry[] ({topic, description}), in discovery order.',
    },
    {
      value: 'docs.detail',
      description:
        "One topic's full ReferenceDoc, with token-ref blocks inlined.",
    },
    {
      value: 'docs.index',
      description:
        "One topic's section index (--index): the topic's name, title, and description, plus sections, each {id, title, summary} (pass the id as the section argument; summary is the section's one-line summary).",
    },
    {
      value: 'docs.detail.section',
      description:
        'One ReferenceSection of a topic, found by key or title, with token-ref blocks inlined.',
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
        'The configured external packages (name, category, components, version, description); when empty it carries meta.configured to tell "nothing configured" from "nothing discovered".',
    },
    {
      value: 'discover.detail',
      description: 'A single external package entry, for an @scope/name query.',
    },
    {
      value: 'discover.detail.doc',
      description:
        'The validated ComponentDoc for one external component: an @scope/name/Component query, or a free-text term resolving to exactly one component.',
    },
    {
      value: 'discover.search',
      description:
        'The echoed query plus the matching {package, component} pairs, when a free-text term matches several components.',
    },

    // search
    {
      value: 'search',
      description:
        'The echoed query, `matchCount` (total matches, before `limit`), and results, a ranked SearchResultEntry[] bounded by `limit`: each {domain, name, score, reason, description, command}, plus import (components, hooks), title (docs), or displayName and kind (templates).',
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
        'The composition kit: echoed query, hasResults, matchCount (total matched, never a cap), directMatch, pages (closest templates), blocks (drop-in patterns) and domain (idea components/hooks) as SearchResultEntry[], frame and foundation name arrays, and hint {reason, commands} when thin.',
    },

    // swizzle
    {
      value: 'swizzle.list',
      description:
        "The names of swizzlable components discoverable from cwd's @astryxdesign/core.",
    },
    {
      value: 'swizzle.copy',
      description:
        'An eject receipt: component name, owning package, output directory, files-copied count, the written file names, whether any file uses StyleX, and an optional maintainer note.',
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
        'Every discovered template (page + block); each entry carries id, name, description, kind, owning package, optional category and componentsUsed, and readiness flags.',
    },
    {
      value: 'template.show',
      description:
        "The resolved template's raw source plus its description, kind, and the component names it composes.",
    },
    {
      value: 'template.skeleton',
      description:
        "A layout skeleton (structural tags with spatial annotations) plus the template's description and the components it composes.",
    },
    {
      value: 'template.copy',
      description:
        'A scaffold receipt: template id, output directory, written file name, and file count.',
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
        'The hook catalog grouped by category: `detail` (the level: names | compact | full) and `components`, the grouped map of hook names, brief entries, or a full HookDoc per entry.',
    },
    {value: 'hook.detail', description: "One hook's full authored HookDoc."},
    {
      value: 'hook.detail.params',
      description: "Just one hook's parameters table (HookParamDoc[]).",
    },

    // theme
    {
      value: 'theme.build',
      description:
        'A theme build receipt: name, tokenCount and componentCount (override counts), sizeKB, the written outputs {css, js, dts, and variantsDts when applicable}, warnings (defects to fix), and notices (advisories about a correct theme, such as a named font it does not load).',
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
        'Every bundled or installed integration theme as a ThemeListEntry[]: each with slug, displayName, description, maintained flag, and owner package.',
    },
    {
      value: 'theme.add',
      description:
        'A scaffold receipt: resolved slug, displayName, maintained flag, owner package, outputDir (relative to cwd), the theme entry file, its exportName, and the files written.',
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
        'Every available codemod, oldest→newest, as {name, title, version, optional}; returned for --list without running anything.',
    },
    {
      value: 'upgrade.status',
      description:
        'A short-circuit outcome with no codemods run (up_to_date, no_codemods, or config_fixable), each carrying the agent-docs summary.',
    },
    {
      value: 'upgrade.run',
      description:
        'The run receipt: from/to versions, codemod count, integrations processed, the agent-docs summary, and (apply mode) filesChanged, transformsApplied, and per-codemod errors.',
    },

    // manifest
    {
      value: 'manifest',
      description:
        'The CLI capability manifest: name, version, apiVersion, description, globalOptions, commands (each name, description, arguments, options, json, aliases?, responseTypes?, examples?, exitCodes? as [{code, when}], subcommands?), jsonSupported, and the flat responseTypes index.',
    },

    // doctor
    {
      value: 'doctor',
      description:
        'The health-check report: `checks` (each with id, label, status: pass | warn | fail | info, a message, and a fix when not passing) plus a `summary` of counts per status.',
    },

    // integration authoring
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
        'The validation result: the package name and version (both null when no local manifest is found) plus issues, an AstryxIntegrationIssue[] of {code, severity: warning | error, message}.',
    },
    {
      value: 'integration.template-conflicts',
      description:
        'The integration identity, structural issues, and non-blocking conflicts where an integration template id is also owned by Core; each conflict includes the exact package-qualified command.',
    },
    {
      value: 'integration.component-conflicts',
      description:
        'The integration identity, structural issues, and non-blocking conflicts where an integration component name is also owned by Core; each conflict includes the exact package-qualified command.',
    },
    {
      value: 'integration.doc-conflicts',
      description:
        'The integration identity, structural issues, and Core doc overlaps classified as intentional replacements, intentional extensions, or accidental same-name conflicts.',
    },

    // layout (XLE/XLO)
    {
      value: 'layout.expand',
      description:
        'The expansion: parsed form, generated TSX code, componentsUsed, states (count of useState hooks scaffolded), todos, blocksReferenced (each {name, mode}), warnings, and written (the output path, or null when nothing was written).',
    },
    {
      value: 'layout.check',
      description:
        'The validation result: a valid flag, the detected form, errors (each with line/col, message, formatted text, and suggestions), warnings, and the expression re-printed in both canonical surfaces (compact and outline).',
    },
    {
      value: 'layout.grammar',
      description:
        "The XLE/XLO grammar cheatsheet: a text field with the full reference plus an aliases map (short name → canonical component) generated from this install's registry.",
    },
  ],
};
