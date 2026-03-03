# Text

Typography components for the XDS design system.

<!-- SYNC: When files in this directory change, update this document. -->

## Import

```tsx
import {XDSText, XDSHeading} from '@xds/core/Text';
```

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

### XDSText

Body text with semantic variants and truncation support.

```tsx
<XDSText type="body" color="primary">
  Body text content.
</XDSText>
```

| Prop                 | Type                                | Default    | Description                                  |
| -------------------- | ----------------------------------- | ---------- | -------------------------------------------- |
| `type`               | `XDSTextType`                       | —          | Semantic text type (body, supporting, label) |
| `size`               | `XDSTextSize`                       | —          | Explicit font size override                  |
| `color`              | `XDSTextColor`                      | —          | Text color (defaults vary by type)           |
| `weight`             | `XDSTextWeight`                     | —          | Font weight override                         |
| `display`            | `XDSTextDisplay`                    | `'inline'` | Display type                                 |
| `maxLines`           | `number`                            | `0`        | Max lines before truncation                  |
| `hasTruncateTooltip` | `boolean \| LayerPlacement`         | `true`     | Tooltip for truncated text                   |
| `wordBreak`          | `XDSWordBreak`                      | —          | Word break behavior                          |
| `textWrap`           | `XDSTextWrap`                       | —          | Text wrapping behavior                       |
| `hasCapsize`         | `boolean`                           | `false`    | Enable optical alignment (text-box-trim)     |
| `hasStrikethrough`   | `boolean`                           | `false`    | Strikethrough decoration                     |
| `hasTabularNumbers`  | `boolean`                           | `false`    | Use tabular (monospace) numbers              |
| `as`                 | `'span' \| 'p' \| 'div' \| 'label'` | `'span'`   | HTML element to render                       |
| `xstyle`             | `StyleXStyles`                      | —          | Constrained styles for layout integration    |
| `children`           | `ReactNode`                         | —          | Text content                                 |

### XDSHeading

Headings with level-based styling and optional accessibility level override.

```tsx
<XDSHeading level={1} size="2xl">
  Page Title
</XDSHeading>
```

| Prop                 | Type                         | Default         | Description                               |
| -------------------- | ---------------------------- | --------------- | ----------------------------------------- |
| `level`              | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | —               | Visual heading level (required)           |
| `accessibilityLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | same as `level` | ARIA level override                       |
| `variant`            | `'default' \| 'editorial'`   | `'default'`     | Visual variant (dense vs editorial scale) |
| `color`              | `XDSTextColor`               | `'primary'`     | Text color                                |
| `display`            | `XDSTextDisplay`             | `'block'`       | Display type                              |
| `maxLines`           | `number`                     | `0`             | Max lines before truncation               |
| `hasTruncateTooltip` | `boolean \| LayerPlacement`  | `true`          | Tooltip for truncated text                |
| `wordBreak`          | `XDSWordBreak`               | —               | Word break behavior                       |
| `textWrap`           | `XDSTextWrap`                | —               | Text wrapping behavior                    |
| `hasCapsize`         | `boolean`                    | `false`         | Enable optical alignment                  |
| `hasStrikethrough`   | `boolean`                    | `false`         | Strikethrough decoration                  |
| `xstyle`             | `StyleXStyles`               | —               | Constrained styles for layout integration |
| `children`           | `ReactNode`                  | —               | Heading content                           |

### XDSFontWrapper

Wrapper that applies typography styles to native HTML (for user content/markdown).

```tsx
<XDSFontWrapper variant="editorial">
  <article dangerouslySetInnerHTML={{__html: markdownContent}} />
</XDSFontWrapper>
```

| Prop          | Type                       | Default     | Description           |
| ------------- | -------------------------- | ----------- | --------------------- |
| `variant`     | `'default' \| 'editorial'` | `'default'` | Heading scale variant |
| `children`    | `ReactNode`                | —           | Content to style      |
| `data-testid` | `string`                   | —           | Test ID               |

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
