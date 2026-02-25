# Text

Typography components for the XDS design system.

<!-- SYNC: When files in this directory change, update this document. -->

## Components

| File                 | Export                    | Purpose                                                    |
| -------------------- | ------------------------- | ---------------------------------------------------------- |
| `XDSText.tsx`        | `XDSText`                 | Body text with semantic variants (body, supporting, label) |
| `XDSHeading.tsx`     | `XDSHeading`              | Headings with level and size props                         |
| `XDSFontWrapper.tsx` | `XDSFontWrapper`          | Wrapper that applies typography styles to native HTML      |
| `XDSFontWrapper.tsx` | `useXDSFontWrapperStyles` | Hook for programmatic StyleX access to typography styles   |

## Utilities

| File               | Export          | Purpose                                                    |
| ------------------ | --------------- | ---------------------------------------------------------- |
| `text.stylex.ts`   | Various         | StyleX styles for color, weight, display, truncation, etc. |
| `useTruncation.ts` | `useTruncation` | Hook for detecting text overflow                           |

## Usage Patterns

### XDSText / XDSHeading

Use for explicit typography control with full type safety:

```tsx
<XDSHeading level={1} size="2xl">Page Title</XDSHeading>
<XDSText type="body" color="primary">Body text content.</XDSText>
<XDSText type="supporting" color="secondary">Helper text.</XDSText>
```

### XDSFontWrapper

Use when rendering user content or markdown where you can't control the elements:

```tsx
<XDSFontWrapper variant="editorial">
  <article dangerouslySetInnerHTML={{__html: markdownContent}} />
</XDSFontWrapper>
```

### useXDSFontWrapperStyles

Use when you want StyleX-based styling with theme tokens:

```tsx
import {useXDSFontWrapperStyles} from '@xds/core';
import * as stylex from '@stylexjs/stylex';

function Article() {
  const {headingStyles, proseStyles} = useXDSFontWrapperStyles();

  return (
    <article>
      <h1 {...stylex.props(headingStyles?.h1)}>Title</h1>
      <p {...stylex.props(proseStyles?.p)}>Content...</p>
    </article>
  );
}
```
