'use client';

import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCenter} from '@xds/core/Center';

const content = [
  '# Markdown Demo',
  '',
  'Renders **markdown** with *design-system-consistent* styling.',
  '',
  '## Features',
  '',
  '- Headings mapped to the XDS type scale',
  '- **Bold**, *italic*, and ~~strikethrough~~ text',
  '- [Links](https://example.com) with external detection',
  '',
  '> Block quote indented text',
].join('\n');

export default function MarkdownShowcase() {
  return (
    <XDSCenter width={400}>
      <XDSMarkdown>{content}</XDSMarkdown>
    </XDSCenter>
  );
}
