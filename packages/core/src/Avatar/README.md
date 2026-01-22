# /packages/core/src/Avatar

Avatar component for displaying user profile pictures with fallback support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Image loading**: Primary and fallback image sources
- **Initials fallback**: Auto-generates initials from user name
- **Default icon**: Generic person icon when no image or name provided
- **Sizes**: xsmall (24px), small (32px), medium (40px), large (56px), xlarge (80px)
- **Status slot**: Corner position for status indicators or badges
- **Accessible**: Proper role and aria-label support

## Usage

```tsx
import { XDSAvatar } from '@xds/core/Avatar';

// With image
<XDSAvatar src="/user.jpg" name="John Doe" />

// Initials fallback
<XDSAvatar name="Jane Smith" size="large" />

// With status indicator
<XDSAvatar src="/user.jpg" status={<OnlineIndicator />} />

// Different sizes
<XDSAvatar name="AB" size="xsmall" />
<XDSAvatar name="CD" size="medium" />
<XDSAvatar name="EF" size="xlarge" />
```

## Props

| Prop          | Type                                                     | Default   | Description                          |
| ------------- | -------------------------------------------------------- | --------- | ------------------------------------ |
| `src`         | `string`                                                 | —         | Primary image source URL             |
| `fallbackSrc` | `string`                                                 | —         | Fallback image when primary fails    |
| `name`        | `string`                                                 | —         | User name for initials and alt text  |
| `alt`         | `string`                                                 | —         | Alt text (falls back to `name`)      |
| `size`        | `'xsmall' \| 'small' \| 'medium' \| 'large' \| 'xlarge'` | `'small'` | Avatar size                          |
| `status`      | `ReactNode`                                              | —         | Corner content for status indicators |
| `data-testid` | `string`                                                 | —         | Test ID for testing                  |

## Fallback Cascade

1. `src` loads → show image
2. `src` fails → try `fallbackSrc`
3. `fallbackSrc` fails/missing → show initials from `name`
4. No `name` → show generic person icon

## Files

| File                 | Role  | Purpose                     |
| -------------------- | ----- | --------------------------- |
| `index.ts`           | Entry | Exports component and types |
| `XDSAvatar.tsx`      | Core  | Component implementation    |
| `XDSAvatar.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Always circular shape (border-radius: 50%)
- Size type derived from `keyof typeof sizes`
- Uses `color.deemphasized` and `color.textSecondary` for fallback background
- Initials extracted from first and last word of name
