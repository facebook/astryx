// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BlogPostBody.tsx
 * A blog post's Markdown body. Every heading gets a stable id and the
 * hover-revealed copy-link control (createMarkdownHeadingLinks).
 *
 * The plugin list is created here, in the client module, because a Markdown
 * plugin is a registered handle: passed from the server-rendered BlogArticle
 * it would be serialized into a plain object that Markdown no longer
 * recognizes, and the plugin would silently not run.
 */

import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';
import {MarkdownImage} from './ThemedImage';
import css from './BlogPostBody.module.css';

// One post per page, so ids are unprefixed and match each heading's own text.
const POST_MARKDOWN_PLUGINS = [createMarkdownHeadingLinks()];

export interface BlogPostBodyProps {
  /** Markdown body (frontmatter stripped). */
  body: string;
}

export function BlogPostBody({body}: BlogPostBodyProps) {
  return (
    <div className={css.body}>
      <Markdown
        headingLevelStart={2}
        contentWidth="100%"
        components={{image: MarkdownImage}}
        plugins={POST_MARKDOWN_PLUGINS}>
        {body}
      </Markdown>
    </div>
  );
}
