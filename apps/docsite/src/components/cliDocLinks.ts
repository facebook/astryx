// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file cliDocLinks.ts
 * @input The text content of an inline code span.
 * @output The docs-site href that an `astryx docs <topic>` command refers to,
 *   or null when the span is not a resolvable doc reference.
 * @position Consumed by AutolinkedCode.tsx; kept separate so the grammar is
 *   unit-testable without rendering React.
 *
 * Docs prose cites sibling topics as the literal CLI command — "Semantic
 * tokens, not hardcoded values (see `astryx docs tokens`)". That string is
 * what an agent should type, so it has to stay copy-pasteable code, but for a
 * human reading the site it is a dead end. Resolving the command to its page
 * lets the renderer keep the code formatting and add a click target.
 *
 * Hrefs are validated against the generated topic slugs, so a reference to a
 * topic that no longer exists renders as plain code rather than linking to a
 * 404.
 */

import {docTopicSlugs} from '../generated/docTopicSlugs';

/** Package runners a doc may prefix the command with, e.g. `npx astryx docs`. */
const RUNNERS = new Set(['npm', 'npx', 'pnpm', 'pnpx', 'yarn', 'bun', 'bunx']);

/** Runner subcommands that precede the binary, e.g. `pnpm exec astryx docs`. */
const RUNNER_SUBCOMMANDS = new Set(['exec', 'dlx', 'run', 'x']);

/** How the CLI is invoked: the bin name, or the package name under a runner. */
const BINARIES = new Set(['astryx', '@astryxdesign/cli']);

const KNOWN_TOPICS = new Set(docTopicSlugs);

/**
 * Resolve a CLI command string to the docs page it refers to.
 *
 * Handles runner prefixes and trailing flags, so `npx astryx docs styling`
 * and `astryx docs styling --dense` both resolve to the styling page — the
 * `--dense` and `--zh` variants are CLI output modes, not separate pages.
 *
 * A section argument (`astryx docs tokens spacing`) resolves to the topic
 * page. Deep-linking it would mean matching the CLI's section titles against
 * the anchor ids ReferenceDocView derives at render time; the topic page is
 * the correct destination either way.
 *
 * @returns an href like `/docs/tokens`, or null if this is not a resolvable
 *   `astryx docs` reference.
 */
export function resolveCliDocHref(command: string): string | null {
  const tokens = command.trim().split(/\s+/);
  let i = 0;

  if (RUNNERS.has(tokens[i])) {
    i++;
    if (RUNNER_SUBCOMMANDS.has(tokens[i])) {
      i++;
    }
  }

  if (!BINARIES.has(tokens[i]) || tokens[i + 1] !== 'docs') {
    return null;
  }
  i += 2;

  const args: string[] = [];
  for (; i < tokens.length; i++) {
    if (tokens[i].startsWith('-')) {
      break;
    }
    args.push(tokens[i]);
  }

  // Beyond <topic> <section> it is not a valid invocation, so treat it as
  // prose that happens to start with the command rather than a reference.
  if (args.length > 2) {
    return null;
  }
  if (args.length === 0) {
    return '/docs';
  }
  return KNOWN_TOPICS.has(args[0]) ? `/docs/${args[0]}` : null;
}
