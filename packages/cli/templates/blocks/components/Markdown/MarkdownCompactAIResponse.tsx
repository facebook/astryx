'use client';

import {XDSMarkdown} from '@xds/core/Markdown';

const content = [
  '## Setting Up a Design System',
  '',
  "A design system is more than a component library — it's a **shared language** between design and engineering.",
  '',
  '### 1. Start with Tokens',
  '',
  'Design tokens are the atomic values that define your visual language:',
  '',
  '```typescript',
  'const tokens = {',
  '  color: {',
  "    primary: '#0066FF',",
  "    secondary: '#6B7280',",
  '  },',
  '  spacing: {',
  "    sm: '8px',",
  "    md: '16px',",
  "    lg: '24px',",
  '  },',
  '};',
  '```',
  '',
  '### 2. Component Architecture',
  '',
  'Good components follow these principles:',
  '',
  '- **Composable** — small pieces that combine into complex UIs',
  '- **Accessible** — keyboard navigation and screen reader support built-in',
  '- **Themeable** — visual customization without forking',
  '',
  '> The best design systems are *opinionated enough* to ensure consistency, but *flexible enough* to handle edge cases gracefully.',
].join('\n');

export default function MarkdownCompactAIResponse() {
  return (
    <XDSMarkdown density="compact" headingLevelStart={3}>
      {content}
    </XDSMarkdown>
  );
}
