'use client';

import {XDSMarkdown} from '@xds/core/Markdown';

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
  '- Inline `code` and fenced code blocks',
  '',
  '> Design systems free teams to focus on problems that matter.',
].join('\n');

export default function MarkdownShowcase() {
  return <XDSMarkdown>{content}</XDSMarkdown>;
}
