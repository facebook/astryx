'use client';

import {XDSMarkdown} from '@xds/core/Markdown';

export default function MarkdownBasicUsage() {
  return (
    <XDSMarkdown>
      {'# Hello\n\nThis is **bold** and _italic_ text.\n\n- Item one\n- Item two'}
    </XDSMarkdown>
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: MarkdownBasicUsage,
};
