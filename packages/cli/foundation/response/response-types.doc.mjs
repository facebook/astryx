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
  namespace: 'cli',
  description:
    'The `type` discriminant present on every --json success envelope. Consumers switch on it to narrow `data`.',
  members: [
    // component
    {
      value: 'component.list',
      description:
        'The component catalog grouped by category: `detail` (the level: names | compact | full) and `components`, the grouped map of names+package, brief entries, or a full ComponentDoc per entry.',
    },
    {
      value: 'component.detail',
      description:
        "One component's authored ComponentDoc plus ownership metadata (owner package, import specifier, and whether source is available).",
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
      value: 'docs.detail.section',
      description:
        'A single ReferenceSection of a topic: the first whose title contains the section query.',
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
        'The echoed query plus a ranked SearchResultEntry[] (domain, name, score, reason, description, follow-up command, and import path where relevant).',
    },

    // build
    {
      value: 'build.help',
      description:
        'A marker (`playbook: true`) that the renderer expands into the how-to-build-a-page workflow; emitted when no query is given.',
    },
    {
      value: 'build.kit',
      description:
        'The grouped composition kit: echoed query, hasResults/directMatch flags, the closest page templates, drop-in block patterns, idea-specific components/hooks, and the always-on frame + foundation component-name arrays.',
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
        'A write receipt for the no-build-step CDN starter page: the path (relative to cwd), the Astryx version every CDN URL was pinned to, whether it was written, and the reason it was not — `exists` when a file was already there, which is a success.',
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
        'A theme build receipt: name, token- and component-override counts, output size, the written outputs {css, js, dts, and variantsDts when applicable}, and any validation warnings.',
    },
    {
      value: 'theme.build.check',
      description:
        'The --check receipt: theme name, an upToDate flag, the stale outputs (each {path, reason: missing | outdated}), and the full list of checked paths. Writes nothing.',
    },
    {
      value: 'theme.build.batch',
      description:
        'Several themes built in one invocation: `count` plus one {file, receipt} per theme in argument order, where receipt is that theme\'s theme.build (or theme.build.check) envelope, or null when it produced no CSS.',
    },
    {
      value: 'theme.list',
      description:
        'Every bundled theme as a ThemeListEntry[]: each with slug, displayName, description, and a maintained flag.',
    },
    {
      value: 'theme.add',
      description:
        'A scaffold receipt: resolved slug, displayName, maintained flag, outputDir (relative to cwd), the theme entry file, its exportName, and the files written.',
    },
    {
      value: 'theme.template',
      description:
        'A write receipt for the annotated theme template: the path (relative to cwd), whether it was written, and the reason it was not — `exists` when a file was already there, which is a success.',
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
        'The self-describing CLI capability manifest: name, version, apiVersion, global options, the command tree (args, options, json flag, response types, examples), the jsonSupported allowlist, and the flat responseTypes index.',
    },

    // doctor
    {
      value: 'doctor',
      description:
        'The health-check report: `checks` (each with id, label, status: pass | warn | fail | info, a message, and a fix when not passing) plus a `summary` of counts per status.',
    },

    // validate-integration
    {
      value: 'integration.validate',
      description:
        'The validation result: the package name and version (both null when no local manifest is found) plus issues, an AstryxIntegrationIssue[] of {code, severity: warning | error, message}.',
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
