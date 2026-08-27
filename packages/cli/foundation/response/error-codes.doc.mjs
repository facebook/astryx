// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file EnumDoc for the CLI's stable error-code taxonomy. Colocated with the
 * source of truth it documents (`error-codes.mjs`); the member set must stay in
 * lockstep with ERROR_CODES — a drift test enforces that the two match exactly.
 * @position packages/cli/foundation/response — enum documentation
 */

/** @type {import('@astryxdesign/cli/authoring').EnumDoc} */
export const doc = {
  type: 'enum',
  name: 'error-codes',
  displayName: 'Error Codes',
  namespace: 'cli',
  description:
    'Stable, append-only machine-readable error codes on the --json error envelope (envelope.code). Codes never change or get removed; branch on these, not on prose.',
  members: [
    // Generic
    {
      value: 'ERR_UNKNOWN',
      description: 'Fallback for any error without a more specific code.',
    },

    // CLI parsing / dispatch (Commander + bare invocation)
    {
      value: 'ERR_UNKNOWN_COMMAND',
      description:
        'A top-level command name was not recognized (e.g. `astryx bogus`).',
    },
    {
      value: 'ERR_UNKNOWN_SUBCOMMAND',
      description:
        'A subcommand under a command group was not recognized (e.g. `astryx theme bogus`).',
    },
    {
      value: 'ERR_INVALID_OPTION',
      description:
        'An unknown flag/option was passed (Commander `unknownOption`).',
    },
    {
      value: 'ERR_INVALID_ARGUMENT',
      description:
        "An option/argument had a value Commander's parser rejected.",
    },
    {
      value: 'ERR_MISSING_ARGUMENT',
      description:
        'A required positional argument was omitted (Commander `missingArgument`).',
    },
    {
      value: 'ERR_INVALID_LANG',
      description:
        '`--lang` was given a value outside its choices (en, zh, dense).',
    },
    {
      value: 'ERR_INVALID_DETAIL',
      description:
        '`--detail` was given a value outside its choices (full, compact, brief).',
    },

    // Environment / runtime
    {
      value: 'ERR_NODE_VERSION',
      description:
        'The running Node.js version is below the supported minimum.',
    },
    {
      value: 'ERR_CORE_NOT_FOUND',
      description:
        '`@astryxdesign/core` could not be located (not installed / not in a monorepo).',
    },

    // "Unknown <subject>" lookups
    {
      value: 'ERR_UNKNOWN_COMPONENT',
      description: 'No component matched the requested name.',
    },
    {
      value: 'ERR_UNKNOWN_HOOK',
      description: 'No hook matched the requested name.',
    },
    {
      value: 'ERR_UNKNOWN_TOPIC',
      description: 'No docs topic matched the requested name.',
    },
    {
      value: 'ERR_UNKNOWN_SECTION',
      description:
        'A docs topic exists but the requested section within it does not.',
    },
    {
      value: 'ERR_UNKNOWN_CATEGORY',
      description:
        'A `--category` filter value did not match any known category.',
    },
    {
      value: 'ERR_UNKNOWN_TEMPLATE',
      description: 'No template matched the requested name.',
    },
    {
      value: 'ERR_AMBIGUOUS_TEMPLATE',
      description:
        'A template id matched more than one template (narrow with --type/--package).',
    },
    {
      value: 'ERR_AMBIGUOUS_COMPONENT',
      description:
        'A component name is owned by more than one package (narrow with --package).',
    },
    {
      value: 'ERR_UNKNOWN_THEME',
      description: 'No theme matched the requested slug (theme add).',
    },
    {
      value: 'ERR_UNKNOWN_PACKAGE',
      description: 'No package matched the requested name (discover).',
    },
    {
      value: 'ERR_UNKNOWN_AGENT',
      description:
        'An unrecognized `--agent` value was passed to agent-docs/init.',
    },
    {
      value: 'ERR_UNKNOWN_FEATURE',
      description: 'An unrecognized `--features` value was passed to init.',
    },
    {
      value: 'ERR_UNKNOWN_CODEMOD',
      description:
        'A `--codemod` value did not match any registered codemod (upgrade).',
    },
    {
      value: 'ERR_CODEMOD_FAILED',
      description: 'One or more codemods failed during an upgrade run.',
    },
    {
      value: 'ERR_NOT_FOUND',
      description:
        'A generic discover/lookup query matched nothing in any package.',
    },

    // Resource shape problems (subject exists, artifact missing)
    {
      value: 'ERR_NO_DOC',
      description: 'A component exists but has no typed `.doc.mjs` file.',
    },
    {
      value: 'ERR_NO_SHOWCASE',
      description: 'No showcase exists for the requested component.',
    },
    {
      value: 'ERR_NO_SOURCE',
      description:
        'No source file could be located for the requested component/template.',
    },
    {
      value: 'ERR_INVALID_DOC',
      description:
        "A component's docs failed validation (malformed `.doc.mjs`).",
    },

    // Filesystem
    {
      value: 'ERR_FILE_NOT_FOUND',
      description: 'A required input file did not exist.',
    },
    {
      value: 'ERR_FILE_EXISTS',
      description:
        'Refused to overwrite an existing file in non-interactive mode.',
    },
    {
      value: 'ERR_PATH_TRAVERSAL',
      description:
        'A path escaped its allowed root, or a name contained traversal markers.',
    },
    {
      value: 'ERR_WRITE_FAILED',
      description: 'Writing output files failed (and was rolled back).',
    },

    // Theme build
    {
      value: 'ERR_THEME_INVALID',
      description:
        'A theme definition was missing a required property (e.g. `name`).',
    },
    {
      value: 'ERR_THEME_LOAD',
      description:
        'A theme file could not be loaded / parsed into a defineTheme result.',
    },

    // Upgrade
    {
      value: 'ERR_VERSION_DETECT',
      description:
        'The current `@astryxdesign/core` version could not be detected.',
    },
    {
      value: 'ERR_INVALID_VERSION',
      description: 'A `--from`/`--to` value was not a valid semver string.',
    },
    {
      value: 'ERR_DEP_MISSING',
      description:
        'A required external dependency (e.g. jscodeshift) is missing.',
    },

    // GitHub CLI
    {
      value: 'ERR_GH_CLI',
      description: 'GitHub CLI (`gh`) is not installed or not authenticated.',
    },

    // Blog (read via the published RSS feed)
    {
      value: 'ERR_UNKNOWN_POST',
      description: 'No blog post matched the requested slug in the feed.',
    },
    {
      value: 'ERR_FETCH_FAILED',
      description: 'A network fetch (RSS feed or post text) failed.',
    },

    // Layout expressions (XLE/XLO)
    {
      value: 'ERR_LAYOUT_PARSE',
      description:
        'A layout expression failed to parse (syntax error, with line/col).',
    },
    {
      value: 'ERR_LAYOUT_INVALID',
      description:
        'A layout expression parsed but failed validation (unknown component/prop/enum/block).',
    },
  ],
};
