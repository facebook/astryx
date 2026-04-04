## Summary

Implements #1032 — a styled markdown renderer that maps markdown elements to XDS-styled HTML with design-system-consistent typography, spacing, and theming.

### `@xds/markdown` — new package

Separate package because it depends on `markdown-to-jsx` (~6KB gzip, zero transitive deps), keeping `@xds/core` dependency-free.

**Component: `XDSMarkdown`**
- Maps all markdown elements (headings, paragraphs, bold/italic, links, code, blockquotes, lists, tables, images, hr) to XDS token-styled HTML
- `density` prop: `'default'` for documents, `'compact'` for chat/comments
- `maxHeadingLevel` for embedding markdown in pages that already have h1/h2
- `isStreaming` prop with blinking cursor — always renders formatted markdown, no plain-text-to-formatted swap
- `components` prop for full element override (same pattern as react-markdown)
- `onLinkClick` callback with navigation prevention
- External links auto-get `target="_blank"` + `rel="noopener noreferrer"`
- All styles via StyleX + design tokens — automatic light/dark, theme-consistent
- Accessible: `role="document"`, semantic HTML, proper table structure

### `useStreamingText` — new core hook

Smooths bursty LLM token delivery into a steady character-by-character reveal. Lives in `@xds/core/hooks` — pure React, no dependencies.

- Advances on word/syntax boundaries to avoid slicing mid-markdown (`**`, backticks, `[]()`)
- Scales reveal speed with backlog so it never falls hopelessly behind
- Speed presets: `'natural'` | `'fast'` | `'instant'`
- Resets automatically when text clears (new message)
- Snaps to full text when streaming ends — zero visual change

### Usage

```tsx
import { XDSMarkdown } from '@xds/markdown';
import { useStreamingText } from '@xds/core';

// Static markdown
<XDSMarkdown>{markdownString}</XDSMarkdown>

// Streaming AI response
function AIResponse({ text, isStreaming }) {
  const displayed = useStreamingText(text, isStreaming);
  return <XDSMarkdown isStreaming={isStreaming}>{displayed}</XDSMarkdown>;
}

// Compact for chat
<XDSMarkdown density="compact">{comment}</XDSMarkdown>
```

### Tests

- **useStreamingText**: 6 tests — non-streaming passthrough, instant speed, streaming start/stop, reset, progressive reveal
- **XDSMarkdown**: 15 tests — every element type, heading clamping, streaming cursor, component overrides, link behavior

### What's next

- Phase 3: `useLinkify` hook (separate PR) — auto-detect URLs + custom patterns (T1234, D5678) in plain text, render via XDSLink
- Phase 4: Storybook stories, XDSLinkProvider integration docs

Closes #1032

---
*Crafted with care by [Navi](https://navibot.dev/64fc1d01-e499-49fb-9097-1bcef0faf3f2)*
