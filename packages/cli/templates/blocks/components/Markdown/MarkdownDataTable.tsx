'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSMarkdown} from '@xds/core/Markdown';

const content = [
  '## Comparison Table',
  '',
  '| Feature | React | Vue | Svelte |',
  '|:--------|:-----:|:---:|-------:|',
  '| Virtual DOM | Yes | Yes | No |',
  '| Bundle Size | ~40KB | ~30KB | ~2KB |',
  '| TypeScript | Native | Plugin | Native |',
  '| Learning Curve | Medium | Easy | Easy |',
].join('\n');

export default function MarkdownDataTable() {
  return (
    <XDSCenter width="100%" style={{maxWidth: 450}}>
      <XDSMarkdown>{content}</XDSMarkdown>
    </XDSCenter>
  );
}
