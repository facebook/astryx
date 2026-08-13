// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InlineCode.tsx
 * @input The text content of an inline code span.
 * @output A `Code` chip, or a link when a linkifier recognizes the span as a
 *   reference to a page this site serves.
 * @position Renders every inline code span on the docs site — /docs pages go
 *   through inlineMarkdown.tsx, component pages through MarkdownText.tsx's
 *   `inlineCode` override.
 *
 * Spans no linkifier claims — every other backticked prop name, token, and
 * snippet — render as an ordinary code chip.
 */

import * as stylex from '@stylexjs/stylex';
import {Code} from '@astryxdesign/core/CodeBlock';
import {Link} from '@astryxdesign/core/Link';
import {linkifyCode} from './codeLinkifiers';

const styles = stylex.create({
  // Only ever seen on hover, where Link draws its underline. Nudged clear of
  // the descenders in commands like `astryx docs typography`.
  link: {textUnderlineOffset: '0.2em'},
});

export function InlineCode({children}: {children: string}) {
  const href = linkifyCode(children);
  if (href == null) {
    return <Code>{children}</Code>;
  }

  // The chip is unchanged at rest — same background, padding, and colour as
  // any other inline code. Link contributes the hit target and the pointer
  // cursor, and reveals an underline on hover. `type="inherit"` keeps the
  // surrounding text's metrics; Code keeps its own colour, so wrapping it
  // changes nothing visually.
  return (
    <Link href={href} type="inherit" xstyle={styles.link}>
      <Code>{children}</Code>
    </Link>
  );
}
