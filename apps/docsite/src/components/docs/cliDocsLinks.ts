// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Maps `astryx docs <topic>` CLI command strings — as they appear in code
 * spans in authored doc prose — to their docs-site routes, so the rendered
 * code span can double as a link to the topic's page (#4739).
 *
 * The mapping happens at render time rather than in the authored content:
 * doc prose is also consumed verbatim by agents through the CLI, where the
 * bare command string is exactly right, and the docsite's inline markdown
 * subset doesn't support code spans inside link labels (#4425). Kept pure
 * and colocated, changelogLinkify-style, so it can be unit tested without
 * rendering; the known-topic set comes from the generated docs registry at
 * the call site (see inlineMarkdown.tsx).
 */

// A full `astryx docs <topic>` invocation, optionally followed by long-form
// flags (`--dense`, `--zh`, `--detail compact`, ...). Anything else after the
// topic — prose, another subcommand — means this isn't a docs command.
const DOCS_COMMAND =
  /^astryx docs ([a-z0-9]+(?:-[a-z0-9]+)*)((?:\s+--[a-z-]+(?:[ =][a-z0-9-]+)?)*)$/;

/**
 * Returns the docs-site route for a code span that is an `astryx docs
 * <topic>` command whose topic exists in the docs registry, or null when the
 * span should stay plain code (not a docs command, or an unknown topic).
 */
export function getDocsCommandHref(
  code: string,
  knownTopics: ReadonlySet<string>,
): string | null {
  const match = DOCS_COMMAND.exec(code.trim());
  if (match == null) {
    return null;
  }
  const topic = match[1];
  return knownTopics.has(topic) ? `/docs/${topic}` : null;
}
