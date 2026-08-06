// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AutolinkedCode.tsx
 * @input The text content of an inline code span.
 * @output A `Code` chip, wrapped in a link when the span is an
 *   `astryx docs <topic>` reference to a page this site serves.
 * @position Renders every inline code span on the docs site — the `/docs`
 *   block renderers go through inlineMarkdown.tsx, component pages through
 *   MarkdownText.tsx's `inlineCode` override.
 *
 * The chip keeps its code formatting either way: the command is still the
 * literal string an agent should type, and a reader now gets somewhere to
 * click. Spans that are not doc references — every other backticked prop
 * name, token, and snippet — render exactly as before.
 */

import {Code} from '@astryxdesign/core/CodeBlock';
import {Link} from '@astryxdesign/core/Link';
import {resolveCliDocHref} from './cliDocLinks';

export function AutolinkedCode({children}: {children: string}) {
  const href = resolveCliDocHref(children);
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
