// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The parse half of the inline-markdown subset authored docs may use: code
 * spans, links, and a code span used as a whole link label. Split out of
 * inlineMarkdown.tsx so it carries no React or StyleX and can be unit tested
 * directly (the docsite suite runs in plain node, without the StyleX
 * transform).
 *
 * Deliberately not a markdown parser. Nesting beyond "the label is one code
 * span" stays literal, matching what doc authors actually write.
 */

/** One piece of an authored inline string. */
export type InlineToken =
  | {type: 'text'; value: string}
  | {type: 'code'; value: string}
  | {
      type: 'link';
      href: string;
      /** Label text, with the backticks stripped when `isCodeLabel` is true. */
      label: string;
      /** True when the entire label was a single code span. */
      isCodeLabel: boolean;
    };

const TOKEN = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

/** A link label that is entirely one code span, e.g. [`<Theme>`](/x). */
const CODE_LABEL = /^`([^`]+)`$/;

/** Split an authored inline string into text, code, and link tokens. */
export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN)) {
    if (match.index > lastIndex) {
      tokens.push({type: 'text', value: text.slice(lastIndex, match.index)});
    }

    const [whole, code, linkLabel, linkHref] = match;
    if (code != null) {
      tokens.push({type: 'code', value: code});
    } else if (linkLabel != null && linkHref != null) {
      const codeLabel = CODE_LABEL.exec(linkLabel);
      tokens.push({
        type: 'link',
        href: linkHref,
        label: codeLabel != null ? codeLabel[1] : linkLabel,
        isCodeLabel: codeLabel != null,
      });
    }

    lastIndex = match.index + whole.length;
  }

  if (lastIndex < text.length) {
    tokens.push({type: 'text', value: text.slice(lastIndex)});
  }

  return tokens;
}
