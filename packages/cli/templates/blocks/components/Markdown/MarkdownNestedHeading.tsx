'use client';

import {XDSMarkdown} from '@xds/core/Markdown';

export default function MarkdownNestedHeading() {
  return (
    <XDSMarkdown headingLevelStart={3}>
      {'# Section\n\nThis renders as an h3.'}
    </XDSMarkdown>
  );
}
