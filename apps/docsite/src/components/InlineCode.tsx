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
  // Clear the descenders in monospace commands like `astryx docs typography`.
  link: {textUnderlineOffset: '0.22em'},
  // A linked reference drops the chip's background and padding: the box and
  // the underline read as two competing decorations, and the underline would
  // span the padding rather than tracking the text. The monospace face still
  // marks it as the literal command to type.
  code: {backgroundColor: 'transparent', paddingInline: 0},
});

export function InlineCode({children}: {children: string}) {
  const href = linkifyCode(children);
  if (href == null) {
    return <Code>{children}</Code>;
  }

  // type/size/color inherit so the link keeps the surrounding text's metrics.
  return (
    <Link href={href} type="inherit" hasUnderline xstyle={styles.link}>
      <Code color="inherit" size="inherit" xstyle={styles.code}>
        {children}
      </Code>
    </Link>
  );
}
