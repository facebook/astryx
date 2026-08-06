// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeLinkifiers.ts
 * @input The text content of an inline code span.
 * @output The docs-site href that span points at, or null to leave it as
 *   plain code.
 * @position Consumed by InlineCode.tsx, which renders every inline code span
 *   on the site. Kept separate so the rules are unit-testable without React.
 *
 * Docs prose cites sibling topics as the literal CLI command — "Semantic
 * tokens, not hardcoded values (see `astryx docs tokens`)". That string is
 * what an agent should type, so it has to stay copy-pasteable code, but for a
 * human reading the site it is a dead end. Linkifying it keeps the code
 * formatting and adds a click target.
 *
 * To teach the site a new kind of cross-reference, write a CodeLinkifier and
 * add it to LINKIFIERS.
 */

import {docTopicSlugs} from '../generated/docTopicSlugs';

/** Returns an href for a code span it recognizes, or null to pass. */
type CodeLinkifier = (code: string) => string | null;

const KNOWN_TOPICS = new Set(docTopicSlugs);

/**
 * `astryx docs tokens` -> /docs/tokens, `astryx docs` -> the docs index.
 *
 * Anything after the topic (a section argument, or a flag like `--dense`
 * that only changes CLI output) still belongs to the topic's page. Unknown
 * topics return null so a renamed doc degrades to plain code, never a 404.
 */
const docTopic: CodeLinkifier = code => {
  const match = /^(?:npx )?astryx docs(?:\s+([a-z][\w-]*))?(?:\s.*)?$/.exec(
    code,
  );
  if (!match) {
    return null;
  }
  const topic = match[1];
  if (topic == null) {
    return '/docs';
  }
  return KNOWN_TOPICS.has(topic) ? `/docs/${topic}` : null;
};

const LINKIFIERS: CodeLinkifier[] = [docTopic];

/** Resolve an inline code span to a docs href, or null to leave it alone. */
export function linkifyCode(code: string): string | null {
  const text = code.trim();
  for (const linkify of LINKIFIERS) {
    const href = linkify(text);
    if (href != null) {
      return href;
    }
  }
  return null;
}
