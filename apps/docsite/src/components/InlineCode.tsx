// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InlineCode.tsx
 * @input The text content of an inline code span.
 * @output A `Code` chip, wrapped in a link when a linkifier recognizes the
 *   span as a reference to a page this site serves.
 * @position Renders every inline code span on the docs site — /docs pages go
 *   through inlineMarkdown.tsx, component pages through MarkdownText.tsx's
 *   `inlineCode` override.
 *
 * The chip keeps its code formatting either way. Spans no linkifier claims —
 * every other backticked prop name, token, and snippet — render as before.
 */

import {Code} from '@astryxdesign/core/CodeBlock';
import {Link} from '@astryxdesign/core/Link';
import {linkifyCode} from './codeLinkifiers';

export function InlineCode({children}: {children: string}) {
  const href = linkifyCode(children);
  if (href == null) {
    return <Code>{children}</Code>;
  }

  // type/size/color inherit so the linked chip keeps the surrounding text's
  // metrics and picks up the link's accent color instead of code's own.
  return (
    <Link href={href} type="inherit" hasUnderline>
      <Code color="inherit" size="inherit">
        {children}
      </Code>
    </Link>
  );
}
