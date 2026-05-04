'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSMarkdown} from '@xds/core/Markdown';

const content = [
  '## Design Tokens',
  '',
  'Tokens are the **shared language** between design and code.',
  '',
  '```typescript',
  'const tokens = {',
  "  primary: '#0066FF',",
  "  spacing: '8px',",
  '};',
  '```',
  '',
  '- **Composable** — small pieces',
  '- **Accessible** — built-in a11y',
  '',
  '> Opinionated enough for consistency, *flexible* enough for edge cases.',
].join('\n');

export default function MarkdownCompactAIResponse() {
  return (
    <XDSCenter style={{maxWidth: 450}}>
      <XDSMarkdown density="compact" headingLevelStart={3}>
        {content}
      </XDSMarkdown>
    </XDSCenter>
  );
}
