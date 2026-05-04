'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSMarkdown} from '@xds/core/Markdown';

const content = [
  '# Markdown Demo',
  '',
  'Renders **markdown** with *XDS* styling.',
  '',
  '## Features',
  '',
  '- **Bold**, *italic*, `code`',
  '- [Links](https://example.com)',
  '',
  '```typescript',
  'interface User {name: string;}',
  '```',
  '',
  '- [x] Parser',
  '- [ ] Stories',
].join('\n');

export default function MarkdownRichContent() {
  return (
    <XDSCenter width="100%" style={{maxWidth: 450}}>
      <XDSMarkdown>{content}</XDSMarkdown>
    </XDSCenter>
  );
}
