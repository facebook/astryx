// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Pure markdown post-processors for the changelog view. Each turns a raw
 * pattern in the rendered CHANGELOG text into a markdown link before it is
 * handed to <Markdown>. Kept side-effect-free and colocated so they can be
 * unit tested without rendering the component.
 */

import {GITHUB_REPO} from '../constants';

// GitHub profile base, derived from the repo URL (e.g. https://github.com).
const GITHUB_HOST = new URL(GITHUB_REPO).origin;

/** Turn `#1234` PR references into links to the GitHub PR. */
export function linkifyPRs(markdown: string): string {
  return markdown.replace(/(?<!\[)#(\d+)/g, `[#$1](${GITHUB_REPO}/pull/$1)`);
}

/**
 * Link the `#### Contributors` bullets to GitHub profiles. The changelog
 * formatter (scripts/format-changelogs.mjs) emits each contributor as a
 * standalone `- @handle` bullet, so we match a list item whose entire content
 * is a single handle. This deliberately avoids package-name bullets like
 * `- @astryxdesign/core` (they contain a `/` and are backticked) and inline
 * `@` mentions in prose. The handle pattern follows GitHub's username rules
 * (alphanumeric or hyphens, no leading/trailing hyphen, max 39 chars).
 */
export function linkifyContributors(markdown: string): string {
  return markdown.replace(
    /^(\s*-\s+)@([A-Za-z\d](?:[A-Za-z\d-]{0,37}[A-Za-z\d])?)[ \t]*$/gm,
    `$1[@$2](${GITHUB_HOST}/$2)`,
  );
}

/** Link bare component names (e.g. `Button`, `XDSButton`) to their doc page. */
export function linkifyComponents(markdown: string, names: string[]): string {
  if (names.length === 0) {
    return markdown;
  }

  const nameToHref = new Map<string, string>();
  for (const name of names) {
    nameToHref.set(name, `/components/${name}`);
    nameToHref.set('XDS' + name, `/components/${name}`);
  }

  const sorted = [...nameToHref.keys()].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(
    '(?<!`|\\[)\\b(' + escaped.join('|') + ')\\b(?!`|\\])',
    'g',
  );

  return markdown.replace(pattern, match => {
    const href = nameToHref.get(match);
    if (!href) {
      return match;
    }
    return '[' + match + '](' + href + ')';
  });
}

/** Strip the leading `# Title` line (the package name h1) from a changelog. */
export function stripTitle(markdown: string): string {
  return markdown.replace(/^#\s+.+\n+/, '');
}
